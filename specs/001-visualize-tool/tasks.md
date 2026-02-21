---
description: 'Task list template for feature implementation'
---

# Tasks: Ubuntu-First ASCII `visualize` Tool

**Input**: Design documents from `/specs/001-visualize-tool/` **Prerequisites**:
plan.md (required), spec.md (required for user stories), research.md,
data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. Since this is an
existing monorepo, setup just involves creating the new file skeletons and
exporting the initial definitions.

- [ ] T001 Define `VISUALIZE_TOOL_NAME` constant in
      `packages/core/src/tools/definitions/base-declarations.ts`
- [ ] T002 Update `CoreToolSet` interface with `visualize: FunctionDeclaration`
      in `packages/core/src/tools/definitions/types.ts`
- [ ] T003 [P] Add visualize schema from `contracts/visualize-schema.json` to
      `packages/core/src/tools/definitions/model-family-sets/default-legacy.ts`
- [ ] T004 [P] Add visualize schema from `contracts/visualize-schema.json` to
      `packages/core/src/tools/definitions/model-family-sets/gemini-3.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can
be implemented.

- [ ] T005 Create deterministic ASCII Renderer test fixtures and unit tests in
      `packages/core/src/tools/visualize/asciiRenderer.test.ts` (TDD RED)
- [ ] T006 Implement base `AsciiRenderer` box-drawing utility in
      `packages/core/src/tools/visualize/asciiRenderer.ts`
- [ ] T007 Create cache persistence logic definition mapping
      `VisualizeCacheEntry` using `config.storage.getProjectTempDir()` in the
      core tool directory.

**Checkpoint**: Foundation ready - basic ASCII rendering utility exists and
caching capability is established.

---

## Phase 3: User Story 1 - Understand Project Architecture Visually (Priority: P1) 🎯 MVP

**Goal**: The LLM can invoke the visualize capability automatically to generate
deterministic architecture diagrams.

**Independent Test**: The tool can be invoked programmatically via tests,
producing a diagram.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Create unit tests for parsing standard visualization
      requests in `packages/core/src/tools/visualize.test.ts`
- [ ] T009 [P] [US1] Create tool skeleton registration validation tests.

### Implementation for User Story 1

- [ ] T010 [US1] Implement `VisualizeTool` class extending standard BaseTool in
      `packages/core/src/tools/visualize.ts`
- [ ] T011 [US1] Integrate `AsciiRenderer` within `VisualizeTool` to parse
      `VisualizationRequest` and output string graph arrays.
- [ ] T012 [US1] Add caching interceptor within `VisualizeTool` leveraging
      `refresh_cache` and `VisualizationRequest` hashes.
- [ ] T013 [US1] Register tool in `createToolRegistry()` within
      `packages/core/src/config/config.ts`.
- [ ] T014 [US1] Export definition in
      `packages/core/src/tools/definitions/coreTools.ts` and
      `ALL_BUILTIN_TOOL_NAMES`.

**Checkpoint**: At this point, the Core Tool is fully registered, testable
programmatically, and generates strings based on AST inputs.

---

## Phase 4: User Story 2 - Explicit Diagram Generation (Priority: P1)

**Goal**: A power user can explicitly run `/visualize` from the CLI.

**Independent Test**: Running `/visualize` in the local terminal invokes the
architecture flow or displays standard help.

### Tests for User Story 2 ⚠️

- [ ] T015 [P] [US2] Create slash command parser tests in
      `packages/cli/src/ui/commands/visualizeCommand.test.ts`

### Implementation for User Story 2

- [ ] T016 [US2] Implement `/visualize` slash command entrypoint in
      `packages/cli/src/ui/commands/visualizeCommand.ts` (Mapping free-form args
      to `VisualizationRequest`).
- [ ] T017 [US2] Register command in the UI loader at
      `packages/cli/src/services/BuiltinCommandLoader.ts`.
- [ ] T018 [US2] Add standard terminal wrap constraints handling to the Ink
      output rendering layer if graph exceeds columns.

**Checkpoint**: Users can hit `/visualize "Auth Flow"` directly and see the
console print standard boxes without markdown mangling.

---

## Phase 5: User Story 3 - Visualizing Code Dependencies (Priority: P2)

**Goal**: The visualizer can specifically parse manifest files (`package.json`,
`requirements.txt`) into directed trees.

**Independent Test**: `/visualize dependencies` outputs a parent-child ASCII
graph in a standard node project folder.

### Tests for User Story 3 ⚠️

- [ ] T019 [P] [US3] Create dependency parsing fixture tests (with/without
      manifests present) in `packages/core/src/tools/visualize.test.ts`.

### Implementation for User Story 3

- [ ] T020 [US3] Implement Node wrapper logic to parse `package.json` into
      `DependencyManifest` interface inside
      `packages/core/src/tools/visualize.ts`.
- [ ] T021 [US3] Implement tree generation translating `DependencyManifest`
      output into `AsciiRenderer`.
- [ ] T022 [US3] Add graceful error strings for missing manifest directories.

**Checkpoint**: The tool natively maps dependencies mechanically without needing
LLM inferences.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T023 [P] Ensure all TS compiler rules pass (`npm run typecheck`).
- [ ] T024 [P] Ensure UI truncation tests pass standard VTE wrapping
      specifications dynamically.
- [ ] T025 Execute `npm run preflight` to run full integration checks before
      commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Modifies root definitions. Immediate priority.
- **Foundational (Phase 2)**: Depends on core schema updates. Must implement
  Renderer before Tool skeleton.
- **User Stories (Phase 3+)**:
  - US1 directly implements the `VisualizeTool` extending phase 2 renderer.
  - US2 builds the user interface to execute US1.
  - US3 iterates on US1's functionality with static parsing logic.
- **Polish (Final Phase)**: Last integration checks.

### Parallel Opportunities

- Definition additions to multiple manifest schemas (T003, T004) can be executed
  concurrently.
- All testing stubs (T005, T008, T015, T019) can be drafted immediately once the
  specification is mapped out.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

Focus initially on `packages/core/src/tools/visualize.ts` and its interface
command `packages/cli/src/ui/commands/visualizeCommand.ts`. The visualizer must
generate a box deterministically and log to the console effectively before
extending feature logic to parse package metadata out-of-the-box (US3).
