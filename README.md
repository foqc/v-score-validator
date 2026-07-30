# V-Score Validator

A lightweight, browser-based app to evaluate whether a business or product idea is worth pursuing.

You submit an idea title and description. The app deterministically estimates its quality, feasibility, impact, originality, and clarity; maps those ratings to two weighted scores; and gives you a plain-language recommendation. It also keeps a history and surfaces simple learned insights when patterns repeat.

## Features

- Weighted **PoC score** (technical feasibility) and **Market score** (market viability).
- Automatic **idea score** and five-dimension rating breakdown.
- Plain-language **recommendation** with a short explanation.
- No manual ratings; only a title and description are required.
- Input validation (title required, description must contain at least 20 characters).
- Multiple evaluations without reloading the page.
- **Memory**: every completed evaluation is stored in the browser.
- **Self-learning insights**: deterministic heuristic rules generated from repeated history.

## Getting started

No installation, build step, or dependencies. Open the app directly in a browser:

```
src/index.html
```

## How automatic rating works

`idea-rater.js` uses transparent text signals such as description detail, target audience, stated problem, solution, implementation terms, expected outcomes, and lexical variety. It generates integer ratings from 1 to 10 for:

- Quality
- Feasibility
- Impact
- Originality
- Clarity

Their average is displayed as an automatic idea score from 10 to 100. The same description always produces the same result.

> These are text-based estimates—not real market research or technical due diligence.

The generated ratings are mapped to the original PoC and Market criteria. The official weighted formulas remain unchanged:

**PoC score** (max 100):

```
(Novelty × 3) + (Scope × 4) + (Resources × 2) + (Outcome × 1)
```

**Market score** (max 100):

```
(Pain × 4) + (Pay × 3) + (Size × 2) + (Differentiation × 1)
```

**Recommendation matrix** (threshold 65, inclusive):

| PoC | Market | Recommendation |
|-----|--------|----------------|
| ≥ 65 | ≥ 65 | Go / Full Speed Ahead |
| < 65 | ≥ 65 | De-risk First |
| ≥ 65 | < 65 | Validate Demand |
| < 65 | < 65 | Reframe or Shelve |

## Memory

After each successful evaluation, a record is appended to `localStorage` under the key `v-score-evaluations` (a JSON array). Each record includes the timestamp, title, description, automatic ratings, mapped criteria, both scores, recommendation, and explanation. Previous records are never overwritten.

Inspect the history in the browser console:

```js
VScoreMemory.getAll();
```

## Self-learning insights

The app derives simple, deterministic rules from the stored history. A rule is generated once its pattern appears in at least **two** evaluations, and rules persist in `localStorage` under `v-score-learning-rules`.

Rules:

- PoC below 40 → usually requires technical validation.
- Market above 80 but PoC below 50 → should prioritize prototyping.
- PoC and Market both above 80 → strong implementation candidate.

Matching rules are shown as extra guidance under **Learned insights**. They never replace or modify the official recommendation matrix. This is not machine learning and uses no external APIs.

## Project structure

```
/
├── src/
│   ├── index.html      # UI structure and entry point
│   ├── css/
│   │   └── styles.css  # Styling
│   └── js/
│       ├── idea-rater.js # Deterministic automatic rating
│       ├── memory.js     # Evaluation history (localStorage)
│       ├── learning.js   # Heuristic rule generation and matching
│       └── script.js     # Scoring, validation, and UI workflow
│
├── SPEC.md             # Specification
├── ARCHITECTURE.md     # Architecture notes
├── VERIFY.md           # Verification scenarios and checklist
└── prompts/            # Build prompts
```

## Tech stack

HTML5, CSS3, and vanilla JavaScript (ES6). No frameworks, no backend, no database, no build tools, and no external dependencies.

## Verification

Manual verification scenarios and a test checklist live in [`VERIFY.md`](VERIFY.md).
