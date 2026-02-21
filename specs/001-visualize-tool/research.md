# Research & Decisions - Visualize Tool

## Agent & Skill Selection

**Decision**: The project utilizes a strict `.agent` routing protocol. Based on
the requirements, we've identified the necessary active agents:

1. `backend-specialist`: Writing the core plugin logic, AST manifest parsing,
   and schema declaration in TypeScript.
2. `frontend-specialist`: React / Ink integration for `/visualize` command
   execution in `packages/cli`.
3. `project-planner`: Managing the milestone structure and TDD flow checklist.

**Skills Involved**:

- `clean-code`: Critical constraint to maintain minimal footprint in the
  `gemini-cli` framework.
- `tdd-workflow` / `testing-patterns`: Necessary to test snapshot ASCII
  box-drawings deterministically without complex external dependencies.
- `bash-linux`: Validating standard ANSI rendering explicitly for the Ubuntu
  target terminal emulator.

## Caching Strategy

**Decision**: Implement disk-based hash map caching tying LLM invocation
arguments or local dependency file states (i.e. `package.json`,
`requirements.txt` stats) to generated ASCII blocks. **Rationale**: Saves
explicit user money by omitting redundant Model API calls if the underlying
codebase dependencies or the exact layout request haven't changed. Cache resides
securely in the temp directory managed securely by `config.storage`.

## Dependency Resolution

**Decision**: Initial rollout focuses squarely on explicit standard Node context
and Python manifest text files before expanding iteratively to AST tree walking.
**Rationale**: Adhering to the Constitution's "Step-by-Step Verification"
guideline prevents unbounded scope creep. No heavy dependencies like canvas or
Puppeteer are permitted.
