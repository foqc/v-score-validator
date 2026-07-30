# Architecture

## Overview

This project is implemented as a simple client-side web application.

The entire application runs inside the browser using only HTML5, CSS3 and Vanilla JavaScript (ES6). Completed evaluations are persisted with the browser's `localStorage` API. No server, build tools or external dependencies are required.

The architecture prioritizes simplicity, readability, maintainability and separation of responsibilities.

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6)

## Backend

None

## Database

None

## Browser Storage

`localStorage`, containing a JSON array under the `v-score-evaluations` key.

## Build Tools

None

## Package Manager

None

## External Libraries

None

---

# High-Level Architecture

```
User
   │
   ▼
src/index.html
   │
   ▼
User Interface
   │
   ▼
Input Validation
   │
   ▼
Score Calculator
   │
   ▼
Recommendation Engine
   │
   ▼
DOM Renderer
```

The UI collects user input.

The calculator computes both weighted scores.

The recommendation engine determines the final verdict.

The renderer updates the page with the results.

---

# Project Structure

```
/
├── src/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── memory.js
│       └── script.js
│
├── SPEC.md
├── ARCHITECTURE.md
├── VERIFY.md
│
└── prompts/
```

---

# Component Responsibilities

## src/index.html

Responsible for:

* Page layout
* User inputs
* Score forms
* Result section
* Button actions

Contains no business logic.

---

## src/css/styles.css

Responsible for:

* Layout
* Typography
* Responsive design
* Visual feedback

Contains no application logic.

---

## src/js/script.js

Responsible for:

* Reading user input
* Input validation
* Score calculations
* Recommendation logic
* Rendering results
* Event handling

Contains the evaluation workflow and UI logic.

---

## src/js/memory.js

Responsible for:

* Initializing browser storage
* Reading stored evaluations
* Appending completed evaluations
* Repairing malformed stored data

Contains no scoring or DOM rendering logic.

---

# Logical Modules

The JavaScript is split by responsibility: `script.js` handles evaluation behavior and `memory.js` handles persistence.

## Input Module

Responsibilities:

* Read form values
* Validate ranges
* Convert values to numbers

---

## PoC Calculator

Responsibilities:

* Calculate weighted PoC score
* Return score between 10 and 100

Formula:

PoC =
(Novelty × 3)
+
(Scope × 4)
+
(Resources × 2)
+
(Outcome × 1)

---

## Market Calculator

Responsibilities:

* Calculate weighted Market score
* Return score between 10 and 100

Formula:

Market =
(Pain × 4)
+
(Pay × 3)
+
(Size × 2)
+
(Differentiation × 1)

---

## Recommendation Engine

Responsibilities:

* Compare both scores
* Apply the official decision matrix
* Return:

  * Verdict
  * Short explanation

No DOM manipulation should occur here.

---

## UI Renderer

Responsibilities:

* Display scores
* Display recommendation
* Display explanation
* Display validation errors

This module should never perform calculations.

---

## Memory Module

Responsibilities:

* Initialize browser storage as a valid JSON array
* Preserve existing evaluation records
* Append each successful evaluation
* Repair malformed stored data before saving new records

---

# Data Flow

```
User Input
      │
      ▼
Validation
      │
      ▼
PoC Calculator
      │
      ▼
Market Calculator
      │
      ▼
Recommendation Engine
      │
      ▼
Persist Evaluation
      │
      ▼
Render Results
```

Each stage has a single responsibility.

---

# Design Principles

The implementation should follow these principles:

* Single Responsibility Principle
* Separation of Concerns
* Small reusable functions
* Pure calculation functions
* No duplicated logic
* Keep the code simple
* Prefer readability over clever solutions

---

# Error Handling

The application should validate:

* Empty fields
* Values below 1
* Values above 10
* Non-numeric values

When validation fails:

* Show a user-friendly message.
* Do not perform calculations.

---

# Performance

Expected response time:

* Score calculation: instantaneous
* No asynchronous operations
* No network requests

---

# Maintainability

Future enhancements should be easy to add without changing the core calculation logic.

Examples:

* Exporting results
* AI-assisted scoring
* Charts and visualizations

These features should be added as separate modules without modifying the existing calculators.

---

# Coding Standards

* Use modern ES6 syntax.
* Use const by default.
* Use let only when reassignment is required.
* Use descriptive variable and function names.
* Prefer pure functions.
* Keep functions focused on a single responsibility.
* Avoid global variables whenever possible.
* Keep the code clean and self-explanatory.

---

# Definition of Architecture Success

The architecture is considered successful when:

* The UI contains no business logic.
* Calculations are isolated from rendering.
* Every logical module has a single responsibility.
* The application can be understood without additional documentation.
* New features can be added with minimal impact on existing code.
