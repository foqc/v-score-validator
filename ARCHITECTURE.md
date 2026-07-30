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

`localStorage`, containing JSON arrays under:

* `v-score-evaluations` for completed evaluations
* `v-score-learning-rules` for generated heuristic rules

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
Automatic Idea Rater
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

The UI collects an idea title and description.

The idea rater derives five transparent text-based estimates and maps them to the existing PoC and Market criteria.

The calculator computes both weighted scores from those mapped criteria.

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
│       ├── idea-rater.js
│       ├── learning.js
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
* Idea submission form
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

## src/js/idea-rater.js

Responsible for:

* Analyzing the submitted description with deterministic, normalized text signals
* Generating quality, feasibility, impact, originality, and clarity ratings
* Mapping generated ratings to the official PoC and Market criteria

The ratings are estimates of description quality and specificity, not real-world validation.

---

## src/js/memory.js

Responsible for:

* Initializing browser storage
* Reading stored evaluations
* Appending completed evaluations
* Repairing malformed stored data

Contains no scoring or DOM rendering logic.

---

## src/js/learning.js

Responsible for:

* Defining transparent heuristic patterns
* Counting repeated patterns in evaluation history
* Persisting generated rules
* Matching evaluations against existing rules

Contains no recommendation-matrix or DOM rendering logic.

---

# Logical Modules

The JavaScript is split by responsibility: `script.js` handles the workflow, `idea-rater.js` generates ratings, `memory.js` stores evaluations, and `learning.js` generates and matches heuristic rules.

## Input Module

Responsibilities:

* Read form values
* Require a title
* Require a description of at least 20 characters

---

## Automatic Idea Rater

Responsibilities:

* Tokenize the idea description
* Measure transparent keyword and specificity signals as normalized strengths from 0 to 1
* Map each signal strength onto five integer ratings from 1 to 10
* Return an overall score from 10 to 100
* Map the ratings to existing scoring criteria

Signals are normalized so that ordinary one-sentence descriptions and richly detailed ones land at different points on the scale, keeping the rating distribution wide enough for the learning module to detect patterns. The same description always produces the same ratings.

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

## Learning Module

Responsibilities:

* Generate a rule only after its pattern occurs at least twice
* Persist rules as a valid JSON array
* Reuse existing rules across sessions
* Return matching rules as supplemental insights

Rule thresholds are calibrated against the rating distribution the idea rater actually produces, so each pattern describes a minority of evaluations. A condition that no description can trigger, or that every description triggers, carries no information and is treated as a defect. Rules never modify the official recommendation.

---

# Data Flow

```
User Input
      │
      ▼
Validation
      │
      ▼
Automatic Idea Rater
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
Generate / Match Rules
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

* A missing idea title
* An idea description shorter than 20 characters

When validation fails:

* Show a user-friendly message.
* Do not rate the idea, calculate scores, or store a record.

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
