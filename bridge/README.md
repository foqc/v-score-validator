# V-Score Bridge

Isolated local app that drives V-Score from a browser form via the **Cursor SDK**. The core repo stays untouched: skills under `.agents/`, scoring under `scripts/`, viewer under `src/`.

```
bridge/public  →  bridge/server  →  Cursor agents (Technical ∥ Market)
                                      ↓
                               evaluations/<id>/{poc,market}.json
                                      ↓
                               scripts/run-evaluation.mjs
                               scripts/write-ui-result.mjs
                                      ↓
                               evaluations/latest.json + UI result panel
```

## Requirements

* Node.js ≥ 20
* `CURSOR_API_KEY` from [Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations)

## Setup

```bash
cd bridge
cp .env.example .env   # paste CURSOR_API_KEY
npm install
npm start
```

Open **http://localhost:8787** in the browser (do not open `public/index.html` via IDE preview or `file://` — CSS/JS and Evaluate will not work).

Optional env:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CURSOR_API_KEY` | (required) | Auth for SDK agents |
| `CURSOR_MODEL` | `composer-2.5` | Model id |
| `PORT` | `8787` | HTTP port |

## Behavior

1. User submits title + description (≥ 20 chars).
2. Server creates `evaluations/<date>-<slug>/`.
3. Two local Cursor agents run **in parallel** (Technical + Market), each following the matching skill under `.agents/skills/`.
4. SSE stream updates agent status and live text in the UI.
5. Bridge reads `poc.json` / `market.json` (fallback: JSON inside `technical.md` / `market.md`).
6. Core scripts compute scores and write `evaluations/latest.json`.
7. UI shows PoC / Market / recommendation.

Agents never invent weighted scores. Scripts own calculation. Ratings remain reasoned estimates.

## API

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/evaluate` | Body `{ title, description }` → `202 { jobId }` |
| `GET` | `/api/jobs/:id` | Job snapshot |
| `GET` | `/api/jobs/:id/events` | SSE: `status`, `log`, `done`, `error` |

## Boundaries

* Lives only under `bridge/`. Do not move deps into the repo root.
* Does not replace `/evaluate-idea` or `src/` viewer.
* Needs network + paid Cursor API usage; not part of `node scripts/verify.mjs`.
