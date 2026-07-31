---
name: verdict-matrix
description: >-
  Turn PoC and Market scores into the official Go/No-Go verdict. Use after
  scores are computed by scripts. Threshold 65 is inclusive.
---

# Skill: Verdict Matrix

## Purpose

Turn PoC Score and Market Score into a plain-language verdict with a fixed explanation. Never present raw numbers alone as the final answer.

## Classification

`High` if score ≥ 65. `Low` if score < 65. **Exactly 65 is High.** Use `>=`, never `>`.

## Matrix

| PoC | Market | Verdict | Explanation |
|-----|--------|---------|-------------|
| High | High | Go / Full Speed Ahead | Both technical feasibility and market viability clear the 65 threshold. The idea is strong enough to pursue at full speed. |
| Low | High | De-risk First | Market viability is strong, but technical feasibility is below 65. Reduce technical risk before scaling. |
| High | Low | Validate Demand | Technical feasibility is strong, but market viability is below 65. Validate demand and willingness to pay before building further. |
| Low | Low | Reframe or Shelve | Both scores are below 65. Reframe the idea substantially or shelve it for now. |

## Command

```bash
node scripts/recommend.mjs --poc <n> --market <n>
```

Or obtain verdict from `run-evaluation.mjs` / `write-ui-result.mjs`.

## Rule

* Never invent a different label or explanation.
* Memory-bank insights may be listed separately; they never change the matrix verdict.
