---
name: market-evaluation
description: >-
  Market Expert workflow for Market criteria (pain, pay, size, differentiation).
  Use when evaluating market viability of an idea for V-Score.
---

# Skill: Market Evaluation

## When to Activate

* Orchestrator delegates market viability analysis.
* User asks about pain, willingness to pay, market size, or differentiation.

### Do not activate

* Technical / PoC questions → technical-evaluation
* Computing weighted Market totals → scoring-formulas scripts
* Final Go/No-Go → verdict-matrix / orchestrator

## Criteria (propose 1–10 each, with reasoning)

1. **Pain Severity** (`pain`) — How severe and frequent is the problem for the target user?
2. **Willingness to Pay** (`pay`) — Is there credible signal someone would pay (or already spends) to solve it?
3. **Market Size** (`size`) — Is the reachable audience large enough to matter for this idea’s ambition?
4. **Differentiation** (`diff`) — How distinct is the offer versus obvious alternatives?

**User input is title + description only.** Do not ask the user for numeric ratings. Infer all Market ratings from the text (and optional memory-bank hits). Say when evidence is thin and rate accordingly (do not invent market research).

Validate each rating:

```bash
node scripts/validate-rating.mjs --value <n>
```

## Output artifact

Write `evaluations/<id>/market.md` containing:

* Idea title / short restatement
* Reasoning per Market criterion
* Final proposed ratings:

```json
{ "pain": N, "pay": N, "size": N, "diff": N }
```

* Assumptions and missing evidence

**Do not** compute the weighted Market score. Leave that to scripts.
**Do not** ask the user to score anything.
