<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0
- List of modified principles:
  - Added: I. Terminal-First Interface
  - Added: II. Minimal Repo Churn & Focused Modifications
  - Added: III. Test-Driven & Step-by-Step Verification
  - Added: IV. Monorepo Architecture Compliance
  - Added: V. Google Coding Standards & Observability
- Added sections: Development Workflow, Architectural Guidelines
- Removed sections: N/A
- Templates requiring updates:
  - ⚠ .specify/templates/plan-template.md
  - ⚠ .specify/templates/spec-template.md
  - ⚠ .specify/templates/tasks-template.md
- Follow-up TODOs: Determine original RATIFICATION_DATE.
-->

# Gemini CLI Constitution

<!-- Establishes the core principles and governance for the Gemini CLI project. -->

## Core Principles

### I. Terminal-First Interface

The CLI provides a seamless, robust terminal interface for Gemini models. It
emphasizes text, ASCII, and ANSI-based interaction (via React and Ink) before
any advanced graphical protocols. All interfaces must prioritize usability
within standard environments (e.g., Ubuntu VTE) and handle side-effects
predictably.

### II. Minimal Repo Churn & Focused Modifications

Changes should be introduced in minimal, testable milestones with as little
repository churn as possible. Avoid broad structural refactors or brittle intent
routing unless explicitly justified. Keep the scope of mutations minimal to
ensure stability.

### III. Test-Driven & Step-by-Step Verification (NON-NEGOTIABLE)

New features must be tested at every milestone (e.g., using snapshot fixtures,
`vitest`, goldens). Unit, integration, and workspace-specific tests must pass
before progressing. A full `npm run preflight` must validate the implementation
before creating a Pull Request.

### IV. Monorepo Architecture Compliance

Strict package boundaries must be respected:

- `packages/cli`: User-facing UI, generic input processing, rendering.
- `packages/core`: Backend logic, Gemini orchestration, prompting.
- Cross-workspace relative imports are strictly forbidden. Extensions like
  devtools or external tools must communicate over well-defined boundaries.

### V. Google Coding Standards & Observability

Strictly adhere to Conventional Commits, maintain Prettier/ESLint rules, handle
environment variables cleanly via `vi.stubEnv`, and include Apache-2.0 license
headers on all new source files. Use deterministic, testable outcomes over
"smart" but unreliable behaviors.

## Development Workflow

1. **Feature Planning:** Features must adhere to the `plan.md` conventions:
   explicit, minimally invasive, backward-compatible steps.
2. **Implementation:** Proceed logically. Always write and update tests
   alongside features. Fix `react-hooks/exhaustive-deps` issues strictly.
3. **Preflight Checklist:**
   - Before finishing any code implementation task, always run
     `npm run preflight` (clean, build, lint, typecheck, test) as the ultimate
     validation gate.
   - For fast, targeted iterations, use `npm run test`, `npm run lint`, or
     workspace-specific test commands.

## Architectural Guidelines

- **UI Framework:** React with Ink. Do not manually measure or truncate strings;
  rely on Ink layout controls such as `ResizeObserver`.
- **Core Orchestration:** Build declarative tool schemas (e.g., `visualize`).
  Rely on robust tool-call handling over fragile keyword routing.
- **Dependency Handling:** Make integrations (like AST parsing, dependency
  graphs) standard, deterministic, and easily tested with fixtures.
- **Testing Constraints:** Mocks should be minimized; use true output testing
  natively wherever possible.

## Governance

This Constitution supersedes all ad-hoc agent practices. Any architectural
departures or addition of new tools MUST conform to these guidelines.
Refactoring legacy schemas (like `snippets.legacy.ts`) requires overriding
authorization to preserve historical behavior.

All code generation and reviews must verify compliance with this Constitution.
If changes require amending the principles, they must increment the
`CONSTITUTION_VERSION`.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Needs date | **Last
Amended**: 2026-02-21
