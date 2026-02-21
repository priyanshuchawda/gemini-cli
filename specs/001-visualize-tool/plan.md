# Implementation Plan: Visualize Tool

**Branch**: `001-visualize-tool` | **Date**: 2026-02-21 | **Spec**:
[spec.md](./spec.md) **Input**: Feature specification from
`/specs/001-visualize-tool/spec.md`

## Summary

Add a new built-in core tool `visualize` to the Gemini CLI that the model can
invoke to render architecture graphs and dependency trees directly within the
terminal, exclusively using ASCII/ANSI constraints for standard Ubuntu
(xterm-256color) environments. Includes an explicit user `/visualize` command
and uses `Vitest` snapshot tests for strict TDD verification.

## Technical Context

**Language/Version**: TypeScript, Node.js (>=20.0.0) **Primary Dependencies**:
`ink`, `react`, `@google/gemini-cli-core` dependencies **Storage**: Ephemeral
Temp Dir via `config.storage.getProjectTempDir()` for visualized cache artifacts
**Testing**: Vitest (`test:integration:sandbox:none`, `test`) **Target
Platform**: Linux/Ubuntu CLI (xterm-256color VTE emulator, no raw image
protocol) **Project Type**: Monorepo Console Application **Performance Goals**:
<3 second graph generation after cached hit; graceful wrapping for 80-column
terminals. **Constraints**: Pure text/ASCII rendering (No Puppeteer/canvas
usage), strictly adhere to `react-hooks/exhaustive-deps`. **Scale/Scope**:
Generates graphs of file dependencies and system designs up to medium-sized
repositories.

## Constitution Check

_GATE: Must pass before Phase 0 research._

- **I. Terminal-First Interface**: PASSED - Explicitly constrainted exclusively
  to ASCII/ANSI rendering.
- **II. Minimal Repo Churn & Focused Modifications**: PASSED - Plugs into
  existing `createToolRegistry()`, adds one command handler, does not
  restructure major command buses.
- **III. Test-Driven & Step-by-Step Verification**: PASSED - Vitest snapshot
  fixtures explicitly mandated in spec.
- **IV. Monorepo Architecture Compliance**: PASSED - Boundary strictly enforced:
  Tool runs in `packages/core`, Command UI logic in `packages/cli`.

## Project Structure

### Documentation (this feature)

```text
specs/001-visualize-tool/
├── plan.md              # This file
├── research.md          # Determined Agent/Skill selection contexts
├── data-model.md        # State definitions
├── quickstart.md        # Feature validation guide
├── contracts/           # API Signatures for Tool schema
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
packages/core/
├── src/
│   ├── tools/
│   │   ├── definitions/
│   │   │   ├── base-declarations.ts
│   │   │   └── types.ts
│   │   ├── visualize/
│   │   │   ├── asciiRenderer.ts
│   │   │   └── asciiRenderer.test.ts
│   │   ├── visualize.ts
│   │   └── visualize.test.ts
│   ├── config/
│       └── config.ts

packages/cli/
├── src/
│   ├── ui/
│   │   ├── commands/
│   │       ├── visualizeCommand.ts
│   │       └── visualizeCommand.test.ts
│   ├── services/
│       └── BuiltinCommandLoader.ts
```

**Structure Decision**: Monorepo integration, splitting logic cleanly into
`packages/core` (schema, backend tool logic, ASCIIRenderer) and `packages/cli`
(Ink/React component updates and slash command mapping), conforming explicitly
to Monorepo Architecture Guidelines.

## Agent & Skill Selection

To execute this plan properly, the following `.agent` contexts must be engaged:

- **Agents**:
  - `orchestrator.md`: General feature execution and git commit workflow
    handling.
  - `project-planner.md`: Initial architecture review.
  - `backend-specialist.md`: TypeScript tool logic, caching module
    implementations.
  - `frontend-specialist.md`: CLI interface rendering using React and Ink for
    the `/visualize` command output.

- **Skills**:
  - `architecture`: For laying out the ASCII Renderer logic securely.
  - `clean-code`: For succinct rendering logic.
  - `tdd-workflow`: Vital due to Constitution Principle III.
  - `testing-patterns`: Implementing Vitest environment mocking and box drawing
    assertions.
  - `nodejs-best-practices`: Proper AST manifest parsing for Node.js
    (`package.json`) architectures.
