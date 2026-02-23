// z-mode-widget.ts — Show current z-mode layer mappings in a Lin widget
// Triggered via kar hotkey: linWidget("~/config/i/kar/scripts/z-mode-widget.ts")
// Outputs JSON to stdout → piped to lin-widget-send.mjs → Lin intent inbox

import { readZModeMappings } from "./z-mode-lib.ts"
import fs from "node:fs"

const mappings = readZModeMappings()
const widgetId = `z-mode-preview-${Date.now()}`
const idPath = "/tmp/kar-z-mode-widget-id"
const now = Date.now()
const ttlMs = 20_000

const readVisibleState = (): { id?: string; expiresAt?: number } => {
  try {
    const raw = fs.readFileSync(idPath, "utf8").trim()
    if (!raw) return {}
    if (raw.startsWith("{")) {
      const parsed = JSON.parse(raw) as { id?: string; expiresAt?: number }
      return {
        id: typeof parsed.id === "string" ? parsed.id : undefined,
        expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : undefined,
      }
    }
    return { id: raw }
  } catch {
    return {}
  }
}

const clearVisibleState = () => {
  try {
    fs.unlinkSync(idPath)
  } catch {}
}

const writeVisibleState = (id: string, expiresAt: number) => {
  try {
    fs.writeFileSync(idPath, JSON.stringify({ id, expiresAt }), "utf8")
  } catch {}
}

const previous = readVisibleState()
if (previous.id && previous.expiresAt && previous.expiresAt > now) {
  const payload = {
    id: previous.id,
    kind: "widget_hide",
    title: "z-mode hide",
    createdAt: now,
    expiresAt: now + 2_000,
  }
  clearVisibleState()
  console.log(JSON.stringify(payload))
  process.exit(0)
}
if (previous.id && previous.expiresAt && previous.expiresAt <= now) {
  clearVisibleState()
}

if (mappings.length === 0) {
  const expiresAt = now + ttlMs
  const payload = {
    id: widgetId,
    kind: "widget",
    title: "z-mode",
    message: "No mappings configured",
    createdAt: now,
    expiresAt,
  }
  writeVisibleState(widgetId, expiresAt)
  console.log(JSON.stringify(payload))
} else {
  const compact = (text: string): string =>
    text
      .replace(/^ai\s+agent\s+on\s+clipboard$/i, "agent on clipboard")
      .replace(/^screenshot\s+for\s+ai$/i, "screenshot for AI")
      .replace(/^update\s+z-mode\s+\(zero-latency\s+preview\)$/i, "update layer (preview)")
      .replace(/^toggle\s+/i, "tog ")
      .replace(/^flow:\s*/i, "")
      .replace(/^run\s+/i, "")
      .replace(/^quick\s+/i, "")
      .replace(/^enter\s+plan\s+mode$/i, "plan")
      .replace(/^approve\/confirm$/i, "confirm")
      .replace(/^deny\/reject$/i, "deny")
      .replace(/^show\s+z-mode\s+layer$/i, "show layer")
      .replace(/^ai\s+update\s+z-mode$/i, "update layer")
      .replace(/\s+/g, " ")
      .trim()

  // One binding per line for reliable readability in Lin widget.
  const rows = mappings.map((m) => `${m.from}: ${compact(m.note || m.to)}`)
  const message = rows.join("\n")

  const expiresAt = now + ttlMs
  const payload = {
    id: widgetId,
    kind: "widget",
    title: `z-mode (${mappings.length} keys)`,
    message,
    createdAt: now,
    expiresAt,
  }
  writeVisibleState(widgetId, expiresAt)
  console.log(JSON.stringify(payload))
}
