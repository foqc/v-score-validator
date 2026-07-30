# V-Score Validator

## Project Overview

The V-Score Validator is a lightweight browser-based application that helps users evaluate whether a business or product idea is worth pursuing.

The application measures an idea across two independent dimensions:

* Technical Feasibility (PoC Score)
* Market Viability (Market Score)

It calculates both scores and generates a plain-language recommendation using the V-Score decision matrix.

This project is intentionally small in scope. The objective is to build a correct, maintainable implementation that demonstrates structured agent orchestration rather than technical complexity.

---

# Problem

Evaluating new ideas is often subjective and inconsistent.

Different people may reach different conclusions because there is no standardized evaluation process.

The application provides a simple, repeatable scoring system that helps users evaluate ideas using predefined weighted criteria.

---

# Goal

Build a simple web application that:

* Collects the required evaluation data from the user.
* Calculates the PoC Score.
* Calculates the Market Score.
* Applies the recommendation matrix.
* Displays both scores and a final recommendation with a brief explanation.

---

# Scope

The application SHALL:

* Run entirely in the browser.
* Ask the user to enter an idea name or description.
* Automatically generate ratings from the submitted idea description.
* Evaluate the idea across:

  * Quality
  * Feasibility
  * Impact
  * Originality
  * Clarity
* Calculate both weighted scores.
* Preserve completed evaluations in browser storage across sessions.
* Derive deterministic heuristic rules from repeated historical patterns.
* Display:

  * PoC Score
  * Market Score
  * Final Recommendation
  * Short explanation of the recommendation.
  * Any learned rule matching the current evaluation.

---

# Out of Scope

The application will NOT:

* Perform real market research.
* Connect to external APIs.
* Use AI to determine scores.
* Require authentication.
* Use a database.
* Require internet access after loading.
* Implement advanced analytics.

---

# Functional Requirements

### FR-1

The user can enter an idea title.

### FR-2

The user provides an idea description of at least 20 characters.

### FR-3

The application deterministically generates integer ratings from 1 to 10 for quality, feasibility, impact, originality, and clarity. It displays each rating and an overall automatic score from 10 to 100.

### FR-4

The application calculates:

PoC Score =
(Novelty × 3)

* (Scope × 4)
* (Resources × 2)
* (Outcome × 1)

Maximum score: 100.

### FR-5

The application calculates:

Market Score =
(Pain × 4)

* (Pay × 3)
* (Size × 2)
* (Differentiation × 1)

Maximum score: 100.

### FR-6

The recommendation matrix shall be:

PoC ≥ 65
Market ≥ 65

→ Go / Full Speed Ahead

PoC < 65
Market ≥ 65

→ De-risk First

PoC ≥ 65
Market < 65

→ Validate Demand

PoC < 65
Market < 65

→ Reframe or Shelve

### FR-7

The application shall explain why the recommendation was selected.

### FR-8

The user can perform multiple evaluations without reloading the page.

### FR-9

After every successful evaluation, the application stores the timestamp, idea title, description, automatic ratings, mapped criteria, scores, recommendation, and explanation in browser local storage without removing previous evaluations.

### FR-10

After a pattern appears in at least two stored evaluations, the application persists a human-readable heuristic rule. Matching rules are displayed as additional guidance and never alter the official recommendation.

---

# Non-Functional Requirements

The application shall:

* Load instantly.
* Execute all calculations locally.
* Work without a backend.
* Work in modern browsers.
* Require no installation.
* Be easy to read and maintain.
* Prioritize simplicity over visual appearance.

---

# Constraints

* Implementation must use only:

  * HTML5
  * CSS3
  * Vanilla JavaScript (ES6)
* No frontend frameworks.
* No backend.
* No package manager.
* No build tools.
* No external dependencies.
* No third-party UI libraries.
* Keep the codebase small and understandable.

---

# Assumptions

* Automatically generated ratings are deterministic text-based estimates, not real market research or technical due diligence.
* Generated ratings are integers between 1 and 10.
* Calculations use the official weighting rules defined by the challenge.

---

# Definition of Done

The project is complete when:

* The user can complete an evaluation.
* No manual ratings are requested.
* The automatic score and five generated ratings are clearly displayed.
* Both scores are calculated correctly.
* The recommendation matrix produces the correct verdict.
* A short explanation accompanies every verdict.
* Invalid inputs are rejected.
* The interface updates without reloading the page.
* Completed evaluations persist across browser sessions.
* Generated rules persist and matching rules appear as additional insights.
* Every verification scenario passes successfully.

---

# Verification Strategy

The implementation must successfully pass the following scenarios.

## Scenario 1 — Determinism

Evaluate the same title and description twice.

Expected: automatic ratings, automatic score, PoC score, Market score, and recommendation are identical.

---

## Scenario 2 — Validation

Submit an empty title or a description shorter than 20 characters.

Expected: a visible validation error and no evaluation record.

---

## Scenario 3 — Automatic rating

Submit a detailed idea describing users, problem, solution, implementation approach, and expected impact.

Expected: five generated ratings between 1 and 10 and an overall automatic score between 10 and 100.

---

## Scenario 4 — Official scoring

Expected: generated ratings map to the existing PoC and Market criteria, weighted calculations remain exact, and the official 65-threshold matrix selects the recommendation.

---

# Success Criteria

The application is considered successful if:

* All calculations are mathematically correct.
* The recommendation always matches the official decision matrix.
* The user can complete the workflow without errors.
* The implementation remains simple, readable and easy to maintain.
