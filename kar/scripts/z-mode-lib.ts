// z-mode-lib.ts — Shared library for reading/writing z-mode layer in kar config
// Used by z-mode-widget.ts and z-mode-update.ts

import fs from "node:fs"
import { execSync } from "node:child_process"
import os from "node:os"
import path from "node:path"

export const KAR_CONFIG_PATH = "/Users/nikiv/config/i/kar/config.ts"
export const KAR_BIN = "kar"
export const LAYER_NAME = "z-mode"
export const RULE_DESCRIPTION_PREFIX = "zkey"

export interface ZMapping {
  from: string
  to: string // human-readable description of what `to` does
  toRaw: string // raw TS source of the `to` value
  note?: string
}

// Extract z-mode mappings from the config file by parsing the TS source
export function readZModeMappings(): ZMapping[] {
  const src = fs.readFileSync(KAR_CONFIG_PATH, "utf8")

  // Find the z-mode rule block
  const layerPattern = /layer:\s*"z-mode"/
  const layerMatch = src.match(layerPattern)
  if (!layerMatch || layerMatch.index === undefined) return []

  // Find the mappings array for this rule
  const afterLayer = src.slice(layerMatch.index)
  const mappingsStart = afterLayer.indexOf("mappings: [")
  if (mappingsStart === -1) return []

  // Find the closing bracket of mappings array
  const mappingsSlice = afterLayer.slice(mappingsStart + "mappings: [".length)
  let depth = 1
  let end = 0
  for (let i = 0; i < mappingsSlice.length; i++) {
    if (mappingsSlice[i] === "[") depth++
    if (mappingsSlice[i] === "]") depth--
    if (depth === 0) {
      end = i
      break
    }
  }

  const mappingsBlock = mappingsSlice.slice(0, end)
  if (mappingsBlock.trim().length === 0) return []

  // Parse individual mapping objects
  const mappings: ZMapping[] = []
  const mappingRegex = /\{\s*from:\s*"([^"]+)"\s*,\s*to:\s*([\s\S]*?)(?:,\s*note:\s*"([^"]*)")?\s*\}/g
  let m: RegExpExecArray | null
  while ((m = mappingRegex.exec(mappingsBlock)) !== null) {
    const from = m[1]
    const toRaw = m[2].trim().replace(/,\s*$/, "")
    const note = m[3] || undefined
    const to = describeToAction(toRaw)
    mappings.push({ from, to, toRaw, note })
  }

  return mappings
}

// Get line range of z-mode mappings block in the config file
export function getZModeMappingsRange(): { start: number; end: number } | null {
  const src = fs.readFileSync(KAR_CONFIG_PATH, "utf8")
  const lines = src.split("\n")

  let inZMode = false
  let mappingsStart = -1
  let mappingsEnd = -1
  let depth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('layer: "z-mode"')) {
      inZMode = true
      continue
    }
    if (inZMode && line.includes("mappings: [")) {
      mappingsStart = i
      depth = 1
      continue
    }
    if (mappingsStart >= 0 && depth > 0) {
      for (const ch of line) {
        if (ch === "[") depth++
        if (ch === "]") depth--
      }
      if (depth === 0) {
        mappingsEnd = i
        break
      }
    }
  }

  if (mappingsStart === -1 || mappingsEnd === -1) return null
  return { start: mappingsStart, end: mappingsEnd }
}

// Replace z-mode mappings in config file with new TS source lines
export function writeZModeMappings(mappingLines: string[]): void {
  const range = getZModeMappingsRange()
  if (!range) throw new Error("Could not find z-mode mappings block in config")

  const src = fs.readFileSync(KAR_CONFIG_PATH, "utf8")
  const lines = src.split("\n")

  // Replace everything between mappings: [ and ]
  const before = lines.slice(0, range.start + 1) // includes "mappings: ["
  const after = lines.slice(range.end) // includes the "]"

  const newLines = [...before, ...mappingLines, ...after]
  fs.writeFileSync(KAR_CONFIG_PATH, newLines.join("\n"), "utf8")
}

// Compile and apply kar config
export function compileKar(dryRun = false): { ok: boolean; output: string } {
  try {
    const flags = dryRun ? "--dry-run" : ""
    const output = execSync(
      `${KAR_BIN} -c ${KAR_CONFIG_PATH} ${flags}`,
      {
        encoding: "utf8",
        timeout: 30_000,
        maxBuffer: 64 * 1024 * 1024,
        stdio: "pipe",
      },
    )
    return { ok: true, output: output.trim() }
  } catch (err: any) {
    const stderr =
      typeof err?.stderr === "string" ? err.stderr : String(err?.stderr || "")
    const stdout =
      typeof err?.stdout === "string" ? err.stdout : String(err?.stdout || "")
    const msg = typeof err?.message === "string" ? err.message : String(err)
    return {
      ok: false,
      output: [msg, stderr, stdout].filter(Boolean).join("\n").slice(0, 20000),
    }
  }
}

// Get current environment context for AI-driven mapping decisions
export function getEnvironmentContext(): Record<string, unknown> {
  const ctx: Record<string, unknown> = {}

  // Frontmost app
  try {
    const frontApp = execSync(
      `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      { encoding: "utf8", timeout: 3000 },
    ).trim()
    ctx.frontmostApp = frontApp
  } catch {
    ctx.frontmostApp = "unknown"
  }

  // Running GUI apps
  try {
    const apps = execSync(
      `osascript -e 'tell application "System Events" to get name of every application process whose background only is false'`,
      { encoding: "utf8", timeout: 3000 },
    ).trim()
    ctx.runningApps = apps.split(", ").filter(Boolean)
  } catch {
    ctx.runningApps = []
  }

  // Current git repo (if in one)
  try {
    const cwd = process.cwd()
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
      timeout: 2000,
      cwd,
    }).trim()
    ctx.currentRepo = gitRoot
    ctx.currentBranch = execSync("git branch --show-current", {
      encoding: "utf8",
      timeout: 2000,
      cwd,
    }).trim()
  } catch {
    ctx.currentRepo = null
  }

  // Hour of day (for time-aware mappings)
  ctx.hour = new Date().getHours()
  ctx.dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" })

  // Recent projects from claude sessions
  try {
    const claudeProjects = fs.readdirSync(
      path.join(os.homedir(), ".claude", "projects"),
    )
    const recent = claudeProjects
      .filter((d) => d.startsWith("-Users-nikiv-"))
      .map((d) => d.replace(/-/g, "/").replace(/^\/Users\/nikiv\//, "~/"))
      .slice(-10)
    ctx.recentProjects = recent
  } catch {
    ctx.recentProjects = []
  }

  return ctx
}

// Human-readable description of a `to` action from its raw TS source
function describeToAction(raw: string): string {
  // seqAgentFromClipboard()
  if (raw.includes("seqAgentFromClipboard")) return "AI agent on clipboard"
  // seqScreenshotOpen()
  if (raw.includes("seqScreenshotOpen")) return "Screenshot for AI"
  // paste("...")
  const pasteMatch = raw.match(/paste\("([^"]+)"\)/)
  if (pasteMatch) return `paste: ${pasteMatch[1]}`
  // enter("...")
  const enterMatch = raw.match(/enter\("([^"]+)"\)/)
  if (enterMatch) return `enter: ${enterMatch[1]}`
  // openApp("...")
  const openAppMatch = raw.match(/openApp(?:Toggle)?\("([^"]+)"\)/)
  if (openAppMatch) return `open: ${openAppMatch[1]}`
  // openUrl("...")
  const openUrlMatch = raw.match(/openUrl\("([^"]+)"\)/)
  if (openUrlMatch) return `url: ${openUrlMatch[1]}`
  // zed("...")
  const zedMatch = raw.match(/zed\("([^"]+)"\)/)
  if (zedMatch) return `zed: ${zedMatch[1]}`
  // km("...")
  const kmMatch = raw.match(/km\("([^"]+)"\)/)
  if (kmMatch) return `km: ${kmMatch[1]}`
  // shell("...")
  if (raw.includes("shell(")) return "shell command"
  return raw.slice(0, 60)
}
