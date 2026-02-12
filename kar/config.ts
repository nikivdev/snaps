import type { Config } from "./types/index.ts"
import { km, raycast, alfred, shell, zed, linWidget, openApp, seq, seqSocket, keystroke } from "./types/index.ts"

const useSeqSocket = false
const debugSimJK = false

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
    // Keep explicit simultaneous chords snappy (avoid perceptible delay on normal typing).
    // Simlayers use their own per-layer thresholds (usually 250ms).
    sim: 30,
  },

  simple: [{ from: "caps_lock", to: "escape" }],

  simlayers: {
    "semicolon-mode": { key: "semicolon", threshold: 250 },
    "quote-mode": { key: "quote", threshold: 250 },
    "backslash-mode": { key: "non_us_backslash", threshold: 250 },
    "1-mode": { key: "1", threshold: 250 },
    "2-mode": { key: "2", threshold: 250 },
    "3-mode": { key: "3", threshold: 250 },
    "4-mode": { key: "4", threshold: 250 },
    "5-mode": { key: "5", threshold: 250 },
    "7-mode": { key: "7", threshold: 250 },
    "8-mode": { key: "8", threshold: 250 },
    "9-mode": { key: "9", threshold: 250 },
    "0-mode": { key: "0", threshold: 250 },
    "hyphen-mode": { key: "hyphen", threshold: 250 },
    "equal-sign-mode": { key: "equal_sign", threshold: 250 },
    "tab-mode": { key: "tab", threshold: 250 },
    "q-mode": { key: "q", threshold: 250 },
    "w-mode": { key: "w", threshold: 250 },
    "e-mode": { key: "e", threshold: 250 },
    "r-mode": { key: "r", threshold: 250 },
    "t-mode": { key: "t", threshold: 250 },
    "u-mode": { key: "u", threshold: 250 },
    "y-mode": { key: "y", threshold: 250 },
    "i-mode": { key: "i", threshold: 250 },
    "o-mode": { key: "o", threshold: 250 },
    "p-mode": { key: "p", threshold: 250 },
    "open-bracket-mode": { key: "open_bracket", threshold: 250 },
    "close-bracket-mode": { key: "close_bracket", threshold: 250 },
    "a-mode": { key: "a", threshold: 250 },
    "s-mode": { key: "s", threshold: 250 },
    "d-mode": { key: "d", threshold: 250 },
    "f-mode": { key: "f", threshold: 250 },
    "g-mode": { key: "g", threshold: 250 },
    "escape-mode": { key: "escape", threshold: 250 },
    "tilde-mode": { key: "grave_accent_and_tilde", threshold: 250 },
    "z-mode": { key: "z", threshold: 250 },
    "x-mode": { key: "x", threshold: 250 },
    "c-mode": { key: "c", threshold: 250 },
    "v-mode": { key: "v", threshold: 250 },
    "b-mode": { key: "b", threshold: 250 },
    "n-mode": { key: "n", threshold: 250 },
    "m-mode": { key: "m", threshold: 250 },
    "comma-mode": { key: "comma", threshold: 250 },
    "dot-mode": { key: "period", threshold: 250 },
    "slash-mode": { key: "slash", threshold: 250 },
    "left-control-mode": { key: "left_control", threshold: 250 },
    "left-option-mode": { key: "left_option", threshold: 250 },
    "left-command-mode": { key: "left_command", threshold: 250 },
    "right-command-mode": { key: "right_command", threshold: 250 },
    "spacebar-mode": { key: "spacebar", threshold: 250 },
    "ts-mode": { key: "1", threshold: 250 },
    "go-mode": { key: "2", threshold: 250 },
    "py-mode": { key: "3", threshold: 250 },
    "swift-mode": { key: "6", threshold: 250 },
    // "rust-mode": { key: "grave_accent_and_tilde", threshold: 250 },
  },

  rules: [
    // semicolon-mode: control for numbers, shift for letters
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
        { from: "escape", to: zed("~/code/nikiv/do.md") },
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
        { from: "left_command", to: openApp("Notion") },
        { from: "spacebar", to: zed("~/code/nikiv") },
      ],
      // { from: "grave_accent_and_tilde", to: zed("~/docs") },
      // { from: "left_command", to: km("open: Reflect") },
    },

    // s-mode: essential navigation and editing
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

    // simultaneous keys
    {
      description: "sim",
      mappings: [
        {
          from: ["j", "k"],
          // Debug knob: if true, write a marker so we know the chord fired at all.
          to: debugSimJK ? shell(`echo "jk $(date +%s%3N)" >> /tmp/kar-sim.log`) : seqSocket("open Safari new tab"),
        },
        { from: ["k", "n"], to: seqSocket("open Comet new tab") },
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

    // backslash-mode: sites
    {
      description: "backkey (sites)",
      layer: "backslash-mode",
      mappings: [
        { from: "c", to: seqSocket("w: CodeSandbox") },
        { from: "a", to: openApp("Val Town") },
        { from: "semicolon", to: seqSocket("w: Repl.it") },
      ],
    },

    // 1-mode: repo prompt
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

    // 2-mode: move, searches
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

    // 3-mode: ports
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

    // 4-mode: scroll
    {
      description: "4key ()",
      layer: "4-mode",
      mappings: [
        { from: "o", to: seqSocket("arc: scaleway.com") },
        { from: "j", to: { mouse_key: { vertical_wheel: 60 } } },
        { from: "k", to: { mouse_key: { vertical_wheel: -60 } } },
      ],
    },

    // 5-mode: language switching
    {
      description: "5key (swapping languages)",
      layer: "5-mode",
      mappings: [
        {
          from: "j",
          to: shell(
            'open -g "dash-plugin://query=.tsprofile%3A&prevent_activation=true"',
          ),
        },
        {
          from: "k",
          to: shell(
            'open "dash-plugin://query=.goprofile%3A&prevent_activation=true"',
          ),
        },
        {
          from: "n",
          to: shell(
            'open "dash-plugin://query=.pyprofile%3A&prevent_activation=true"',
          ),
        },
        {
          from: "3",
          to: shell(
            'open -g "dash-plugin://query=.rustprofile%3A&prevent_activation=true"',
          ),
        },
        {
          from: "spacebar",
          to: shell(
            'open "dash-plugin://query=.swiftprofile%3A&prevent_activation=true"',
          ),
        },
      ],
    },

    // 7-mode: gh workspaces
    {
      description: "7key (gh workspaces)",
      layer: "7-mode",
      mappings: [
        { from: "r", to: cursor("brush-gh") },
        { from: "f", to: cursor("folo-rs-gh") },
        { from: "c", to: cursor("calloop-rs-gh") },
        { from: "spacebar", to: cursor("model2vec-rs-gh") },
      ],
    },

    // 8-mode: gh workspaces
    {
      description: "8key (gh workspaces)",
      layer: "8-mode",
      mappings: [
        { from: "q", to: cursor("quic-go-gh") },
        { from: "e", to: cursor("elevenlabs-gh") },
        { from: "r", to: cursor("rig-gh") },
        { from: "s", to: cursor("goose-gh") },
        { from: "g", to: cursor("g3-gh") },
        { from: "k", to: cursor("anki-gh") },
        { from: "c", to: cursor("quiche-gh") },
        { from: "spacebar", to: cursor("fumadocs-gh") },
      ],
    },

    // 9-mode: gh workspaces
    {
      description: "9key (gh workspaces)",
      layer: "9-mode",
      mappings: [
        { from: "w", to: cursor("vscode-vim-gh") },
        { from: "t", to: cursor("typst-gh") },
        { from: "e", to: cursor("neovim-gh") },
        { from: "u", to: cursor("cuml-gh") },
        { from: "s", to: cursor("scipy-gh") },
        { from: "d", to: cursor("pandas-gh") },
        { from: "f", to: cursor("snafu-gh") },
        { from: "v", to: cursor("v8-gh") },
        { from: "spacebar", to: cursor("keel-gh") },
      ],
    },

    // hyphen-mode: gh workspaces
    {
      description: "hyphenkey (gh workspaces)",
      layer: "hyphen-mode",
      mappings: [
        { from: "e", to: cursor("phoenix-gh") },
        { from: "r", to: cursor("elixir-gh") },
        { from: "t", to: cursor("upstash-gh") },
        { from: "a", to: cursor("astro-gh") },
        { from: "s", to: cursor("scalar-gh") },
        { from: "d", to: cursor("caddy-gh") },
        { from: "f", to: cursor("traefik-gh") },
        { from: "g", to: cursor("godot-gh") },
        { from: "b", to: cursor("ladybird-gh") },
        { from: "x", to: cursor("xata-gh") },
        { from: "spacebar", to: cursor("morphic-gh") },
      ],
    },

    // hyphen-mode: more gh workspaces (second set)
    {
      description: "equalSignKey (gh workspaces)",
      layer: "hyphen-mode",
      mappings: [
        { from: "q", to: cursor("sqlight-gh") },
        { from: "w", to: cursor("swift-async-algorithms-gh") },
        { from: "e", to: cursor("lean-gh") },
        { from: "t", to: cursor("yugabyte-db-gh") },
        { from: "s", to: cursor("bolt-ts-gh") },
        { from: "f", to: cursor("fets-gh") },
        { from: "g", to: cursor("gptqmodel-gh") },
        { from: "c", to: cursor("curlie-gh") },
        { from: "t", to: cursor("streamlit-gh") },
        { from: "b", to: cursor("browser-bee-gh") },
        { from: "spacebar", to: cursor("n8n-gh") },
      ],
    },

    // tab-mode: sites
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

    // q-mode: cmd+shift
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

    // w-mode: apps
    {
      description: "wkey (apps)",
      layer: "w-mode",
      mappings: [
        { from: "e", to: openApp("Comet") },
        { from: "r", to: openApp("1Password") },
        { from: "t", to: openApp("Activity Monitor") },
        { from: "u", to: openApp("Instruments") },
        { from: "i", to: seqSocket("arc: n8n.io") },
        { from: "o", to: openApp("Keyboard Maestro") },
        { from: "escape", to: openApp("Finder") },
        { from: "a", to: openApp("Xcode Beta") },
        { from: "d", to: openApp("Fantastical") },
        { from: "f", to: openApp("Things") },
        { from: "h", to: openApp("Proxyman") },
        { from: "j", to: openApp("Ghostty") },
        { from: "k", to: openApp("Safari") },
        { from: "l", to: openApp("Zed Preview") },
        { from: "semicolon", to: openApp("Rise") },
        { from: "quote", to: openApp("JuxtaCode") },
        { from: "c", to: openApp("Conar") },
        { from: "v", to: openApp("TablePlus") },
        { from: "b", to: openApp("OrbStack") },
        { from: "n", to: openApp("Repo Prompt") },
        { from: "m", to: openApp("Cursor") },
        { from: "period", to: openApp("Yaak") },
        { from: "slash", to: openApp("Sublime Merge") },
        { from: "left_command", to: zed("~/config/fish/fn.fish") },
        { from: "spacebar", to: openApp("~/code/org/linsa/linsa/build/app/node_modules/electron/dist/Electron.app") },
      ],
      // { from: "spacebar", to: zed("~/config/i/lin/config.ts") },
      // { from: "g", to: km("open: Granola") },
      // { from: "e", to: zed("~/code") }, // too much load on zed to load in code
      // { from: "semicolon", to: km("open: Electron") }, // todo: make 1f desktop & move it somewhere nice
    },

    // e-mode: cmd
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
        // { from: "left_command", to: km("open: Glide") }, // do: do smth with glide too. mby pass current context into glide (review etc)
        // todo: replace with glide once it has full features of preview and more
        // { from: "spacebar", to: km("open: Preview") },
        // { from: "spacebar", to: openApp("~/code/org/linsa/linsa/build/app/node_modules/electron/dist/Electron.app") },
        { from: "spacebar", to: openApp("Linear") },
        // { from: "spacebar", to: openApp("Glide") },
        // { from: "spacebar", to: zed("~/config/i/kar/config.ts") },
        // { from: "spacebar", to: km("zed: ~/.config/lin/config.ts") },
        // todo: paste optimal prompt with context for current sesh
        // { from: "spacebar", to: zed("~/docs") },
        // { from: "spacebar", to: zed("~/code/rise") },
        // {
        //   from: "spacebar",
        //   to: {
        //     key: "c",
        //     modifiers: ["left_command", "left_option", "left_shift"],
        //   },
        // },
      ],
    },

    // r-mode: apps
    {
      description: "rkey (apps)",
      layer: "r-mode",
      mappings: [
        { from: "tab", to: openApp("Transmission") },
        { from: "q", to: openApp("Craft") },
        { from: "w", to: openApp("IINA") },
        { from: "e", to: openApp("Music") },
        { from: "i", to: openApp("Voice Memos") },
        { from: "o", to: openApp("OBS") },
        { from: "p", to: openApp("PDF Expert") },
        { from: "escape", to: openApp("Darkroom") },
        { from: "a", to: openApp("Alfred Preferences") },
        { from: "g", to: openApp("Pages") },
        { from: "j", to: openApp("Preview") },
        { from: "k", to: openApp("Photos") },
        { from: "l", to: openApp("LM Studio") },
        { from: "semicolon", to: openApp("Final Cut Pro") },
        { from: "n", to: openApp("Blender") },
        { from: "m", to: openApp("Lightroom") },
        { from: "period", to: openApp("DaVinci Resolve") },
        { from: "slash", to: openApp("Developer") },
        { from: "spacebar", to: openApp("System Settings") },
      ],
      // { from: "r", to: km("open: System Settings: Network") },
      // { from: "b", to: km("Edit keyboard shortcuts") },
    },

    // t-mode:
    {
      description: "tkey ()",
      layer: "t-mode",
      mappings: [
        { from: "w", to: zed("~/repos/overengineeringstudio/effect-utils") },
        { from: "a", to: shell("seq agent \"$(pbpaste)\"") },
        { from: "s", to: shell("seq screenshot /tmp/seq_screenshot.png && open /tmp/seq_screenshot.png") },
      ],
      // { from: "w", to: km("arc: wikipedia") },
      // { from: "u", to: km("arc: upstash") },
      // { from: "i", to: km("arc: tiktok.com") },
      // { from: "p", to: km("arc: glass.photo") },
      // { from: "a", to: km("arc: amazon") },
      // { from: "s", to: km("arc: etsy") },
      // { from: "h", to: km("arc: news.ycombinator.com") },
      // { from: "j", to: km("arc: threads.com") },
      // { from: "k", to: km("arc: farcaster") },
      // { from: "l", to: km("arc: bluesky") },
      // { from: "semicolon", to: km("arc: twitch") },
      // { from: "quote", to: km("arc: strava") },
      // { from: "b", to: km("arc: lobsters") },
      // { from: "n", to: km("arc: pinterest.com") },
      // { from: "m", to: km("arc: cosmos.co") },
      // { from: "period", to: km("arc: substack.com") },
      // { from: "slash", to: km("arc: alltrails") },
      // { from: "spacebar", to: km("arc: linkedin.com") },
    },

    // u-mode: sites
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

    // y-mode: gh workspaces
    {
      description: "ykey (gh workspaces)",
      layer: "y-mode",
      mappings: [
        { from: "w", to: cursor("workos-gh") },
        { from: "i", to: cursor("builder-gh") },
        { from: "u", to: cursor("mycloudkit-gh") },
        { from: "o", to: cursor("leptos-gh") },
        { from: "p", to: cursor("spark-gh") },
        { from: "h", to: cursor("authkit-gh") },
        { from: "f", to: cursor("ffmpeg-gh") },
        { from: "k", to: cursor("kanidm-gh") },
        { from: "l", to: cursor("litellm-gh") },
        { from: "semicolon", to: cursor("markdoc-gh") },
        { from: "b", to: cursor("obs-studio-gh") },
        { from: "n", to: cursor("ferron-gh") },
        { from: "m", to: cursor("axum-gh") },
        { from: "period", to: cursor("solidis-gh") },
      ],
    },

    // i-mode: symbols
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
        { from: "h", to: seqSocket("paste: €") },
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

    // o-mode: things
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
      // { from: "d", to: km("arc: yandex.cloud") },
      // { from: "s", to: km("arc: jazz inspector") },
      // { from: "z", to: km("arc: deepseek") },
    },

    // p-mode: zed paths
    {
      description: "pkey (zed)",
      layer: "p-mode",
      mappings: [
        { from: "a", to: zed("~/repos/ziglang/zig") },
        // { from: "a", to: zed("~/repos/ziglang/zig") },
      ],
    },

    // open-bracket-mode: gh workspaces
    {
      description: "openBracketKey (gh workspaces)",
      layer: "open-bracket-mode",
      mappings: [
        { from: "w", to: cursor("tldraw-gh") },
        { from: "e", to: cursor("electric-gh") },
        { from: "r", to: cursor("rive-gh") },
        { from: "t", to: cursor("stripe-gh") },
        { from: "u", to: cursor("kunkun-gh") },
        { from: "i", to: cursor("vite-gh") },
        { from: "o", to: cursor("solid-gh") },
        { from: "s", to: cursor("liveblocks-gh") },
        { from: "f", to: cursor("codemirror-gh") },
        { from: "g", to: cursor("pglite-gh") },
        { from: "j", to: cursor("laminar-gh") },
        { from: "k", to: cursor("kunkun-gh") },
        { from: "z", to: cursor("zero-gh") },
        { from: "x", to: cursor("axiom-gh") },
        { from: "v", to: cursor("devenv-gh") },
        { from: "b", to: cursor("tinybase-gh") },
        { from: "n", to: cursor("instantdb-gh") },
        { from: "m", to: cursor("automerge-gh") },
        { from: "spacebar", to: cursor("lightning-ai-gh") },
      ],
    },

    // close-bracket-mode: gh workspaces
    {
      description: "closeBracketKey (gh workspaces)",
      layer: "close-bracket-mode",
      mappings: [
        { from: "w", to: cursor("wrpc-gh") },
        { from: "e", to: cursor("muscle-mem-gh") },
        { from: "r", to: cursor("stack-error-rs-gh") },
        { from: "a", to: cursor("nats-gh") },
        { from: "s", to: cursor("timescale-gh") },
        { from: "d", to: cursor("wit-deps-gh") },
        { from: "f", to: cursor("kafka-gh") },
        { from: "spacebar", to: cursor("river-gh") },
      ],
    },

    // a-mode: ctrl
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

    // d-mode: mouse/media
    {
      description: "dkey (mouse)",
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
        { from: "a", to: seqSocket("Move selection to LM Studio") },
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
        { from: "spacebar", to: seqSocket("Selection -> Claude") },
      ],
    },

    // f-mode: essential
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
        { from: "s", to: openApp("Codex") },
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
        { from: "g", to: openApp("Discord (in Arc)") }, // todo: move prob
        { from: "h", to: seqSocket("telegram: nikivdev (chat)") },
        { from: "j", to: openApp("~/code/org/linsa/linsa/build/app/node_modules/electron/dist/Electron.app") },
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
        { from: "l", to: openApp("Claude") },
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
          to: seq("X Feed (in Arc)", [
            openApp("Arc"),
            keystroke("ctrl+1"),
            keystroke("cmd+6"),
          ], { eagerKeystrokes: true, waitFrontmostMs: 0, appSettleMs: 0 }),
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
        { from: "spacebar", to: openApp("Eagle") },
      ],
    },

    // g-mode: actions/window management
    {
      description: "gkey (actions)",
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

    // escape-mode: sites
    {
      description: "capskey",
      layer: "escape-mode",
      mappings: [
        { from: "q", to: seqSocket("arc: console.groq.com") },
        { from: "w", to: seqSocket("arc: axiom.co") },
        { from: "e", to: seqSocket("arc: sentry.com") }, // do: move
        { from: "r", to: seqSocket("arc: dodopayments.com") },
        { from: "t", to: seqSocket("arc: stripe.com") },
        { from: "i", to: seqSocket("arc: lovable.dev") },
        { from: "o", to: seqSocket("arc: openrouter.ai") },
        { from: "s", to: seqSocket("arc: aws.amazon.com") },
        { from: "d", to: seqSocket("arc: daytona.com") },
        { from: "f", to: seqSocket("arc: maps.google.com") },
        { from: "h", to: seqSocket("arc: clickhouse") },
        { from: "j", to: seqSocket("arc: primeintellect.ai") },
        { from: "k", to: seqSocket("arc: modal.com") },
        { from: "l", to: seqSocket("arc: huggingface.com") },
        { from: "semicolon", to: seqSocket("arc: leap.new") },
        { from: "c", to: seqSocket("arc: cloud.cerebras.ai") },
        { from: "v", to: seqSocket("arc: app.planetscale.com") },
        { from: "n", to: seqSocket("arc: fal.ai") },
        { from: "m", to: seqSocket("arc: hetzner.com") },
        { from: "period", to: seqSocket("arc: expo") },
        { from: "slash", to: seqSocket("arc: resend.com") },
        { from: "spacebar", to: seqSocket("arc: console.cloud.google.com") },
      ],
      // { from: "t", to: km("arc: tinker-console.thinkingmachines.ai") },
    },

    // tilde-mode: pastes and sites
    {
      description: "tilkey ()",
      layer: "tilde-mode",
      mappings: [
        { from: "q", to: seqSocket("paste: personal nikita@ email") },
        { from: "w", to: seqSocket("paste: personal nikita.vo@ email") },
        { from: "e", to: seqSocket("enter: explain") },
        { from: "i", to: seqSocket("paste: Cal.com (15 min)") },
        {
          from: "o",
          to: {
            key: "0",
            modifiers: ["left_control", "left_shift", "left_command"],
          },
        },
        { from: "s", to: seqSocket("enter: what to run next?") },
        { from: "d", to: seqSocket("paste: what flow.toml task to run ") },
        { from: "f", to: seqSocket("paste: create flow.toml task ") },
        { from: "h", to: km("New KM global macro") },
        { from: "j", to: km("Test") },
        { from: "k", to: km("Go to test macro") },
        { from: "l", to: alfred("run", "iansinnott.keyboardmaestro") },
        { from: "semicolon", to: raycast("loris/safari/search-history") },
        { from: "c", to: seqSocket("arc: dashboard.electric-sql.cloud") },
        { from: "v", to: seqSocket("paste: need hive agent ") }, // todo: better
        {
          from: "b",
          to: seqSocket("paste: todo: better"),
        },
        {
          from: "n",
          to: seqSocket("paste: todo: "),
        },
        {
          from: "m",
          to: km(
            "paste: create flow.toml task for this and tell me what to run",
          ),
        },
        { from: "b", to: seqSocket("arc: reddit.com (upvotes)") },
        { from: "comma", to: seqSocket("enter: write docs/how-it-works.md") },
        { from: "period", to: seqSocket("arc: x.com (bookmarks)") },
        { from: "slash", to: seqSocket("arc: x.com (likes)") },
        { from: "left_command", to: seqSocket("paste: create cmd in flow where ") },
      ],
    },

    // z-mode: communication
    {
      description: "zkey ()",
      layer: "z-mode",
      mappings: [
        { from: "w", to: km("Create new contact") },
        { from: "e", to: km("New Spark email") },
        { from: "f", to: openApp("Spark") },
        { from: "j", to: seqSocket("arc: gmail.com") },
        { from: "k", to: openApp("Simulator") },
        { from: "l", to: seqSocket("arc: localhost:linsa") },
        {
          from: "semicolon",
          to: raycast("raycast/emoji-symbols/search-emoji-symbols"),
        },
        { from: "v", to: seqSocket("arc: drive.google.com") },
        // { from: "n", to: km("New X dm") }, // todo: make fast via arc site (for now)
        { from: "m", to: openApp("Zoom") },
        { from: "spacebar", to: seqSocket("arc: v0.app") },
      ],
      // { from: "spacebar", to: km("use ai") },
      // { from: "period", to: km("arc: localhost:gitedit") },
      // { from: "slash", to: km("arc: localhost:as") },
      // { from: "n", to: km("arc: localhost:sb") },
      // { from: "m", to: km("arc: localhost:la") },
      // { from: "c", to: km("open: Chattti") },
      // { from: "quote", to: km("arc: localhost:genx") },
      // { from: "j", to: km("arc: localhost:gen") },
      // { from: "k", to: km("arc: localhost:nikiv") },
      // { from: "semicolon", to: km("arc: localhost:1f") },
    },

    // x-mode: zed workspaces
    {
      description: "xkey ()",
      layer: "x-mode",
      mappings: [
        { from: "i", to: zed("~/repos/ronin-co/hive") },
        { from: "o", to: zed("~/repos/tailwindlabs/tailwindcss") },
        { from: "v", to: zed("~/repos/astral-sh/uv") },
        { from: "n", to: zed("~/repos/glushchenko/fsnotes") },
        { from: "m", to: zed("~/repos/ml-explore/mlx-lm") },
        { from: "spacebar", to: zed("~/repos/mui/base-ui") },
      ],
      // { from: "i", to: zed("") }, // todo: panda css
      // { from: "slash", to: zed("~/code/x/nikiv-rise") },
      // { from: "j", to: zed("~/code/org/1f/sdk/packages/rise") },
      // { from: "semicolon", to: zed("~/code/org/linsa/base") },
      // { from: "l", to: km("zed: LMCache") },
      // { from: "k", to: km("zed: karabiner") },
    },

    {
      description: "ckey ()",
      layer: "c-mode",
      mappings: [
        { from: "w", to: zed("~/repos/pg83/std") }, // do: cpp
        { from: "e", to: zed("~/code/lang/swift") },
        { from: "i", to: zed("~/code/lang/zig") },
        { from: "o", to: zed("~/code/lang/mojo") },
        { from: "a", to: zed("~/repos/overengineeringstudio/effect-utils") },
        { from: "s", to: zed("~/repos/Effect-TS/effect") },
        { from: "d", to: zed("~/repos/TanStack/ai") },
        { from: "h", to: zed("~/repos/denoland/std") },
        { from: "j", to: zed("~/code/lang/ts") },
        { from: "k", to: zed("~/code/lang/mbt") },
        { from: "l", to: zed("~/code/lang/rust") },
        { from: "semicolon", to: zed("~/code/lang/go") },
        { from: "z", to: zed("~/repos/0xPlaygrounds/rig") },
        { from: "n", to: zed("~/repos/oven-sh/bun") },
        { from: "m", to: zed("~/repos/denoland/deno") },
        { from: "period", to: zed("~/repos/ml-explore/mlx") },
        { from: "slash", to: zed("~/repos/pytorch/pytorch") },
        { from: "spacebar", to: zed("~/code/lang/py") },
      ],
      // { from: "b", to: zed("~/repos/obsproject/obs-studio") },
      // { from: "slash", to: zed("~/code/lang/elixir") },
      // { from: "slash", to: zed("~/code/lang/cpp") },
      // todo: replace after once more stable and once we copy obs well
      // { from: "period", to: zed("~/code/lang/cpp") },
      // { from: "slash", to: zed("~/repos/obsproject/obs-studio") },
      // { from: "w", to: km("warp: swift") },
      // { from: "e", to: km("warp: ts") },
      // { from: "i", to: km("warp: riplay") },
      // { from: "o", to: km("warp: go") },
      // { from: "escape", to: km("warp: train") }, // todo: moved to v+m in zed
      // { from: "a", to: km("warp: py") },
      // { from: "s", to: km("warp: config") },
      // { from: "d", to: km("warp: lin-ios") },
      // { from: "k", to: km("warp: new") },
      // { from: "l", to: km("warp: linsa") },
      // { from: "semicolon", to: km("warp: 1f") },
      // { from: "n", to: km("warp: gitedit") },
      // { from: "m", to: km("warp: glide") },
      // { from: "period", to: km("warp: mbt") },
      // { from: "spacebar", to: km("warp: infra") },
      // { from: "spacebar", to: km("warp: x") },
      // { from: "r", to: km("warp: try") },
      // { from: "right_command", to: km("warp: mojo") },
      // { from: "comma", to: km("warp: ai") },
      // { from: "grave_accent_and_tilde", to: km("warp: focus") },
      // { from: "quote", to: km("warp: genx") },
      // { from: "f", to: km("warp: 1f-vscode") },
      // { from: "tab", to: km("warp: cpp") },
      // { from: "left_command", to: zed("~/code/org/1f/sdk") },
      // { from: "h", to: zed("~/code/org/gen/train") },
      // { from: "i", to: zed("~/repos/cloudflare/agents") },
      // { from: "n", to: km("warp: lin") },
      // { from: "semicolon", to: km("warp: flow") },
      // { from: "n", to: zed("~/") },
      // { from: "a", to: zed("~/repos/lisyarus/webgpu-raytracer") },
      // { from: "q", to: km("zed: cpp") },
      // { from: "w", to: km("zed: flow") },
      // { from: "e", to: zed("~/lang/ts") },
      // { from: "r", to: km("zed: try") },
      // { from: "i", to: km("zed: glide") },
      // { from: "o", to: km("zed: infra") },
      // { from: "p", to: km("zed: riplay") },
      // { from: "escape", to: km("zed: la") },
      // { from: "a", to: km("zed: rust") },
      // { from: "s", to: km("zed: train") },
      // { from: "j", to: km("zed: lin") },
      // { from: "k", to: km("zed: nikiv") },
      // { from: "l", to: km("zed: linsa") },
      // { from: "semicolon", to: km("zed: 1f") },
      // { from: "quote", to: km("zed: genx") },
      // { from: "grave_accent_and_tilde", to: km("zed: infra") },
      // { from: "z", to: km("zed: py") },
      // { from: "x", to: km("zed: xx") },
      // { from: "n", to: km("zed: lin-ios") },
      // { from: "m", to: km("zed: new") },
      // { from: "comma", to: km("zed: ai") },
      // { from: "period", to: km("zed: gitedit") },
      // { from: "slash", to: km("zed: config") },
      // { from: "left_command", to: km("zed: swift") },
      // { from: "spacebar", to: km("zed: x") },
      // { from: "right_command", to: km("zed: mojo") },
    },

    // v-mode: search
    {
      description: "vkey ()",
      layer: "v-mode",
      mappings: [
        { from: "q", to: zed("~/repos/raycast/extensions") }, // todo: make it ~/code/raycast with /ext/raycast
        { from: "w", to: zed("~/repos/onejs/on-zero") },
        { from: "e", to: zed("~/code/org/linsa/base") }, // todo: include jazz here
        // { from: "e", to: zed("~/code/org/1f/glide") },
        { from: "i", to: zed("~/code/org/gitedit/gitedit") }, // todo: move more vscode things into gitedit (electron it later)
        { from: "o", to: zed("~/code/rise-app") },
        { from: "a", to: zed("~/code/kar") },
        { from: "s", to: zed("~/code/seq") },
        { from: "d", to: zed("~/code/zerg/ai") },
        { from: "f", to: zed("~/code/infra") },
        { from: "h", to: zed("~/code/unhash") },
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
        { from: "z", to: zed("~/code/org/1f/jazz") },
        { from: "x", to: zed("~/repos/garden-co/jazz") },
        { from: "n", to: zed("~/code/org/1f/1f") },
        { from: "m", to: zed("~/code/org/linsa/lin") },
        { from: "spacebar", to: zed("~/code/flow") },
        { from: "period", to: zed("~/code/myflow") },
        { from: "slash", to: zed("~/code/org/gen/new") },
      ],
      // { from: "quote", to: zed("~/code/friendik") }, // todo: start with search int tool or action
      // { from: "x", to: zed("~/code/x") },
      // { from: "b", to: zed("~/code/org/sb/sb") },
      // { from: "slash", to: zed("~/code/org/la/la") },
      // { from: "a", to: zed("~/code/nikiv") },
      // { from: "b", to: zed("~/code/org/sb/sb") },
      // { from: "r", to: zed("~/code/hatch") },
      // { from: "spacebar", to: zed("~/config") }, // todo: move prob
      // { from: "x", to: zed("~/code/x") },
    },

    // b-mode: editing
    {
      description: "bkey ()",
      layer: "b-mode",
      mappings: [
        { from: "s", to: zed("~/repos/ClickHouse/ClickHouse") },
        { from: "j", to: zed("~/code/jack") },
        { from: "k", to: zed("~/repos/pqrs-org/Karabiner-Elements") },
        { from: "l", to: zed("~/repos/inline-chat/inline") },
        { from: "semicolon", to: zed("~/repos/supabitapp/supacode") },
        { from: "n", to: zed("~/repos/aidenybai/react-grab") },
        { from: "m", to: zed("~/repos/tw93/Mole") },
        { from: "period", to: zed("~/repos/tim-smart/lalph") },
        { from: "spacebar", to: zed("~/code/myflow") },
        // { from: "h", to: km("edit: GitHub Bio") },
        // {
        //   from: "j",
        //   to: linWidget("~/config/i/kar/widgets/sf-time.ts", { ttlMs: 2000 }),
        // },
        // { from: "k", to: km("open: Link") },
        // {
        //   from: "semicolon",
        //   to: km("paste url of currently playing spotify song"),
        // },
        // { from: "period", to: km("paste currently playing spotify song") },
      ],
      // stopped working so we made our own todo: remove
      // {
      //   from: "k",
      //   to: alfred(
      //     "list_windows_of_active_app",
      //     "com.alfredapp.vitor.windowswitcher",
      //   ),
      // },
    },

    {
      description: "nkey (pages)",
      layer: "n-mode",
      mappings: [
        { from: "1", to: { key: "1", modifiers: "left_option" } },
        { from: "2", to: { key: "2", modifiers: "left_option" } },
        { from: "3", to: { key: "3", modifiers: "left_option" } },
        { from: "4", to: { key: "4", modifiers: "left_option" } },
        { from: "5", to: { key: "5", modifiers: "left_option" } },
        { from: "6", to: { key: "6", modifiers: "left_option" } },
        { from: "escape", to: zed("~/code/nikiv/docs/lessons.mdx") },
        // todo: make smart
        { from: "w", to: zed("~/code/nikiv/docs/journal/26-feb.mdx") },
        { from: "e", to: zed("~/code/nikiv/docs/health.mdx") },
        { from: "a", to: zed("~/code/nikiv/docs/learn.mdx") },
        { from: "s", to: zed("~/code/nikiv/docs/habits.mdx") },
        { from: "d", to: zed("~/code/nikiv/docs/dev.mdx") },
        { from: "f", to: zed("~/code/nikiv/docs/focus.mdx") },
        { from: "b", to: zed("~/code/nikiv/docs/buy.mdx") },
        { from: "spacebar", to: zed("~/repos/google-research/kauldron") },
      ],
      // { from: "tab", to: km("reflect: Grow") },
      // { from: "q", to: km("reflect: Events") },
      // { from: "w", to: km("Search Reflect") },
      // { from: "e", to: km("reflect: Learn") },
      // { from: "r", to: km("reflect: Raise") },
      // { from: "t", to: km("reflect: Nutrition") },
      // { from: "o", to: km("reflect: Jobs") },
      // { from: "escape", to: km("reflect: Hire") },
      // { from: "s", to: km("reflect: Health") },
      // { from: "d", to: km("reflect: Read") },
      // { from: "f", to: km("reflect: Focus") },
      // { from: "g", to: km("reflect: Projects") },
      // { from: "k", to: km("reflect: Music") },
      // { from: "l", to: km("reflect: Photos") },
      // { from: "semicolon", to: km("reflect: Family") },
      // { from: "grave_accent_and_tilde", to: km("reflect: Invest") },
      // { from: "z", to: km("reflect: Meet") },
      // { from: "x", to: km("reflect: Pretty") },
      // { from: "c", to: km("reflect: Costs") },
      // { from: "v", to: km("reflect: Love") },
      // { from: "b", to: km("reflect: Buy") },
      // { from: "b", to: km("reflect: Buy") },
      // { from: "left_command", to: km("reflect: Habits") },
      // { from: "period", to: km("reflect: Move") },
      // { from: "a", to: km("reflect: Plan") },
      // { from: "a", to: km("reflect: Think") }, // todo: move this to glide better (bike + figma like thing)
    },

    // m-mode: zed workspaces
    {
      description: "mkey ()",
      layer: "m-mode",
      mappings: [
        { from: "q", to: zed("~/repos/tobi/qmd") },
        { from: "w", to: zed("~/repos/electron/electron") },
        { from: "e", to: zed("~/repos/expo/expo") },
        { from: "r", to: zed("~/repos/TanStack/router") },
        { from: "t", to: zed("~/repos/tailscale/tailscale") },
        { from: "escape", to: zed("~/repos/batrachianai/toad") },
        { from: "a", to: zed("~/repos/badlogic/pi-mono") },
        { from: "s", to: zed("~/repos/jj-vcs/jj") },
        { from: "d", to: zed("~/repos/openai/codex") },
        { from: "f", to: zed("~/repos/openclaw/openclaw") },
        { from: "g", to: zed("~/repos/agno-agi/agno") },
        { from: "k", to: zed("~/repos/rudrankriyam/App-Store-Connect-CLI") },
        { from: "l", to: zed("~/repos/overtake/TelegramSwift") },
        { from: "semicolon", to: zed("~/repos/idursun/jjui") },
        { from: "grave_accent_and_tilde", to: zed("~/repos/banteg/takopi") },
        { from: "z", to: zed("~/repos/HazelChat/hazel") },
        { from: "x", to: zed("~/repos/GitoxideLabs/gitoxide") },
        { from: "c", to: zed("~/repos/wannabespace/conar") },
        { from: "v", to: zed("~/repos/alchemy-run/alchemy") },
        { from: "b", to: zed("~/repos/steipete/bird") },
        { from: "left_command", to: zed("~/repos/sgl-project/sglang") },
        { from: "spacebar", to: zed("~/repos/moonbitlang/moon") },
        // { from: "left_command", to: zed("~/code/zerg") },
        // { from: "slash", to: zed("~/repos/jax-ml/jax") },
        // { from: "spacebar", to: zed("~/repos/antirez/flux2.c") },
      ],
      // { from: "slash", to: zed("~/repos/ekzhang/jax-js") },
      // { from: "r", to: zed("~/code/kar") },
      // { from: "escape", to: zed("~/repos/traefik/traefik") },
      // { from: "spacebar", to: zed("~/code/nikiv/test.md") },
      // { from: "a", to: zed("~/repos/tarantool/tarantool") },
      // { from: "escape", to: zed("~/code/hatch") },
      // { from: "s", to: zed("~/code/org/1f/sdk") },
      // { from: "d", to: zed("~/repos/microsoft/vscode") },
      // { from: "d", to: zed("~/repos/TanStack/router") },
      // { from: "left_command", to: zed("") }, // todo: verifiers
      // { from: "escape", to: zed("~/repos/typesense/typesense") },
    },

    // dot-mode: zed workspaces
    {
      description: "dotkey ()",
      layer: "dot-mode",
      mappings: [
        { from: "w", to: zed("~/repos/reatom/reatom") },
        { from: "e", to: zed("~/repos/Effect-TS/effect-smol") },
        { from: "r", to: zed("~/repos/mikearnaldi/cruster") },
        { from: "t", to: zed("~/repos/daytonaio/daytona") },
        { from: "escape", to: zed("~/repos/zed-industries/extensions") },
        { from: "a", to: zed("~/repos/ghostty-org/ghostty") },
        { from: "s", to: zed("~/repos/fish-shell/fish-shell") },
        { from: "d", to: zed("~/code/org/1f/gen") },
        {
          from: "f",
          to: zed("~/repos/Dimillian/CodexMonitor"),
        },
        { from: "g", to: zed("~/repos/postgres/postgres") },
        { from: "j", to: zed("~/repos/elysiajs/elysia") },
        { from: "k", to: zed("~/repos/ClickHouse/ClickHouse") },
        { from: "grave_accent_and_tilde", to: zed("~/repos/HelixDB/helix-db") },
        { from: "z", to: zed("~/repos/drizzle-team/drizzle-orm") },
        { from: "x", to: zed("~/repos/oxc-project/oxc") },
        { from: "c", to: zed("~/repos/pytorch/pytorch") },
        { from: "v", to: zed("~/repos/flox/flox") },
        { from: "b", to: zed("~/repos/Dicklesworthstone/beads_rust") },
        { from: "n", to: zed("~/repos/encoredev/encore") },
        { from: "m", to: zed("~/repos/ManimCommunity/manim") },
        { from: "left_command", to: zed("~/repos/MoonshotAI/kimi-cli") },
        { from: "spacebar", to: zed("~/repos/zed-industries/zed") },
      ],
      // { from: "a", to: zed("~/repos/Effect-TS/effect") },
      // { from: "t", to: zed("~/repos/midday-ai/midday") },
      // { from: "escape", to: zed("~/repos/fuma-nama/fumadocs") },
      // { from: "g", to: zed("~/repos/nanovms/ops") },
      // { from: "c", to: zed("~/repos/tursodatabase/turso") },
      // { from: "v", to: zed("~/repos/microsoft/vscode") },
      // { from: "b", to: zed("~/repos/livestorejs/livestore") },
      // { from: "left_command", to: zed("~/repos/NixOS/nix") },
      // { from: "t", to: km("zed: tuist") },
      // { from: "grave_accent_and_tilde", to: km("zed: opentinker") },
      // { from: "z", to: km("zed: agno") },
      // { from: "x", to: km("zed: electric") },
      // { from: "x", to: km("zed: jax-js") },
      // { from: "c", to: km("zed: llama.cpp") },
      // { from: "v", to: km("zed: encore") },
      // { from: "b", to: km("zed: obs") },
      // { from: "v", to: zed("~/repos/pqrs-org/TrueWidget") },
      // { from: "g", to: km("zed: gridchess") }, // todo: move to diff good key
      // { from: "c", to: km("zed: sync") },
      // { from: "v", to: km("zed: reatom") },
      // { from: "b", to: km("warp: sb") },
      //{ from: "q", to: km("zed: helix") },
      // { from: "e", to: km("warp: raycast") },
      // { from: "e", to: km("warp: alfred") },
      // { from: "s", to: zed("~/x/scrape") },
      //{ from: "d", to: km("zed: as") },
      // { from: "d", to: km("zed: genx") },
      // { from: "f", to: km("warp: friendik") },
      //{ from: "f", to: km("warp: la") },
    },

    // ts-mode: TypeScript snippets
    {
      description: "tsdot",
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

    // go-mode: Go snippets
    {
      description: "godot",
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

    // py-mode: Python snippets
    {
      description: "pydot",
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

    // swift-mode: Swift snippets
    {
      description: "swiftdot",
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

    // rust-mode: Rust snippets
    // {
    //   description: "rustdot",
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

    // left-control-mode: gh workspaces
    {
      description: "leftControlKey (gh workspaces)",
      layer: "left-control-mode",
      mappings: [
        { from: "e", to: cursor("openai-evals-gh.") },
        { from: "r", to: cursor("swift-subprocess-gh.") },
        { from: "t", to: cursor("tiktoken-gh.") },
        { from: "y", to: cursor("yt-dlp-gh.") },
        { from: "u", to: cursor("just-gh.") },
        { from: "i", to: cursor("sqlite-utils-gh.") },
        { from: "a", to: cursor("optax-gh.") },
        { from: "s", to: cursor("datasette-gh.") },
        { from: "d", to: cursor("claude-coder-gh.") },
        { from: "f", to: cursor("fish-gh.") },
        { from: "h", to: cursor("helix-gh.") },
        { from: "j", to: cursor("jj-gh.") },
        { from: "k", to: cursor("scrapling-gh.") },
        { from: "l", to: cursor("simonw-llm-gh.") },
        { from: "semicolon", to: cursor("roo-code-gh.") },
        { from: "c", to: cursor("claude-code-gh.") },
        { from: "v", to: cursor("llvm-gh.") },
        { from: "b", to: cursor("blender-gh.") },
        { from: "n", to: cursor("tapnet-gh.") },
        { from: "m", to: cursor("mujoco-warp-gh.") },
        { from: "period", to: cursor("crawl4ai-gh.") },
        { from: "spacebar", to: cursor("openai-realtime-agents-gh.") },
      ],
    },

    // left-option-mode: linear
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

    // spacebar-mode: screenshots & apps
    {
      description: "spacekey",
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
        { from: "t", to: seqSocket("web: GitHub (personal)") },
        { from: "i", to: openApp("Reader") },
        // { from: "o", to: openApp("X Feed (in Arc)") },
        {
          from: "o",
          to: seq("X Feed (in Arc)", [
            openApp("Arc"),
            keystroke("ctrl+1"),
            keystroke("cmd+6"),
          ], { eagerKeystrokes: true, waitFrontmostMs: 0, appSettleMs: 0 }),
        },
        { from: "p", to: openApp("X profile (in Arc)") },
        { from: "a", to: openApp("Safari Technology Preview") },
        { from: "s", to: openApp("Arc") },
        {
          from: "f",
          to: { key: "9", modifiers: ["left_command", "left_shift"] },
        },
        { from: "g", to: seqSocket("arc: grokipedia.com") },
        { from: "h", to: openApp("Codex Monitor") },
        { from: "j", to: openApp("Discord") },
        { from: "k", to: openApp("Dia") },
        // { from: "k", to: openApp("Electron") },
        { from: "k", to: openApp("~/code/org/linsa/linsa/build/app/node_modules/electron/dist/Electron.app") },
        { from: "l", to: openApp("Telegram") },
        { from: "semicolon", to: openApp("Slack") },
        {
          from: "grave_accent_and_tilde",
          to: seqSocket("arc: news.ycombinator/new-comments"),
        },
        { from: "z", to: openApp("IG Messages (in Arc)") },
        { from: "c", to: seqSocket("telegram: saved") },
        {
          from: "m",
          to: seq("X Messages (in Arc)", [
            openApp("Arc"),
            keystroke("ctrl+1"),
            keystroke("cmd+8"),
          ], { eagerKeystrokes: true, waitFrontmostMs: 0, appSettleMs: 0 }),
        },
        { from: "comma", to: seqSocket("arc: aistudio.google.com (3)") },
        { from: "period", to: seqSocket("arc: colab.research.google.com") },
        { from: "slash", to: seqSocket("arc: aistudio.google.com (2)") },
      ],
      // { from: "n", to: km("linear: Plan") },
    },

    // slash-mode: zed paths
    {
      description: "slashKey (zed)",
      layer: "slash-mode",
      mappings: [
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
