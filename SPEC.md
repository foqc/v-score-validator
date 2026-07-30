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
* Collect ratings from 1 to 10 for the four PoC criteria:

  * Technical Novelty
  * Defined Scope
  * Resource Accessibility
  * Measurable Outcome
* Collect ratings from 1 to 10 for the four Market criteria:

  * Pain Severity
  * Willingness to Pay
  * Market Size
  * Differentiation
* Calculate both weighted scores.
* Preserve completed evaluations in browser storage across sessions.
* Display:

  * PoC Score
  * Market Score
  * Final Recommendation
  * Short explanation of the recommendation.

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

The user can rate each PoC criterion from 1 to 10.

### FR-3

The user can rate each Market criterion from 1 to 10.

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

After every successful evaluation, the application stores the timestamp, idea title, criteria, scores, recommendation, and explanation in browser local storage without removing previous evaluations.

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

* Users understand the meaning of each scoring criterion.
* All ratings are integers between 1 and 10.
* Calculations use the official weighting rules defined by the challenge.

---

# Definition of Done

The project is complete when:

* The user can complete an evaluation.
* Both scores are calculated correctly.
* The recommendation matrix produces the correct verdict.
* A short explanation accompanies every verdict.
* Invalid inputs are rejected.
* The interface updates without reloading the page.
* Completed evaluations persist across browser sessions.
* Every verification scenario passes successfully.

---

# Verification Strategy

The implementation must successfully pass the following scenarios.

## Scenario 1

Input

All values = 10

Expected

PoC Score = 100

Market Score = 100

Recommendation:

Go / Full Speed Ahead

---

## Scenario 2

Input

All values = 1

Expected

PoC Score = 10

Market Score = 10

Recommendation:

Reframe or Shelve

---

## Scenario 3

Input

Values producing scores close to 65.

Expected

The recommendation changes correctly when crossing the threshold.

---

## Scenario 4

Input

Random manually calculated values.

Expected

Application results exactly match manual calculations.

---

# Success Criteria

The application is considered successful if:

* All calculations are mathematically correct.
* The recommendation always matches the official decision matrix.
* The user can complete the workflow without errors.
* The implementation remains simple, readable and easy to maintain.
