# Prompt 5 — Self-Learning

## Objective

Implement a deterministic rule-generation system that derives reusable heuristic guidance from stored evaluations. This is not machine learning.

## Persistence decision

Because the application is browser-only, rules are stored as a JSON array in `localStorage` under `v-score-learning-rules` rather than in a physical `learning.json` file.

Keep rule persistence and matching isolated in `src/js/learning.js`.

## Requirements

After each completed evaluation:

1. Inspect the complete stored evaluation history.
2. Count evaluations matching each transparent rule definition.
3. Generate a rule after the pattern occurs at least twice.
4. Persist generated rules across browser sessions.

Rules:

* PoC below 40 → technical validation.
* Market above 80 and PoC below 50 → prioritize prototyping.
* PoC and Market both above 80 → strong implementation candidate.

For each new evaluation:

* Load existing rules.
* Match the evaluation against them.
* Refresh rules from the updated history.
* Display all matching rules as additional insights.

Rules never replace or modify the official recommendation matrix.

## Constraints

* Deterministic and explainable rules only.
* No AI APIs or machine-learning libraries.
* No backend, external libraries, or build tools.

## Definition of Done

* Rules are generated after two matching historical evaluations.
* Rules persist between sessions.
* Existing rules are reused.
* Matching rules appear in the results.
* The official recommendation remains unchanged.
