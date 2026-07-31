# Technical Evaluation — Smart Inventory Alerts

**Idea:** A web tool for small retail teams that automates inventory alerts, reducing stockouts and manual spreadsheet work.

## Criterion reasoning

* **novelty (3):** Threshold-based inventory alerts and spreadsheet replacement are well-established patterns (POS low-stock notices, inventory SaaS, Zapier-on-Sheets). No novel technical approach is stated.
* **scope (7):** PoC boundary is clear enough: web app, alert automation for small retail, stockout/spreadsheet pain. Achievable as CSV ingest + threshold rules + notifications; integrations and forecasting are out of scope unless added later.
* **resources (10):** From private resource checklist (all 8 factors available for a CSV-first PoC): standard web skills/tools, sample inventory data, no hard vendor lock-in, cheap hosting, enough domain knowledge to interpret stockout/alert metrics.
* **outcome (8):** Success can be measured as fewer stockout events, alert precision/recall vs. manual checks, and time spent on spreadsheet inventory reviews.

## Proposed PoC ratings

```json
{ "novelty": 3, "scope": 7, "resources": 10, "outcome": 8 }
```

## Open risks / assumptions

* Assumes PoC can start from CSV/spreadsheet export rather than live POS APIs.
* “Smart” is underspecified (rules vs. demand forecasting); scoring assumes simple threshold alerts.
* Real retail multi-location / supplier lead-time complexity may expand scope beyond a thin PoC.
