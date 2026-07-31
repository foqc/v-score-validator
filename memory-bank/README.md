# Memory bank

Keyword-indexed knowledge for V-Score agents.

## Layout

* `index.json` — search surface: `{ path, title, type, keywords[], capturedAt }`
* `evaluations/` — summaries of past runs
* `learnings/` — validated reusable insights (not model training)

Each document should include a header listing keywords that describe its content.

## Usage

Agents generate keywords, then run:

```bash
node scripts/memory-search.mjs --keywords market,willingness-to-pay
```

Capture after a successful evaluation:

```bash
node scripts/memory-capture.mjs \
  --type evaluation \
  --title "My idea summary" \
  --keywords "retail,inventory,poc" \
  --body-file evaluations/<id>/result.json
```

Do not load the entire memory bank into context. Search first, then open matched paths only.

Learnings are supplemental and never alter the official recommendation matrix.
