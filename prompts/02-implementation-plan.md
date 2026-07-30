# Prompt 2 – Implementation Plan

Approved analysis plan for V-Score Validator. Agents implementing this project MUST follow `SPEC.md` and `ARCHITECTURE.md` as sources of truth, and this document for task breakdown and shared contracts.

## Resolved decisions

| Ambiguity | Decision |
|-----------|----------|
| Idea title required? | **Yes.** Empty/whitespace title is invalid. |
| Explanation copy | Fixed template string per verdict (see below). |
| VERIFY.md | Create at repo root with concrete Scenario 3 boundary fixtures. |
| Input type | `type="number"` with `min="1"` `max="10"` `step="1"`, plus JS validation. |
| Reset | Clears all inputs and hides/clears results and errors. |
| Scoring trigger | Calculate only on Evaluate click (not live-as-you-type). |

---

## Spec summary (reminder)

- **Stack:** HTML5 + CSS3 + Vanilla ES6 only. No frameworks, package manager, build tools, or external deps.
- **PoC:** `(Novelty×3) + (Scope×4) + (Resources×2) + (Outcome×1)` → max 100
- **Market:** `(Pain×4) + (Pay×3) + (Size×2) + (Differentiation×1)` → max 100
- **Threshold:** 65 inclusive (`≥ 65` / `< 65`)
- **Matrix:**
  - PoC ≥ 65, Market ≥ 65 → Go / Full Speed Ahead
  - PoC < 65, Market ≥ 65 → De-risk First
  - PoC ≥ 65, Market < 65 → Validate Demand
  - PoC < 65, Market < 65 → Reframe or Shelve

---

## Target files

```
/
├── src/
│   ├── index.html          # UI structure and app entry point
│   ├── css/
│   │   └── styles.css      # Layout / readability / error feedback
│   └── js/
│       ├── memory.js       # Browser persistence
│       └── script.js       # Evaluation and UI logic
├── VERIFY.md           # Manual verification fixtures
├── SPEC.md
├── ARCHITECTURE.md
└── prompts/
    ├── 01-analysis.md
    └── 02-implementation-plan.md
```

---

## Shared DOM contract

Agents MUST use these exact `id` values so HTML and JS stay compatible.

| Element | `id` |
|---------|------|
| Idea title input | `idea-title` |
| PoC – Technical Novelty | `poc-novelty` |
| PoC – Defined Scope | `poc-scope` |
| PoC – Resource Accessibility | `poc-resources` |
| PoC – Measurable Outcome | `poc-outcome` |
| Market – Pain Severity | `market-pain` |
| Market – Willingness to Pay | `market-pay` |
| Market – Market Size | `market-size` |
| Market – Differentiation | `market-diff` |
| Evaluate button | `btn-evaluate` |
| Reset button | `btn-reset` |
| Error message container | `error-message` |
| Results section | `results` |
| PoC score display | `poc-score` |
| Market score display | `market-score` |
| Recommendation display | `recommendation` |
| Explanation display | `explanation` |

Form element: `id="evaluation-form"` (optional but preferred).

---

## Explanation templates

| Verdict | Explanation |
|---------|-------------|
| Go / Full Speed Ahead | Both technical feasibility and market viability clear the 65 threshold. The idea is strong enough to pursue at full speed. |
| De-risk First | Market viability is strong, but technical feasibility is below 65. Reduce technical risk before scaling. |
| Validate Demand | Technical feasibility is strong, but market viability is below 65. Validate demand and willingness to pay before building further. |
| Reframe or Shelve | Both scores are below 65. Reframe the idea substantially or shelve it for now. |

---

## Numbered tasks

1. **Create `index.html`** — page structure, labels, inputs, buttons, results region; link `styles.css` and `script.js`; no business logic.
2. **Create `styles.css`** — simple readable layout; group PoC vs Market; results + error visibility; responsive enough for modern browsers; prioritize clarity over polish.
3. **Implement input module in `script.js`** — read values; require title; validate each rating is an integer 1–10; return errors without calculating.
4. **Implement PoC calculator** — pure function using official weights.
5. **Implement Market calculator** — pure function using official weights.
6. **Implement recommendation engine** — pure function returning `{ verdict, explanation }` from the matrix + templates above.
7. **Implement renderer + events** — Evaluate wires validate → calc → recommend → render; Reset clears form/results/errors; multi-eval without reload.
8. **Create `VERIFY.md`** — Scenario 1–4 with concrete inputs (see fixtures below).
9. **Manual verification** — open `index.html`, run all VERIFY scenarios, confirm expected outputs.

---

## VERIFY fixtures (required)

### Scenario 1 — All 10s

All eight ratings = 10.

- PoC = 100, Market = 100
- Recommendation: Go / Full Speed Ahead

### Scenario 2 — All 1s

All eight ratings = 1.

- PoC = 10, Market = 10
- Recommendation: Reframe or Shelve

### Scenario 3 — Threshold boundaries

Use idea title `Boundary Test` for all.

| Case | PoC inputs (N,S,R,O) | Market (Pain,Pay,Size,Diff) | PoC | Market | Verdict |
|------|----------------------|-----------------------------|-----|--------|---------|
| 3a Exactly 65 / 65 | 5, 10, 5, 5 → 15+40+10+5=70 wait — need exact 65 | see below | 65 | 65 | Go |
| 3b PoC 64 / Market 65 | see below | | 64 | 65 | De-risk First |
| 3c PoC 65 / Market 64 | | | 65 | 64 | Validate Demand |
| 3d PoC 64 / Market 64 | | | 64 | 64 | Reframe or Shelve |

**Concrete rating sets that produce these scores:**

PoC weights: N×3 + S×4 + R×2 + O×1

- **PoC = 65:** Novelty=5, Scope=8, Resources=8, Outcome=6 → 15+32+16+6 = **69** — adjust:
- **PoC = 65:** Novelty=7, Scope=7, Resources=7, Outcome=6 → 21+28+14+6 = **69**
- **PoC = 65:** Novelty=5, Scope=10, Resources=5, Outcome=0 invalid
- **PoC = 65:** Novelty=9, Scope=5, Resources=8, Outcome=8 → 27+20+16+8 = **71**
- **PoC = 65:** Novelty=5, Scope=8, Resources=7, Outcome=7 → 15+32+14+7 = **68**
- **PoC = 65:** Novelty=3, Scope=10, Resources=8, Outcome=4 → 9+40+16+4 = **69**
- **PoC = 65:** Novelty=5, Scope=9, Resources=5, Outcome=4 → 15+36+10+4 = **65** ✓
- **PoC = 64:** Novelty=5, Scope=9, Resources=5, Outcome=3 → 15+36+10+3 = **64** ✓

Market weights: Pain×4 + Pay×3 + Size×2 + Diff×1

- **Market = 65:** Pain=8, Pay=7, Size=5, Diff=4 → 32+21+10+4 = **67**
- **Market = 65:** Pain=10, Pay=5, Size=5, Diff=5 → 40+15+10+5 = **70**
- **Market = 65:** Pain=8, Pay=5, Size=8, Diff=5 → 32+15+16+5 = **68**
- **Market = 65:** Pain=7, Pay=7, Size=7, Diff=6 → 28+21+14+6 = **69**
- **Market = 65:** Pain=5, Pay=10, Size=5, Diff=5 → 20+30+10+5 = **65** ✓
- **Market = 64:** Pain=5, Pay=10, Size=5, Diff=4 → 20+30+10+4 = **64** ✓

| Case | PoC (N,S,R,O) | Market (Pain,Pay,Size,Diff) | Scores | Verdict |
|------|---------------|-----------------------------|--------|---------|
| 3a | 5, 9, 5, 4 | 5, 10, 5, 5 | 65 / 65 | Go / Full Speed Ahead |
| 3b | 5, 9, 5, 3 | 5, 10, 5, 5 | 64 / 65 | De-risk First |
| 3c | 5, 9, 5, 4 | 5, 10, 5, 4 | 65 / 64 | Validate Demand |
| 3d | 5, 9, 5, 3 | 5, 10, 5, 4 | 64 / 64 | Reframe or Shelve |

### Scenario 4 — Manual spot check

| Field | Value |
|-------|-------|
| Novelty | 8 |
| Scope | 6 |
| Resources | 7 |
| Outcome | 9 |
| Pain | 9 |
| Pay | 4 |
| Size | 8 |
| Diff | 3 |

- PoC = 24+24+14+9 = **71**
- Market = 36+12+16+3 = **67**
- Recommendation: Go / Full Speed Ahead

---

## Coding standards

- ES6; `const` by default; descriptive names; pure calculators.
- No globals beyond a single init/DOMContentLoaded scope (IIFE or module-pattern via function scope is fine; no `type="module"` required).
- HTML/CSS contain no scoring logic.
- Recommendation engine never touches the DOM.
- Renderer never calculates scores.

---

## Agent work split

| Agent | Owns | Must not |
|-------|------|----------|
| **UI agent** | `index.html`, `styles.css` | Add calculation logic or invent different IDs |
| **Logic agent** | `script.js` | Change HTML structure or CSS unrelated to JS needs |
| **Verify agent** | `VERIFY.md` + manual scenario checklist confirmation after files exist | Rewrite working calculators unless a scenario fails |

Implement UI and Logic in parallel using the DOM contract above. Verify runs after both complete.

---

## Definition of Done

- [ ] User can complete an evaluation end-to-end
- [ ] Scores match formulas exactly
- [ ] Matrix + explanations correct for all four quadrants
- [ ] Invalid inputs rejected with a visible message
- [ ] Multiple evaluations without page reload
- [ ] All VERIFY scenarios pass
- [ ] No frameworks, deps, or build tools introduced
