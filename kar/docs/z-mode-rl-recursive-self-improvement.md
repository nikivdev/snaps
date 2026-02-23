# z-mode RL Data Plan for Recursive Self-Improvement

## Goal
Make `z-mode` learn from real usage, not guesses:
- predict the best bindings for current context
- measure whether those bindings helped or hurt
- retrain policy quickly from fresh telemetry

This document defines the data contract, join strategy, and fast feedback loop.

## Current System Map (Code References)

### z-mode policy engine (candidate generation + scoring + AI moderation)
- `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:1`
- Zero-latency cache path + async refresh: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:337`
- Candidate/Binding schema: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:26`
- Candidate generation: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:395`
- Flow task filtering and signal gating: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:348`
- Scoring logic: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:566`
- Deterministic assignment fallback: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:666`
- LLM config + model fallback: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:821`
- Two-stage moderation (Haiku -> Sonnet): `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:1131`
- Preview output (`z-mode-preview.json`) and Lin widget emission: `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts:1309`

### Context engine (state features)
- `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:1`
- Fast context mode for low-latency execution: `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:457`
- Context shape: `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:32`
- Flow task discovery roots: `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:180`
- Lin intent ingestion from inbox JSONL: `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:244`
- z-key usage from `kar.intent` in `seq_mem`: `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:296`
- Flow task usage from shell histories: `/Users/nikiv/config/i/kar/scripts/z-mode-context.ts:356`

### Config application + layer source of truth
- Layer read/write/compile: `/Users/nikiv/config/i/kar/scripts/z-mode-lib.ts:21`
- Live layer bindings: `/Users/nikiv/config/i/kar/config.ts:1493`

### Lin widget pipeline (preview surface)
- Runner: `/Users/nikiv/config/i/kar/scripts/lin-widget-run.sh:1`
- Inbox writer: `/Users/nikiv/config/i/kar/scripts/lin-widget-send.mjs:6`
- Lin inbox watcher: `/Users/nikiv/code/org/linsa/lin/mac/Lin/Sources/IntentInboxService.swift:73`

### Existing RL capture rails in seq
- Kar signal contract doc: `/Users/nikiv/code/seq/docs/kar-rl-signal-contract.md:1`
- Kar event emitter implementation: `/Users/nikiv/code/seq/tools/kar_signal_capture.py:1`
- Event schemas emitted (`kar.intent/outcome/override`): `/Users/nikiv/code/seq/tools/kar_signal_capture.py:141`
- Capture stack (continuous): `/Users/nikiv/code/seq/docs/seq-harbor-capture.md:1`

### Why you are seeing "Next to Type"
- Predictor writes widget title `Next to Type`: `/Users/nikiv/code/seq/tools/next_type_predictor_daemon.py:216`
- Flow task to stop it: `/Users/nikiv/code/seq/flow.toml:316`

## Data We Need (Minimum Set)

### 1) Decision-time policy snapshot (must-have)
At every `z-mode-update` preview/apply run, emit one event:
- `zmode.policy.decision.v1`

Required fields:
- `decision_id` (stable hash)
- `ts_ms`
- `mode` (`baseline` | `haiku` | `sonnet+haiku`)
- `context` (front app, active project, hour/day, running app set)
- `candidate_pool` (candidate_id, action, score, evidence)
- `selected_bindings` (key, candidate_id, confidence, rationale)
- `llm_meta` (provider, model ids, moderation errors)
- `preview_path`

Why: This is the state-action record for policy learning.

### 2) Apply exposure (must-have)
When `--apply` succeeds, emit:
- `zmode.policy.apply.v1`

Required fields:
- `decision_id`
- `apply_id`
- `compile_ok`
- `binding_count`
- `diff_summary` (`changed/new/removed`)
- `mapping_epoch_id` (new id for this live keymap version)

Why: RL needs to know what policy actually went live.

### 3) Key-level outcomes linked to policy (must-have)
Reuse existing seq events:
- `kar.intent.v1`
- `kar.outcome.v1`
- `kar.override.v1`

Already produced by:
- `/Users/nikiv/code/seq/tools/kar_signal_capture.py:141`

Needed join extension:
- include `mapping_epoch_id` and `candidate_id` in each emitted kar event subject (or join from sidecar map by timestamp window + key).

Why: This creates per-binding reward labels.

### 4) Manual correction signals (must-have)
Emit explicit correction events when user overrides layer decisions:
- `zmode.policy.override.v1`

Fields:
- `decision_id`
- `candidate_id` overridden
- `replacement_candidate_id` (or raw action)
- `time_since_apply_ms`
- `reason` (optional)

Why: This is high-value preference data (human correction).

### 5) Long-horizon utility (should-have)
Link policy decisions to downstream outcomes:
- shell command success/failure latency (`seqd.run`, `cli.run.local`)
- app-toggle success latency (`app.activate` linkage already in kar capture)

Why: Some bindings are good only if they reduce time-to-resolution later.

## Current Gaps Blocking Fast RL

1. `z-mode-update` now emits `zmode.policy.decision.v1` and `zmode.policy.apply.v1` to `seq_mem`, but `kar.intent/outcome/override` rows do not yet carry `mapping_epoch_id` for direct joins.
2. `zmode.policy.override.v1` is not implemented yet, so explicit user correction signal is missing.
3. Preview data is persisted to file (`z-mode-preview.json`) and logged in decision events, but there is no dedicated z-mode exporter/auditor generating train/val/test datasets.
4. Noise source (`Next to Type`) still shares the Lin inbox; filtering exists, but this stream should be disabled during z-mode experiments to avoid UX confusion.

## Recommended Event Schemas

### `zmode.policy.decision.v1`
```json
{
  "schema_version": "zmode_policy_decision_v1",
  "decision_id": "sha256(...)",
  "mode": "sonnet+haiku",
  "context": {"frontmost_app": "Zed", "active_project": "goose"},
  "candidate_pool": [{"id": "slash-review", "score": 79}],
  "selected_bindings": [{"key": "r", "candidate_id": "slash-review", "confidence": 0.95}],
  "moderation": {"provider": "anthropic", "haiku_model": "...", "sonnet_model": "..."}
}
```

### `zmode.policy.apply.v1`
```json
{
  "schema_version": "zmode_policy_apply_v1",
  "decision_id": "...",
  "mapping_epoch_id": "...",
  "compile_ok": true,
  "changed": 7,
  "new": 2,
  "removed": 1
}
```

### `zmode.policy.override.v1`
```json
{
  "schema_version": "zmode_policy_override_v1",
  "decision_id": "...",
  "mapping_epoch_id": "...",
  "key": "g",
  "old_candidate_id": "flow:flow:deploy",
  "new_action": "paste(\"/commit\")",
  "ms_since_apply": 42000
}
```

## How to Feed RL Pipeline Fast

## Zero-Latency Runtime Path (Now Live)
- Trigger with `--zero-latency` (or `Z_MODE_ZERO_LATENCY=1`).
- Behavior:
  - load context fast-mode snapshot
  - hit local policy cache (context-keyed) and apply immediately
  - if cache miss, use deterministic baseline immediately
  - schedule detached `--refresh-cache --force-ai` run for Sonnet/Haiku refresh without blocking
- Cache file:
  - `~/Library/Application Support/Lin/z-mode-policy-cache.json`
- Refresh throttle stamp:
  - `~/Library/Application Support/Lin/.zmode-refresh.stamp`

## Step 1 (today)
- Done: `zmode.policy.decision.v1` + `zmode.policy.apply.v1` emission in `/Users/nikiv/config/i/kar/scripts/z-mode-update.ts`.
- Done: rows append into seq sink (`SEQ_CH_MEM_PATH` or default `~/repos/ClickHouse/ClickHouse/user_files/seq_mem.jsonl`).
- Enhancement added: failed apply attempts also emit `zmode.policy.apply.v1` with `compile_ok=false` and error payload for RL negative examples.

## Step 2 (today)
- Add `mapping_epoch_id` sidecar file and attach to notes or signal metadata.
- Ensure every z-key press can be joined to active epoch.

## Step 3 (today)
- Build exporter `zmode_signal_export.py` (pattern after `router_signal_export.py` / kar exporter contract).
- Produce `train/val/test` with dedupe ids.

## Step 4 (daily loop)
1. Collect continuously (`seq-harbor-run`).
2. Export + audit quality gates.
3. Train policy/ranker.
4. Deploy new policy in shadow mode first.
5. Promote if metrics improve.

## Quality Gates Before Training
- `decision_count >= 500`
- `apply_rate >= 0.4`
- `decision->outcome link rate >= 0.8`
- `override_count >= 20`
- `wasted_outcome rate` not exploding week-over-week
- `task/action dominance <= 0.55` (avoid collapse to one action)

## Reward Model (Practical)
Per key action reward:
- `+1.0` for `kar.outcome=success`
- `+0.3` for `partial`
- `-0.7` for `failure`
- `-1.0` for `wasted`
- extra `-0.5` when override occurs quickly (< 60s)
- optional latency bonus: `+min(0.5, baseline_latency - observed_latency)`

Episode-level reward:
- aggregate per action over a bounded window after `mapping_epoch_id` activation.

## Recursive Self-Improvement Loop (Fast)
- Train two components separately:
  1. **Candidate scorer** (state -> candidate ranking)
  2. **Key assigner** (ranked candidates -> ergonomic key layout)
- Use Haiku for frequent low-cost proposals; Sonnet for final moderation on top-k only.
- Keep deterministic fallback always available (already implemented).

Cadence:
- every 2-4 hours: re-export + quick eval on last 7 days
- daily: promote only if gates pass and online metrics improve
- weekly: prune stale candidates and refresh feature set

## Immediate Action List
1. Attach `mapping_epoch_id` (and `candidate_id` where possible) to downstream `kar.intent/outcome/override` joins.
2. Implement `zmode.policy.override.v1` for explicit correction signals.
3. Add z-mode signal exporter + audit script.
4. Disable `Next to Type` when focusing on z-mode UX experiments:
   - `cd ~/code/seq && f next-type-predictor-off`

## Notes
- Current z-mode engine already exposes most needed features internally (candidate ids, scores, evidence, confidence, moderation status).
- Main remaining gap is stable joins from policy snapshots into downstream `kar.*` outcome rails plus explicit override capture/export.
