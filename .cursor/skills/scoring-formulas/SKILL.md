---
name: scoring-formulas
description: >-
  Official PoC and Market weighted formulas. Use when computing scores or
  explaining how totals are derived. Always run scripts; never invent weights.
---

# Skill: Scoring Formulas

## Purpose

Compute PoC Score and Market Score from 8 validated 1–10 ratings. Weights are fixed.

## Criteria

| Criterion | Axis | Key | Weight |
|-----------|------|-----|--------|
| Technical Novelty | PoC | `novelty` | ×3 |
| Defined Scope | PoC | `scope` | ×4 |
| Resource Accessibility | PoC | `resources` | ×2 |
| Measurable Outcome | PoC | `outcome` | ×1 |
| Pain Severity | Market | `pain` | ×4 |
| Willingness to Pay | Market | `pay` | ×3 |
| Market Size | Market | `size` | ×2 |
| Differentiation | Market | `diff` | ×1 |

## Formulas

```
PoC Score    = (novelty×3) + (scope×4) + (resources×2) + (outcome×1)
Market Score = (pain×4) + (pay×3) + (size×2) + (diff×1)
```

Max each axis = 100.

## Commands

```bash
node scripts/compute-poc.mjs --ratings ratings.json
node scripts/compute-market.mjs --ratings ratings.json
node scripts/run-evaluation.mjs --ratings ratings.json
```

`ratings.json` shape:

```json
{
  "poc": { "novelty": 7, "scope": 7, "resources": 5, "outcome": 6 },
  "market": { "pain": 8, "pay": 6, "size": 5, "diff": 4 }
}
```

## Rule

* Every rating must pass the Validate Rating skill first.
* Do not round, normalize, or rescale. Do not compute totals mentally when a script is available.
