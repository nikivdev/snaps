import type { Config } from "./types/index.ts"
import {
  km,
  raycast,
  alfred,
  shell,
  zed,
  linWidget,
  openApp,
  openUrl,
  openUrlInApp,
  seq,
  seqSocket,
  paste,
  enter,
  keystroke,
  seqAgentFromClipboard,
  seqScreenshotOpen,
  openAppToggle,
} from "./types/index.ts"

const useSeqSocket = true
const debugSimJK = false

const safariNewTab = seq("open Safari new tab", [openApp("Safari"), keystroke("cmd+t")], {
  waitFrontmostMs: 2200,
  appSettleMs: 25,
  eagerKeystrokes: false,
})

const _seqMacroDefs = [safariNewTab]

// Cursor GH workspaces are noisy and easy to accidentally trigger.
// Keep them disabled until we migrate them to seq-native primitives.
const enableCursorMacros = false
function cursor(name: string) {
  // Avoid spawning a shell process on every key press when disabled.
  return enableCursorMacros ? km(`cursor: ${name}`) : "vk_none"
}

export default {
  profile: {
    alone: 80,
    sim: 50,
  },

  simple: [{ from: "caps_lock", to: "escape" }],

  simlayers: {
    "semicolon-mode": { key: "semicolon", threshold: 180 },
    "quote-mode": { key: "quote", threshold: 180 },
    "backslash-mode": { key: "non_us_backslash", threshold: 180 },
    "1-mode": { key: "1", threshold: 180 },
    "2-mode": { key: "2", threshold: 180 },
    "3-mode": { key: "3", threshold: 180 },
    "4-mode": { key: "4", threshold: 180 },
    "5-mode": { key: "5", threshold: 180 },
    "7-mode": { key: "7", threshold: 180 },
    "8-mode": { key: "8", threshold: 180 },
    "9-mode": { key: "9", threshold: 180 },
    "0-mode": { key: "0", threshold: 180 },
    "hyphen-mode": { key: "hyphen", threshold: 180 },
    "equal-sign-mode": { key: "equal_sign", threshold: 180 },
    "tab-mode": { key: "tab", threshold: 180 },
    "q-mode": { key: "q", threshold: 180 },
    "w-mode": { key: "w", threshold: 180 },
    "e-mode": { key: "e", threshold: 180 },
    "r-mode": { key: "r", threshold: 180 },
    "t-mode": { key: "t", threshold: 180 },
    "u-mode": { key: "u", threshold: 180 },
    "y-mode": { key: "y", threshold: 180 },
    "i-mode": { key: "i", threshold: 180 },
    "o-mode": { key: "o", threshold: 180 },
    "p-mode": { key: "p", threshold: 180 },
    "open-bracket-mode": { key: "open_bracket", threshold: 180 },
    "close-bracket-mode": { key: "close_bracket", threshold: 180 },
    "a-mode": { key: "a", threshold: 180 },
    "s-mode": { key: "s", threshold: 180 },
    "d-mode": { key: "d", threshold: 180 },
    "f-mode": { key: "f", threshold: 180 },
    "g-mode": { key: "g", threshold: 180 },
    "escape-mode": { key: "escape", threshold: 180 },
    "tilde-mode": { key: "grave_accent_and_tilde", threshold: 180 },
    "z-mode": { key: "z", threshold: 180 },
    "x-mode": { key: "x", threshold: 180 },
    "c-mode": { key: "c", threshold: 180 },
    "v-mode": { key: "v", threshold: 180 },
    "b-mode": { key: "b", threshold: 180 },
    "n-mode": { key: "n", threshold: 180 },
    "m-mode": { key: "m", threshold: 180 },
    "comma-mode": { key: "comma", threshold: 180 },
    "dot-mode": { key: "period", threshold: 180 },
    "slash-mode": { key: "slash", threshold: 180 },
    "left-control-mode": { key: "left_control", threshold: 180 },
    "left-option-mode": { key: "left_option", threshold: 180 },
    "left-command-mode": { key: "left_command", threshold: 180 },
    "right-command-mode": { key: "right_command", threshold: 180 },
    "spacebar-mode": { key: "spacebar", threshold: 180 },
    "ts-mode": { key: "1", threshold: 180 },
    "go-mode": { key: "2", threshold: 180 },
    "py-mode": { key: "3", threshold: 180 },
    "swift-mode": { key: "6", threshold: 180 },
    // "rust-mode": { key: "grave_accent_and_tilde", threshold: 180 },
  },

  rules: [
    {
      description: "colonkey (shift)",
      layer: "semicolon-mode",
      mappings: [
        { from: "1", to: { key: "1", modifiers: "left_control" } },
        { from: "2", to: { key: "2", modifiers: "left_control" } },
        { from: "3", to: { key: "3", modifiers: "left_control" } },
        { from: "4", to: { key: "4", modifiers: "left_control" } },
        { from: "5", to: { key: "5", modifiers: "left_control" } },
        { from: "6", to: { key: "6", modifiers: "left_control" } },
        { from: "7", to: { key: "7", modifiers: "left_control" } },
        { from: "8", to: { key: "8", modifiers: "left_control" } },
        { from: "9", to: { key: "9", modifiers: "left_control" } },
        { from: "q", to: { key: "q", modifiers: "left_shift" } },
        { from: "w", to: { key: "w", modifiers: "left_shift" } },
        { from: "e", to: { key: "e", modifiers: "left_shift" } },
        { from: "r", to: { key: "r", modifiers: "left_shift" } },
        { from: "t", to: { key: "t", modifiers: "left_shift" } },
        { from: "y", to: { key: "y", modifiers: "left_shift" } },
        { from: "u", to: { key: "u", modifiers: "left_shift" } },
        { from: "i", to: { key: "i", modifiers: "left_shift" } },
        { from: "o", to: { key: "o", modifiers: "left_shift" } },
        { from: "p", to: { key: "p", modifiers: "left_shift" } },
        { from: "escape", to: zed("~/docs/do.mdx") },
        { from: "a", to: { key: "a", modifiers: "left_shift" } },
        { from: "s", to: { key: "s", modifiers: "left_shift" } },
        { from: "d", to: { key: "d", modifiers: "left_shift" } },
        { from: "f", to: { key: "f", modifiers: "left_shift" } },
        { from: "g", to: { key: "g", modifiers: "left_shift" } },
        { from: "h", to: { key: "h", modifiers: "left_shift" } },
        { from: "j", to: { key: "j", modifiers: "left_shift" } },
        { from: "k", to: { key: "k", modifiers: "left_shift" } },
        { from: "l", to: { key: "l", modifiers: "left_shift" } },
        { from: "z", to: { key: "z", modifiers: "left_shift" } },
        { from: "x", to: { key: "x", modifiers: "left_shift" } },
        { from: "c", to: { key: "c", modifiers: "left_shift" } },
        { from: "v", to: { key: "v", modifiers: "left_shift" } },
        { from: "b", to: { key: "b", modifiers: "left_shift" } },
        { from: "n", to: { key: "n", modifiers: "left_shift" } },
        { from: "m", to: { key: "m", modifiers: "left_shift" } },
        // { from: "left_command", to: openApp("Notion") },
        { from: "left_command", to: zed("~/code/nikiv") },
        { from: "spacebar", to: zed("~/docs") },
      ],
      // { from: "grave_accent_and_tilde", to: zed("~/docs") },
      // { from: "left_command", to: km("open: Reflect") },
    },

    // swap : and ;
    {
      description: "swap : and ;",
      mappings: [
        {
          from: { key: "semicolon", modifiers: [] },
          to: { key: "semicolon", modifiers: "left_shift" },
        },
        { from: { key: "semicolon", modifiers: "shift" }, to: "semicolon" },
      ],
    },

    {
      description: "skey (essential)",
      layer: "s-mode",
      mappings: [
        {
          from: "w",
          to: [
            { key: "left_arrow", modifiers: "left_option" },
            { key: "right_arrow", modifiers: ["left_option", "left_shift"] },
          ],
        },
        { from: "e", to: "tab" },
        { from: "r", to: { key: "tab", modifiers: "left_shift" } },
        {
          from: "i",
          to: {
            key: "4",
            modifiers: ["left_control", "left_option", "left_command"],
          },
        },
        { from: "o", to: { key: "x", modifiers: "left_command" } },
        { from: "open_bracket", to: km("Lowercase selected text") },
        { from: "close_bracket", to: km("Uppercase selected text") },
        { from: "a", to: { key: "c", modifiers: "left_command" } },
        { from: "d", to: "delete_or_backspace" },
        { from: "f", to: "return_or_enter" },
        {
          from: "g",
          to: [{ key: "tab", modifiers: "left_command" }, "vk_none"],
        },
        { from: "h", to: "left_arrow" },
        { from: "j", to: "down_arrow" },
        { from: "k", to: "up_arrow" },
        { from: "l", to: "right_arrow" },
        {
          from: "semicolon",
          to: { key: "return_or_enter", modifiers: "left_shift" },
        },
        {
          from: "quote",
          to: [
            { key: "left_arrow", modifiers: "left_command" },
            { key: "right_arrow", modifiers: ["left_command", "left_shift"] },
          ],
        },
        {
          from: "c",
          to: { key: "delete_or_backspace", modifiers: "left_command" },
        },
        { from: "v", to: "left_shift" },
        { from: "b", to: { key: "left_arrow", modifiers: "left_command" } },
        { from: "n", to: { key: "v", modifiers: "left_command" } },
        { from: "m", to: { key: "right_arrow", modifiers: "left_command" } },
        {
          from: "period",
          to: {
            key: "y",
            modifiers: ["left_control", "left_option", "left_command"],
          },
        },
        { from: "slash", to: km("Make markdown link from selection {link}") },
        { from: "left_command", to: km("paste relevant context to issue") },
        { from: "spacebar", to: zed("~/config/i/kar/config.ts") },
      ],
      // { from: "left_command", to: km("paste last flow cmd") },
      // { from: "spacebar", to: km("get last cmd output & paste it") },
    },

    // simultaneous keys
    {
      description: "sim",
      mappings: [
        {
          from: ["j", "k"],
          parameters: { simultaneous_threshold_ms: 40 },
          to: debugSimJK
            ? shell(`echo "jk $(date +%s%3N)" >> /tmp/kar-sim.log`)
            : seqSocket("open Safari new tab"),
        },
        {
          from: ["k", "j"],
          parameters: { simultaneous_threshold_ms: 40 },
          to: debugSimJK
            ? shell(`echo "kj $(date +%s%3N)" >> /tmp/kar-sim.log`)
            : seqSocket("open Safari new tab"),
        },
        // { from: ["k", "n"], to: seqSocket("open Comet new tab") },
        { from: ["k", "m"], to: seqSocket("New Linear task") },
        // lin launcher (moved to assistant)
        // {
        //   from: ["j", "l"],
        //   to: { key: "spacebar", modifiers: ["left_command", "left_shift"] },
        // },
        // assistant, todo: improve lots (escape, clear input)
        {
          from: ["j", "l"],
          to: { key: "spacebar", modifiers: "left_command" },
        },
        {
          from: ["k", "l"],
          to: {
            key: "spacebar",
            modifiers: ["left_control", "left_option", "left_command"],
          },
        },
        {
          from: ["j", "semicolon"],
          to: {
            key: "9",
            modifiers: ["left_command", "left_option", "left_shift"],
          },
        },
        { from: ["l", "m"], to: raycast("nikivdev/flow/fork-internal-search") },
        { from: ["l", "n"], to: raycast("nikivdev/flow/index") },
      ],
    },

    {
      description: "backkey (sites)",
      layer: "backslash-mode",
      mappings: [
        { from: "c", to: seqSocket("w: CodeSandbox") },
        { from: "a", to: openApp("Val Town") },
        { from: "semicolon", to: seqSocket("w: Repl.it") },
      ],
    },

    {
      description: "1key (repo prompt)",
      layer: "1-mode",
      mappings: [
        { from: "f", to: km("repo prompt: flow") },
        { from: "j", to: km("repo prompt: 1f") },
        { from: "k", to: km("repo prompt: nikiv") },
        { from: "l", to: km("repo prompt: linsa") },
        { from: "semicolon", to: km("repo prompt: new") },
        { from: "spacebar", to: km("repo prompt: x") },
      ],
    },

    {
      description: "2key (move, searches)",
      layer: "2-mode",
      mappings: [
        { from: "h", to: { key: "left_arrow", modifiers: "left_command" } },
        { from: "j", to: { key: "down_arrow", modifiers: "left_command" } },
        { from: "k", to: { key: "up_arrow", modifiers: "left_command" } },
        { from: "l", to: { key: "right_arrow", modifiers: "left_command" } },
        {
          from: "semicolon",
          to: { key: "up_arrow", modifiers: "left_option" },
        },
        { from: "quote", to: { key: "down_arrow", modifiers: "left_option" } },
      ],
    },

    {
      description: "3key (ports)",
      layer: "3-mode",
      mappings: [
        { from: "r", to: seqSocket("arc: localhost:fr") },
        { from: "i", to: seqSocket("arc: localhost:linsa") },
        { from: "o", to: seqSocket("arc: localhost:la") },
        { from: "h", to: seqSocket("arc: localhost:ghost") },
        { from: "j", to: seqSocket("arc: localhost:3000") },
        { from: "k", to: seqSocket("arc: localhost:nikiv") },
        { from: "semicolon", to: seqSocket("arc: localhost:gen") },
        { from: "period", to: seqSocket("arc: localhost:api") },
        { from: "slash", to: seqSocket("arc: localhost:sb") },
        { from: "spacebar", to: seqSocket("arc: localhost:ui") },
      ],
    },

    {
      description: "4key (scroll)",
      layer: "4-mode",
      mappings: [
        { from: "o", to: seqSocket("arc: scaleway.com") },
        { from: "j", to: { mouse_key: { vertical_wheel: 60 } } },
        { from: "k", to: { mouse_key: { vertical_wheel: -60 } } },
      ],
    },

    {
      description: "5key (swapping languages)",
      layer: "5-mode",
      mappings: [
        {
          from: "j",
          to: openUrl("dash-plugin://query=.tsprofile%3A&prevent_activation=true", {
            background: true,
          }),
        },
        {
          from: "k",
          to: openUrl("dash-plugin://query=.goprofile%3A&prevent_activation=true"),
        },
        {
          from: "n",
          to: openUrl("dash-plugin://query=.pyprofile%3A&prevent_activation=true"),
        },
        {
          from: "3",
          to: openUrl("dash-plugin://query=.rustprofile%3A&prevent_activation=true", {
            background: true,
          }),
        },
        {
          from: "spacebar",
          to: openUrl("dash-plugin://query=.swiftprofile%3A&prevent_activation=true"),
        },
      ],
    },

    {
      description: "7key (gh workspaces, disabled)",
      layer: "7-mode",
      mappings: [],
    },

    {
      description: "tabkey (sites)",
      layer: "tab-mode",
      mappings: [
        { from: "w", to: seqSocket("arc: swift forum") },
        { from: "t", to: seqSocket("arc: t3 chat") },
        { from: "u", to: seqSocket("arc: soundcloud") },
        { from: "i", to: seqSocket("arc: le chat") },
        { from: "o", to: seqSocket("arc: bolt") },
        { from: "h", to: seqSocket("arc: producthunt") },
        { from: "j", to: seqSocket("arc: midjourney") },
        { from: "k", to: seqSocket("arc: grok imagine") },
        { from: "l", to: seqSocket("arc: sora") },
        { from: "semicolon", to: seqSocket("arc: backpack exchange") },
        { from: "c", to: seqSocket("arc: chef") },
        { from: "v", to: seqSocket("arc: vsco") },
        { from: "b", to: seqSocket("arc: uber") },
        { from: "n", to: seqSocket("arc: coinbase") },
        { from: "period", to: seqSocket("arc: elk") },
      ],
    },

    {
      description: "qkey (cmd + shift)",
      layer: "q-mode",
      mappings: [
        {
          from: "3",
          to: { key: "3", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "4",
          to: { key: "4", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "5",
          to: { key: "5", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "6",
          to: { key: "6", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "7",
          to: { key: "7", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "8",
          to: { key: "8", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "9",
          to: { key: "9", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "0",
          to: { key: "0", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "w",
          to: { key: "w", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "e",
          to: { key: "e", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "r",
          to: { key: "r", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "t",
          to: { key: "t", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "y",
          to: { key: "y", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "u",
          to: { key: "u", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "i",
          to: { key: "i", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "o",
          to: { key: "o", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "p",
          to: { key: "p", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "open_bracket",
          to: {
            key: "open_bracket",
            modifiers: ["left_command", "left_shift"],
          },
        },
        {
          from: "close_bracket",
          to: {
            key: "close_bracket",
            modifiers: ["left_command", "left_shift"],
          },
        },
        {
          from: "a",
          to: { key: "a", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "s",
          to: { key: "s", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "d",
          to: { key: "d", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "f",
          to: { key: "f", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "g",
          to: { key: "g", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "h",
          to: { key: "h", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "j",
          to: { key: "j", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "k",
          to: { key: "k", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "l",
          to: { key: "l", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "semicolon",
          to: { key: "semicolon", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "quote",
          to: { key: "quote", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "z",
          to: { key: "z", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "x",
          to: { key: "x", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "c",
          to: { key: "c", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "v",
          to: { key: "v", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "b",
          to: { key: "b", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "n",
          to: { key: "n", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "m",
          to: { key: "m", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "comma",
          to: { key: "comma", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "period",
          to: { key: "period", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "slash",
          to: { key: "slash", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "spacebar",
          to: {
            key: "n",
            modifiers: ["left_command", "left_option", "left_shift"],
          },
        },
      ],
    },

    {
      description: "wkey (apps)",
      layer: "w-mode",
      mappings: [
        { from: "e", to: openApp("Comet") },
        { from: "r", to: openApp("1Password") },
        { from: "t", to: openApp("Activity Monitor") },
        { from: "u", to: openApp("Instruments") },
        { from: "i", to: openUrlInApp("https://n8n.io", "Arc") },
        { from: "o", to: openApp("Keyboard Maestro") },
        { from: "escape", to: openApp("Finder") },
        { from: "a", to: openApp("Xcode") },
        { from: "d", to: openApp("Fantastical") },
        { from: "f", to: openApp("Things") },
        { from: "h", to: openApp("Proxyman") },
        { from: "j", to: openApp("Ghostty") },
        { from: "k", to: openApp("Safari") },
        { from: "l", to: openApp("Zed Preview") },
        { from: "semicolon", to: openApp("Repo Prompt") },
        { from: "quote", to: openApp("JuxtaCode") },
        { from: "c", to: openApp("OrbStack") },
        { from: "v", to: openApp("TablePlus") },
        { from: "b", to: openApp("Conar") },
        { from: "n", to: openApp("Rise") },
        { from: "m", to: openApp("Cursor") },
        { from: "period", to: openApp("Yaak") },
        { from: "slash", to: openApp("Sublime Merge") },
        { from: "left_command", to: zed("~/config/fish/fn.fish") },
        { from: "spacebar", to: zed("~/repos/anomalyco/opencode") },
      ],
    },

    {
      description: "ekey (cmd)",
      layer: "e-mode",
      mappings: [
        { from: "q", to: { key: "q", modifiers: "left_command" } },
        { from: "w", to: { key: "w", modifiers: "left_command" } },
        { from: "r", to: { key: "r", modifiers: "left_command" } },
        { from: "t", to: { key: "t", modifiers: "left_command" } },
        { from: "u", to: { key: "u", modifiers: "left_command" } },
        { from: "i", to: { key: "i", modifiers: "left_command" } },
        { from: "p", to: { key: "p", modifiers: "left_command" } },
        {
          from: "open_bracket",
          to: { key: "open_bracket", modifiers: "left_command" },
        },
        {
          from: "close_bracket",
          to: { key: "close_bracket", modifiers: "left_command" },
        },
        {
          from: "semicolon",
          to: { key: "semicolon", modifiers: "left_command" },
        },
        { from: "quote", to: { key: "quote", modifiers: "left_command" } },
        { from: "comma", to: { key: "comma", modifiers: "left_command" } },
        { from: "period", to: { key: "period", modifiers: "left_command" } },
        { from: "slash", to: { key: "slash", modifiers: "left_command" } },
        { from: "escape", to: zed("~/config/zed/settings.json") },
        { from: "a", to: { key: "a", modifiers: "left_command" } },
        { from: "b", to: { key: "b", modifiers: "left_command" } },
        { from: "c", to: { key: "c", modifiers: "left_command" } },
        { from: "d", to: { key: "d", modifiers: "left_command" } },
        { from: "f", to: { key: "f", modifiers: "left_command" } },
        { from: "g", to: { key: "g", modifiers: "left_command" } },
        { from: "h", to: { key: "h", modifiers: "left_command" } },
        { from: "j", to: { key: "j", modifiers: "left_command" } },
        { from: "k", to: { key: "k", modifiers: "left_command" } },
        { from: "l", to: { key: "l", modifiers: "left_command" } },
        { from: "m", to: { key: "m", modifiers: "left_command" } },
        { from: "n", to: { key: "n", modifiers: "left_command" } },
        { from: "o", to: { key: "o", modifiers: "left_command" } },
        { from: "s", to: { key: "s", modifiers: "left_command" } },
        { from: "v", to: { key: "v", modifiers: "left_command" } },
        { from: "x", to: { key: "x", modifiers: "left_command" } },
        { from: "y", to: { key: "y", modifiers: "left_command" } },
        { from: "z", to: { key: "z", modifiers: "left_command" } },
        { from: "1", to: { key: "1", modifiers: "left_command" } },
        { from: "2", to: { key: "2", modifiers: "left_command" } },
        { from: "3", to: { key: "3", modifiers: "left_command" } },
        { from: "4", to: { key: "4", modifiers: "left_command" } },
        { from: "5", to: { key: "5", modifiers: "left_command" } },
        { from: "6", to: { key: "6", modifiers: "left_command" } },
        { from: "7", to: { key: "7", modifiers: "left_command" } },
        { from: "8", to: { key: "8", modifiers: "left_command" } },
        { from: "9", to: { key: "9", modifiers: "left_command" } },
        { from: "0", to: { key: "0", modifiers: "left_command" } },
        { from: "spacebar", to: openApp("Linear") },
      ],
    },

    {
      description: "rkey ()",
      layer: "r-mode",
      mappings: [
        // { from: "s", to: enter("what to run next?") },
        // { from: "d", to: paste("what flow.toml task to run ") },
        { from: "l", to: paste("/prompts:review-push") },
        {
          from: "semicolon",
          to: raycast("raycast/emoji-symbols/search-emoji-symbols"),
        },
        { from: "spacebar", to: paste("nikita.voloboev@gmail.com") },
      ],
    },

    {
      description: "tkey ()",
      layer: "t-mode",
      mappings: [
        { from: "w", to: zed("~/repos/overengineeringstudio/effect-utils") },
        { from: "a", to: seqAgentFromClipboard() },
        { from: "s", to: shell("seq screenshot /tmp/seq_screenshot.png && open /tmp/seq_screenshot.png") },
      ],
    },

    {
      description: "ukey (sites)",
      layer: "u-mode",
      mappings: [
        { from: "q", to: seqSocket("arc: qwen") },
        { from: "w", to: seqSocket("arc: github map") },
        { from: "e", to: seqSocket("arc: gel") },
        { from: "r", to: seqSocket("arc: arxiv") },
        { from: "i", to: seqSocket("arc: pinboard (popular)") },
        { from: "escape", to: seqSocket("arc: vercel domains") },
        { from: "s", to: seqSocket("arc: vs") },
        { from: "d", to: seqSocket("arc: map of reddit") },
        { from: "f", to: seqSocket("arc: cronometer") },
        { from: "x", to: seqSocket("arc: science explore") },
        { from: "c", to: seqSocket("arc: convex") },
        { from: "v", to: seqSocket("arc: elevenlabs") },
        { from: "b", to: seqSocket("arc: grafbase") },
        { from: "spacebar", to: seqSocket("arc: rutracker") },
      ],
    },

    {
      description: "ykey (gh workspaces, disabled)",
      layer: "y-mode",
      mappings: [],
    },

    {
      description: "ikey (symbols)",
      layer: "i-mode",
      mappings: [
        { from: "1", to: { key: "1", modifiers: "left_shift" } },
        { from: "2", to: { key: "2", modifiers: "left_shift" } },
        { from: "3", to: { key: "equal_sign", modifiers: "left_shift" } },
        { from: "4", to: { key: "8", modifiers: "left_shift" } },
        { from: "w", to: { key: "9", modifiers: "left_shift" } },
        { from: "e", to: { key: "3", modifiers: "left_shift" } },
        { from: "q", to: { key: "open_bracket", modifiers: "left_shift" } },
        {
          from: "escape",
          to: { key: "open_bracket", modifiers: "left_shift" },
        },
        { from: "left_command", to: km("explain (selection, or paste)") },
        { from: "r", to: { key: "quote", modifiers: "left_shift" } },
        { from: "t", to: "quote" },
        { from: "o", to: "open_bracket" },
        { from: "p", to: "close_bracket" },
        {
          from: "open_bracket",
          to: { key: "close_bracket", modifiers: "left_shift" },
        },
        { from: "a", to: "slash" },
        { from: "s", to: { key: "hyphen", modifiers: "left_shift" } },
        { from: "d", to: "backslash" },
        { from: "f", to: "hyphen" },
        { from: "g", to: { key: "4", modifiers: "left_shift" } },
        { from: "h", to: paste("€") },
        { from: "j", to: "equal_sign" },
        {
          from: "l",
          to: [
            "hyphen",
            { key: "period", modifiers: "left_shift" },
            "spacebar",
          ],
        },
        { from: "semicolon", to: "semicolon" },
        {
          from: "grave_accent_and_tilde",
          to: { key: "grave_accent_and_tilde", modifiers: "left_shift" },
        },
        { from: "z", to: { key: "slash", modifiers: "left_shift" } },
        { from: "x", to: { key: "backslash", modifiers: "left_shift" } },
        { from: "c", to: { key: "7", modifiers: "left_shift" } },
        { from: "v", to: { key: "comma", modifiers: "left_shift" } },
        { from: "b", to: ["slash", "slash", "spacebar"] },
      ],
    },

    {
      description: "okey (things)",
      layer: "o-mode",
      mappings: [
        { from: "1", to: { key: "1", modifiers: "left_command" } },
        { from: "2", to: { key: "2", modifiers: "left_command" } },
        { from: "3", to: { key: "3", modifiers: "left_command" } },
        { from: "4", to: { key: "4", modifiers: "left_command" } },
        { from: "5", to: { key: "5", modifiers: "left_command" } },
        { from: "6", to: { key: "6", modifiers: "left_command" } },
        { from: "w", to: seqSocket("arc: console.neon.tech") },
        { from: "e", to: seqSocket("arc: vercel.com") },
        { from: "spacebar", to: seqSocket("arc: railway.com") },
      ],
    },

    {
      description: "pkey (zed)",
      layer: "p-mode",
      mappings: [
        { from: "a", to: zed("~/repos/ziglang/zig") },
      ],
    },

    {
      description: "openBracketKey (gh workspaces, disabled)",
      layer: "open-bracket-mode",
      mappings: [],
    },
    {
      description: "closeBracketKey (gh workspaces)",
      layer: "close-bracket-mode",
      mappings: [],
    },

    {
      description: "akey (ctrl)",
      layer: "a-mode",
      mappings: [
        { from: "2", to: { key: "2", modifiers: "left_control" } },
        { from: "3", to: { key: "3", modifiers: "left_control" } },
        { from: "4", to: { key: "4", modifiers: "left_control" } },
        { from: "5", to: { key: "5", modifiers: "left_control" } },
        { from: "6", to: { key: "6", modifiers: "left_control" } },
        { from: "7", to: { key: "7", modifiers: "left_control" } },
        { from: "8", to: { key: "8", modifiers: "left_control" } },
        { from: "9", to: { key: "9", modifiers: "left_control" } },
        { from: "0", to: { key: "0", modifiers: "left_control" } },
        { from: "q", to: { key: "q", modifiers: "left_control" } },
        { from: "w", to: { key: "w", modifiers: "left_control" } },
        { from: "e", to: { key: "e", modifiers: "left_control" } },
        { from: "r", to: { key: "r", modifiers: "left_control" } },
        { from: "t", to: { key: "t", modifiers: "left_control" } },
        { from: "i", to: { key: "i", modifiers: "left_control" } },
        { from: "o", to: { key: "o", modifiers: "left_control" } },
        { from: "y", to: { key: "y", modifiers: "left_control" } },
        { from: "u", to: { key: "u", modifiers: "left_control" } },
        { from: "p", to: { key: "p", modifiers: "left_control" } },
        {
          from: "open_bracket",
          to: { key: "open_bracket", modifiers: "left_control" },
        },
        {
          from: "close_bracket",
          to: { key: "close_bracket", modifiers: "left_control" },
        },
        { from: "s", to: { key: "s", modifiers: "left_control" } },
        { from: "d", to: { key: "d", modifiers: "left_control" } },
        { from: "f", to: { key: "f", modifiers: "left_control" } },
        { from: "g", to: { key: "g", modifiers: "left_control" } },
        { from: "h", to: { key: "h", modifiers: "left_control" } },
        { from: "j", to: { key: "j", modifiers: "left_control" } },
        { from: "k", to: { key: "k", modifiers: "left_control" } },
        { from: "l", to: { key: "l", modifiers: "left_control" } },
        {
          from: "semicolon",
          to: { key: "semicolon", modifiers: "left_control" },
        },
        { from: "quote", to: { key: "quote", modifiers: "left_control" } },
        { from: "z", to: { key: "z", modifiers: "left_control" } },
        { from: "x", to: { key: "x", modifiers: "left_control" } },
        { from: "c", to: { key: "c", modifiers: "left_control" } },
        { from: "v", to: { key: "v", modifiers: "left_control" } },
        { from: "b", to: { key: "b", modifiers: "left_control" } },
        { from: "n", to: { key: "n", modifiers: "left_control" } },
        { from: "m", to: { key: "m", modifiers: "left_control" } },
        { from: "comma", to: { key: "comma", modifiers: "left_control" } },
        { from: "period", to: { key: "period", modifiers: "left_control" } },
        { from: "slash", to: { key: "slash", modifiers: "left_control" } },
        {
          from: "left_command",
          to: {
            key: "spacebar",
            modifiers: ["left_command", "left_shift", "left_control"],
          },
        },
        {
          from: "spacebar",
          to: { key: "spacebar", modifiers: ["left_shift", "left_option"] },
        },
      ],
    },

    {
      description: "dkey (mouse/media)",
      layer: "d-mode",
      mappings: [
        { from: "v", to: { pointing_button: "button1" } },
        { from: "b", to: { pointing_button: "button3" } },
        { from: "z", to: { pointing_button: "button2" } },
        { from: "tab", to: "mute" },
        { from: "q", to: "illumination_decrement" },
        { from: "w", to: "illumination_increment" },
        { from: "e", to: "display_brightness_decrement" },
        { from: "i", to: { key: "keypad_hyphen", modifiers: "left_command" } },
        { from: "o", to: { key: "keypad_plus", modifiers: "left_command" } },
        { from: "escape", to: "display_brightness_increment" },
        // todo: what is this?
        // {
        //   from: "a",
        //   to: { key: "9", modifiers: ["left_command", "left_control"] },
        // },
        { from: "s", to: alfred("nikiv.dev.flow", "current_windows_of_app") },
        {
          from: "f",
          to: { key: "return_or_enter", modifiers: "left_command" },
        },
        { from: "h", to: "vk_consumer_previous" },
        { from: "j", to: seqSocket("arc: cloudflare.com") },
        { from: "k", to: "vk_consumer_play" },
        { from: "l", to: "vk_consumer_next" },
        // { from: "semicolon", to: openApp("Spotify (or search)") },
        // { from: "semicolon", to: openApp("Spotify (or search)") },
        { from: "semicolon", to: seqSocket("open: Spotify (or search)") },
        { from: "n", to: "volume_decrement" },
        { from: "m", to: "volume_increment" },
        { from: "period", to: seqSocket("New Linear task") },
        {
          from: "slash",
          to: alfred("text_to_docs_and_text", "nikiv.flow"),
        },
        {
          from: "comma",
          to: {
            key: "1",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        { from: "spacebar", to: zed("~/config/i/lin/config.ts") },
        // { from: "spacebar", to: seqSocket("Selection -> Claude") },
      ],
    },

    {
      description: "fkey (essential)",
      layer: "f-mode",
      mappings: [
        { from: "1", to: km("View Sip") },
        { from: "q", to: seqSocket("arc: framer.com") },
        { from: "w", to: openApp("Figma Beta") },
        {
          from: "e",
          to: { key: "8", modifiers: ["left_command", "left_option"] },
        },
        { from: "r", to: km("Centre mouse to active app") },
        { from: "tab", to: openApp("tldraw") },
        { from: "a", to: openApp("Google Chrome Canary") },
        { from: "s", to: openApp("Eagle") },
        { from: "d", to: openApp("ChatGPT") },
        // do: breaks
        // {
        //   from: "d",
        //   to: {
        //     key: "l",
        //     modifiers: ["left_command", "left_option", "left_shift"],
        //   },
        // },
        // { from: "h", to: km("open: Focus") }, // todo: move this to 1focus proper
        {
          from: "g",
          to: openApp("Discord (in Arc)"),
          note: "Open Discord in Arc; this binding is likely temporary.",
        },
        { from: "h", to: seqSocket("telegram: nikivdev (chat)") },
        // do: move preview to r+space to smth else. f+j should be Linsa (embed Glide into Linsa proper, I think its wise but will see, otherwise it moves to space+ key)
        { from: "j", to: openApp("Preview") },
        // do: glide or linsa (but linsa better on f+j)
        // { from: "spacebar", to: openApp("~/code/org/linsa/linsa/build/app/node_modules/electron/dist/Electron.app") },
        // { from: "j", to: openApp("~/code/org/linsa/linsa/build/app/node_modules/electron/dist/Electron.app") },
        // {
        //   from: "j",
        //   to: {
        //     key: "3",
        //     modifiers: ["left_control", "left_command"],
        //   },
        // },
        {
          from: "k",
          to: {
            key: "close_bracket",
            modifiers: ["left_control", "left_option", "left_command"],
          },
        },
        { from: "l", to: openApp("/Applications/Claude.app") },
        {
          from: "semicolon",
          to: useSeqSocket
            ? seqSocket(
                "switch between windows of same app (or switch to another app if no more than 1 window)",
              )
            : seq(
                "switch between windows of same app (or switch to another app if no more than 1 window)",
              ),
        },
        { from: "u", to: seqSocket("telegram: log") },
        { from: "i", to: seqSocket("telegram: nikivdev") },
        {
          from: "o",
          to: seq(
            "open x.com front page in Arc",
            [openApp("Arc"), keystroke("ctrl+1"), keystroke("cmd+6")],
            { waitFrontmostMs: 1800, appSettleMs: 20, eagerKeystrokes: false },
          ),
          note: "Open x.com front page in Arc (focus tab 1, then trigger cmd+6).",
        },
        {
          from: "z",
          to: {
            key: "backslash",
            modifiers: ["left_control", "left_option", "left_command"],
          },
        },
        { from: "n", to: seqSocket("arc: grok.com/imagine") },
        { from: "m", to: seqSocket("arc: aistudio.google.com") },
        { from: "period", to: seqSocket("arc: grok.com") },
        { from: "spacebar", to: openApp("Simulator") },
      ],
    },

    {
      description: "gkey (actions/window)",
      layer: "g-mode",
      mappings: [
        {
          from: "w",
          to: {
            key: "grave_accent_and_tilde",
            modifiers: ["left_command", "left_shift"],
          },
        },
        {
          from: "caps_lock",
          to: km("Go to KM group of current app from picklist"),
        },
        { from: "a", to: km("Go to KM group of current app") },
        { from: "d", to: km("Dismiss notifications") },
        {
          from: "h",
          to: {
            key: "a",
            modifiers: ["left_command", "left_shift", "left_option"],
          },
        },
        {
          from: "j",
          to: { key: "slash", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "k",
          to: {
            key: "f",
            modifiers: ["left_command", "left_option", "left_shift"],
          },
        },
        {
          from: "l",
          to: {
            key: "d",
            modifiers: ["left_command", "left_shift", "left_option"],
          },
        },
        {
          from: "semicolon",
          to: {
            key: "s",
            modifiers: ["left_command", "left_option", "left_shift"],
          },
        },
        {
          from: "u",
          to: {
            key: "7",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "i",
          to: {
            key: "6",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "n",
          to: {
            key: "4",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "m",
          to: {
            key: "3",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "comma",
          to: {
            key: "5",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "quote",
          to: {
            key: "6",
            modifiers: ["left_command", "left_option", "left_shift"],
          },
        },
        {
          from: "spacebar",
          to: {
            key: "u",
            modifiers: ["left_command", "left_option", "left_shift"],
          },
        },
      ],
    },

    {
      description: "tilkey ()",
      layer: "tilde-mode",
      mappings: [
        {
          from: "o",
          to: {
            key: "0",
            modifiers: ["left_control", "left_shift", "left_command"],
          },
        },
        { from: "h", to: km("New KM global macro") },
        { from: "j", to: km("Test") },
        { from: "k", to: km("Go to test macro") },
        { from: "l", to: alfred("run", "iansinnott.keyboardmaestro") },
        { from: "semicolon", to: raycast("loris/safari/search-history") },
        { from: "c", to: seqSocket("arc: dashboard.electric-sql.cloud") },
        { from: "b", to: seqSocket("arc: reddit.com (upvotes)") },
        { from: "period", to: seqSocket("arc: x.com (bookmarks)") },
        { from: "slash", to: seqSocket("arc: x.com (likes)") },
      ],
    },

    {
      description: "zkey (ai agent)",
      layer: "z-mode",
      mappings: [
        { from: "q", to: seqAgentFromClipboard(), note: "AI agent on clipboard" },
        { from: "w", to: seqScreenshotOpen(), note: "Screenshot for AI" },
        { from: "r", to: paste("yes"), note: "Confirm" },
        { from: "t", to: paste("no"), note: "Deny" },
        { from: "j", to: linWidget("~/config/i/kar/scripts/z-mode-widget.ts"), note: "Show z-mode layer" },
        { from: "k", to: shell("bun run ~/config/i/kar/scripts/z-mode-update.ts --zero-latency"), note: "Update z-mode (zero-latency preview)" },
        { from: "comma", to: paste("/review"), note: "Code review" },
        { from: "period", to: paste("/test"), note: "Run tests" },
        { from: "d", to: paste("/diff"), note: "Show diff" },
        { from: "f", to: paste("/fix"), note: "Fix issue" },
        { from: "g", to: paste("f deploy"), note: "flow: f deploy" },
        { from: "h", to: paste("/help"), note: "Help" },
        { from: "l", to: enter("/clear"), note: "Clear context" },
        { from: "y", to: paste("f test"), note: "flow: f test" },
        { from: "2", to: paste("f release-build"), note: "flow: f release-build" },
        { from: "semicolon", to: paste("/plan"), note: "Plan mode" },
        { from: "slash", to: openAppToggle("Arc"), note: "Toggle Arc" },
        { from: "p", to: paste("/commit"), note: "Commit" },
        { from: "n", to: enter("/new"), note: "New session" },
        { from: "m", to: enter("study this codebase"), note: "Study codebase" },
        { from: "b", to: paste("refactor this to be cleaner"), note: "Refactor prompt" },
        { from: "v", to: paste("explain this error and fix it"), note: "Fix error prompt" },
        { from: "c", to: openAppToggle("Claude"), note: "Toggle Claude" },
        { from: "x", to: openAppToggle("Zed"), note: "Toggle Zed" },
        { from: "1", to: openAppToggle("Things3"), note: "Toggle Things3" },
      ],
    },

    {
      description: "xkey (zed workspaces)",
      layer: "x-mode",
      mappings: [
        { from: "i", to: zed("~/repos/ronin-co/hive") },
        { from: "o", to: zed("~/repos/tailwindlabs/tailwindcss") },
        { from: "j", to: zed("~/repos/cocoindex-io/cocoindex") },
        { from: "k", to: zed("~/repos/blackboardsh/electrobun") },
        { from: "l", to: zed("~/repos/millionco/react-doctor") },
        { from: "semicolon", to: zed("~/repos/zeroclaw-labs/zeroclaw") },
        { from: "v", to: zed("~/repos/thelinuxlich/go-go-scope") },
        { from: "n", to: zed("~/repos/glushchenko/fsnotes") },
        { from: "m", to: zed("~/repos/ml-explore/mlx-lm") },
        { from: "period", to: zed("~/repos/christopherkarani/Hive") },
        { from: "spacebar", to: zed("~/repos/mui/base-ui") },
      ],
    },

    {
      description: "ckey ()",
      layer: "c-mode",
      mappings: [
        { from: "w", to: zed("~/repos/ml-explore/mlx") },
        { from: "e", to: zed("~/repos/ml-explore/mlx-lm") },
        { from: "i", to: zed("~/repos/0xPlaygrounds/rig") },
        { from: "o", to: zed("~/repos/agno-agi/agno") },
        { from: "escape", to: zed("~/repos/google-deepmind/optax") },
        { from: "a", to: zed("~/repos/sgl-project/sglang") },
        { from: "s", to: zed("~/repos/vllm-project/vllm") },
        { from: "d", to: zed("~/repos/google/grain") },
        { from: "j", to: zed("~/repos/jax-ml/jax") },
        { from: "k", to: zed("~/repos/block/goose") },
        { from: "l", to: zed("~/repos/PrimeIntellect-ai/prime-rl") },
        { from: "semicolon", to: zed("~/repos/laude-institute/harbor") },
        { from: "grave_accent_and_tilde", to: zed("~/repos/antirez/qwen-asr") },
        { from: "z", to: zed("~/repos/google-research/kauldron") },
        { from: "n", to: zed("~/repos/PrimeIntellect-ai/verifiers") },
        { from: "m", to: zed("~/code/lang/mojo") },
        { from: "period", to: zed("~/repos/triton-lang/triton") },
        { from: "left_command", to: zed("~/repos/google/flax") },
        { from: "spacebar", to: zed("~/repos/pytorch/pytorch") },
      ],
    },

    {
      description: "vkey (search/workspaces)",
      layer: "v-mode",
      mappings: [
        {
          from: "q",
          to: zed("~/repos/raycast/extensions"),
          note: "Raycast extensions workspace; planned path migration to ~/code/raycast/ext/raycast.",
        },
        { from: "w", to: zed("~/code/alfred") },
        { from: "e", to: zed("~/repos/tim-smart/lalph") },
        { from: "r", to: zed("~/code/stream") },
        { from: "i", to: zed("~/code/unhash") },
        {
          from: "o",
          to: zed("~/code/org/gitedit/gitedit"),
          note: "Gitedit workspace; migrate more VS Code-specific flows here over time.",
        },
        { from: "a", to: zed("~/code/kar") },
        { from: "s", to: zed("~/code/seq") },
        {
          from: "d",
          to: zed("~/code/org/gen/new"),
          note: "Primary gen/new workspace, including training artifacts and data storage.",
        },
        { from: "f", to: zed("~/code/infra") },
        { from: "h", to: zed("~/repos/alibaba/zvec") },
        {
          from: "j",
          to: alfred("nikiv.dev.flow", "code"),
        },
        {
          from: "k",
          to: alfred("nikiv.dev.flow", "repos"),
        },
        { from: "l", to: zed("~/code/org/linsa/linsa") },
        { from: "semicolon", to: zed("~/code/rise") },
        { from: "grave_accent_and_tilde", to: zed("~/code/telegram") },
        { from: "z", to: zed("~/repos/garden-co/jazz2") },
        {
          from: "x",
          to: zed("~/repos/org/gen/genx"),
          note: "Genx workspace (Hugging Face-aligned copy).",
        },
        {
          from: "b",
          to: zed("~/code/org/linsa/lin-ios"),
          note: "lin-ios workspace; target is to consolidate under /lin.",
        },
        { from: "n", to: zed("~/code/org/linsa/lin") },
        { from: "m", to: zed("~/code/org/linsa/linsa-mac") },
        { from: "left_command", to: zed("~/code/zerg") },
        { from: "spacebar", to: zed("~/code/flow") },
        { from: "period", to: zed("~/code/myflow") },
        { from: "slash", to: zed("~/repos/bobzhang/hol") },
      ],
    },

    {
      description: "bkey (zed workspaces)",
      layer: "b-mode",
      mappings: [
        { from: "e", to: zed("~/repos/tw93/Mole") },
        { from: "r", to: zed("~/repos/aidenybai/react-grab") },
        { from: "i", to: zed("~/repos/oxc-project/tsgolint") },
        { from: "o", to: zed("~/repos/rolldown/rolldown") },
        { from: "s", to: zed("~/repos/rudrankriyam/App-Store-Connect-CLI") },
        { from: "d", to: zed("~/repos/TanStack/table") },
        { from: "f", to: zed("~/repos/npmx-dev/npmx.dev") },
        { from: "j", to: zed("~/repos/oven-sh/bun") },
        { from: "k", to: zed("~/repos/pqrs-org/Karabiner-Elements-user-command-receiver") },
        { from: "l", to: zed("~/repos/oxc-project/oxc") },
        { from: "semicolon", to: zed("~/repos/vercel/turborepo") },
        { from: "n", to: zed("~/repos/vercel/streamdown") },
        { from: "m", to: zed("~/repos/TanStack/router") },
        { from: "spacebar", to: zed("~/repos/polarsource/polar") },
      ],
    },

    {
      description: "nkey ()",
      layer: "n-mode",
      mappings: [
        { from: "1", to: { key: "1", modifiers: "left_option" } },
        { from: "2", to: { key: "2", modifiers: "left_option" } },
        { from: "3", to: { key: "3", modifiers: "left_option" } },
        { from: "4", to: { key: "4", modifiers: "left_option" } },
        { from: "5", to: { key: "5", modifiers: "left_option" } },
        { from: "6", to: { key: "6", modifiers: "left_option" } },
        // do: make smart
        { from: "q", to: zed("~/docs/journal/26-feb.mdx") },
        { from: "w", to: zed("~/code/org/la/la") },
        { from: "e", to: zed("~/repos/openclaw/openclaw") },
        { from: "r", to: zed("~/docs/learn.mdx") },
        { from: "escape", to: zed("~/docs/health.mdx") },
        { from: "a", to: zed("~/code/lang/go") },
        { from: "s", to: zed("~/code/lang/swift") },
        { from: "d", to: zed("~/code/lang/rust") },
        { from: "f", to: zed("~/code/lang/py") },
        // do: make linsa-mac (this is exp)
        { from: "g", to: zed("~/code/org/1f/glide") },
        // do: move
        {
          from: "semicolon",
          to: zed("~/repos/moonbitlang/moon"),
        },
        { from: "z", to: zed("~/repos/astral-sh/uv") },
        {
          from: "c",
          to: zed("~/code/rise-app"),
          note: "Rise app workspace; keep this aligned with current VS Code setup.",
        },
        {
          from: "v",
          to: zed("~/repos/Makisuo/maple"),
          note: "Maple workspace; possible candidate for 1focus integration.",
        },
        { from: "spacebar", to: zed("~/code/lang/ts") },
      ],
    },

    {
      description: "mkey (zed workspaces)",
      layer: "m-mode",
      mappings: [
        { from: "q", to: zed("~/repos/tobi/qmd") },
        { from: "w", to: zed("~/repos/electron/electron") },
        { from: "e", to: zed("~/repos/openai/codex") },
        { from: "r", to: zed("~/repos/wannabespace/conar") },
        { from: "t", to: zed("~/repos/TinyAGI/tinyclaw") },
        { from: "escape", to: zed("~/repos/batrachianai/toad") },
        { from: "a", to: zed("~/repos/badlogic/pi-mono") },
        { from: "s", to: zed("~/repos/jj-vcs/jj") },
        {
          from: "d",
          to: zed("~/repos/supabitapp/supacode"),
          note: "Supacode workspace; revisit whether Friendik should cover this workflow.",
        },
        { from: "f", to: zed("~/repos/expo/expo") },
        { from: "k", to: zed("~/repos/nearai/ironclaw") },
        { from: "semicolon", to: zed("~/repos/idursun/jjui") },
        { from: "grave_accent_and_tilde", to: zed("~/repos/banteg/takopi") },
        { from: "z", to: zed("~/repos/HazelChat/hazel") },
        { from: "x", to: zed("~/repos/GitoxideLabs/gitoxide") },
        { from: "c", to: zed("~/repos/tailscale/tailscale") },
        { from: "v", to: zed("~/repos/alchemy-run/alchemy") },
        { from: "b", to: zed("~/repos/steipete/bird") },
        { from: "spacebar", to: zed("~/repos/makepad/makepad") },
      ],
    },

    {
      description: "dotkey (zed workspaces)",
      layer: "dot-mode",
      mappings: [
        { from: "w", to: zed("~/repos/reatom/reatom") },
        { from: "e", to: zed("~/repos/Effect-TS/effect-smol") },
        { from: "r", to: zed("~/repos/mikearnaldi/cruster") },
        { from: "escape", to: zed("~/repos/zed-industries/extensions") },
        { from: "a", to: zed("~/repos/ghostty-org/ghostty") },
        { from: "s", to: zed("~/repos/fish-shell/fish-shell") },
        { from: "d", to: zed("~/repos/daytonaio/daytona") },
        {
          from: "f",
          to: zed("~/repos/Dimillian/CodexMonitor"),
        },
        { from: "g", to: zed("~/repos/postgres/postgres") },
        { from: "j", to: zed("~/repos/elysiajs/elysia") },
        { from: "z", to: zed("~/repos/drizzle-team/drizzle-orm") },
        { from: "c", to: zed("~/repos/HelixDB/helix-db") },
        { from: "v", to: zed("~/repos/flox/flox") },
        { from: "b", to: zed("~/repos/Dicklesworthstone/beads_rust") },
        { from: "n", to: zed("~/repos/encoredev/encore") },
        { from: "m", to: zed("~/repos/ManimCommunity/manim") },
        { from: "left_command", to: zed("~/repos/MoonshotAI/kimi-cli") },
        { from: "spacebar", to: zed("~/repos/zed-industries/zed") },
      ],
    },

    {
      description: "tsdot (ts snippets)",
      layer: "ts-mode",
      mappings: [
        {
          from: "a",
          to: [
            "c",
            "o",
            "n",
            "s",
            "o",
            "l",
            "e",
            "period",
            "l",
            "o",
            "g",
            { key: "9", modifiers: "left_shift" },
            { key: "0", modifiers: "left_shift" },
            "left_arrow",
          ],
        },
        {
          from: "s",
          to: [
            "equal_sign",
            { key: "period", modifiers: "left_shift" },
            "spacebar",
          ],
        },
        { from: "d", to: ["r", "e", "t", "u", "r", "n", "spacebar"] },
        { from: "f", to: ["c", "o", "n", "s", "t", "spacebar"] },
        {
          from: "g",
          to: [
            { key: "f", modifiers: "left_command" },
            "c",
            "o",
            "n",
            "s",
            "o",
            "l",
            "e",
            "period",
            "l",
            "o",
            "g",
            { key: "9", modifiers: "left_shift" },
            "return_or_enter",
          ],
        },
        {
          from: "z",
          to: [
            "spacebar",
            "s",
            "t",
            "y",
            "l",
            "e",
            "equal_sign",
            { key: "open_bracket", modifiers: "left_shift" },
            { key: "open_bracket", modifiers: "left_shift" },
            { key: "close_bracket", modifiers: "left_shift" },
            { key: "close_bracket", modifiers: "left_shift" },
            "left_arrow",
            "left_arrow",
          ],
        },
        {
          from: "x",
          to: [
            "p",
            "r",
            "o",
            "c",
            "e",
            "s",
            "s",
            "period",
            "e",
            "n",
            "v",
            "period",
          ],
        },
        {
          from: "c",
          to: [
            "spacebar",
            "c",
            "l",
            "a",
            "s",
            "s",
            { key: "n", modifiers: "left_shift" },
            "a",
            "m",
            "e",
            "equal_sign",
            { key: "quote", modifiers: "left_shift" },
            { key: "quote", modifiers: "left_shift" },
            "left_arrow",
          ],
        },
        { from: "tab", to: ["a", "s", "y", "n", "c", "spacebar"] },
        { from: "escape", to: ["a", "w", "a", "i", "t", "spacebar"] },
        {
          from: "v",
          to: ["t", "y", "p", "e", "s", "c", "r", "i", "p", "t", "spacebar"],
        },
      ],
    },

    {
      description: "godot (go snippets)",
      layer: "go-mode",
      mappings: [
        { from: "tab", to: seqSocket("w: GoDoc") },
        {
          from: "a",
          to: [
            "f",
            "m",
            "t",
            "period",
            { key: "p", modifiers: "left_shift" },
            "r",
            "i",
            "n",
            "t",
            "l",
            "n",
            { key: "9", modifiers: "left_shift" },
            { key: "0", modifiers: "left_shift" },
            "left_arrow",
          ],
        },
        {
          from: "s",
          to: [
            { key: "semicolon", modifiers: "left_shift" },
            "equal_sign",
            "spacebar",
          ],
        },
        { from: "d", to: ["r", "e", "t", "u", "r", "n", "spacebar"] },
        {
          from: "f",
          to: [
            { key: "f", modifiers: "left_command" },
            "f",
            "m",
            "t",
            "period",
            "p",
            "return_or_enter",
          ],
        },
        {
          from: "g",
          to: [
            "i",
            "f",
            "spacebar",
            "e",
            "r",
            "r",
            "spacebar",
            { key: "1", modifiers: "left_shift" },
            "equal_sign",
            "spacebar",
            "n",
            "i",
            "l",
            "spacebar",
            { key: "open_bracket", modifiers: "left_shift" },
            "return_or_enter",
          ],
        },
        {
          from: "j",
          to: [
            "grave_accent_and_tilde",
            "j",
            "s",
            "o",
            "n",
            { key: "semicolon", modifiers: "left_shift" },
            { key: "quote", modifiers: "left_shift" },
            { key: "quote", modifiers: "left_shift" },
            "grave_accent_and_tilde",
            "left_arrow",
            "left_arrow",
          ],
        },
        {
          from: "z",
          to: [
            "l",
            "o",
            "g",
            "period",
            { key: "p", modifiers: "left_shift" },
            "r",
            "i",
            "n",
            "t",
            "l",
            "n",
            { key: "9", modifiers: "left_shift" },
            { key: "0", modifiers: "left_shift" },
            "left_arrow",
          ],
        },
        {
          from: "x",
          to: [
            "f",
            "m",
            "t",
            "period",
            { key: "p", modifiers: "left_shift" },
            "r",
            "i",
            "n",
            "t",
            "l",
            "n",
            { key: "9", modifiers: "left_shift" },
            { key: "0", modifiers: "left_shift" },
            "left_arrow",
            { key: "quote", modifiers: "left_shift" },
            "hyphen",
            "hyphen",
          ],
        },
        {
          from: "c",
          to: { key: "semicolon", modifiers: ["left_control", "left_shift"] },
        },
        { from: "v", to: ["g", "o", "l", "a", "n", "g", "spacebar"] },
        {
          from: "b",
          to: [
            "l",
            "o",
            "g",
            "period",
            { key: "f", modifiers: "left_shift" },
            "a",
            "t",
            "a",
            "l",
            { key: "9", modifiers: "left_shift" },
            "e",
            "r",
            "r",
            { key: "0", modifiers: "left_shift" },
          ],
        },
      ],
    },

    {
      description: "pydot (py snippets)",
      layer: "py-mode",
      mappings: [
        {
          from: "a",
          to: [
            "p",
            "r",
            "i",
            "n",
            "t",
            { key: "9", modifiers: "left_shift" },
            { key: "0", modifiers: "left_shift" },
            "left_arrow",
          ],
        },
        {
          from: "s",
          to: ["hyphen", { key: "period", modifiers: "left_shift" }],
        },
        { from: "d", to: ["r", "e", "t", "u", "r", "n", "spacebar"] },
        { from: "v", to: ["p", "y", "t", "h", "o", "n", "spacebar"] },
      ],
    },

    {
      description: "swiftdot (swift snippets)",
      layer: "swift-mode",
      mappings: [
        {
          from: "a",
          to: [
            "p",
            "r",
            "i",
            "n",
            "t",
            { key: "9", modifiers: "left_shift" },
            { key: "0", modifiers: "left_shift" },
            "left_arrow",
          ],
        },
        { from: "v", to: ["s", "w", "i", "f", "t", "spacebar"] },
      ],
    },

    // {
    //   description: "rustdot (rust snippets)",
    //   layer: "rust-mode",
    //   mappings: [
    //     {
    //       from: "a",
    //       to: [
    //         "l",
    //         "o",
    //         "g",
    //         { key: "1", modifiers: "left_shift" },
    //         { key: "9", modifiers: "left_shift" },
    //         { key: "0", modifiers: "left_shift" },
    //         "semicolon",
    //         "left_arrow",
    //         "left_arrow",
    //       ],
    //     },
    //     {
    //       from: "s",
    //       to: [
    //         "a",
    //         "s",
    //         "s",
    //         "e",
    //         "r",
    //         "t",
    //         { key: "hyphen", modifiers: "left_shift" },
    //         "e",
    //         "q",
    //         { key: "1", modifiers: "left_shift" },
    //         { key: "9", modifiers: "left_shift" },
    //       ],
    //     },
    //     {
    //       from: "d",
    //       to: [
    //         "hyphen",
    //         { key: "period", modifiers: "left_shift" },
    //         "spacebar",
    //       ],
    //     },
    //     {
    //       from: "f",
    //       to: [
    //         "p",
    //         "r",
    //         "i",
    //         "n",
    //         "t",
    //         "l",
    //         "n",
    //         { key: "1", modifiers: "left_shift" },
    //         { key: "9", modifiers: "left_shift" },
    //         { key: "0", modifiers: "left_shift" },
    //         "semicolon",
    //         "left_arrow",
    //         "left_arrow",
    //         { key: "quote", modifiers: "left_shift" },
    //         { key: "open_bracket", modifiers: "left_shift" },
    //         { key: "semicolon", modifiers: "left_shift" },
    //         { key: "slash", modifiers: "left_shift" },
    //         { key: "close_bracket", modifiers: "left_shift" },
    //         "right_arrow",
    //         "comma",
    //         "spacebar",
    //       ],
    //     },
    //     { from: "v", to: ["r", "u", "s", "t", "spacebar"] },
    //   ],
    // },

    {
      description: "leftControlKey (gh workspaces, disabled)",
      layer: "left-control-mode",
      mappings: [],
    },

    {
      description: "leftOptionKey (linear)",
      layer: "left-option-mode",
      mappings: [
        { from: "j", to: seqSocket("linear: focus initiative") },
        { from: "k", to: seqSocket("linear: nikiv") },
        { from: "i", to: seqSocket("linear: linsa") },
        { from: "semicolon", to: seqSocket("linear: gen") },
      ],
    },

    {
      description: "spacekey (screenshots/apps)",
      layer: "spacebar-mode",
      mappings: [
        {
          from: "1",
          to: {
            key: "q",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "2",
          to: { key: "4", modifiers: ["left_command", "left_shift"] },
        },
        {
          from: "3",
          to: {
            key: "9",
            modifiers: ["left_control", "left_option", "left_shift"],
          },
        },
        {
          from: "4",
          to: { key: "3", modifiers: ["left_command", "left_shift"] },
        },
        { from: "tab", to: openApp("CleanShot") },
        {
          from: "q",
          to: { key: "5", modifiers: ["left_control", "left_option"] },
        },
        {
          from: "w",
          to: { key: "3", modifiers: ["left_control", "left_option"] },
        },
        {
          from: "e",
          to: { key: "2", modifiers: ["left_control", "left_option"] },
        },
        {
          from: "r",
          to: { key: "7", modifiers: ["left_command", "left_shift"] },
        },
        { from: "t", to: openUrlInApp("https://github.com/nikivdev", "Safari") },
        { from: "i", to: openApp("Reader") },
        {
          from: "o",
          to: seq(
            "open x.com front page in Arc",
            [openApp("Arc"), keystroke("ctrl+1"), keystroke("cmd+6")],
            { waitFrontmostMs: 1800, appSettleMs: 20, eagerKeystrokes: false },
          ),
          note: "Open x.com front page in Arc (focus tab 1, then trigger cmd+6).",
        },
        { from: "p", to: openApp("X profile (in Arc)") },
        {
          from: "a",
          to: { key: "9", modifiers: ["left_command", "left_shift"] },
        },
        { from: "s", to: openApp("Safari Technology Preview") },
        { from: "d", to: openApp("Arc") },
        { from: "f", to: openApp("Spark") },
        { from: "g", to: openUrlInApp("https://grokipedia.com", "Arc") },
        { from: "h", to: openApp("Codex Monitor") },
        { from: "j", to: openApp("Discord") },
        { from: "k", to: openApp("Dia") },
        { from: "l", to: openApp("Telegram") },
        { from: "semicolon", to: openApp("Slack") },
        {
          from: "grave_accent_and_tilde",
          to: openUrlInApp("https://news.ycombinator/new-comments", "Arc"),
        },
        { from: "z", to: openApp("IG Messages (in Arc)") },
        { from: "c", to: seqSocket("telegram: saved") },
        {
          from: "m",
          to: seq(
            "open X Messages in Arc",
            [openApp("Arc"), keystroke("ctrl+1"), keystroke("cmd+8")],
            { waitFrontmostMs: 1800, appSettleMs: 20, eagerKeystrokes: false },
          ),
          note: "Open X Messages in Arc (focus tab 1, then trigger cmd+8).",
        },
        { from: "comma", to: openUrlInApp("https://aistudio.google.com", "Arc") },
        { from: "period", to: openUrlInApp("https://colab.research.google.com", "Arc") },
        // { from: "slash", to: openUrlInApp("https://aistudio.google.com", "Arc") },
      ],
      // { from: "n", to: km("linear: Plan") },
    },

    {
      description: "spacekey (Dia links)",
      layer: "spacebar-mode",
      condition: { app: "^company\\.thebrowser\\.dia$" },
      mappings: [
        {
          from: "n",
          to: seqSocket("dia: save current url to docs"),
          note: "In Dia, copy current URL (opt+cmd+c) and append it to ~/docs/nice-urls.mdx under ## Links.",
        },
      ],
    },

    {
      description: "slashKey (zed)",
      layer: "slash-mode",
      mappings: [
        { from: "w", to: zed("~/repos/SuperCmdLabs/SuperCmd") },
        { from: "e", to: zed("~/repos/mzau/mlx-knife") },
        { from: "s", to: zed("~/repos/Hmbown/aleph") },
        // { from: "f", to: zed("~/repos/alchemy-run/distilled-aws") },
        { from: "spacebar", to: zed("~/repos/xai-org/x-algorithm") },
        // { from: "a", to: zed("~/repos/Hmbown/aleph") },
        // { from: "w", to: zed("~/code/lin") },
      ],
    },

  ],
} satisfies Config
