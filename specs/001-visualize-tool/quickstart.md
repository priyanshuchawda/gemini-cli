# Quickstart: Visualize Tool Development

## Overview

This guides developers iteratively validating the ASCII `/visualize` tool
capability.

### Prerequisites

Since this heavily leverages terminal layout manipulation (Ink module
dependencies) alongside strict package environments, ensure you follow Monorepo
principles closely:

1. `npm ci`
2. `npm run build:all`

### Local Development Flow

To validate and manually execute changes locally during iterative
implementations:

1. In one terminal, automatically compile backend changes:
   `npm run build --workspace @google/gemini-cli-core -w`

2. Re-open terminal session or run the main CLI tool explicitly to hit the
   registered tool endpoints (the built binary output is natively tied to your
   source via workspaces): `/path/to/bin/gemini /visualize dependencies`

### Validation Checklist

Before finalizing feature tests or requesting commits:

- Run explicit Vitest checks locally. Target your snapshot assertions:
  `npm test -w @google/gemini-cli-core -- visualize`
- Do NOT test structural/integration issues dynamically before writing fixtures.
  The Constitution requires TDD flow (Red-Green-Refactor) against expected
  deterministic ASCII graphs immediately.
- Ensure all final validations pass by executing **`npm run preflight`** from
  root to check strict Typescript compiler typings alongside Google's Lint
  requirements.
