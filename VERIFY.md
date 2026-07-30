# V-Score Validator — Verification

The app accepts an idea title and description, generates ratings automatically, and applies the unchanged official formulas and 65-point recommendation matrix.

## Deterministic fixture

Description:

> A web tool for small retail teams that automates inventory alerts, reducing stockouts and manual spreadsheet work using local sales data.

Expected automatic ratings:

| Dimension | Rating |
|-----------|-------:|
| Quality | 8 |
| Feasibility | 7 |
| Impact | 5 |
| Originality | 6 |
| Clarity | 8 |
| Overall automatic score | 68 / 100 |

Expected mapped criteria:

- PoC: Novelty 6, Scope 8, Resources 7, Outcome 7
- Market: Pain 5, Pay 8, Size 7, Differentiation 6

Expected weighted results:

- PoC = (6×3) + (8×4) + (7×2) + (7×1) = **71**
- Market = (5×4) + (8×3) + (7×2) + (6×1) = **64**
- Recommendation = **Validate Demand**

Running the same description repeatedly must produce the exact same ratings and scores.

## Official matrix boundaries

The recommendation engine remains unchanged:

- 65 / 65 → Go / Full Speed Ahead
- 64 / 65 → De-risk First
- 65 / 64 → Validate Demand
- 64 / 64 → Reframe or Shelve

## Manual checklist

- [ ] No manual rating fields are displayed
- [ ] Empty title is rejected
- [ ] Description shorter than 20 characters is rejected
- [ ] A valid description displays the overall score and five ratings
- [ ] The deterministic fixture produces 68 overall, 71 PoC, and 64 Market
- [ ] The result states that automatic ratings are text-based estimates
- [ ] Reset clears inputs and generated results
- [ ] Repeating the same input produces identical scores
- [ ] Each successful evaluation stores the description and generated ratings
- [ ] Invalid evaluations do not create memory records
- [ ] Existing memory and learning rules persist after reload
- [ ] Matching learned insights never modify the official recommendation

## Learning rules

Rules are generated after a pattern appears in **two** stored evaluations, and persist in `v-score-learning-rules`.

| Rule | Condition |
|------|-----------|
| `vague-description` | Clarity ≤ 4 |
| `unclear-feasibility` | Feasibility ≤ 3 |
| `impact-not-stated` | Impact ≤ 3 |
| `low-differentiation` | Originality ≤ 4 |
| `low-poc` | PoC < 50 |
| `well-rounded` | Every dimension ≥ 6 |

Thresholds must stay inside the rater's reachable range (PoC ≈ 21–85, Market ≈ 17–97) and must describe a minority of evaluations. A rule that no description can trigger, or that every description triggers, is a defect.

- [ ] Evaluating a vague idea twice (for example `Something that we might build later for people maybe`) generates `vague-description`, `unclear-feasibility`, `impact-not-stated`, `low-differentiation`, and `low-poc`
- [ ] Evaluating a detailed idea twice (audience, problem, implementation, and measurable outcome) generates `well-rounded`
- [ ] A single matching evaluation does not generate a rule
