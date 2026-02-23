// z-mode-context.ts — Deep context engine for z-mode layer adaptation
// Gathers: running apps, flow tasks, Lin intents, usage stats, editor state
//
// Every field is gathered from real system state. No guessing, no AI.

import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { execSync } from "node:child_process"

// --- Types ---

export interface FlowTask {
  name: string
  command: string
  description?: string
  projectRoot: string
  projectName: string
}

export interface LinIntent {
  kind: string
  title: string
  message?: string
  action?: string
  actionTitle?: string
  value?: string
  createdAt: number
  expiresAt?: number
}

export interface ZModeContext {
  frontmostApp: string
  runningApps: string[]
  hour: number
  dayOfWeek: string
  activeProject: string | null
  activeProjectName: string | null
  activeProjectBranch: string | null
  zedProject: string | null
  flowTasks: FlowTask[]
  flowTaskUsage: Record<string, { count: number; lastUsed: number }>
  flowTaskUsageByProject: Record<string, { count: number; lastUsed: number }>
  flowRootsScanned: string[]
  recentIntents: LinIntent[]
  keyUsage: Record<string, { count: number; lastUsed: number }>
  recentProjects: string[]
}

export interface GatherContextOptions {
  fast?: boolean
}

// --- Helpers ---

function tryExec(cmd: string, timeout = 3000): string | null {
  try {
    return execSync(cmd, { encoding: "utf8", timeout }).trim()
  } catch {
    return null
  }
}

// --- Gathering functions ---

function getApps(fast = false): { frontmost: string; running: string[] } {
  const timeout = fast ? 180 : 3000
  const frontmost =
    tryExec(
      `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      timeout,
    ) || "unknown"

  const raw =
    tryExec(
      `osascript -e 'tell application "System Events" to get name of every application process whose background only is false'`,
      timeout,
    ) || ""

  return { frontmost, running: raw.split(", ").filter(Boolean) }
}

function getZedProject(fast = false): string | null {
  // Zed Preview window title is "ProjectName — filename.ext"
  const title = tryExec(
    `osascript -e 'tell application "System Events" to get name of front window of process "Zed"'`,
    fast ? 180 : 3000,
  )
  if (!title) return null
  const match = title.match(/^([^—–]+)/)
  return match ? match[1].trim() : null
}

function detectActiveProject(
  zedProject: string | null,
): { root: string | null; branch: string | null; name: string | null } {
  // Method 1: git root from cwd
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
      timeout: 2000,
    }).trim()
    return {
      root: gitRoot,
      branch: tryExec("git branch --show-current"),
      name: path.basename(gitRoot),
    }
  } catch {}

  // Method 2: Zed project name → find matching directory
  if (zedProject) {
    const candidates = [
      path.join(os.homedir(), "code", zedProject),
      path.join(os.homedir(), "repos", "block", zedProject),
      path.join(os.homedir(), "repos", zedProject),
      path.join(os.homedir(), "code", "org", zedProject),
    ]
    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        return {
          root: dir,
          branch: tryExec(`git -C "${dir}" branch --show-current`),
          name: zedProject,
        }
      }
    }
  }

  // Method 3: most recently modified Claude session project
  try {
    const claudeDir = path.join(os.homedir(), ".claude", "projects")
    const dirs = fs
      .readdirSync(claudeDir)
      .filter((d) => d.startsWith("-Users-nikiv-"))
      .map((d) => {
        const fullPath = path.join(claudeDir, d)
        const realPath = "/" + d.slice(1).replace(/-/g, "/")
        return { mtime: fs.statSync(fullPath).mtime.getTime(), path: realPath }
      })
      .sort((a, b) => b.mtime - a.mtime)

    if (dirs.length > 0 && fs.existsSync(dirs[0].path)) {
      return {
        root: dirs[0].path,
        branch: tryExec(`git -C "${dirs[0].path}" branch --show-current`),
        name: path.basename(dirs[0].path),
      }
    }
  } catch {}

  return { root: null, branch: null, name: null }
}

function parseFlowTasks(projectRoot: string): FlowTask[] {
  const flowToml = path.join(projectRoot, "flow.toml")
  if (!fs.existsSync(flowToml)) return []

  const src = fs.readFileSync(flowToml, "utf8")
  const projectName = path.basename(projectRoot)
  const tasks: FlowTask[] = []

  const blocks = src.split(/^\[\[tasks\]\]/gm).slice(1)
  for (const block of blocks) {
    let name: string | undefined
    let command: string | undefined
    let description: string | undefined

    for (const line of block.split("\n")) {
      const s = line.trim()
      if (s.startsWith("[[") || (s.startsWith("[") && !s.startsWith("[]"))) break

      const nm = s.match(/^name\s*=\s*"([^"]+)"/)
      if (nm) name = nm[1]
      const cm = s.match(/^command\s*=\s*"([^"]+)"/)
      if (cm) command = cm[1]
      const dm = s.match(/^description\s*=\s*"([^"]+)"/)
      if (dm) description = dm[1]
    }

    if (name && command) {
      tasks.push({ name, command, description, projectRoot, projectName })
    }
  }

  return tasks
}

function gatherFlowTasks(
  activeProject: string | null,
  recentProjects: string[],
  fast = false,
): { tasks: FlowTask[]; roots: string[] } {
  const allTasks: FlowTask[] = []
  const scanned = new Set<string>()
  const roots: string[] = []

  function addRoot(root: string): void {
    if (scanned.has(root)) return
    const flowToml = path.join(root, "flow.toml")
    if (!fs.existsSync(flowToml)) return
    scanned.add(root)
    roots.push(root)
    allTasks.push(...parseFlowTasks(root))
  }

  // Active project first (highest priority)
  if (activeProject) {
    addRoot(activeProject)
  }

  // Always include flow's own task space when present.
  addRoot(path.join(os.homedir(), "code", "flow"))
  if (!fast) {
    addRoot(path.join(os.homedir(), "agi"))
    // Include known high-signal roots if they exist.
    addRoot(path.join(os.homedir(), "repos", "nikivdev", "clawdis-i"))
    addRoot(path.join(os.homedir(), "repos", "nikivdev", "myflow-i"))
    addRoot(path.join(os.homedir(), "code", "seq"))
    addRoot(path.join(os.homedir(), "code", "org", "linsa", "lin"))
  }

  // Include current workspace if script is run from a project with flow.toml.
  try {
    addRoot(process.cwd())
  } catch {}

  // Include git root for current cwd if available.
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
      timeout: 2000,
    }).trim()
    addRoot(gitRoot)
  } catch {}

  if (!fast) {
    // Up to 6 recent projects
    for (const proj of recentProjects.slice(-6).reverse()) {
      const expanded = proj.replace("~/", os.homedir() + "/")
      addRoot(expanded)
    }
  }

  const deduped: FlowTask[] = []
  const seen = new Set<string>()
  for (const task of allTasks) {
    const key = `${task.projectRoot}::${task.name}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(task)
  }

  return { tasks: deduped, roots }
}

function getRecentIntents(maxAgeMs = 3600_000, limit = 20): LinIntent[] {
  const inbox = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Lin",
    "intent-inbox.jsonl",
  )
  if (!fs.existsSync(inbox)) return []

  try {
    const src = fs.readFileSync(inbox, "utf8")
    const lines = src.trim().split("\n").slice(-200)
    const now = Date.now()
    const intents: LinIntent[] = []

    for (const line of lines) {
      try {
        const intent = JSON.parse(line) as LinIntent
        if (intent.createdAt && now - intent.createdAt < maxAgeMs) {
          intents.push(intent)
        }
      } catch {}
    }

    return intents.slice(-limit)
  } catch {
    return []
  }
}

function getKeyUsage(): Record<string, { count: number; lastUsed: number }> {
  const usage: Record<string, { count: number; lastUsed: number }> = {}
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600_000

  // Source 1: local z-mode usage log (written by z-mode-log.ts)
  const localLog = path.join(os.homedir(), ".config", "kar", "z-mode-usage.jsonl")
  if (fs.existsSync(localLog)) {
    try {
      for (const line of fs.readFileSync(localLog, "utf8").trim().split("\n")) {
        try {
          const entry = JSON.parse(line) as { key: string; ts: number }
          if (entry.ts < sevenDaysAgo) continue
          if (!usage[entry.key]) usage[entry.key] = { count: 0, lastUsed: 0 }
          usage[entry.key].count++
          if (entry.ts > usage[entry.key].lastUsed)
            usage[entry.key].lastUsed = entry.ts
        } catch {}
      }
    } catch {}
  }

  // Source 2: seq_mem.jsonl for kar signal telemetry
  const seqMem = path.join(
    os.homedir(),
    "repos",
    "ClickHouse",
    "ClickHouse",
    "user_files",
    "seq_mem.jsonl",
  )
  if (fs.existsSync(seqMem)) {
    try {
      const stat = fs.statSync(seqMem)
      if (stat.size < 50_000_000) {
        const lines = fs
          .readFileSync(seqMem, "utf8")
          .trim()
          .split("\n")
          .slice(-5000)
        for (const line of lines) {
          try {
            const event = JSON.parse(line)
            if (!event.name?.includes("kar.intent")) continue
            if (event.ts_ms && event.ts_ms < sevenDaysAgo) continue
            const subject =
              typeof event.subject === "string"
                ? JSON.parse(event.subject)
                : event.subject
            const signal = subject?._kar_signal
            if (!signal?.rule_id?.includes("zkey")) continue
            const key =
              signal.mapping_id?.replace(/^zkey\.\w+\./, "") || "unknown"
            if (!usage[key]) usage[key] = { count: 0, lastUsed: 0 }
            usage[key].count++
            if (event.ts_ms > usage[key].lastUsed)
              usage[key].lastUsed = event.ts_ms
          } catch {}
        }
      }
    } catch {}
  }

  return usage
}

function getRecentProjects(): string[] {
  try {
    const claudeDir = path.join(os.homedir(), ".claude", "projects")
    return fs
      .readdirSync(claudeDir)
      .filter((d) => d.startsWith("-Users-nikiv-"))
      .map((d) => {
        const p = "/" + d.slice(1).replace(/-/g, "/")
        return p.replace(/^\/Users\/nikiv\//, "~/")
      })
      .slice(-10)
  } catch {
    return []
  }
}

function parseFlowTaskNameFromCommand(command: string): string[] {
  const tasks: string[] = []
  if (!command || command.length > 2000) return tasks

  const regex = /(?:^|[;&|]\s*|\s)f\s+([A-Za-z0-9:_-]+)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(command)) !== null) {
    const task = (m[1] || "").trim()
    if (!task || task.startsWith("-")) continue
    tasks.push(task)
  }
  return tasks
}

function getFlowTaskUsageFromZshHistory(
  usage: Record<string, { count: number; lastUsed: number }>,
): void {
  const zshHistory = path.join(os.homedir(), ".zsh_history")
  if (!fs.existsSync(zshHistory)) return

  try {
    const lines = fs.readFileSync(zshHistory, "utf8").split("\n").slice(-8000)
    for (const line of lines) {
      if (!line) continue
      let command = line
      let ts = 0
      const match = line.match(/^: (\d+):\d+;(.*)$/)
      if (match) {
        ts = Number(match[1]) * 1000
        command = match[2] || ""
      }
      for (const task of parseFlowTaskNameFromCommand(command)) {
        if (!usage[task]) usage[task] = { count: 0, lastUsed: 0 }
        usage[task].count += 1
        if (ts > usage[task].lastUsed) usage[task].lastUsed = ts
      }
    }
  } catch {}
}

function getFlowTaskUsageFromFishHistory(
  usage: Record<string, { count: number; lastUsed: number }>,
): void {
  const fishHistory = path.join(
    os.homedir(),
    ".local",
    "share",
    "fish",
    "fish_history",
  )
  if (!fs.existsSync(fishHistory)) return

  try {
    const lines = fs.readFileSync(fishHistory, "utf8").split("\n").slice(-16000)
    let pendingCommand: string | null = null
    for (const line of lines) {
      if (line.startsWith("- cmd: ")) {
        pendingCommand = line.slice(7)
        continue
      }
      if (!pendingCommand) continue
      if (!line.trim().startsWith("when:")) continue
      const tsRaw = line.split("when:")[1]?.trim() || ""
      const ts = Number(tsRaw) * 1000
      for (const task of parseFlowTaskNameFromCommand(pendingCommand)) {
        if (!usage[task]) usage[task] = { count: 0, lastUsed: 0 }
        usage[task].count += 1
        if (ts > usage[task].lastUsed) usage[task].lastUsed = ts
      }
      pendingCommand = null
    }
  } catch {}
}

function getFlowTaskUsage(
  flowTasks: FlowTask[],
): {
  byTask: Record<string, { count: number; lastUsed: number }>
  byProjectTask: Record<string, { count: number; lastUsed: number }>
} {
  const usage: Record<string, { count: number; lastUsed: number }> = {}
  getFlowTaskUsageFromZshHistory(usage)
  getFlowTaskUsageFromFishHistory(usage)

  const byProjectTask: Record<string, { count: number; lastUsed: number }> = {}
  for (const task of flowTasks) {
    const u = usage[task.name]
    if (!u) continue
    byProjectTask[`${task.projectName}:${task.name}`] = u
    byProjectTask[`${task.projectRoot}:${task.name}`] = u
  }

  return { byTask: usage, byProjectTask }
}

// --- Main export ---

export function gatherContext(options: GatherContextOptions = {}): ZModeContext {
  const fast = Boolean(options.fast)
  const { frontmost, running } = getApps(fast)
  const hasZed = running.some((app) => app.toLowerCase() === "zed")
  const zedProject = hasZed ? getZedProject(fast) : null
  const project = detectActiveProject(zedProject)
  const recentProjects = fast ? [] : getRecentProjects()
  const flow = gatherFlowTasks(project.root, recentProjects, fast)
  const flowUsage = fast
    ? { byTask: {}, byProjectTask: {} }
    : getFlowTaskUsage(flow.tasks)

  return {
    frontmostApp: frontmost,
    runningApps: running,
    hour: new Date().getHours(),
    dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    activeProject: project.root,
    activeProjectName: project.name,
    activeProjectBranch: project.branch,
    zedProject,
    flowTasks: flow.tasks,
    flowTaskUsage: flowUsage.byTask,
    flowTaskUsageByProject: flowUsage.byProjectTask,
    flowRootsScanned: flow.roots,
    recentIntents: fast ? [] : getRecentIntents(),
    keyUsage: fast ? {} : getKeyUsage(),
    recentProjects,
  }
}
