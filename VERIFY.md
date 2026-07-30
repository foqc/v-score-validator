# V-Score Validator — Verification

Verification fixtures and checklist for the browser app (`src/index.html`, `src/js/script.js`, and `src/js/memory.js`). Threshold is **65 inclusive** (`≥ 65` / `< 65`).

## Formulas

**PoC Score** = (Novelty × 3) + (Scope × 4) + (Resources × 2) + (Outcome × 1)

**Market Score** = (Pain × 4) + (Pay × 3) + (Size × 2) + (Differentiation × 1)

## Scenario 1 — All 10s

| Field | Value |
|-------|------:|
| All eight ratings | 10 |

| Score | Expected |
|-------|---------:|
| PoC | 30+40+20+10 = **100** |
| Market | 40+30+20+10 = **100** |
| Verdict | **Go / Full Speed Ahead** |

## Scenario 2 — All 1s

| Field | Value |
|-------|------:|
| All eight ratings | 1 |

| Score | Expected |
|-------|---------:|
| PoC | 3+4+2+1 = **10** |
| Market | 4+3+2+1 = **10** |
| Verdict | **Reframe or Shelve** |

## Scenario 3 — Threshold boundaries

Use idea title `Boundary Test` for all cases.

PoC weights: N×3 + S×4 + R×2 + O×1  
Market weights: Pain×4 + Pay×3 + Size×2 + Diff×1

| Case | PoC (N, S, R, O) | Market (Pain, Pay, Size, Diff) | PoC | Market | Verdict |
|------|------------------|--------------------------------|-----|--------|---------|
| 3a | 5, 9, 5, 4 → 15+36+10+4 | 5, 10, 5, 5 → 20+30+10+5 | **65** | **65** | Go / Full Speed Ahead |
| 3b | 5, 9, 5, 3 → 15+36+10+3 | 5, 10, 5, 5 → 20+30+10+5 | **64** | **65** | De-risk First |
| 3c | 5, 9, 5, 4 → 15+36+10+4 | 5, 10, 5, 4 → 20+30+10+4 | **65** | **64** | Validate Demand |
| 3d | 5, 9, 5, 3 → 15+36+10+3 | 5, 10, 5, 4 → 20+30+10+4 | **64** | **64** | Reframe or Shelve |

## Scenario 4 — Manual spot check

| Field | Value |
|-------|------:|
| Novelty | 8 |
| Scope | 6 |
| Resources | 7 |
| Outcome | 9 |
| Pain | 9 |
| Pay | 4 |
| Size | 8 |
| Diff | 3 |

| Score | Expected |
|-------|---------:|
| PoC | 24+24+14+9 = **71** |
| Market | 36+12+16+3 = **67** |
| Verdict | **Go / Full Speed Ahead** |

## Expected explanations

| Verdict | Explanation |
|---------|-------------|
| Go / Full Speed Ahead | Both technical feasibility and market viability clear the 65 threshold. The idea is strong enough to pursue at full speed. |
| De-risk First | Market viability is strong, but technical feasibility is below 65. Reduce technical risk before scaling. |
| Validate Demand | Technical feasibility is strong, but market viability is below 65. Validate demand and willingness to pay before building further. |
| Reframe or Shelve | Both scores are below 65. Reframe the idea substantially or shelve it for now. |

## Manual test checklist

- [ ] Empty/whitespace idea title is rejected with a visible error (no scores shown)
- [ ] Non-integer, out-of-range (&lt;1 or &gt;10), or blank ratings are rejected
- [ ] Valid Evaluate shows PoC score, Market score, recommendation, and explanation
- [ ] Reset clears all inputs, hides/clears results, and clears errors
- [ ] Multiple evaluations work without reloading the page
- [ ] Scenarios 1–4 produce the expected scores and verdicts above
- [ ] `localStorage.getItem('v-score-evaluations')` is a valid JSON array
- [ ] Each successful evaluation appends one complete record without removing earlier records
- [ ] Reloading the page preserves previously stored evaluations
- [ ] Invalid evaluations do not create memory records
