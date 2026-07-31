# V-Score Validator

Evaluate whether a business or product idea is worth pursuing — with specialized Agent Skills for analysis and deterministic scripts for scoring.

Agents reason about technical feasibility and market viability. Node scripts compute the PoC Score, Market Score, and recommendation matrix. A simple browser page displays the latest structured result.

## Features

* **Technical** and **Market** evaluation skills produce criterion ratings with reasoning.
* Optional **subagent wrappers** (`technical-expert`, `market-expert`) isolate those roles when Cursor/Codex/Claude can spawn them.
* **Orchestrator** skill + `/evaluate-idea` coordinate the run, audit outputs, and write the UI result.
* Weighted **PoC** and **Market** scores via scripts (official formulas; threshold 65 inclusive).
* Plain-language **recommendation** from the decision matrix.
* **Memory bank** with keyword search for prior evaluations and learnings (supplemental only).
* Browser **UI viewer** — presentation only; no viability math in the page.

## Getting started

Skills live under `.agents/skills/` (Cursor and Codex). Subagent wrappers live under `.codex/agents/` with symlinks from `.cursor/agents/` and `.claude/agents/`. Claude also uses `.claude/skills/` and `.claude/commands/` as symlinks into `.agents/`.

### 1. Run an evaluation

Use `/evaluate-idea` (where supported) or ask the agent to evaluate an idea and follow `v-score-orchestrator`.

```bash
node scripts/poc-resources.mjs
node scripts/validate-rating.mjs --value 7
node scripts/run-evaluation.mjs --ratings path/to/ratings.json
node scripts/write-ui-result.mjs --result path/to/result.json
```

### 2. View the result

Open `src/index.html` in a browser and load `evaluations/latest.json` (file picker), or open the page after the orchestrator has written that file into place for local serving.

### 3. Verify scoring

```bash
node scripts/verify.mjs
```

## Official formulas

```
PoC    = (Novelty×3) + (Scope×4) + (Resources×2) + (Outcome×1)
Market = (Pain×4) + (Pay×3) + (Size×2) + (Differentiation×1)
```

| PoC | Market | Verdict |
|-----|--------|---------|
| ≥ 65 | ≥ 65 | Go / Full Speed Ahead |
| < 65 | ≥ 65 | De-risk First |
| ≥ 65 | < 65 | Validate Demand |
| < 65 | < 65 | Reframe or Shelve |

> Ratings are reasoned estimates from the idea text — not real market research or technical due diligence.

## Project layout

| Path | Role |
|------|------|
| `.agents/skills/` | Canonical skills (Claude: symlinked under `.claude/skills/`) |
| `.agents/commands/` | `/evaluate-idea` entry (Claude: `.claude/commands/` symlink) |
| `.codex/agents/` | Canonical thin subagent wrappers |
| `.cursor/agents/` / `.claude/agents/` | Symlinks → `.codex/agents/` |
| `scripts/` | Deterministic CLI |
| `evaluations/` | Run artifacts + `latest.json` |
| `memory-bank/` | Keyword-indexed knowledge |
| `src/` | UI viewer |

## Docs

* [SPEC.md](SPEC.md) — requirements
* [ARCHITECTURE.md](ARCHITECTURE.md) — design
* [AGENTS.md](AGENTS.md) — agent operating rules
* [VERIFY.md](VERIFY.md) — verification
