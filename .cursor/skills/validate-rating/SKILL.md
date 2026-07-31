---
name: validate-rating
description: >-
  Validate a single 1–10 integer criterion rating before scoring. Use whenever
  accepting or checking a PoC or Market rating from a user or expert agent.
---

# Skill: Validate Rating

## Purpose

Accept a 1–10 integer rating for a single criterion. Never accept or silently coerce anything outside this range.

## Rule

* Input must parse as an integer. `"5"` → 5. `"five"`, `"5.5"`, `""` → invalid.
* Valid range is 1–10 inclusive. `0` and `11` are both invalid.
* On invalid input, re-prompt. Do not clamp values.

## Command

```bash
node scripts/validate-rating.mjs --value <raw>
```

Success prints `{ "ok": true, "rating": N }`. Non-zero exit means invalid.

## Do not

* Invent a score when validation fails.
* Round floats into range.
* Skip validation before calling compute scripts.
