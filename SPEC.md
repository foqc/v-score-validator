# V-Score Validator

## Project Overview

The V-Score Validator helps users evaluate whether a business or product idea is worth pursuing. It measures an idea across two independent dimensions:

* Technical Feasibility (PoC Score)
* Market Viability (Market Score)

Specialized agents analyze the idea and propose criterion ratings with reasoning. Deterministic scripts compute both scores and apply the V-Score recommendation matrix. A lightweight browser UI displays the final structured result.

This project is intentionally small in scope. The objective is a correct, maintainable agent/script split that demonstrates structured orchestration rather than technical complexity.

---

# Problem

Evaluating new ideas is often subjective and inconsistent.

Different people may reach different conclusions because there is no standardized evaluation process.

The system provides a repeatable workflow: expert agents reason about evidence; scripts apply fixed weighted formulas and an official decision matrix.

---

# Goal

Build an agent-skill evaluation system that:

* Collects the idea title and description from the user (no manual criterion scores).
* Uses specialized agents to analyze technical and market aspects and **infer** ratings with reasoning.
* Calculates the PoC Score and Market Score with deterministic scripts.
* Applies the recommendation matrix with a deterministic script.
* Displays both scores and a final recommendation with a brief explanation in the existing UI.
* Optionally retrieves and stores knowledge via a keyword-indexed memory bank (supplemental only).

---

# Scope

The system SHALL:

* Run evaluation through Agent Skills (`.agents/skills/`) and the evaluate-idea entry command.
* Ask the user for an idea name or description (minimum 20 characters of description).
* Rate the idea on the eight official criteria (four PoC, four Market), each as an integer from 1 to 10.
* Calculate both weighted scores with scripts (never with the LLM).
* Apply the recommendation matrix with a script.
* Write a structured result that the browser UI can display.
* Support a memory bank searchable by keywords so agents load only relevant knowledge.
* Support self-learning by capturing validated insights from past evaluations (not model training).

---

# Out of Scope

The system will NOT:

* Perform real market research via external APIs.
* Determine viability with hardcoded keyword or heuristic rating logic in the browser.
* Let the LLM invent or alter scoring formulas or the recommendation matrix.
* Require authentication or a database.
* Use frontend frameworks, package managers, or build tools.
* Fine-tune or train models.

---

# Functional Requirements

### FR-1

The user can enter an idea title.

### FR-2

The user provides an idea description of at least 20 characters.

### FR-3

Specialized agents analyze the idea and propose integer ratings from 1 to 10 for each of the eight official criteria, with short reasoning. Ratings must be validated by script before scoring.

### FR-4

A script calculates:

```
PoC Score =
(Novelty × 3) + (Scope × 4) + (Resources × 2) + (Outcome × 1)
```

Maximum score: 100.

### FR-5

A script calculates:

```
Market Score =
(Pain × 4) + (Pay × 3) + (Size × 2) + (Differentiation × 1)
```

Maximum score: 100.

### FR-6

The recommendation matrix shall be:

| PoC | Market | Verdict |
|-----|--------|---------|
| ≥ 65 | ≥ 65 | Go / Full Speed Ahead |
| < 65 | ≥ 65 | De-risk First |
| ≥ 65 | < 65 | Validate Demand |
| < 65 | < 65 | Reframe or Shelve |

The threshold is inclusive: a score of exactly 65 is High.

### FR-7

The system shall explain why the recommendation was selected (fixed explanation templates per verdict).

### FR-8

The user can run multiple evaluations across sessions. Each run produces a structured artifact under `evaluations/`.

### FR-9

After a successful evaluation, the orchestrator may capture a summary into the memory bank with keywords for later retrieval. Captured knowledge never alters the official recommendation.

### FR-10

Agents retrieve prior knowledge via `scripts/memory-search.mjs` using keywords. Agents must not load the entire memory bank into context.

---

# Evaluation roles (skills + optional subagents)

Specialized **role logic** lives in Agent Skills under `.agents/skills/`. Thin **subagent wrappers** under `.agents/agents/` spawn Technical and Market experts with isolated context when the host supports custom subagents; otherwise the orchestrator applies the skills inline. Canonical config stays under `.agents/`; host folders such as `.claude/` may expose it via relative directory symlinks only (no file copies).

| Role | Skill | Subagent wrapper |
|------|-------|------------------|
| Technical Expert | `technical-evaluation` — PoC criteria | `technical-expert` |
| Market Expert | `market-evaluation` — Market criteria | `market-expert` |
| Orchestrator | `v-score-orchestrator` — coordinates flow, audits, runs scripts | (skill + `/evaluate-idea` only) |
| Scoring / matrix | `scoring-formulas`, `verdict-matrix`, `validate-rating` | (skills only) |

---

# Non-Functional Requirements

* Deterministic calculations must be reproducible given the same validated ratings.
* Scripts use Node.js standard library only (no package manager).
* Browser UI uses only HTML5, CSS3, and vanilla ES6.
* Learned insights are supplemental and never replace the matrix verdict.
* Keep the codebase small and understandable.

---

# Assumptions

* Agent ratings are reasoned estimates from the provided text, not real market research or technical due diligence.
* Ratings are integers between 1 and 10 inclusive.
* Calculations use the official weighting rules defined by the challenge.

---

# Definition of Done

The project is complete when:

* The user can complete an evaluation via `/evaluate-idea` or by asking the agent to follow `v-score-orchestrator`.
* Technical and Market experts produce audited ratings with reasoning.
* Scripts compute PoC, Market, and the recommendation correctly.
* The UI displays the latest evaluation result.
* Invalid ratings are rejected by validation scripts.
* Memory search returns keyword-matched documents only.
* Every verification scenario in `VERIFY.md` passes.

---

# Verification Strategy

See `VERIFY.md`. Scripts must pass all-10s, all-1s, and the 65/64 boundary fixture. The orchestrated evaluation path must produce a UI-readable `evaluations/latest.json`.
