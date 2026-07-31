---
description: Run a full V-Score evaluation for a business or product idea
---

# Evaluate Idea

You are running the V-Score Validator workflow. Follow `.agents/skills/v-score-orchestrator/SKILL.md`.

Also load when needed: `technical-evaluation`, `market-evaluation`, `scoring-formulas`, `verdict-matrix`, `validate-rating`.

Prefer spawning project subagents `technical-expert` and `market-expert` from `.agents/agents/` in parallel (isolated context). Fallback: apply the matching skills inline if the host cannot spawn custom subagents.

## User task

$ARGUMENTS

## Steps

1. If title/description are missing from the arguments, ask for:
   * Idea title (required)
   * Idea description (at least 20 characters)
   * Do **not** ask the user for criterion scores or resource checklists.
2. Create `evaluations/<id>/`.
3. Optionally search the memory bank with keywords from the idea.
4. Spawn `technical-expert` — **infer** PoC ratings from the idea text (or apply `technical-evaluation` inline).
5. Spawn `market-expert` in parallel — **infer** Market ratings (or apply `market-evaluation` inline). Do not share Technical ratings with Market.
6. Audit ratings; write `evaluations/<id>/ratings.json`.
7. Run:

```bash
node scripts/run-evaluation.mjs --ratings evaluations/<id>/ratings.json
node scripts/write-ui-result.mjs --ratings evaluations/<id>/ratings.json
```

8. Show PoC Score, Market Score, recommendation, and explanation from script output.
9. Tell the user to open `src/index.html` and load `evaluations/latest.json`.
10. Optionally capture the evaluation into the memory bank.

Do not invent weighted scores or the verdict. Scripts own all calculations.
Experts own criterion ratings (inferred); the user only supplies the idea.
