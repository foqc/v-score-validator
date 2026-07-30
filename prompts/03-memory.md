# Prompt 4 — Memory System

You are implementing the project memory feature.

Read SPEC.md and ARCHITECTURE.md before making changes.

## Objective

Implement a lightweight memory system that stores every completed evaluation.

The purpose is to preserve previous evaluations so they can be reviewed and reused in future sessions.

## Requirements

Use browser `localStorage` with the key:

`v-score-evaluations`

If the key does not exist, initialize it automatically with `[]`.

Keep persistence isolated in `src/js/memory.js`; evaluation and UI logic remain in `src/js/script.js`.

After every successful evaluation, append a new record containing:

* Timestamp
* Idea title
* PoC criteria
* Market criteria
* PoC Score
* Market Score
* Recommendation
* Explanation

Do not overwrite previous records.

The stored value should always contain a valid JSON array.

## Constraints

* Keep the implementation simple.
* Do not introduce databases.
* Do not introduce external libraries.
* Use browser-compatible JavaScript and `localStorage`.

## Definition of Done

The task is complete only if:

* Every completed evaluation is stored.
* Previous evaluations remain intact.
* The stored JSON array is always valid.
* Existing functionality continues to work.

Do not implement self-learning in this task.
