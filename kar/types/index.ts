// Karabiner key codes
export type KeyCode =
  // Letters
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  // Numbers
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  // Function keys
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "f9"
  | "f10"
  | "f11"
  | "f12"
  // Modifiers
  | "left_command"
  | "right_command"
  | "left_control"
  | "right_control"
  | "left_option"
  | "right_option"
  | "left_shift"
  | "right_shift"
  | "caps_lock"
  | "fn"
  // Navigation
  | "return_or_enter"
  | "escape"
  | "delete_or_backspace"
  | "delete_forward"
  | "tab"
  | "spacebar"
  | "up_arrow"
  | "down_arrow"
  | "left_arrow"
  | "right_arrow"
  | "page_up"
  | "page_down"
  | "home"
  | "end"
  // Punctuation
  | "hyphen"
  | "equal_sign"
  | "open_bracket"
  | "close_bracket"
  | "backslash"
  | "non_us_pound"
  | "semicolon"
  | "quote"
  | "grave_accent_and_tilde"
  | "comma"
  | "period"
  | "slash"
  | "non_us_backslash"
  // Keypad
  | "keypad_num_lock"
  | "keypad_slash"
  | "keypad_asterisk"
  | "keypad_hyphen"
  | "keypad_plus"
  | "keypad_enter"
  | "keypad_period"
  | "keypad_0"
  | "keypad_1"
  | "keypad_2"
  | "keypad_3"
  | "keypad_4"
  | "keypad_5"
  | "keypad_6"
  | "keypad_7"
  | "keypad_8"
  | "keypad_9"
  // Media
  | "vk_consumer_brightness_down"
  | "vk_consumer_brightness_up"
  | "vk_consumer_play"
  | "vk_consumer_next"
  | "vk_consumer_previous"
  // Virtual (Karabiner internal)
  | "vk_none"
  | "mute"
  | "volume_down"
  | "volume_up"
  | "volume_increment"
  | "volume_decrement"
  | "display_brightness_increment"
  | "display_brightness_decrement"
  | "illumination_increment"
  | "illumination_decrement"
  // Special
  | "print_screen"
  | "scroll_lock"
  | "pause"
  | "insert"
  | "application"
  | "help"
  | "power"
  | "execute"
  | "menu"
  | "select"
  | "stop"
  | "again"
  | "undo"

export type Modifier =
  | "command"
  | "control"
  | "option"
  | "shift"
  | "left_command"
  | "right_command"
  | "left_control"
  | "right_control"
  | "left_option"
  | "right_option"
  | "left_shift"
  | "right_shift"
  | "fn"
  | "caps_lock"

// Profile timing settings
export interface ProfileSettings {
  /** Timeout for to_if_alone in ms (default: 80) */
  alone?: number
  /** Threshold for simultaneous key detection in ms (default: 200) */
  sim?: number
}

// Simlayer definition
export interface Simlayer {
  /** The key that activates this simlayer */
  key: KeyCode
  /** Optional custom threshold in ms */
  threshold?: number
  /** Optional timeout for to_if_alone in ms (hold mode only) */
  alone?: number
  /** Optional mode: hold (variable) or simultaneous (chord) */
  mode?: "hold" | "simultaneous"
}

// From key specification
export type FromKey =
  | KeyCode
  | { key: KeyCode; modifiers?: Modifier | Modifier[]; optional?: Modifier[] }
  | KeyCode[] // Simultaneous keys

// Mouse key specification
export interface MouseKey {
  x?: number
  y?: number
  vertical_wheel?: number
  horizontal_wheel?: number
  speed_multiplier?: number
}

// Pointing button (mouse click)
export type PointingButton = "button1" | "button2" | "button3"

export interface SocketCommand {
  endpoint: string
  command: string
}

export interface SendUserCommand {
  payload: unknown
  endpoint?: string
}

// To key specification
export type ToKey =
  | KeyCode
  | { key: KeyCode; modifiers?: Modifier | Modifier[] }
  | { shell: string }
  | { socket_command: SocketCommand }
  | { send_user_command: SendUserCommand }
  | { mouse_key: MouseKey }
  | { pointing_button: PointingButton }
  | ToKey[] // Multiple actions

// Condition for when a rule applies
export type Condition =
  | { app: string }
  | { variable: string; value: number | boolean | string }

// A single key mapping
export interface Mapping {
  from: FromKey
  to: ToKey
  /** Action when key is released quickly (tap) */
  to_if_alone?: ToKey
  /** Action when key is held down */
  to_if_held?: ToKey
}

// A rule containing multiple mappings
export interface Rule {
  description: string
  /** Simlayer name to use for these mappings */
  layer?: string
  /** Condition for when this rule applies */
  condition?: Condition
  mappings: Mapping[]
}

// Simple modification (key remapping without conditions)
export interface SimpleModification {
  from: KeyCode
  to: KeyCode
}

// Main config structure
export interface Config {
  profile?: ProfileSettings
  simlayers?: Record<string, Simlayer>
  /** Simple key remappings (e.g., caps_lock -> escape) */
  simple?: SimpleModification[]
  rules: Rule[]
}

// Helper functions for building shell commands
export function shell(command: string): { shell: string } {
  return { shell: command }
}

export function socketCommand(endpoint: string, command: string): { socket_command: SocketCommand } {
  return { socket_command: { endpoint, command } }
}

export function sendUserCommand(payload: unknown, endpoint?: string): { send_user_command: SendUserCommand } {
  if (endpoint) {
    return { send_user_command: { payload, endpoint } }
  }
  return { send_user_command: { payload } }
}

type SeqMacroMeta = {
  action: string
  arg?: string
  app?: string
}

let seqMacroIndexCache: Map<string, SeqMacroMeta> | null | undefined

function parseYamlScalar(raw: string): string {
  const value = raw.trim()
  if (!value) return ""
  if (value.startsWith("\"") && value.endsWith("\"")) {
    try {
      return JSON.parse(value)
    } catch {
      return value.slice(1, -1)
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1)
  }
  return value
}

function getSeqMacroIndex(): Map<string, SeqMacroMeta> | null {
  if (seqMacroIndexCache !== undefined) {
    return seqMacroIndexCache
  }

  const macrosPath = process.env.SEQ_MACROS_PATH ?? "/Users/nikiv/code/seq/seq.macros.yaml"
  try {
    const deno = (globalThis as { Deno?: { readTextFileSync?: (path: string) => string } }).Deno
    if (!deno || typeof deno.readTextFileSync !== "function") {
      seqMacroIndexCache = null
      return null
    }
    const text = deno.readTextFileSync(macrosPath)
    const map = new Map<string, SeqMacroMeta>()

    let currentName = ""
    let currentAction = ""
    let currentArg: string | undefined
    let currentApp: string | undefined

    const flush = () => {
      if (currentName && currentAction) {
        map.set(currentName, {
          action: currentAction,
          arg: currentArg,
          app: currentApp,
        })
      }
      currentName = ""
      currentAction = ""
      currentArg = undefined
      currentApp = undefined
    }

    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith("- name:")) {
        flush()
        currentName = parseYamlScalar(line.slice("- name:".length))
        continue
      }
      if (!currentName) continue

      if (line.startsWith("  action:")) {
        currentAction = parseYamlScalar(line.slice("  action:".length))
        continue
      }
      if (line.startsWith("  arg:")) {
        currentArg = parseYamlScalar(line.slice("  arg:".length))
        continue
      }
      if (line.startsWith("  app:")) {
        currentApp = parseYamlScalar(line.slice("  app:".length))
        continue
      }
    }

    flush()
    seqMacroIndexCache = map
    return map
  } catch {
    seqMacroIndexCache = null
    return null
  }
}

function directPayloadForSeqMacro(macroName: string): unknown | null {
  const index = getSeqMacroIndex()
  if (!index) return null

  const meta = index.get(macroName)
  if (!meta) return null

  // Fast-path only URL-open macros. Everything else keeps current seqd behavior.
  if (meta.action !== "open_url" || !meta.arg) {
    return null
  }

  if (meta.app) {
    return { line: `OPEN_WITH_APP ${meta.app}:${meta.arg}` }
  }
  return {
    v: 1,
    type: "open",
    target: meta.arg,
  }
}

// Karabiner 15.9.15+ low-latency path.
// We keep the function name for config compatibility, but it now emits send_user_command.
export function seqSocket(
  macroName: string,
  endpoint?: string,
  opts?: {
    directOpenUrl?: boolean
  },
): { send_user_command: SendUserCommand } {
  const useDirectOpenUrl = opts?.directOpenUrl ?? true
  if (useDirectOpenUrl) {
    const directPayload = directPayloadForSeqMacro(macroName)
    if (directPayload) {
      return sendUserCommand(directPayload, endpoint)
    }
  }

  return sendUserCommand(
    {
      v: 1,
      type: "run",
      name: macroName,
    },
    endpoint,
  )
}

export function seqSocketFast(macroName: string, endpoint?: string): { send_user_command: SendUserCommand } {
  return seqSocket(macroName, endpoint, { directOpenUrl: true })
}

export function kmFast(macroName: string, endpoint?: string): { send_user_command: SendUserCommand } {
  return seqSocket(macroName, endpoint)
}

export function kmShell(macroName: string): { shell: string } {
  const seqBin = "/Users/nikiv/code/seq/cli/cpp/out/bin/seq"
  const seqCmd = `"${seqBin}" run ${JSON.stringify(macroName)}`
  const kmCmd = `osascript -e ${JSON.stringify(
    `tell application "Keyboard Maestro Engine" to do script "${macroName}"`,
  )}`

  // Note: this string is executed under `/bin/sh -c` by Karabiner, so we must use
  // explicit command separators (`;` or newlines). Joining with spaces will break.
  const cmd = [
    // `seq run` is local-first for UI macros, so don't require seqd to be up here.
    `if [ -x "${seqBin}" ]; then`,
    `  ${seqCmd} >/dev/null 2>&1 && exit 0;`,
    `fi;`,
    kmCmd,
  ].join(" ")

  return shell(cmd)
}

export function km(macroName: string): { send_user_command: SendUserCommand } {
  return kmFast(macroName)
}

function seqStepsToInlineYaml(macroName: string, steps: unknown[]): string | null {
  // Best-effort: allow `seq("Name", [openApp("Arc"), keystroke("ctrl+1")])` to work even if the
  // generated `~/code/seq/seq.macros.yaml` is stale (or the macro doesn't exist).
  //
  // We do not want to attach extra fields to Karabiner actions, so we infer step intent from the
  // objects passed in at config-build time.
  type InlineStep = { action: string; arg: string }

  const out: InlineStep[] = []

  for (const s of steps) {
    if (!s || typeof s !== "object") continue
    const any = s as any

    // openApp("Arc") => { send_user_command: { payload: { v:1, type:"open_app", app:"Arc" } } }
    if (any.send_user_command && any.send_user_command.payload) {
      const p = any.send_user_command.payload
      if (
        p &&
        typeof p === "object" &&
        typeof p.type === "string" &&
        (p.type === "open_app" || p.type === "open_app_toggle") &&
        typeof p.app === "string"
      ) {
        out.push({ action: "open_app", arg: p.app })
        continue
      }
    }

    // Legacy (pre-15.9.15): openAppFast("Arc") => { socket_command: { endpoint: "/tmp/seqd.sock", command: "RUN open-app-toggle:Arc" } }
    if (any.socket_command && typeof any.socket_command.command === "string") {
      const m = any.socket_command.command.match(/^RUN open-app-toggle:(.+)$/)
      if (m) {
        out.push({ action: "open_app", arg: m[1] })
        continue
      }
    }

    // Legacy: openApp("Arc") => { shell: '... seq open-app-toggle "Arc" ...' }
    if (typeof any.shell === "string") {
      const m = any.shell.match(/\\bopen-app-toggle\\s+\"([^\"]+)\"/)
      if (m) {
        out.push({ action: "open_app", arg: m[1] })
        continue
      }
    }

    // keystroke("ctrl+1") => { key: "1", modifiers: ["left_control"] }
    if (typeof any.key === "string") {
      const mods: string[] = []
      const raw = any.modifiers
      const list: string[] =
        typeof raw === "string" ? [raw] : Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : []

      const map: Record<string, string> = {
        left_command: "cmd",
        right_command: "cmd",
        left_control: "ctrl",
        right_control: "ctrl",
        left_option: "opt",
        right_option: "opt",
        left_shift: "shift",
        right_shift: "shift",
      }
      for (const m of list) {
        const tok = map[m]
        if (tok) mods.push(tok)
      }
      const spec = mods.length ? `${mods.join("+")}+${any.key}` : any.key
      out.push({ action: "keystroke", arg: spec })
      continue
    }
  }

  if (out.length === 0) return null

  // `macros::load(...)` expects a list of macro entries.
  const lines: string[] = []
  lines.push(`- name: ${JSON.stringify(macroName)}`)
  lines.push(`  action: sequence`)
  lines.push(`  arg: ""`)
  lines.push(`  steps:`)
  for (const st of out) {
    lines.push(`    - action: ${st.action}`)
    lines.push(`      arg: ${JSON.stringify(st.arg)}`)
  }
  lines.push("")
  return lines.join("\n")
}

// `steps` is primarily used by `~/code/seq/tools/gen_macros.py` to generate a native seq macro.
// Additionally, if the macro isn't found, we fall back to running an inline sequence macro.
export function seq(
  macroName: string,
  steps?: unknown[],
  opts?: {
    waitFrontmostMs?: number
    appSettleMs?: number
    eagerKeystrokes?: boolean
  },
): { shell: string } {
  const seqBin = "/Users/nikiv/code/seq/cli/cpp/out/bin/seq"
  const envParts: string[] = []
  if (opts?.waitFrontmostMs != null) {
    envParts.push(`SEQ_SEQUENCE_WAIT_FRONTMOST_MS=${JSON.stringify(String(opts.waitFrontmostMs))}`)
  }
  if (opts?.appSettleMs != null) {
    envParts.push(`SEQ_SEQUENCE_APP_SETTLE_MS=${JSON.stringify(String(opts.appSettleMs))}`)
  }
  if (opts?.eagerKeystrokes != null) {
    envParts.push(`SEQ_SEQUENCE_EAGER_KEYSTROKES=${opts.eagerKeystrokes ? "1" : "0"}`)
  }
  const envPrefix = envParts.length ? `${envParts.join(" ")} ` : ""

  const runCmd = `${envPrefix}"${seqBin}" run ${JSON.stringify(macroName)}`
  const inlineYaml = steps && steps.length ? seqStepsToInlineYaml(macroName, steps) : null

  if (!inlineYaml) {
    return shell(`${envPrefix}${seqBin} run "${macroName}"`)
  }

  // Note: this string is executed under `/bin/sh -c` by Karabiner, so we must use explicit
  // separators. The normal path is still the fast path.
  const cmd = [
    `if [ -x "${seqBin}" ]; then`,
    `  ${runCmd} >/dev/null 2>&1 && exit 0;`,
    `fi;`,
    `tmp="$(mktemp -t seq_inline.XXXXXX.yaml)" || exit 1;`,
    `cat > "$tmp" <<'SEQ_INLINE_YAML'`,
    inlineYaml,
    `SEQ_INLINE_YAML`,
    `${envPrefix}"${seqBin}" --macros "$tmp" run ${JSON.stringify(macroName)} >/dev/null 2>&1; rc=$?; rm -f "$tmp"; exit $rc;`,
  ].join("\n")

  return shell(cmd)
}

export function keystroke(keys: string): KeyMapping {
  // Used both as:
  // - a normal Karabiner key chord helper in config.ts
  // - a marker for seq macro generator (tools/gen_macros.py) when nested in seq(..., [ ... ])
  const parts = keys
    .split("+")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)

  const modMap: Record<string, string> = {
    cmd: "left_command",
    command: "left_command",
    ctrl: "left_control",
    control: "left_control",
    opt: "left_option",
    option: "left_option",
    alt: "left_option",
    shift: "left_shift",
  }

  const mods: string[] = []
  let key: string | null = null
  for (const p of parts) {
    const m = modMap[p]
    if (m) {
      mods.push(m)
      continue
    }
    key = p
  }

  if (!key) {
    // Fail closed: returning a no-op makes debugging impossible.
    throw new Error(`keystroke(): missing key in ${JSON.stringify(keys)}`)
  }

  if (mods.length === 0) {
    return { key }
  }
  if (mods.length === 1) {
    return { key, modifiers: mods[0] }
  }
  return { key, modifiers: mods }
}

function expandHome(path: string): string {
  const home = process.env.HOME ?? "$HOME"
  return path === "~" ? home : path.startsWith("~/") ? `${home}${path.slice(1)}` : path
}

export function open(path: string): { send_user_command: SendUserCommand } {
  return sendUserCommand({
    v: 1,
    type: "open",
    target: expandHome(path),
  })
}

export function openAppFast(app: string): { send_user_command: SendUserCommand } {
  // Expand "~" at config-build time so callers can pass "~/.../Foo.app".
  const home = process.env.HOME ?? "$HOME"
  const expandedApp =
    app === "~" ? home : app.startsWith("~/") ? `${home}${app.slice(1)}` : app

  return sendUserCommand({
    v: 1,
    type: "open_app",
    app: expandedApp,
  })
}

export function openApp(app: string): { send_user_command: SendUserCommand } {
  // Expand "~" at config-build time so callers can pass "~/.../Foo.app".
  const home = process.env.HOME ?? "$HOME"
  const expandedApp =
    app === "~" ? home : app.startsWith("~/") ? `${home}${app.slice(1)}` : app

  // Karabiner 15.9.15+ path: send JSON payload to user-command receiver.
  // Lowest-latency deterministic path avoids /bin/sh and seq process spawning.
  // Uses non-toggle open behavior for maximal responsiveness.
  return sendUserCommand({
    v: 1,
    type: "open_app",
    app: expandedApp,
  })
}

export function openAppToggle(app: string): { send_user_command: SendUserCommand } {
  const home = process.env.HOME ?? "$HOME"
  const expandedApp =
    app === "~" ? home : app.startsWith("~/") ? `${home}${app.slice(1)}` : app
  return sendUserCommand({
    v: 1,
    type: "open_app_toggle",
    app: expandedApp,
  })
}

export function openAppToggleFast(app: string): { send_user_command: SendUserCommand } {
  return openAppToggle(app)
}

export function zed(path: string): { send_user_command: SendUserCommand } {
  // Expand "~" at config-build time for non-shell payloads.
  const home = process.env.HOME ?? "$HOME"
  const expandedPath = path === "~" ? home : path.startsWith("~/") ? `${home}${path.slice(1)}` : path
  const appPath = "/System/Volumes/Data/Applications/Zed Preview.app"
  return sendUserCommand({
    line: `OPEN_WITH_APP ${appPath}:${expandedPath}`,
  })
}

// Alias for compatibility with older callsites.
export function zedFast(path: string): { send_user_command: SendUserCommand } {
  return zed(path)
}

// todo: should switch to last active window but for this we need to replicate km's tracking
// or move this to km macro. need fast speed that is just as reliable
export function zedToggle(path: string): { shell: string } {
  // Expand ~ to $HOME for shell
  const expandedPath = path.startsWith("~/") ? `$HOME${path.slice(1)}` : path
  const title = path.split("/").filter(Boolean).pop() ?? path
  // Avoid osascript unless Zed is frontmost to keep this close to zed() speed.
  const titleLines = [
    `set targetTitle to ${JSON.stringify(title)}`,
    `set targetPath to ${JSON.stringify(expandedPath)}`,
    `tell application "System Events"`,
    `  set frontTitle to ""`,
    `  try`,
    `    set frontTitle to name of front window of process "Zed"`,
    `  end try`,
    `  if frontTitle starts with targetTitle then`,
    `    key code 48 using {command down}`,
    `    return`,
    `  end if`,
    `end tell`,
    `do shell script "open -a '/System/Volumes/Data/Applications/Zed Preview.app' " & quoted form of targetPath`,
  ]
  const titleScript = titleLines
    .map((line) => `-e ${JSON.stringify(line)}`)
    .join(" ")
  const cmd = [
    `frontApp=$(lsappinfo info -only kCFBundleNameKey -app "$(lsappinfo front | awk '{print $1}')" | awk -F'"' '{print $4}')`,
    `if [ "$frontApp" != "Zed" ]; then open -a "/System/Volumes/Data/Applications/Zed Preview.app" "${expandedPath}"; exit 0; fi`,
    `osascript ${titleScript}`,
  ].join("; ")
  return shell(cmd)
}

export function openUrl(
  url: string,
  opts?: {
    background?: boolean
  },
): { send_user_command: SendUserCommand } {
  return sendUserCommand({
    v: 1,
    type: "open",
    background: opts?.background ?? false,
    target: url,
  })
}

export function openUrlInApp(url: string, app: string): { send_user_command: SendUserCommand } {
  return sendUserCommand({
    line: `OPEN_WITH_APP ${app}:${url}`,
  })
}

export function seqAgentFromClipboard(endpoint?: string): { send_user_command: SendUserCommand } {
  return sendUserCommand(
    {
      v: 1,
      type: "seq_agent_clipboard",
    },
    endpoint,
  )
}

export function seqScreenshotOpen(
  path = "/tmp/seq_screenshot.png",
  endpoint?: string,
): { send_user_command: SendUserCommand } {
  return sendUserCommand(
    {
      v: 1,
      type: "seq_screenshot_open",
      path: expandHome(path),
    },
    endpoint,
  )
}

export function alfred(
  workflow: string,
  trigger: string,
  arg?: string,
): { shell: string } {
  const argPart = arg ? ` with argument "${arg}"` : ""
  return shell(
    `osascript -e 'tell application id "com.runningwithcrayons.Alfred" to run trigger "${trigger}" in workflow "${workflow}"${argPart}'`,
  )
}

export function raycast(extension: string): { send_user_command: SendUserCommand } {
  return sendUserCommand({
    v: 1,
    type: "open",
    background: true,
    target: `raycast://extensions/${extension}`,
  })
}

export function linWidget(
  tsPath: string,
  options?: {
    ttlMs?: number
  },
): { shell: string } {
  const expandedPath = tsPath.startsWith("~/") ? `$HOME${tsPath.slice(1)}` : tsPath
  const runnerPath = "$HOME/config/i/kar/scripts/lin-widget-run.sh"
  const logFile = "$HOME/Library/Logs/Lin/widget.log"
  const quotedPath = JSON.stringify(expandedPath)
  const quotedRunner = JSON.stringify(runnerPath)
  const quotedLog = JSON.stringify(logFile)
  const ttlMs = options?.ttlMs ?? 0
  const pipeline = [
    `log_file=${quotedLog}; mkdir -p \"$(dirname \\\"$log_file\\\")\";`,
    ttlMs > 0 ? `export LIN_WIDGET_TTL_MS=${ttlMs};` : "",
    `exec ${quotedRunner} ${quotedPath}`,
  ].filter(Boolean).join(" ")
  return shell(`bash -lc ${JSON.stringify(pipeline)}`)
}
