// z-mode-update.ts — Context-aware z-mode binding engine with AI moderation.
//
// Pipeline:
// 1) Gather deterministic context and build candidates with explicit scores.
// 2) Assign baseline keys deterministically.
// 3) Ask Claude Haiku to propose a constrained re-ranking.
// 4) Ask Claude Sonnet to audit/finalize the same constrained candidate set.
// 5) Validate strictly; fallback to baseline on any AI error.

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import crypto from "node:crypto"
import { spawn } from "node:child_process"
import {
  gatherContext,
  type FlowTask,
  type ZModeContext,
} from "./z-mode-context.ts"
import { readZModeMappings, writeZModeMappings, compileKar } from "./z-mode-lib.ts"

const args = new Set(process.argv.slice(2))
const shouldApply = args.has("--apply")
const showContext = args.has("--context")
const disableAI = args.has("--no-ai")
const showPrompts = args.has("--show-prompts") || args.has("--show-prompt")
const zeroLatency = args.has("--zero-latency") || process.env.Z_MODE_ZERO_LATENCY === "1"
const refreshCacheOnly = args.has("--refresh-cache")
const forceAI = args.has("--force-ai")
const noWidget = args.has("--no-widget")

interface Candidate {
  id: string
  action: string
  label: string
  score: number
  source: "core" | "slash" | "flow" | "app" | "prompt" | "contextual"
  preferredKey?: string
  fixed?: boolean
  fixedKey?: string
  evidence: string[]
}

interface Binding {
  key: string
  action: string
  note: string
  score: number
  source: string
  fixed: boolean
  candidate_id?: string
  confidence?: number
  rationale?: string
}

interface DiffEntry {
  key: string
  prev_action: string | null
  prev_note: string | null
  new_action: string
  new_note: string
  reason: string
}

interface ModerationResult {
  enabled: boolean
  source?: string
  provider?: "anthropic" | "openai_compat"
  haiku_model?: string
  sonnet_model?: string
  haiku_ok?: boolean
  sonnet_ok?: boolean
  global_confidence?: number
  errors: string[]
}

interface Preview {
  version: 2
  generated_at: number
  decision_id: string
  mapping_epoch_id: string
  context: {
    frontmost_app: string
    active_project: string | null
    zed_project: string | null
    flow_tasks: string[]
    flow_roots_scanned: string[]
    running_apps: string[]
    hour: number
    day: string
    hot_flow_tasks: Array<{ task: string; count: number }>
  }
  moderation: ModerationResult
  bindings: Binding[]
  diff: DiffEntry[]
}

interface SeqRow {
  ts_ms: number
  dur_us: number
  ok: boolean
  session_id: string
  event_id: string
  content_hash: string
  name: string
  subject: string
}

interface PolicyCacheEntry {
  context_id: string
  created_at: number
  updated_at: number
  context: {
    frontmost_app: string
    active_project: string | null
    hour_bucket: "morning" | "day" | "evening" | "night"
    running_signal_apps: string[]
  }
  decision_id: string
  mapping_epoch_id: string
  mode: string
  dynamic_bindings: Binding[]
}

interface AIPlanAssignment {
  key: string
  candidate_id: string
  confidence: number
  reason: string
}

interface AIPlan {
  assignments: AIPlanAssignment[]
  drops?: Array<{ candidate_id: string; reason: string }>
  global_confidence?: number
}

interface LLMConfig {
  provider: "anthropic" | "openai_compat"
  source: string
  apiKey: string
  apiUrl: string
  haikuModels: string[]
  sonnetModels: string[]
}

const Z_MODE_TABLE_KEY = "j"
const Z_MODE_TABLE_ACTION = 'linWidget("~/config/i/kar/scripts/z-mode-widget.ts")'
const Z_MODE_TABLE_NOTE = "Show z-mode layer"

const FIXED: Candidate[] = [
  {
    id: "fixed-ai-clipboard",
    action: "seqAgentFromClipboard()",
    label: "AI agent on clipboard",
    score: 100,
    source: "core",
    fixed: true,
    fixedKey: "q",
    evidence: ["core action", "always available"],
  },
  {
    id: "fixed-ai-screenshot",
    action: "seqScreenshotOpen()",
    label: "Screenshot for AI",
    score: 100,
    source: "core",
    fixed: true,
    fixedKey: "w",
    evidence: ["core action", "always available"],
  },
  {
    id: "fixed-confirm-yes",
    action: 'paste("yes")',
    label: "Confirm",
    score: 100,
    source: "core",
    fixed: true,
    fixedKey: "r",
    evidence: ["approval path", "always available"],
  },
  {
    id: "fixed-confirm-no",
    action: 'paste("no")',
    label: "Deny",
    score: 100,
    source: "core",
    fixed: true,
    fixedKey: "t",
    evidence: ["approval path", "always available"],
  },
  {
    id: "fixed-show-layer",
    action: Z_MODE_TABLE_ACTION,
    label: Z_MODE_TABLE_NOTE,
    score: 100,
    source: "core",
    fixed: true,
    fixedKey: Z_MODE_TABLE_KEY,
    evidence: ["inspection", "always available"],
  },
  {
    id: "fixed-update-layer",
    action: 'shell("bun run ~/config/i/kar/scripts/z-mode-update.ts --zero-latency")',
    label: "Update z-mode (zero-latency preview)",
    score: 100,
    source: "core",
    fixed: true,
    fixedKey: "k",
    evidence: ["refresh", "always available"],
  },
]

const SLASH_COMMANDS: Candidate[] = [
  {
    id: "slash-review",
    action: 'paste("/review")',
    label: "Code review",
    score: 63,
    source: "slash",
    preferredKey: "comma",
    evidence: ["high utility", "frequent in coding loop"],
  },
  {
    id: "slash-test",
    action: 'paste("/test")',
    label: "Run tests",
    score: 61,
    source: "slash",
    preferredKey: "period",
    evidence: ["high utility", "frequent in coding loop"],
  },
  {
    id: "slash-fix",
    action: 'paste("/fix")',
    label: "Fix issue",
    score: 58,
    source: "slash",
    preferredKey: "f",
    evidence: ["high utility", "frequent in coding loop"],
  },
  {
    id: "slash-diff",
    action: 'paste("/diff")',
    label: "Show diff",
    score: 54,
    source: "slash",
    preferredKey: "d",
    evidence: ["high utility", "frequent in coding loop"],
  },
  {
    id: "slash-plan",
    action: 'paste("/plan")',
    label: "Plan mode",
    score: 51,
    source: "slash",
    preferredKey: "semicolon",
    evidence: ["planning", "frequent in coding loop"],
  },
  {
    id: "slash-commit",
    action: 'paste("/commit")',
    label: "Commit",
    score: 49,
    source: "slash",
    preferredKey: "p",
    evidence: ["wrap up", "frequent in coding loop"],
  },
  {
    id: "slash-new",
    action: 'enter("/new")',
    label: "New session",
    score: 43,
    source: "slash",
    preferredKey: "n",
    evidence: ["session reset"],
  },
  {
    id: "slash-clear",
    action: 'enter("/clear")',
    label: "Clear context",
    score: 41,
    source: "slash",
    preferredKey: "l",
    evidence: ["session reset"],
  },
  {
    id: "slash-help",
    action: 'paste("/help")',
    label: "Help",
    score: 35,
    source: "slash",
    preferredKey: "h",
    evidence: ["fallback command"],
  },
]

const APP_RELEVANCE: Record<string, number> = {
  Goose: 16,
  Claude: 13,
  Zed: 12,
  Arc: 9,
  Warp: 9,
  ghostty: 9,
  Terminal: 7,
  Xcode: 7,
  Things3: 6,
  Linear: 6,
  Safari: 5,
  Finder: 3,
}

const APP_KEY_HINTS: Record<string, string> = {
  Goose: "4",
  Claude: "c",
  Arc: "slash",
  Zed: "x",
  Things3: "1",
  Linear: "3",
}

const FLOW_KEY_HINTS: Record<string, string> = {
  dev: "g",
  test: "y",
  check: "2",
  review: "comma",
  fix: "f",
  logs: "slash",
  build: "b",
  run: "m",
  status: "1",
  deploy: "p",
}

const KEY_TIERS: string[][] = [
  ["d", "f", "g", "h", "l", "p", "n", "m", "b", "v"],
  ["c", "x", "y", "u", "comma", "period", "semicolon", "slash", "1", "2"],
  ["3", "4", "5", "6", "7", "8", "9", "0", "open_bracket", "close_bracket", "hyphen", "equal_sign"],
]

const DYNAMIC_KEYS = KEY_TIERS.flat()
const POLICY_CACHE_PATH = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Lin",
  "z-mode-policy-cache.json",
)
const REFRESH_THROTTLE_MS = 30_000
const CACHE_MAX_ENTRIES = 120
const CACHE_MAX_AGE_MS = 14 * 24 * 3600_000

const CODE_APPS = [
  "ghostty",
  "Terminal",
  "Warp",
  "Zed",
  "Xcode",
  "Cursor",
  "VS Code",
  "Code",
]

function hourBucket(hour: number): "morning" | "day" | "evening" | "night" {
  if (hour >= 6 && hour <= 11) return "morning"
  if (hour >= 12 && hour <= 16) return "day"
  if (hour >= 17 && hour <= 22) return "evening"
  return "night"
}

function contextId(ctx: ZModeContext): string {
  const knownApps = new Set(Object.keys(APP_RELEVANCE).map((k) => k.toLowerCase()))
  const frontmost = (ctx.frontmostApp || "").toLowerCase()
  const frontmostNorm = frontmost && frontmost !== "unknown" ? frontmost : "_"
  const runningSignalApps = ctx.runningApps
    .map((a) => a.toLowerCase())
    .filter((a) => knownApps.has(a))
    .sort()

  return sha256(
    JSON.stringify({
      frontmost_app: frontmostNorm,
      active_project: ctx.activeProjectName || null,
      hour_bucket: hourBucket(ctx.hour),
      running_signal_apps: runningSignalApps,
    }),
  )
}

function normalizeDynamicBindings(
  bindings: Binding[],
  fixedKeys: Set<string>,
): Binding[] {
  const out: Binding[] = []
  const used = new Set<string>(fixedKeys)
  for (const b of bindings) {
    if (!b || typeof b !== "object") continue
    if (!b.key || !b.action || !b.note) continue
    if (fixedKeys.has(b.key)) continue
    if (!DYNAMIC_KEYS.includes(b.key)) continue
    if (used.has(b.key)) continue
    used.add(b.key)
    out.push({
      key: b.key,
      action: b.action,
      note: b.note,
      score: Number.isFinite(b.score) ? b.score : 0,
      source: b.source || "cache",
      fixed: false,
      candidate_id: b.candidate_id || undefined,
      confidence: typeof b.confidence === "number" ? b.confidence : 0.85,
      rationale: b.rationale || "cache hit",
    })
  }
  return out.sort((a, b) => DYNAMIC_KEYS.indexOf(a.key) - DYNAMIC_KEYS.indexOf(b.key))
}

function readPolicyCache(): PolicyCacheEntry[] {
  if (!fs.existsSync(POLICY_CACHE_PATH)) return []
  try {
    const raw = fs.readFileSync(POLICY_CACHE_PATH, "utf8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((e) => e && typeof e === "object") as PolicyCacheEntry[]
  } catch {
    return []
  }
}

function writePolicyCache(entries: PolicyCacheEntry[]): void {
  try {
    fs.mkdirSync(path.dirname(POLICY_CACHE_PATH), { recursive: true })
    fs.writeFileSync(POLICY_CACHE_PATH, JSON.stringify(entries, null, 2), "utf8")
  } catch (err: any) {
    console.error(`[z-mode] warn: failed writing cache: ${String(err?.message || err)}`)
  }
}

function findPolicyCacheHit(ctx: ZModeContext): PolicyCacheEntry | null {
  const now = Date.now()
  const entries = readPolicyCache()
    .filter((e) => now - e.updated_at <= CACHE_MAX_AGE_MS)
    .sort((a, b) => b.updated_at - a.updated_at)
  if (entries.length === 0) return null

  const id = contextId(ctx)
  const exact = entries.find((e) => e.context_id === id)
  if (exact) return exact

  const bucket = hourBucket(ctx.hour)
  const front = (ctx.frontmostApp || "").toLowerCase()
  const frontKnown = front && front !== "unknown"
  const project = ctx.activeProjectName || null
  const fallback = entries.find(
    (e) => {
      const cachedFront = (e.context.frontmost_app || "").toLowerCase()
      const frontMatches =
        !frontKnown || cachedFront === "_" || cachedFront === front
      return (
        frontMatches &&
        e.context.active_project === project &&
        e.context.hour_bucket === bucket
      )
    },
  )
  return fallback || null
}

function upsertPolicyCache(
  ctx: ZModeContext,
  decisionId: string,
  mappingEpochId: string,
  mode: string,
  dynamicBindings: Binding[],
): void {
  const now = Date.now()
  const id = contextId(ctx)
  const knownApps = new Set(Object.keys(APP_RELEVANCE).map((k) => k.toLowerCase()))
  const entry: PolicyCacheEntry = {
    context_id: id,
    created_at: now,
    updated_at: now,
    context: {
      frontmost_app:
        ctx.frontmostApp && ctx.frontmostApp.toLowerCase() !== "unknown"
          ? ctx.frontmostApp
          : "_",
      active_project: ctx.activeProjectName || null,
      hour_bucket: hourBucket(ctx.hour),
      running_signal_apps: ctx.runningApps
        .map((a) => a.toLowerCase())
        .filter((a) => knownApps.has(a))
        .sort(),
    },
    decision_id: decisionId,
    mapping_epoch_id: mappingEpochId,
    mode,
    dynamic_bindings: dynamicBindings,
  }

  const current = readPolicyCache()
  const idx = current.findIndex((e) => e.context_id === entry.context_id)
  if (idx >= 0) {
    entry.created_at = current[idx].created_at || now
    current[idx] = entry
  } else {
    current.push(entry)
  }
  current.sort((a, b) => b.updated_at - a.updated_at)
  writePolicyCache(current.slice(0, CACHE_MAX_ENTRIES))
}

function maybeSpawnRefresh(): void {
  if (!zeroLatency || disableAI || refreshCacheOnly || forceAI) return
  const stampPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Lin",
    ".zmode-refresh.stamp",
  )
  const now = Date.now()
  try {
    if (fs.existsSync(stampPath)) {
      const last = Number(fs.readFileSync(stampPath, "utf8").trim() || "0")
      if (now - last < REFRESH_THROTTLE_MS) return
    }
    fs.mkdirSync(path.dirname(stampPath), { recursive: true })
    fs.writeFileSync(stampPath, String(now), "utf8")
  } catch {}

  const scriptPath = "/Users/nikiv/config/i/kar/scripts/z-mode-update.ts"
  const child = spawn(
    "bun",
    ["run", scriptPath, "--refresh-cache", "--force-ai", "--no-widget"],
    {
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        Z_MODE_ZERO_LATENCY: "0",
      },
    },
  )
  child.unref()
}

function isCodeContext(ctx: ZModeContext): boolean {
  return CODE_APPS.some(
    (app) => ctx.frontmostApp === app || ctx.runningApps.includes(app),
  )
}

function flowTaskBaseScore(task: FlowTask): number {
  const name = task.name.toLowerCase()
  if (name === "default") return 10
  if (name === "dev") return 62
  if (name === "test") return 60
  if (name.includes("review")) return 59
  if (name.includes("fix")) return 57
  if (name.includes("check") || name.includes("lint")) return 54
  if (name.includes("build")) return 52
  if (name.includes("status")) return 47
  if (name.includes("logs")) return 45
  if (name.includes("start") || name.includes("run")) return 48
  if (name.includes("stop")) return 40
  return 42
}

function flowTaskLikelyNoise(name: string): boolean {
  const n = name.toLowerCase()
  return (
    n.includes("next-type") ||
    n.includes("predictor") ||
    n.includes("watchdog") ||
    n.includes("dataset") ||
    n.includes("capture")
  )
}

function isSignalFlowTaskName(name: string): boolean {
  const n = name.toLowerCase()
  const hyphenCount = (n.match(/-/g) || []).length
  const shortPrefixed = hyphenCount <= 1
  return (
    n === "dev" ||
    n === "test" ||
    n === "build" ||
    n === "check" ||
    n === "lint" ||
    n === "review" ||
    n === "fix" ||
    n === "status" ||
    n === "logs" ||
    n === "run" ||
    n === "start" ||
    n === "stop" ||
    n === "deploy" ||
    n === "release" ||
    n === "commit" ||
    n === "env" ||
    (shortPrefixed && n.startsWith("dev-")) ||
    (shortPrefixed && n.startsWith("build-")) ||
    (shortPrefixed && n.startsWith("check-")) ||
    (shortPrefixed && n.startsWith("lint-")) ||
    (shortPrefixed && n.startsWith("review-")) ||
    (shortPrefixed && n.startsWith("fix-")) ||
    (shortPrefixed && n.startsWith("deploy-")) ||
    (shortPrefixed && n.startsWith("release-")) ||
    (shortPrefixed && n.startsWith("logs-")) ||
    (shortPrefixed && n.startsWith("status-"))
  )
}

function extractFlowTasksFromText(text: string): string[] {
  const tasks: string[] = []
  if (!text) return tasks
  const regex = /(?:^|\s)f\s+([A-Za-z0-9:_-]+)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    const task = (m[1] || "").trim()
    if (!task || task.startsWith("-")) continue
    tasks.push(task)
  }
  return tasks
}

function buildCandidates(ctx: ZModeContext): Candidate[] {
  const candidates: Candidate[] = [...SLASH_COMMANDS.map((c) => ({ ...c, evidence: [...c.evidence] }))]

  const recentIntentTasks = new Set<string>()
  for (const intent of ctx.recentIntents.slice(-40)) {
    if (
      intent.title === "Next to Type" ||
      intent.title.toLowerCase().startsWith("z-mode")
    ) {
      continue
    }
    for (const task of extractFlowTasksFromText(`${intent.title || ""} ${intent.message || ""}`)) {
      recentIntentTasks.add(task)
    }
  }

  const bestByTask = new Map<string, { task: FlowTask; rank: number }>()
  const flowRootOrder = new Map(
    ctx.flowRootsScanned.map((root, idx) => [root, idx]),
  )
  for (const task of ctx.flowTasks.slice(0, 220)) {
    if (task.name === "default") continue
    if (flowTaskLikelyNoise(task.name)) continue

    const usage = ctx.flowTaskUsage[task.name]
    const isActive = Boolean(
      ctx.activeProject && ctx.activeProject === task.projectRoot,
    )
    const isFlowProject = task.projectName === "flow"
    const isIntentMentioned = recentIntentTasks.has(task.name)
    const hasUsage = Boolean(usage && usage.count > 0)
    const allowForeignProject = isIntentMentioned
    const usageCount = usage?.count || 0
    const isSignal = isSignalFlowTaskName(task.name)

    if (
      !isActive &&
      !isFlowProject &&
      !allowForeignProject
    ) {
      continue
    }

    if (
      !isActive &&
      !hasUsage &&
      !isIntentMentioned &&
      !isSignal
    ) {
      continue
    }

    // In non-active projects, keep only high-signal or repeatedly-used tasks.
    if (!isActive && !isSignal && usageCount < 3 && !isIntentMentioned) {
      continue
    }

    let rank = flowTaskBaseScore(task)
    if (isActive) rank += 28
    if (isFlowProject) rank += 25
    if (hasUsage) rank += Math.min(16, usage!.count)
    if (isIntentMentioned) rank += 8
    const rootIdx = flowRootOrder.get(task.projectRoot)
    if (rootIdx !== undefined) {
      rank += Math.max(0, 8 - rootIdx)
    }

    const current = bestByTask.get(task.name)
    if (!current || rank > current.rank) {
      bestByTask.set(task.name, { task, rank })
    }
  }

  for (const { task } of bestByTask.values()) {
    const usage = ctx.flowTaskUsage[task.name]
    const base = flowTaskBaseScore(task)
    const preferred =
      FLOW_KEY_HINTS[task.name.toLowerCase()] || task.name[0]?.toLowerCase()
    const evidence = [`flow:${task.projectName}`, `base:${base}`]
    if (usage) evidence.push(`history:${usage.count}`)
    if (ctx.activeProject && ctx.activeProject === task.projectRoot) {
      evidence.push("active_project")
    }
    if (task.projectName === "flow") evidence.push("flow_home")
    if (recentIntentTasks.has(task.name)) evidence.push("recent_lin_intent")

    candidates.push({
      id: `flow:${task.projectName}:${task.name}`,
      action: `paste("f ${task.name}")`,
      label: `${task.projectName}: f ${task.name}`,
      score: base,
      source: "flow",
      preferredKey: preferred,
      evidence,
    })
  }

  const appRelevanceLower = new Map(
    Object.entries(APP_RELEVANCE).map(([k, v]) => [k.toLowerCase(), { name: k, score: v }]),
  )
  const appHintsLower = new Map(
    Object.entries(APP_KEY_HINTS).map(([k, v]) => [k.toLowerCase(), v]),
  )

  for (const app of ctx.runningApps) {
    const info = appRelevanceLower.get(app.toLowerCase())
    if (!info) continue
    candidates.push({
      id: `app:${info.name}`,
      action: `openAppToggle("${info.name}")`,
      label: `Toggle ${info.name}`,
      score: 30 + info.score,
      source: "app",
      preferredKey: appHintsLower.get(app.toLowerCase()),
      evidence: ["running_app", `relevance:${info.score}`],
    })
  }

  if (isCodeContext(ctx)) {
    candidates.push(
      {
        id: "prompt-study",
        action: 'enter("study this codebase")',
        label: "Study codebase",
        score: 34,
        source: "prompt",
        preferredKey: "m",
        evidence: ["coding_context"],
      },
      {
        id: "prompt-fix",
        action: 'paste("explain this error and fix it")',
        label: "Fix error prompt",
        score: 32,
        source: "prompt",
        preferredKey: "v",
        evidence: ["coding_context"],
      },
      {
        id: "prompt-refactor",
        action: 'paste("refactor this to be cleaner")',
        label: "Refactor prompt",
        score: 30,
        source: "prompt",
        preferredKey: "b",
        evidence: ["coding_context"],
      },
    )
  }

  if (ctx.runningApps.some((a) => a.toLowerCase() === "goose")) {
    candidates.push({
      id: "ctx-goose-docs",
      action: 'openUrl("https://block.github.io/goose/")',
      label: "Goose docs",
      score: 35,
      source: "contextual",
      preferredKey: "open_bracket",
      evidence: ["goose_running"],
    })
  }

  return candidates
}

function currentActionKeyMap(
  currentMappings: ReturnType<typeof readZModeMappings>,
): Map<string, string> {
  return new Map(currentMappings.map((m) => [m.toRaw, m.from]))
}

function applyContextScoring(
  candidates: Candidate[],
  ctx: ZModeContext,
  currentMappings: ReturnType<typeof readZModeMappings>,
): void {
  const coding = isCodeContext(ctx)
  const now = Date.now()
  const currentActionMap = currentActionKeyMap(currentMappings)

  const recentIntentTasks = new Set<string>()
  for (const intent of ctx.recentIntents.slice(-40)) {
    if (
      intent.title === "Next to Type" ||
      intent.title.toLowerCase().startsWith("z-mode")
    ) {
      continue
    }
    for (const task of extractFlowTasksFromText(`${intent.title || ""} ${intent.message || ""}`)) {
      recentIntentTasks.add(task)
    }
  }

  for (const c of candidates) {
    if (coding && c.source === "slash") {
      c.score += 8
      c.evidence.push("coding:+8")
    }

    if (c.source === "flow") {
      const taskNameMatch = c.action.match(/^paste\("f\s+([^"]+)"\)$/)
      const taskName = taskNameMatch?.[1]
      if (taskName) {
        const usage = ctx.flowTaskUsage[taskName]
        if (usage) {
          const usageBoost = Math.min(28, Math.floor(usage.count * 1.8))
          c.score += usageBoost
          c.evidence.push(`usage:+${usageBoost}`)

          const ageHours = usage.lastUsed > 0 ? (now - usage.lastUsed) / 3_600_000 : 999
          if (ageHours < 3) {
            c.score += 12
            c.evidence.push("recent:+12")
          } else if (ageHours < 24) {
            c.score += 7
            c.evidence.push("recent:+7")
          }
        }

        if (flowTaskLikelyNoise(taskName)) {
          c.score -= 30
          c.evidence.push("noise:-30")
        }

        if (recentIntentTasks.has(taskName)) {
          c.score += 12
          c.evidence.push("lin_intent:+12")
        }

        if (ctx.activeProjectName && c.label.startsWith(`${ctx.activeProjectName}:`)) {
          c.score += 20
          c.evidence.push("active_project:+20")
        }
      }
    }

    if (c.source === "app" && c.label.includes(ctx.frontmostApp)) {
      c.score += 5
      c.evidence.push("frontmost:+5")
    }

    if (c.preferredKey && ctx.keyUsage[c.preferredKey]) {
      const stats = ctx.keyUsage[c.preferredKey]
      const boost = Math.min(10, Math.floor(stats.count / 4))
      c.score += boost
      c.evidence.push(`key_usage:+${boost}`)
    }

    const existingKey = currentActionMap.get(c.action)
    if (existingKey) {
      c.score += 8
      c.evidence.push("stability:+8")
      if (DYNAMIC_KEYS.includes(existingKey) && !FIXED.some((f) => f.fixedKey === existingKey)) {
        c.preferredKey = existingKey
      }
    }

    if (ctx.hour >= 9 && ctx.hour <= 11) {
      if (c.action.includes("/plan") || c.action.includes("/review")) {
        c.score += 4
        c.evidence.push("morning:+4")
      }
    } else if (ctx.hour >= 16) {
      if (c.action.includes("/commit") || c.action.includes("f test")) {
        c.score += 4
        c.evidence.push("evening:+4")
      }
    }
  }
}

function deterministicAssignDynamic(
  candidates: Candidate[],
  usedKeys: Set<string>,
): Binding[] {
  const bindings: Binding[] = []
  const pool = [...candidates].sort((a, b) => b.score - a.score)

  const assigned = new Set<number>()
  for (let i = 0; i < pool.length; i++) {
    const c = pool[i]
    if (!c.preferredKey) continue
    if (usedKeys.has(c.preferredKey)) continue
    if (!DYNAMIC_KEYS.includes(c.preferredKey)) continue
    bindings.push({
      key: c.preferredKey,
      action: c.action,
      note: c.label,
      score: c.score,
      source: c.source,
      fixed: false,
      candidate_id: c.id,
      confidence: 0.78,
      rationale: "deterministic preferred key",
    })
    usedKeys.add(c.preferredKey)
    assigned.add(i)
  }

  const available = DYNAMIC_KEYS.filter((k) => !usedKeys.has(k))
  let keyIndex = 0
  for (let i = 0; i < pool.length; i++) {
    if (assigned.has(i)) continue
    if (keyIndex >= available.length) break
    const key = available[keyIndex++]
    bindings.push({
      key,
      action: pool[i].action,
      note: pool[i].label,
      score: pool[i].score,
      source: pool[i].source,
      fixed: false,
      candidate_id: pool[i].id,
      confidence: 0.72,
      rationale: "deterministic top score",
    })
    usedKeys.add(key)
  }

  return bindings
}

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced && fenced[1]) return fenced[1].trim()
  const first = text.indexOf("{")
  const last = text.lastIndexOf("}")
  if (first === -1 || last === -1 || last <= first) return null
  return text.slice(first, last + 1)
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(1, v))
}

function validatePlan(
  raw: unknown,
  availableKeys: string[],
  candidateIds: Set<string>,
): AIPlan | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.assignments)) return null

  const usedKeys = new Set<string>()
  const usedCandidates = new Set<string>()
  const assignments: AIPlanAssignment[] = []

  for (const item of obj.assignments) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    const key = typeof row.key === "string" ? row.key : ""
    const candidateId = typeof row.candidate_id === "string" ? row.candidate_id : ""
    const reason = typeof row.reason === "string" ? row.reason.slice(0, 200) : ""
    const confidence = clamp01(Number(row.confidence ?? 0.7))
    if (!availableKeys.includes(key)) continue
    if (!candidateIds.has(candidateId)) continue
    if (usedKeys.has(key) || usedCandidates.has(candidateId)) continue
    usedKeys.add(key)
    usedCandidates.add(candidateId)
    assignments.push({ key, candidate_id: candidateId, confidence, reason })
  }

  if (assignments.length === 0) return null

  let globalConfidence = Number(obj.global_confidence ?? 0.7)
  if (!Number.isFinite(globalConfidence)) globalConfidence = 0.7

  const drops = Array.isArray(obj.drops)
    ? obj.drops
        .filter((d) => d && typeof d === "object")
        .map((d) => {
          const row = d as Record<string, unknown>
          return {
            candidate_id:
              typeof row.candidate_id === "string" ? row.candidate_id : "",
            reason: typeof row.reason === "string" ? row.reason.slice(0, 200) : "",
          }
        })
        .filter((d) => d.candidate_id)
    : []

  return {
    assignments,
    drops,
    global_confidence: clamp01(globalConfidence),
  }
}

function flowEnvGet(key: string): string | null {
  const envPath = path.join(
    os.homedir(),
    ".config",
    "flow",
    "env-local",
    "personal",
    "production.env",
  )
  if (!fs.existsSync(envPath)) return null
  try {
    const src = fs.readFileSync(envPath, "utf8")
    for (const line of src.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq <= 0) continue
      const k = trimmed.slice(0, eq).trim()
      if (k !== key) continue
      return trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "")
    }
  } catch {}
  return null
}

function normalizeChatCompletionsUrl(raw: string): string {
  let url = raw.trim()
  if (!url) return ""
  if (url.endsWith("/chat/completions")) return url
  if (url.endsWith("/v1")) return `${url}/chat/completions`
  if (url.endsWith("/v1/")) return `${url}chat/completions`
  if (url.endsWith("/")) return `${url}v1/chat/completions`
  if (url.endsWith("/v1/messages")) return url.replace(/\/v1\/messages$/, "/v1/chat/completions")
  return `${url}/v1/chat/completions`
}

function resolveLLMConfig(): LLMConfig | null {
  const get = (k: string): string | null => process.env[k] || flowEnvGet(k)

  const anthropicKey = get("ANTHROPIC_API_KEY")
  if (anthropicKey) {
    const haikuPreferred = process.env.Z_MODE_HAIKU_MODEL
    const sonnetPreferred = process.env.Z_MODE_SONNET_MODEL
    return {
      provider: "anthropic",
      source: process.env.ANTHROPIC_API_KEY ? "env:ANTHROPIC_API_KEY" : "flow:ANTHROPIC_API_KEY",
      apiKey: anthropicKey,
      apiUrl: "https://api.anthropic.com/v1/messages",
      haikuModels: [
        haikuPreferred || "",
        "claude-3-5-haiku-latest",
        "claude-3-5-haiku-20241022",
        "claude-3-haiku-20240307",
      ],
      sonnetModels: [
        sonnetPreferred || "",
        "claude-sonnet-4-5",
        "claude-3-7-sonnet-latest",
        "claude-3-5-sonnet-latest",
        "claude-3-5-sonnet-20241022",
      ],
    }
  }

  const genKey = get("GEN_API_KEY")
  if (genKey) {
    const genUrl =
      get("GEN_API_URL") ||
      "https://api.gen.new/v1/chat/completions"
    return {
      provider: "openai_compat",
      source: process.env.GEN_API_KEY ? "env:GEN_API_KEY" : "flow:GEN_API_KEY",
      apiKey: genKey,
      apiUrl: normalizeChatCompletionsUrl(genUrl),
      haikuModels: [
        process.env.Z_MODE_HAIKU_MODEL || "",
        "anthropic/claude-3-5-haiku-latest",
        "anthropic/claude-3-5-haiku-20241022",
        "anthropic/claude-3-haiku-20240307",
      ],
      sonnetModels: [
        process.env.Z_MODE_SONNET_MODEL || "",
        "anthropic/claude-sonnet-4-5",
        "anthropic/claude-3-7-sonnet-latest",
        "anthropic/claude-3-5-sonnet-latest",
        "anthropic/claude-3-5-sonnet-20241022",
      ],
    }
  }

  const openRouterKey = get("OPENROUTER_API_KEY")
  if (openRouterKey) {
    return {
      provider: "openai_compat",
      source: process.env.OPENROUTER_API_KEY
        ? "env:OPENROUTER_API_KEY"
        : "flow:OPENROUTER_API_KEY",
      apiKey: openRouterKey,
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      haikuModels: [
        process.env.Z_MODE_HAIKU_MODEL || "",
        "anthropic/claude-3-5-haiku-latest",
        "anthropic/claude-3-5-haiku-20241022",
        "anthropic/claude-3-haiku-20240307",
      ],
      sonnetModels: [
        process.env.Z_MODE_SONNET_MODEL || "",
        "anthropic/claude-sonnet-4-5",
        "anthropic/claude-3-7-sonnet-latest",
        "anthropic/claude-3-5-sonnet-latest",
        "anthropic/claude-3-5-sonnet-20241022",
      ],
    }
  }

  return null
}

async function callLLM(
  config: LLMConfig,
  model: string,
  system: string,
  prompt: string,
  maxTokens = 1400,
): Promise<string> {
  if (config.provider === "anthropic") {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(35_000),
    })

    const text = await response.text()
    if (!response.ok) {
      throw new Error(`anthropic ${response.status}: ${text.slice(0, 500)}`)
    }
    const json = JSON.parse(text) as any
    const content = Array.isArray(json.content) ? json.content : []
    const joined = content
      .filter((b: any) => b?.type === "text" && typeof b?.text === "string")
      .map((b: any) => b.text)
      .join("\n")
      .trim()
    if (!joined) throw new Error("anthropic: empty text response")
    return joined
  }

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(35_000),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`chat-completions ${response.status}: ${text.slice(0, 500)}`)
  }
  const json = JSON.parse(text) as any
  const message = json?.choices?.[0]?.message?.content
  if (typeof message === "string" && message.trim()) return message.trim()
  if (Array.isArray(message)) {
    const chunks = message
      .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim()
    if (chunks) return chunks
  }
  throw new Error("chat-completions: empty message")
}

function dedupeModelList(models: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const model of models) {
    const trimmed = model.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

async function callLLMWithFallback(
  config: LLMConfig,
  models: string[],
  system: string,
  prompt: string,
  maxTokens = 1400,
): Promise<{ text: string; model: string }> {
  const attempts: string[] = []
  const modelList = dedupeModelList(models)
  for (const model of modelList) {
    try {
      const text = await callLLM(config, model, system, prompt, maxTokens)
      return { text, model }
    } catch (err: any) {
      attempts.push(`${model}: ${String(err?.message || err)}`)
    }
  }
  throw new Error(`all models failed: ${attempts.join(" | ")}`)
}

function buildModerationPrompt(
  phase: "haiku" | "sonnet",
  ctx: ZModeContext,
  availableKeys: string[],
  fixedBindings: Binding[],
  candidatePool: Candidate[],
  baseline: Binding[],
  haikuPlan?: AIPlan,
): string {
  const payload = {
    objective:
      "Create a highly useful z-layer for action execution. Do NOT output text prediction or autocomplete behavior. Prioritize flow tasks, agent commands, review/test/fix, and active app toggles.",
    phase,
    context: {
      frontmost_app: ctx.frontmostApp,
      active_project: ctx.activeProjectName,
      zed_project: ctx.zedProject,
      running_apps: ctx.runningApps,
      hour: ctx.hour,
      day: ctx.dayOfWeek,
      flow_roots_scanned: ctx.flowRootsScanned,
      flow_task_count: ctx.flowTasks.length,
      top_flow_usage: Object.entries(ctx.flowTaskUsage)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 20)
        .map(([task, stats]) => ({ task, count: stats.count, last_used: stats.lastUsed })),
      recent_intents: ctx.recentIntents
        .filter((i) => i.title !== "Next to Type")
        .slice(-15)
        .map((i) => ({ title: i.title, message: i.message || "" })),
    },
    keys: {
      fixed: fixedBindings.map((b) => ({ key: b.key, candidate_id: b.candidate_id, note: b.note })),
      dynamic_available: availableKeys,
    },
    candidates: candidatePool.map((c) => ({
      id: c.id,
      label: c.label,
      action: c.action,
      score: c.score,
      source: c.source,
      preferred_key: c.preferredKey || null,
      evidence: c.evidence,
    })),
    baseline: baseline
      .filter((b) => !b.fixed)
      .map((b) => ({ key: b.key, candidate_id: b.candidate_id, note: b.note, score: b.score })),
    prior_haiku_plan: haikuPlan || null,
    rules: [
      "Use ONLY candidate ids from candidates[].id.",
      "Use ONLY keys from keys.dynamic_available.",
      "Do not assign the same candidate_id twice.",
      "Do not assign the same key twice.",
      "Keep high-scoring baseline bindings unless a better option exists.",
      "Prefer active-project flow tasks and frequently used flow tasks.",
      "Never generate text-completion/next-token style actions.",
    ],
    output_schema: {
      assignments: [
        {
          key: "d",
          candidate_id: "flow:project:dev",
          confidence: 0.91,
          reason: "high flow usage + active project",
        },
      ],
      drops: [{ candidate_id: "flow:project:next-type-start", reason: "low utility" }],
      global_confidence: 0.84,
    },
  }

  return JSON.stringify(payload, null, 2)
}

function mergePlanWithBaseline(
  plan: AIPlan,
  availableKeys: string[],
  candidatesById: Map<string, Candidate>,
  baselineDynamic: Binding[],
): Binding[] {
  const out: Binding[] = []
  const usedKeys = new Set<string>()
  const usedCandidates = new Set<string>()

  for (const assign of plan.assignments) {
    if (!availableKeys.includes(assign.key)) continue
    const candidate = candidatesById.get(assign.candidate_id)
    if (!candidate) continue
    if (usedKeys.has(assign.key) || usedCandidates.has(assign.candidate_id)) continue
    out.push({
      key: assign.key,
      action: candidate.action,
      note: candidate.label,
      score: candidate.score,
      source: candidate.source,
      fixed: false,
      candidate_id: candidate.id,
      confidence: assign.confidence,
      rationale: assign.reason,
    })
    usedKeys.add(assign.key)
    usedCandidates.add(assign.candidate_id)
  }

  for (const b of baselineDynamic) {
    if (!availableKeys.includes(b.key)) continue
    if (!b.candidate_id) continue
    if (usedKeys.has(b.key) || usedCandidates.has(b.candidate_id)) continue
    out.push({
      ...b,
      confidence: b.confidence ?? 0.7,
      rationale: b.rationale || "baseline fill",
    })
    usedKeys.add(b.key)
    usedCandidates.add(b.candidate_id)
  }

  return out.sort((a, b) => DYNAMIC_KEYS.indexOf(a.key) - DYNAMIC_KEYS.indexOf(b.key))
}

async function runAIModeration(
  ctx: ZModeContext,
  fixedBindings: Binding[],
  dynamicCandidates: Candidate[],
  baselineDynamic: Binding[],
): Promise<{ bindings: Binding[]; moderation: ModerationResult }> {
  const candidatePool = [...dynamicCandidates]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(availableDynamicKeys(fixedBindings).length * 3, 28))

  const candidatesById = new Map(candidatePool.map((c) => [c.id, c]))
  const candidateIds = new Set(candidatePool.map((c) => c.id))
  const available = availableDynamicKeys(fixedBindings)

  const fallbackBindings = baselineDynamic
  const moderation: ModerationResult = {
    enabled: true,
    errors: [],
  }

  const llm = resolveLLMConfig()
  if (!llm) {
    moderation.enabled = false
    moderation.errors.push("No LLM config found (ANTHROPIC_API_KEY / GEN_API_KEY / OPENROUTER_API_KEY)")
    return { bindings: fallbackBindings, moderation }
  }

  moderation.source = llm.source
  moderation.provider = llm.provider
  moderation.haiku_model = dedupeModelList(llm.haikuModels)[0]
  moderation.sonnet_model = dedupeModelList(llm.sonnetModels)[0]

  const system =
    "You optimize keyboard command layers. Return JSON only. Never invent candidate ids or keys."

  let haikuPlan: AIPlan | null = null
  try {
    const haikuPrompt = buildModerationPrompt(
      "haiku",
      ctx,
      available,
      fixedBindings,
      candidatePool,
      [...fixedBindings, ...baselineDynamic],
    )
    if (showPrompts) {
      console.error("[z-mode][haiku prompt]\n" + haikuPrompt)
    }
    const haiku = await callLLMWithFallback(
      llm,
      llm.haikuModels,
      system,
      haikuPrompt,
    )
    moderation.haiku_model = haiku.model
    const haikuText = haiku.text
    const haikuJson = extractJsonObject(haikuText)
    if (!haikuJson) throw new Error("haiku: no JSON object in response")
    const parsed = JSON.parse(haikuJson)
    haikuPlan = validatePlan(parsed, available, candidateIds)
    if (!haikuPlan) throw new Error("haiku: invalid plan schema")
    moderation.haiku_ok = true
  } catch (err: any) {
    moderation.haiku_ok = false
    moderation.errors.push(String(err?.message || err))
  }

  if (!haikuPlan) {
    return { bindings: fallbackBindings, moderation }
  }

  try {
    const sonnetPrompt = buildModerationPrompt(
      "sonnet",
      ctx,
      available,
      fixedBindings,
      candidatePool,
      [...fixedBindings, ...baselineDynamic],
      haikuPlan,
    )
    if (showPrompts) {
      console.error("[z-mode][sonnet prompt]\n" + sonnetPrompt)
    }
    const sonnet = await callLLMWithFallback(
      llm,
      llm.sonnetModels,
      system,
      sonnetPrompt,
    )
    moderation.sonnet_model = sonnet.model
    const sonnetText = sonnet.text
    const sonnetJson = extractJsonObject(sonnetText)
    if (!sonnetJson) throw new Error("sonnet: no JSON object in response")
    const parsed = JSON.parse(sonnetJson)
    const sonnetPlan = validatePlan(parsed, available, candidateIds)
    if (!sonnetPlan) throw new Error("sonnet: invalid plan schema")
    moderation.sonnet_ok = true
    moderation.global_confidence = sonnetPlan.global_confidence

    return {
      bindings: mergePlanWithBaseline(
        sonnetPlan,
        available,
        candidatesById,
        baselineDynamic,
      ),
      moderation,
    }
  } catch (err: any) {
    moderation.sonnet_ok = false
    moderation.errors.push(String(err?.message || err))
    moderation.global_confidence = haikuPlan.global_confidence

    return {
      bindings: mergePlanWithBaseline(
        haikuPlan,
        available,
        candidatesById,
        baselineDynamic,
      ),
      moderation,
    }
  }
}

function availableDynamicKeys(fixedBindings: Binding[]): string[] {
  const used = new Set(fixedBindings.map((b) => b.key))
  return DYNAMIC_KEYS.filter((k) => !used.has(k))
}

function enforceReservedBindings(bindings: Binding[]): Binding[] {
  const tableBinding: Binding = {
    key: Z_MODE_TABLE_KEY,
    action: Z_MODE_TABLE_ACTION,
    note: Z_MODE_TABLE_NOTE,
    score: 100,
    source: "core",
    fixed: true,
    candidate_id: "fixed-show-layer",
    confidence: 1,
    rationale: "reserved",
  }

  const next = bindings
    .filter((b) => b.key !== Z_MODE_TABLE_KEY)
    .sort((a, b) => (a.fixed === b.fixed ? 0 : a.fixed ? -1 : 1))

  return [tableBinding, ...next]
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function resolveSeqMemPath(): string {
  const raw =
    process.env.SEQ_CH_MEM_PATH ||
    "~/repos/ClickHouse/ClickHouse/user_files/seq_mem.jsonl"
  if (raw.startsWith("~/")) return path.join(os.homedir(), raw.slice(2))
  return raw
}

function appendSeqRows(rows: SeqRow[]): void {
  if (rows.length === 0) return
  const seqMemPath = resolveSeqMemPath()
  try {
    fs.mkdirSync(path.dirname(seqMemPath), { recursive: true })
    const payload = rows.map((r) => JSON.stringify(r)).join("\n") + "\n"
    fs.appendFileSync(seqMemPath, payload, "utf8")
  } catch (err: any) {
    console.error(
      `[z-mode] warn: failed to append policy rows to seq_mem (${seqMemPath}): ${String(err?.message || err)}`,
    )
  }
}

function emitSeqEvent(
  name: string,
  subjectObj: Record<string, unknown>,
  ok: boolean,
  tsMs = Date.now(),
): void {
  const subject = JSON.stringify(subjectObj)
  const eventId = sha256(
    `${name}|${tsMs}|${subjectObj.decision_id || ""}|${subjectObj.apply_id || ""}`,
  )
  const row: SeqRow = {
    ts_ms: tsMs,
    dur_us: 0,
    ok,
    session_id: "zmode-policy",
    event_id: eventId,
    content_hash: sha256(subject),
    name,
    subject,
  }
  appendSeqRows([row])
}

function policyMode(moderation: ModerationResult): string {
  if (moderation.source === "cache-hit") return "cache"
  if (!moderation.enabled) return "baseline"
  if (moderation.sonnet_ok) return "sonnet+haiku"
  if (moderation.haiku_ok) return "haiku"
  return "baseline"
}

function computeDecisionId(
  generatedAt: number,
  ctx: ZModeContext,
  bindings: Binding[],
): string {
  const fingerprint = {
    frontmost_app: ctx.frontmostApp,
    active_project: ctx.activeProjectName,
    running_apps: [...ctx.runningApps].sort(),
    selected: bindings.map((b) => ({
      key: b.key,
      action: b.action,
      candidate_id: b.candidate_id || "",
    })),
  }
  return sha256(
    `zmode.policy.decision.v1|${generatedAt}|${JSON.stringify(fingerprint)}`,
  )
}

function computeMappingEpochId(bindings: Binding[]): string {
  return sha256(
    `zmode.mapping.epoch.v1|${JSON.stringify(
      bindings.map((b) => ({ key: b.key, action: b.action })),
    )}`,
  )
}

function computeDiff(
  bindings: Binding[],
  currentMappings: ReturnType<typeof readZModeMappings>,
): DiffEntry[] {
  const diff: DiffEntry[] = []
  const currentByKey = new Map(currentMappings.map((m) => [m.from, m]))
  const newByKey = new Map(bindings.map((b) => [b.key, b]))

  for (const b of bindings) {
    const cur = currentByKey.get(b.key)
    if (!cur) {
      diff.push({
        key: b.key,
        prev_action: null,
        prev_note: null,
        new_action: b.action,
        new_note: b.note,
        reason: b.rationale || `New: ${b.source}`,
      })
    } else if (cur.toRaw !== b.action) {
      diff.push({
        key: b.key,
        prev_action: cur.toRaw,
        prev_note: cur.note || cur.to,
        new_action: b.action,
        new_note: b.note,
        reason: b.rationale || `${b.source} scored ${b.score}`,
      })
    }
  }

  for (const [key, cur] of currentByKey) {
    if (!newByKey.has(key)) {
      diff.push({
        key,
        prev_action: cur.toRaw,
        prev_note: cur.note || cur.to,
        new_action: "(removed)",
        new_note: "",
        reason: "Not selected",
      })
    }
  }

  return diff
}

function writePreviewFile(preview: Preview): string {
  const previewPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Lin",
    "z-mode-preview.json",
  )
  fs.mkdirSync(path.dirname(previewPath), { recursive: true })
  fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2), "utf8")
  return previewPath
}

function writePolicyEpochSidecar(payload: Record<string, unknown>): string {
  const sidecarPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Lin",
    "z-mode-policy-epoch.json",
  )
  fs.mkdirSync(path.dirname(sidecarPath), { recursive: true })
  fs.writeFileSync(sidecarPath, JSON.stringify(payload, null, 2), "utf8")
  return sidecarPath
}

function showWidget(preview: Preview): void {
  const lines = preview.bindings
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map((b) => `${b.key} → ${b.note}${b.fixed ? " [fixed]" : ""}`)

  const changedCount = preview.diff.filter(
    (d) => d.prev_action !== null && d.new_action !== "(removed)",
  ).length
  const newCount = preview.diff.filter((d) => d.prev_action === null).length
  const removedCount = preview.diff.filter(
    (d) => d.new_action === "(removed)",
  ).length

  let title = `z-mode (${preview.bindings.length} keys)`
  const parts: string[] = []
  if (preview.moderation.source === "cache-hit") {
    parts.push("cache")
  } else if (preview.moderation.enabled) {
    const mode = preview.moderation.sonnet_ok
      ? "sonnet+haiku"
      : preview.moderation.haiku_ok
        ? "haiku"
        : "baseline"
    parts.push(mode)
  } else {
    parts.push("baseline")
  }
  if (changedCount > 0) parts.push(`${changedCount} changed`)
  if (newCount > 0) parts.push(`${newCount} new`)
  if (removedCount > 0) parts.push(`${removedCount} removed`)
  if (parts.length > 0) title += ` — ${parts.join(", ")}`

  const payload = {
    kind: "widget",
    title,
    message: lines.join("\n"),
    createdAt: Date.now(),
    expiresAt: Date.now() + 18_000,
  }

  const inboxPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Lin",
    "intent-inbox.jsonl",
  )

  try {
    fs.mkdirSync(path.dirname(inboxPath), { recursive: true })
    fs.appendFileSync(inboxPath, JSON.stringify(payload) + "\n", "utf8")
  } catch {}
}

function esc(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

async function main() {
  console.error("[z-mode] gathering context...")
  const ctx = gatherContext({
    fast: zeroLatency && !refreshCacheOnly && !forceAI,
  })

  if (showContext) {
    console.log(JSON.stringify(ctx, null, 2))
    return
  }

  console.error(
    `[z-mode] frontmost=${ctx.frontmostApp} project=${ctx.activeProjectName || "none"} flow=${ctx.flowTasks.length} roots=${ctx.flowRootsScanned.length}`,
  )

  const currentMappings = readZModeMappings()

  const candidates = buildCandidates(ctx)
  applyContextScoring(candidates, ctx, currentMappings)

  const fixedBindings: Binding[] = FIXED.map((f) => ({
    key: f.fixedKey!,
    action: f.action,
    note: f.label,
    score: f.score,
    source: f.source,
    fixed: true,
    candidate_id: f.id,
    confidence: 1,
    rationale: "fixed",
  }))

  const usedKeys = new Set(fixedBindings.map((b) => b.key))
  const dynamicCandidates = candidates
    .filter((c) => !c.fixed)
    .sort((a, b) => b.score - a.score)

  const baselineDynamic = deterministicAssignDynamic(dynamicCandidates, new Set(usedKeys))
  const fixedKeySet = new Set(fixedBindings.map((b) => b.key))
  const cacheHit =
    (zeroLatency && !forceAI && !refreshCacheOnly) ? findPolicyCacheHit(ctx) : null

  let chosenDynamic = baselineDynamic
  let moderation: ModerationResult = {
    enabled: false,
    errors: [],
  }

  if (cacheHit) {
    const cachedDynamic = normalizeDynamicBindings(cacheHit.dynamic_bindings || [], fixedKeySet)
    if (cachedDynamic.length > 0) {
      chosenDynamic = cachedDynamic
      moderation = {
        enabled: false,
        source: "cache-hit",
        errors: [],
      }
      console.error(
        `[z-mode] zero-latency cache hit (${cacheHit.mode}) updated=${new Date(cacheHit.updated_at).toISOString()}`,
      )
    } else {
      chosenDynamic = baselineDynamic
      moderation = {
        enabled: false,
        source: "cache-miss",
        errors: ["cache payload empty; used deterministic baseline"],
      }
      console.error("[z-mode] zero-latency cache invalid -> baseline")
    }
    maybeSpawnRefresh()
  } else if (zeroLatency && !forceAI && !refreshCacheOnly) {
    chosenDynamic = baselineDynamic
    moderation = {
      enabled: false,
      source: "cache-miss",
      errors: ["cache miss; used deterministic baseline"],
    }
    console.error("[z-mode] zero-latency cache miss -> baseline")
    maybeSpawnRefresh()
  } else if (!disableAI) {
    const ai = await runAIModeration(ctx, fixedBindings, dynamicCandidates, baselineDynamic)
    chosenDynamic = ai.bindings
    moderation = ai.moderation
  } else {
    moderation.errors = ["AI disabled (--no-ai)"]
  }

  const bindings = enforceReservedBindings([
    ...fixedBindings,
    ...chosenDynamic.filter((b) => b.key !== Z_MODE_TABLE_KEY),
  ])

  const diff = computeDiff(bindings, currentMappings)
  const generatedAt = Date.now()
  const decisionId = computeDecisionId(generatedAt, ctx, bindings)
  const mappingEpochId = computeMappingEpochId(bindings)
  upsertPolicyCache(
    ctx,
    decisionId,
    mappingEpochId,
    policyMode(moderation),
    chosenDynamic.filter((b) => !b.fixed),
  )

  const hotFlow = Object.entries(ctx.flowTaskUsage)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([task, stats]) => ({ task, count: stats.count }))

  const preview: Preview = {
    version: 2,
    generated_at: generatedAt,
    decision_id: decisionId,
    mapping_epoch_id: mappingEpochId,
    context: {
      frontmost_app: ctx.frontmostApp,
      active_project: ctx.activeProjectName,
      zed_project: ctx.zedProject,
      flow_tasks: ctx.flowTasks
        .slice(0, 80)
        .map((t) => `${t.projectName}:${t.name}`),
      flow_roots_scanned: ctx.flowRootsScanned,
      running_apps: ctx.runningApps,
      hour: ctx.hour,
      day: ctx.dayOfWeek,
      hot_flow_tasks: hotFlow,
    },
    moderation,
    bindings,
    diff,
  }

  const previewPath = writePreviewFile(preview)
  console.error(`[z-mode] preview -> ${previewPath}`)

  emitSeqEvent(
    "zmode.policy.decision.v1",
    {
      schema_version: "zmode_policy_decision_v1",
      decision_id: decisionId,
      mapping_epoch_id: mappingEpochId,
      ts_ms: generatedAt,
      mode: policyMode(moderation),
      context: {
        frontmost_app: ctx.frontmostApp,
        active_project: ctx.activeProjectName,
        zed_project: ctx.zedProject,
        hour: ctx.hour,
        day: ctx.dayOfWeek,
        running_apps: ctx.runningApps,
        flow_roots_scanned: ctx.flowRootsScanned,
      },
      candidate_pool: dynamicCandidates
        .slice(0, 80)
        .map((c) => ({
          id: c.id,
          action: c.action,
          label: c.label,
          score: c.score,
          source: c.source,
          preferred_key: c.preferredKey || null,
          evidence: c.evidence,
        })),
      selected_bindings: bindings.map((b) => ({
        key: b.key,
        action: b.action,
        note: b.note,
        candidate_id: b.candidate_id || null,
        confidence: b.confidence ?? null,
        rationale: b.rationale || null,
        fixed: b.fixed,
      })),
      llm_meta: {
        moderation_enabled: moderation.enabled,
        provider: moderation.provider || null,
        source: moderation.source || null,
        haiku_model: moderation.haiku_model || null,
        sonnet_model: moderation.sonnet_model || null,
        haiku_ok: Boolean(moderation.haiku_ok),
        sonnet_ok: Boolean(moderation.sonnet_ok),
        global_confidence: moderation.global_confidence ?? null,
        errors: moderation.errors,
      },
      diff_summary: {
        changed: diff.filter(
          (d) => d.prev_action !== null && d.new_action !== "(removed)",
        ).length,
        new: diff.filter((d) => d.prev_action === null).length,
        removed: diff.filter((d) => d.new_action === "(removed)").length,
      },
      preview_path: previewPath,
    },
    true,
    generatedAt,
  )

  const epochSidecarPath = writePolicyEpochSidecar({
    schema_version: "zmode_policy_epoch_v1",
    updated_at_ms: generatedAt,
    decision_id: decisionId,
    mapping_epoch_id: mappingEpochId,
    mode: policyMode(moderation),
    compile_ok: null,
    apply_ts_ms: null,
    selected_bindings: bindings.map((b) => ({
      key: b.key,
      action: b.action,
      candidate_id: b.candidate_id || null,
      confidence: b.confidence ?? null,
      rationale: b.rationale || null,
      fixed: b.fixed,
    })),
    preview_path: previewPath,
  })
  console.error(`[z-mode] epoch sidecar -> ${epochSidecarPath}`)

  if (!noWidget) showWidget(preview)
  console.log(JSON.stringify(preview, null, 2))

  if (!shouldApply) {
    if (refreshCacheOnly) {
      console.error("[z-mode] refresh-cache complete")
      return
    }
    console.error(
      `[z-mode] ${bindings.length} bindings, ${diff.length} changes. Run --apply to write.`,
    )
    return
  }

  console.error("[z-mode] writing to config...")
  const mappingLines = bindings.map(
    (b) =>
      `        { from: "${b.key}", to: ${b.action}, note: "${esc(b.note)}" },`,
  )
  writeZModeMappings(mappingLines)

  const dry = compileKar(true)
  if (!dry.ok) {
    const applyTs = Date.now()
    emitSeqEvent(
      "zmode.policy.apply.v1",
      {
        schema_version: "zmode_policy_apply_v1",
        decision_id: decisionId,
        apply_id: sha256(`zmode.apply|${decisionId}|${applyTs}`),
        mapping_epoch_id: mappingEpochId,
        ts_ms: applyTs,
        compile_ok: false,
        phase: "dry_run",
        error: dry.output.slice(0, 4000),
        binding_count: bindings.length,
        diff_summary: {
          changed: diff.filter(
            (d) => d.prev_action !== null && d.new_action !== "(removed)",
          ).length,
          new: diff.filter((d) => d.prev_action === null).length,
          removed: diff.filter((d) => d.new_action === "(removed)").length,
        },
        preview_path: previewPath,
      },
      false,
      applyTs,
    )
    writePolicyEpochSidecar({
      schema_version: "zmode_policy_epoch_v1",
      updated_at_ms: applyTs,
      decision_id: decisionId,
      mapping_epoch_id: mappingEpochId,
      mode: policyMode(moderation),
      compile_ok: false,
      phase: "dry_run",
      apply_ts_ms: applyTs,
      error: dry.output.slice(0, 4000),
      selected_bindings: bindings.map((b) => ({
        key: b.key,
        action: b.action,
        candidate_id: b.candidate_id || null,
        fixed: b.fixed,
      })),
      preview_path: previewPath,
    })
    console.error("[z-mode] compile dry-run FAILED, reverting")
    console.error(dry.output)
    const revertLines = currentMappings.map(
      (m) =>
        `        { from: "${m.from}", to: ${m.toRaw}, note: "${esc(m.note || m.to)}" },`,
    )
    writeZModeMappings(revertLines)
    process.exit(1)
  }

  const result = compileKar(false)
  if (!result.ok) {
    const applyTs = Date.now()
    emitSeqEvent(
      "zmode.policy.apply.v1",
      {
        schema_version: "zmode_policy_apply_v1",
        decision_id: decisionId,
        apply_id: sha256(`zmode.apply|${decisionId}|${applyTs}`),
        mapping_epoch_id: mappingEpochId,
        ts_ms: applyTs,
        compile_ok: false,
        phase: "apply",
        error: result.output.slice(0, 4000),
        binding_count: bindings.length,
        diff_summary: {
          changed: diff.filter(
            (d) => d.prev_action !== null && d.new_action !== "(removed)",
          ).length,
          new: diff.filter((d) => d.prev_action === null).length,
          removed: diff.filter((d) => d.new_action === "(removed)").length,
        },
        preview_path: previewPath,
      },
      false,
      applyTs,
    )
    writePolicyEpochSidecar({
      schema_version: "zmode_policy_epoch_v1",
      updated_at_ms: applyTs,
      decision_id: decisionId,
      mapping_epoch_id: mappingEpochId,
      mode: policyMode(moderation),
      compile_ok: false,
      phase: "apply",
      apply_ts_ms: applyTs,
      error: result.output.slice(0, 4000),
      selected_bindings: bindings.map((b) => ({
        key: b.key,
        action: b.action,
        candidate_id: b.candidate_id || null,
        fixed: b.fixed,
      })),
      preview_path: previewPath,
    })
    console.error(`[z-mode] compile FAILED: ${result.output}`)
    process.exit(1)
  }

  const applyTs = Date.now()
  emitSeqEvent(
    "zmode.policy.apply.v1",
    {
      schema_version: "zmode_policy_apply_v1",
      decision_id: decisionId,
      apply_id: sha256(`zmode.apply|${decisionId}|${applyTs}`),
      mapping_epoch_id: mappingEpochId,
      ts_ms: applyTs,
      compile_ok: true,
      binding_count: bindings.length,
      diff_summary: {
        changed: diff.filter(
          (d) => d.prev_action !== null && d.new_action !== "(removed)",
        ).length,
        new: diff.filter((d) => d.prev_action === null).length,
        removed: diff.filter((d) => d.new_action === "(removed)").length,
      },
      preview_path: previewPath,
    },
    true,
    applyTs,
  )
  writePolicyEpochSidecar({
    schema_version: "zmode_policy_epoch_v1",
    updated_at_ms: applyTs,
    decision_id: decisionId,
    mapping_epoch_id: mappingEpochId,
    mode: policyMode(moderation),
    compile_ok: true,
    phase: "apply",
    apply_ts_ms: applyTs,
    selected_bindings: bindings.map((b) => ({
      key: b.key,
      action: b.action,
      candidate_id: b.candidate_id || null,
      fixed: b.fixed,
    })),
    preview_path: previewPath,
  })

  console.error(`[z-mode] applied ${bindings.length} bindings`)
}

main().catch((err) => {
  console.error(`[z-mode] fatal: ${err?.message || err}`)
  process.exit(1)
})
