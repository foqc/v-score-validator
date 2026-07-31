# AGENTS.md

Operating rules for agents working in this repo. Product requirements: `SPEC.md`. Design: `ARCHITECTURE.md`.

## Invariants (do not break)

* Vanilla presentation stack only: HTML5, CSS3, ES6. No frameworks, backend, database, build tools, package manager, or external dependencies for the UI or scripts.
* Do not modify the official scoring formulas or the recommendation matrix (threshold 65, inclusive). See `SPEC.md`.
* Viability ratings come from specialized **skills** with reasoning — never from hardcoded keyword/heuristic raters.
* All weighted scores and the matrix verdict are produced by Node scripts under `scripts/`. The LLM must not compute or invent those results.
* Ratings are reasoned estimates, not real market research or technical due diligence. Present them as such.
* Learned insights and memory-bank documents are supplemental only; they must never replace or alter the official recommendation.
* Persist evaluation artifacts under `evaluations/` and knowledge under `memory-bank/`. Do not use browser `localStorage` for scoring or learning.

## Structure

* `.agents/skills/` — canonical skill logic (Cursor, Codex, Claude)
* `.agents/commands/evaluate-idea.md` — entry command (Claude: `.claude/commands/` symlink)
* `.codex/agents/` — canonical thin subagent wrappers (`technical-expert`, `market-expert`, `v-score-orchestrator`)
* `.cursor/agents/` / `.claude/agents/` — symlinks → `.codex/agents/`
* `.claude/skills/` / `.claude/commands/` — symlinks → `.agents/`
* `scripts/` — deterministic validation, scoring, recommendation, memory, verify
* `evaluations/` — run artifacts and `latest.json` for the UI
* `memory-bank/` — keyword-indexed knowledge documents
* `src/` — UI viewer only (`viewer.js` loads result JSON)

Role **logic** lives in skills. Subagent files are thin spawn wrappers for isolated Technical/Market runs when the host supports them.

## Skills map

| Skill | Role |
|-------|------|
| `v-score-orchestrator` | Full evaluation workflow |
| `technical-evaluation` | Infer PoC ratings |
| `market-evaluation` | Infer Market ratings |
| `scoring-formulas` | Official weights (use scripts) |
| `verdict-matrix` | Official recommendation matrix (use scripts) |
| `validate-rating` | Validate 1–10 integers |

## Subagents map

| Agent | Wraps skill | Purpose |
|-------|-------------|---------|
| `technical-expert` | `technical-evaluation` | Isolated PoC ratings |
| `market-expert` | `market-evaluation` | Isolated Market ratings |
| `v-score-orchestrator` | `v-score-orchestrator` | Coordinate + spawn experts |

## Evaluation workflow (summary)

1. Load `v-score-orchestrator`; collect title + description only; optional `memory-search.mjs`.
2. Spawn `technical-expert` (or apply `technical-evaluation` inline) — infer PoC criteria.
3. Spawn `market-expert` in parallel (or apply `market-evaluation` inline) — infer Market criteria.
4. Audit, write `ratings.json`, run `run-evaluation.mjs` and `write-ui-result.mjs`.
5. User views `src/index.html` with the latest result.
6. Optional: `memory-capture.mjs` for self-learning summaries.

## Verifying

* `node scripts/verify.mjs`
* Manual checklist in `VERIFY.md`
* Quick syntax check: `node --check scripts/<file>.mjs`
