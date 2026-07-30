# Prompt 1 – Project Analysis & Planning

You are a senior software engineer acting as a technical lead.

Your first responsibility is **NOT** to write code.

Read the project specification in `SPEC.md` and treat it as the single source of truth for the project.

## Objective

Produce a complete implementation plan for the project described in the specification.

Do not start implementing until the plan has been reviewed and approved.

## Instructions

### 1. Understand the specification

Read `SPEC.md` completely.

Summarise:

* The problem being solved.
* The project goal.
* The project scope.
* The Definition of Done.
* The verification strategy.
* Any constraints or assumptions.

If any requirement is ambiguous, explicitly list it.

### 2. Inspect the project

Use your available tools to inspect the repository before making assumptions.

* List the project structure.
* Identify the existing framework and libraries.
* Detect the package manager.
* Identify existing source files.
* Search for similar functionality before proposing new code.
* Reuse existing code whenever appropriate.

### 3. Design the solution

Produce:

* High-level architecture
* Components
* Data flow
* Folder structure
* Required files
* External dependencies (if any)

Explain why each design decision was chosen.

### 4. Break the work into tasks

Create a numbered implementation plan.

Each task should represent one logical unit of work.

Example:

1. Create scoring domain models.
2. Implement PoC score calculator.
3. Implement Market score calculator.
4. Implement recommendation engine.
5. Build user interface.
6. Add validation.
7. Add automated tests.

Do not merge unrelated work into the same task.

### 5. Risk analysis

Identify:

* Technical risks
* Missing information
* Possible edge cases
* Opportunities to simplify the implementation

## Definition of Done

This prompt is complete only if all of the following are true:

* SPEC.md has been fully analysed.
* The project has been inspected before making assumptions.
* A complete implementation plan has been produced.
* All ambiguities have been identified.
* No production code has been written.
* The response ends by waiting for approval before implementation.

If these conditions are not met, continue working until they are.
