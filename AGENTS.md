# AGENTS.md

Operating rules for agents working in this repo. Product requirements: `SPEC.md`. Design: `ARCHITECTURE.md`.

## Invariants (do not break)

* Vanilla presentation stack only: HTML5, CSS3, ES6. No frameworks, backend, database, build tools, package manager, or external dependencies for the UI or scripts.
* Do not modify the official scoring formulas or the recommendation matrix (threshold 65, inclusive). See `SPEC.md`.
* Viability ratings come from specialized agents with reasoning — never from hardcoded keyword/heuristic raters.
* All weighted scores and the matrix verdict are produced by Node scripts under `scripts/`. The LLM must not compute or invent those results.
* Agent ratings are reasoned estimates, not real market research or technical due diligence. Present them as such.
* Learned insights and memory-bank documents are supplemental only; they must never replace or alter the official recommendation.
* Persist evaluation artifacts under `evaluations/` and knowledge under `memory-bank/`. Do not use browser `localStorage` for scoring or learning.

## Structure

* `.cursor/agents/` — technical-expert, market-expert, v-score-orchestrator
* `.cursor/skills/` — evaluation, scoring, validation, and orchestrator skills
* `.cursor/commands/evaluate-idea.md` — entry command for the full workflow
* `scripts/` — deterministic validation, scoring, recommendation, memory, verify
* `evaluations/` — run artifacts and `latest.json` for the UI
* `memory-bank/` — keyword-indexed knowledge documents
* `src/` — UI viewer only (`viewer.js` loads result JSON)

## Conventions

* `const` by default; pure functions for scoring (no DOM access inside them).
* Renderers never calculate; calculators never touch the DOM.
* Before scoring, always run validation scripts on ratings.
* Prefer `node scripts/<name>.mjs` over mental arithmetic.

## Evaluation workflow (summary)

1. Orchestrator collects title + description only; optional `memory-search.mjs`. Do not ask the user for scores.
2. Technical Expert **infers** PoC criteria from the idea (optional private use of `poc-resources.mjs` / `score-item.mjs` for Resources).
3. Market Expert **infers** Market criteria from the idea.
4. Orchestrator audits, writes `ratings.json`, runs `run-evaluation.mjs` and `write-ui-result.mjs`.
5. User views `src/index.html` with the latest result.
6. Optional: `memory-capture.mjs` for self-learning summaries.

## Verifying

* `node scripts/verify.mjs`
* Manual checklist in `VERIFY.md`
* Quick syntax check: `node --check scripts/<file>.mjs`
