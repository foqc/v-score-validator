# V-Score Validator — Verification

Agents propose ratings; scripts compute scores and the recommendation. The browser UI only displays `evaluations/latest.json`.

## Script edge cases (`node scripts/verify.mjs`)

### 1. All 10s

Every criterion = 10.

Expected: PoC = 100, Market = 100, Verdict = `Go / Full Speed Ahead`

### 2. All 1s

Every criterion = 1.

Expected: PoC = 10, Market = 10, Verdict = `Reframe or Shelve`

### 3. Boundary 65 / 64

PoC ratings: Novelty=7, Scope=7, Resources=5, Outcome=6 → PoC = 65  
Market ratings: Pain=8, Pay=6, Size=5, Diff=4 → Market = 64  

Expected: Verdict = `Validate Demand` (65 is High; 64 is Low)

### Official matrix boundaries

- 65 / 65 → Go / Full Speed Ahead
- 64 / 65 → De-risk First
- 65 / 64 → Validate Demand
- 64 / 64 → Reframe or Shelve

## Fixture: write UI result

Given ratings from case 3, `run-evaluation.mjs` + `write-ui-result.mjs` must produce `evaluations/latest.json` with matching scores and verdict.

## Manual Cursor workflow checklist

- [ ] `/evaluate-idea` (or equivalent) asks for title and description
- [ ] Description shorter than 20 characters is rejected before expert work
- [ ] Technical Expert runs `poc-resources.mjs` and collects resource answers
- [ ] Market Expert produces four Market ratings with reasoning
- [ ] Orchestrator runs scripts for scores and verdict (LLM does not invent totals)
- [ ] `evaluations/latest.json` is written
- [ ] Opening `src/index.html` and loading the result shows PoC, Market, recommendation, and explanation
- [ ] Matching memory-bank insights never change the matrix verdict

## Memory bank

- [ ] `memory-search.mjs --keywords foo,bar` returns only index entries whose keywords intersect
- [ ] Agents call the search script instead of reading the entire `memory-bank/` tree
- [ ] `memory-capture.mjs` appends a document and updates `index.json`
