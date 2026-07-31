# Architecture

## Overview

V-Score Validator separates **AI reasoning** (Agent Skills under `.agents/skills/`) from **deterministic calculation** (Node scripts) and **presentation** (a static browser UI).

Agents propose criterion ratings with reasoning. Scripts validate ratings, compute weighted scores, and apply the recommendation matrix. The UI loads `evaluations/latest.json` and displays results. It never computes viability.

---

# Technology Stack

| Layer | Stack |
|-------|-------|
| Agents / Skills | Skills under `.agents/skills/`; spawn wrappers under `.agents/agents/` |
| Deterministic logic | Node.js ES modules, standard library only |
| UI | HTML5, CSS3, vanilla ES6 |
| Knowledge | Markdown docs + `memory-bank/index.json` |

No package manager, build tools, backend, or external dependencies.

---

# High-Level Architecture

```
User (any agent host)
      │
      ▼
Orchestrator skill / agent
      │
      ├── memory-search.mjs (optional keywords)
      ├── technical-expert subagent (skill: technical-evaluation) → PoC
      └── market-expert subagent (skill: market-evaluation) → Market
            │  (parallel when host supports custom subagents;
            │   else skills applied inline)
      ▼
ratings.json
      │
      ▼
run-evaluation.mjs
      │
      ▼
evaluations/latest.json
      │
      ▼
src/ UI viewer
```

---

# Project Structure

```
/
├── .agents/
│   ├── agents/               # thin subagent wrappers (canonical)
│   ├── commands/
│   └── skills/               # canonical role logic
├── .claude/
│   ├── agents -> ../.agents/agents
│   ├── commands -> ../.agents/commands
│   └── skills -> ../.agents/skills
├── scripts/
│   ├── lib/scoring.mjs
│   └── *.mjs
├── evaluations/
├── memory-bank/
│   ├── index.json
│   ├── evaluations/
│   └── learnings/
├── src/
│   ├── index.html
│   ├── css/styles.css
│   └── js/viewer.js
├── SPEC.md
├── ARCHITECTURE.md
├── AGENTS.md
├── VERIFY.md
└── README.md
```

---

# Separation of Concerns

| Concern | Location | Rule |
|---------|----------|------|
| AI reasoning | `.agents/skills` | Analyze evidence; propose 1–10 ratings; never invent formulas |
| Isolated expert runs | `.agents/agents/` | Thin wrappers; spawn Technical/Market with separate context |
| Deterministic calc | `scripts/*.mjs` | Validate, weight, matrix only |
| Coordination | Orchestrator skill/agent | Sequence, spawn experts, audit, inconsistency resolution |
| Knowledge retrieval | `memory-bank` + `memory-search.mjs` | Keyword search; no full-bank dumps |
| Final recommendation | `run-evaluation.mjs` + verdict-matrix skill | Matrix only; fixed explanations |
| Presentation | `src/` | Render JSON; no scoring |

---

# Official Criteria and Weights

### PoC

| Criterion | Key | Weight |
|-----------|-----|--------|
| Technical Novelty | `novelty` | ×3 |
| Defined Scope | `scope` | ×4 |
| Resource Accessibility | `resources` | ×2 |
| Measurable Outcome | `outcome` | ×1 |

### Market

| Criterion | Key | Weight |
|-----------|-----|--------|
| Pain Severity | `pain` | ×4 |
| Willingness to Pay | `pay` | ×3 |
| Market Size | `size` | ×2 |
| Differentiation | `diff` | ×1 |

```
PoC    = (novelty×3) + (scope×4) + (resources×2) + (outcome×1)
Market = (pain×4) + (pay×3) + (size×2) + (diff×1)
```

High if score ≥ 65 (inclusive).

---

# Component Responsibilities

## Orchestrator

* Validates inputs (title, description length).
* Searches memory bank when useful.
* Prefers spawning `technical-expert` and `market-expert` subagents in parallel; falls back to inline skills.
* Reviews audits; resolves inconsistent ratings.
* Writes `ratings.json` and invokes scoring scripts.
* Writes UI result; optionally captures learnings.

## Technical Expert

* Evaluates PoC criteria with reasoning (skill: `technical-evaluation`).
* Infers ratings from the idea text; may use `poc-resources.mjs` + `score-item.mjs` as a private checklist.
* Writes `evaluations/<id>/technical.md`. Does not compute weighted PoC.

## Market Expert

* Evaluates Market criteria with reasoning (skill: `market-evaluation`).
* Infers ratings from the idea text; does not ask the user for scores.
* Writes `evaluations/<id>/market.md`. Does not compute weighted Market.

## Scripts

Pure CLI entry points around `scripts/lib/scoring.mjs`:

* `validate-rating.mjs` — accept integer 1–10 or reject
* `poc-resources.mjs` — print resource checklist
* `score-item.mjs` — map answers to a validated rating
* `run-evaluation.mjs` — weighted scores + matrix verdict from ratings JSON
* `write-ui-result.mjs` — write `evaluations/latest.json`
* `memory-search.mjs` / `memory-capture.mjs` — knowledge index
* `verify.mjs` — edge-case suite

## UI Viewer

* Loads `evaluations/latest.json` (file input or embedded path note for local open).
* Displays idea metadata, eight ratings, PoC/Market scores, verdict, explanation, optional insights.
* Contains no scoring logic.

---

# Evaluation Artifact Shape

`evaluations/latest.json` (and per-run copies):

```json
{
  "id": "2026-07-30-example",
  "timestamp": "ISO-8601",
  "ideaTitle": "...",
  "ideaDescription": "...",
  "pocCriteria": { "novelty": 7, "scope": 7, "resources": 5, "outcome": 6 },
  "marketCriteria": { "pain": 8, "pay": 6, "size": 5, "diff": 4 },
  "pocScore": 65,
  "marketScore": 64,
  "recommendation": "Validate Demand",
  "explanation": "...",
  "technicalSummary": "...",
  "marketSummary": "...",
  "insights": []
}
```

---

# Design Principles

* Single responsibility per module.
* Calculators never touch the DOM; renderers never calculate.
* Agents never invent weights, thresholds, or verdicts.
* Prefer the standard library and plain files over frameworks.
* Memory and learnings are supplemental only.

---

# Definition of Architecture Success

* UI contains no viability math.
* All formulas and the matrix live only in scripts (plus skill documentation that mirrors them).
* Three agents only: technical, market, orchestrator.
* Memory is retrieved by keyword search, not by loading the whole bank.
