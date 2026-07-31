---
name: technical-evaluation
description: >-
  Technical Expert workflow for PoC criteria (novelty, scope, resources,
  outcome). Use when evaluating technical feasibility of an idea for V-Score.
  Infer ratings from the idea text; do not ask the user for scores.
---

# Skill: Technical Evaluation

## When to Activate

* Orchestrator delegates PoC / technical feasibility analysis.
* User asks to rate technical novelty, scope, resources, or measurable outcome.

### Do not activate

* Market-only questions → market-evaluation
* Computing weighted PoC totals → scoring-formulas scripts
* Final Go/No-Go → verdict-matrix / orchestrator

## Input from the user

**Only** the idea title and description. Do **not** ask the user for numeric ratings or a resource yes/no questionnaire. Infer all PoC ratings from the text (and optional memory-bank hits).

## Criteria (infer 1–10 each, with one-line justification)

1. **Technical Novelty** (`novelty`) — How novel is the technical approach relative to known patterns?
2. **Defined Scope** (`scope`) — Is the PoC boundary clear and achievable from the description?
3. **Resource Accessibility** (`resources`) — How accessible would typical resources be for this kind of PoC, based on what the idea implies (stack, data needs, dependencies)?
4. **Measurable Outcome** (`outcome`) — Can success of the PoC be measured from what the description states?

## Resources (agent-side only)

Optionally run `node scripts/poc-resources.mjs` as a **private reasoning checklist**. Infer yes/no for each factor from the idea text yourself, write `evaluations/<id>/resource-answers.json`, then:

```bash
node scripts/score-item.mjs --criterion resources --answers evaluations/<id>/resource-answers.json
```

Use the script’s `rating` as `resources`. Never present that checklist as questions the user must answer.

If you skip the checklist, still propose `resources` 1–10 with reasoning and validate:

```bash
node scripts/validate-rating.mjs --value <n>
```

Validate every PoC rating the same way.

## Output artifact

Write `evaluations/<id>/technical.md` containing:

* Idea title / short restatement
* Reasoning per PoC criterion (one line each minimum)
* Final proposed ratings:

```json
{ "novelty": N, "scope": N, "resources": N, "outcome": N }
```

* Open risks / assumptions

**Do not** compute the weighted PoC score. Leave that to scripts.
**Do not** ask the user to score anything.
