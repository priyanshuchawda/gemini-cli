# Plan: Ubuntu-First ASCII `visualize` Tool (Minimal-Change Rollout)

## Summary

We will deliver this in small, testable milestones with minimal repo churn:

1. Add a new built-in core tool `visualize` that the model can call
   automatically.
2. Keep rendering ASCII/ANSI-only for Ubuntu terminals in v1 (no image protocols
   yet).
3. Implement v1 generators for architecture diagrams and dependency graphs.
4. Add `/visualize` slash command as explicit UX, while preserving auto
   tool-call behavior.
5. Integrate lightweight "explain architecture" prompting via tool description
   and command helper text (not fragile hard-coded intent routing).
6. Add caching and focused tests at each step.

This matches your constraints: careful changes, Ubuntu-first, step-by-step
verification, and minimal code changes.

## Important API / Interface Changes

1. Add new core tool name constant:

- `packages/core/src/tools/definitions/base-declarations.ts`
- New constant: `VISUALIZE_TOOL_NAME = 'visualize'`.

2. Extend tool declaration interfaces:

- `packages/core/src/tools/definitions/types.ts`
- Add `visualize: FunctionDeclaration` to `CoreToolSet`.

3. Add visualize declaration in both model-family manifests:

- `packages/core/src/tools/definitions/model-family-sets/default-legacy.ts`
- `packages/core/src/tools/definitions/model-family-sets/gemini-3.ts`
- Schema (v1):
  - `intent` (`architecture` | `dependency`)
  - `prompt` (string, required)
  - `targets` (string[], optional)
  - `diagram_type` (`flowchart` | `sequence` | `class` | `auto`, optional)
  - `max_nodes` (number, optional)
  - `refresh_cache` (boolean, optional)

4. Export definition + name through existing tool-definition facade:

- `packages/core/src/tools/definitions/coreTools.ts`
- `packages/core/src/tools/tool-names.ts`
- Add to `ALL_BUILTIN_TOOL_NAMES`.
- Do not add to `PLAN_MODE_TOOLS` yet unless we explicitly want it in strict
  plan-mode tool allowlist.

5. Add new tool implementation:

- `packages/core/src/tools/visualize.ts`
- Register in `Config.createToolRegistry()`:
  - `packages/core/src/config/config.ts`

6. Add slash command entrypoint:

- `packages/cli/src/ui/commands/visualizeCommand.ts`
- Register in loader:
  - `packages/cli/src/services/BuiltinCommandLoader.ts`

No breaking changes to existing command/tool signatures.

## Implementation Chat (Decision-Complete Build Plan)

## Milestone 0: Guardrails and Fixtures

1. Add snapshot fixtures for expected ASCII outputs:

- `packages/core/src/tools/__snapshots__/visualize.test.ts.snap` (created by
  tests).

2. Add test fixture repos/files for dependency parsing:

- use temporary in-test files (no global fixture sprawl).

Gate:

- `npm run test --workspace @google/gemini-cli-core -- visualize`
- Must pass before moving on.

## Milestone 1: Core Tool Skeleton and Registration

1. Create `VisualizeTool` with `Kind.Other`, output markdown disabled
   (`isOutputMarkdown = false`) so ASCII spacing is preserved.
2. Implement tool invocation flow:

- Validate workspace paths.
- Parse params.
- Route to generator (`architecture` or `dependency`).

3. Register tool in `createToolRegistry()` via `maybeRegister(...)`.
4. Add tool declaration exports and tool-name list wiring.

Gate:

- Unit tests for schema + registration + name validation.
- `coreTools` snapshot tests updated and passing.

## Milestone 2: ASCII Architecture Generator (Ubuntu v1)

1. Add a small renderer module:

- `packages/core/src/tools/visualize/asciiRenderer.ts`
- Deterministic box-drawing output with width constraints (80-col baseline).

2. Architecture pipeline:

- Input: prompt + optional targets.
- Context collection: read selected files (or prompt-only when targets empty).
- Generation strategy v1:
  - Ask internal Gemini utility call for structured node/edge JSON (not
    free-form ASCII).
  - Render JSON to deterministic ASCII via renderer.

3. Diagram types supported in v1:

- `flowchart`, `sequence`, `class`, `auto`.
- `auto` resolves from prompt hints.

4. Return format:

- `returnDisplay`: pure ASCII diagram + short legend.
- `llmContent`: compact textual summary + same semantic structure.

Gate:

- Golden tests for all 4 types.
- Width wrapping test.
- Empty/invalid graph graceful output test.

## Milestone 3: Dependency Graph Generator (v1 scope)

1. Implement dependency source adapters:

- Node: `package.json`
- Python: `requirements.txt` (basic pinned/spec lines)

2. Build adjacency graph and render ASCII tree/graph.
3. Respect `targets` when passed; otherwise auto-detect from repo root.

Gate:

- Unit tests for:
  - package.json only
  - requirements.txt only
  - both present
  - no manifest found (clear error message)

## Milestone 4: Caching Layer

1. Cache key inputs:

- tool version
- intent
- prompt
- normalized targets
- diagram_type
- relevant file fingerprints (mtime + size) for manifest/target files

2. Storage path:

- use project temp dir via existing storage
  (`config.storage.getProjectTempDir()`), e.g. `.../visualize-cache/`.

3. Cache behavior:

- hit: return cached ASCII instantly
- miss: generate + persist
- `refresh_cache=true` bypasses read and overwrites

Gate:

- tests for hit/miss/invalidation and refresh flag.

## Milestone 5: `/visualize` Slash Command + Explain UX Hook

1. Add `/visualize` command:

- Accept free-form args, map to tool params (`intent` default `architecture`).
- Add clear usage text and examples.

2. Register command in builtins loader.
3. "Explain architecture" integration (safe/minimal):

- No brittle keyword router in core scheduler.
- Improve tool declaration description so model naturally calls `visualize` when
  user asks to explain/diagram architecture.
- `/visualize` gives explicit deterministic path for users.

Gate:

- slash command tests for parsing and dispatch.
- integration test proving command produces tool-group output.

## Milestone 6: CLI Rendering and UX Polish (still ASCII-only)

1. Keep existing `ToolResultDisplay` path unchanged by returning plain string
   output.
2. Ensure box characters display correctly on Ubuntu VTE (`xterm-256color`,
   truecolor).
3. Add truncation-friendly formatting for very large diagrams.

Gate:

- UI snapshot tests for tool output display.
- manual smoke in current Ubuntu terminal.

## Test Cases and Scenarios

1. Tool registration and schema exposure:

- `tool-registry`, `tool-names`, `coreTools` snapshot coverage.

2. Architecture outputs:

- flowchart/sequence/class/auto deterministic snapshots.
- malformed model JSON fallback path.

3. Dependency outputs:

- Node and Python manifests.
- missing manifest handling.

4. Caching:

- stable hash generation.
- invalidation on file changes.
- forced refresh.

5. Slash command:

- `/visualize "auth flow"` routes and renders.

6. End-to-end CLI behavior:

- tool call appears in history with readable ASCII.
- no markdown mangling.

7. Non-regression:

- existing tool rendering snapshots unchanged.

## Assumptions and Defaults

1. Platform target now: Ubuntu terminal (current env indicates
   VTE/xterm-256color, no Kitty/iTerm image protocol available).
2. v1 output is ASCII/ANSI only; image protocols are explicitly deferred.
3. v1 includes architecture + dependency graphs only; git history visualization
   is phase 2.
4. Auto tool usage is driven by tool schema/description quality plus normal
   model tool selection behavior.
5. No heavy new rendering dependencies in v1 (no Puppeteer/node-canvas/Sharp
   required for milestone 1 release).
6. Keep mutation scope minimal: mostly `packages/core/src/tools/*`, definitions,
   and one new slash command.
