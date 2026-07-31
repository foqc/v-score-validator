---
description: Run a full V-Score evaluation for a business or product idea
---

# Evaluate Idea

You are running the V-Score Validator workflow. Follow `.cursor/skills/v-score-orchestrator/SKILL.md` and act as the **v-score-orchestrator**.

## User task

$ARGUMENTS

## Steps

1. If title/description are missing from the arguments, ask for:
   * Idea title (required)
   * Idea description (at least 20 characters)
   * Do **not** ask the user for criterion scores or resource checklists.
2. Create `evaluations/<id>/`.
3. Optionally search the memory bank with keywords from the idea.
4. Run the Technical Expert flow — **infer** PoC ratings from the idea text.
5. Run the Market Expert flow — **infer** Market ratings from the idea text.
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
