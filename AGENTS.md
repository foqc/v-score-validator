# AGENTS.md

Operating rules for agents working in this repo. For product requirements see `SPEC.md`; for design see `ARCHITECTURE.md`.

## Invariants (do not break)

- Vanilla stack only: HTML5, CSS3, ES6. No frameworks, backend, database, build tools, package manager, or external dependencies.
- Do not modify the official scoring formulas or the recommendation matrix (threshold 65, inclusive). See `SPEC.md`.
- Users provide text only; ratings must be generated deterministically by `idea-rater.js`.
- Generated ratings are text-based estimates and must not be presented as real market research or technical due diligence.
- Learned insights are supplemental only; they must never replace or alter the official recommendation.
- Persist data in `localStorage` (`v-score-evaluations`, `v-score-learning-rules`). No files written to disk from the browser.

## Structure

- `src/index.html` — UI and entry point (no business logic).
- `src/css/styles.css` — styling only.
- `src/js/idea-rater.js` — automatic rating and criteria mapping.
- `src/js/memory.js` — evaluation history.
- `src/js/learning.js` — deterministic rule generation and matching.
- `src/js/script.js` — scoring, validation, and UI wiring.

Keep concerns separated: workflow/UI in `script.js`, rating in `idea-rater.js`, persistence in `memory.js`, rules in `learning.js`.

## Conventions

- `const` by default; pure functions for scoring and rules (no DOM access inside them).
- Renderers never calculate; calculators never touch the DOM.

## Verifying

- No test runner. Validate against the scenarios and checklist in `VERIFY.md`.
- Quick syntax check: `node --check src/js/<file>.js`.
