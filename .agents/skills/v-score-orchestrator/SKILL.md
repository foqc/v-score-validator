---
name: v-score-orchestrator
description: >-
  Coordinate a full V-Score evaluation: memory search, Technical and Market
  experts, audit, deterministic scoring scripts, UI result write, optional
  memory capture. Use for /evaluate-idea or when the user asks to evaluate an idea.
---

# Skill: V-Score Orchestrator

## When to Activate

* User runs `/evaluate-idea` or asks to evaluate / score an idea with V-Score.
* Need to reconcile Technical and Market audits and produce the final result.

### Do not activate

* Pure formula questions with known ratings already validated → run scripts directly
* Editing UI styling only → no orchestrator needed

## Sequence

1. **Collect input**
   * Idea title (required, non-empty).
   * Description (≥ 20 characters).
   * Reject and stop if invalid.
   * **Do not ask the user for criterion scores or resource checklists.** Experts infer all 1–10 ratings from the idea text (same protocol as the reference: ask for *or infer* ratings — prefer infer when a description is provided).

2. **Create run folder**
   * Pick an id, e.g. `YYYY-MM-DD-<slug>` or timestamp.
   * Create `evaluations/<id>/`.

3. **Memory search (optional but preferred when bank has content)**
   * Generate a few keywords from the idea (domain, problem, tech).
   * Run:

```bash
node scripts/memory-search.mjs --keywords keyword1,keyword2
```

   * Read only returned paths. Never load the entire memory bank.

4. **Apply technical-evaluation skill**
   * Load and follow `.agents/skills/technical-evaluation/SKILL.md` (Technical Expert *role*).
   * Infer PoC ratings from the idea; no user scoring; no separate subagent files required.
   * Require `evaluations/<id>/technical.md` and PoC ratings.

5. **Apply market-evaluation skill**
   * Load and follow `.agents/skills/market-evaluation/SKILL.md` (Market Expert *role*).
   * Infer Market ratings from the idea; no user scoring; no separate subagent files required.
   * Require `evaluations/<id>/market.md` and Market ratings.

6. **Audit**
   * Check each rating is an integer 1–10 (re-run `validate-rating.mjs` if unsure).
   * Resolve inconsistencies (e.g. Resources high but checklist mostly unavailable) with the user or by re-asking the expert.
   * Write `evaluations/<id>/ratings.json`:

```json
{
  "id": "<id>",
  "ideaTitle": "...",
  "ideaDescription": "...",
  "poc": { "novelty": N, "scope": N, "resources": N, "outcome": N },
  "market": { "pain": N, "pay": N, "size": N, "diff": N },
  "technicalSummary": "one paragraph",
  "marketSummary": "one paragraph",
  "insights": []
}
```

   * If memory search returned learnings, put human-readable insight strings in `insights` (supplemental only).

7. **Score (scripts only)**

```bash
node scripts/run-evaluation.mjs --ratings evaluations/<id>/ratings.json
node scripts/write-ui-result.mjs --ratings evaluations/<id>/ratings.json
```

   * Also copy or write the full result to `evaluations/<id>/result.json` if useful.
   * **Never** invent PoC/Market totals or the verdict. Use script output and the verdict-matrix skill for wording.

8. **Present**
   * Show PoC, Market, verdict, explanation from script output.
   * Tell the user to open `src/index.html` and load `evaluations/latest.json`.

9. **Self-learning (optional after a successful run)**

```bash
node scripts/memory-capture.mjs \
  --type evaluation \
  --title "short title" \
  --keywords "a,b,c" \
  --body-file evaluations/<id>/result.json
```

   Or capture a learning note with `--type learning` and a markdown body file.
   Learnings never change the matrix verdict.

## Invariants

* LLM reasons; scripts calculate.
* Roles are skills only (technical-evaluation, market-evaluation, v-score-orchestrator) — same pattern as the Downloads reference. No platform-specific subagent files.
* Also apply scoring-formulas, verdict-matrix, and validate-rating skills when scoring.
* Threshold 65 inclusive; official formulas unchanged.
