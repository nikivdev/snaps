// z-mode-widget-hide.ts — hide current z-mode preview widget immediately.
// Emits a special `widget_hide` intent consumed by Lin.

import fs from "node:fs"

const idPath = "/tmp/kar-z-mode-widget-id"
let id: string | undefined
try {
  const raw = fs.readFileSync(idPath, "utf8").trim()
  if (raw.startsWith("{")) {
    const parsed = JSON.parse(raw) as { id?: string }
    id = typeof parsed.id === "string" ? parsed.id : undefined
  } else {
    id = raw || undefined
  }
} catch {}

try {
  fs.unlinkSync(idPath)
} catch {}

const payload = {
  id,
  kind: "widget_hide",
  title: "z-mode hide",
  createdAt: Date.now(),
  expiresAt: Date.now() + 2_000,
}

console.log(JSON.stringify(payload))
