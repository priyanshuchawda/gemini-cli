# Data Model - Visualize Tool

## Core Entities

### 1. VisualizationRequest

- `intent`: Enum `'architecture' | 'dependency'`
- `prompt`: String (Context or specific subgraph parameters)
- `targets`: Array of Strings (Optional file paths or directories)
- `diagram_type`: Enum `'flowchart' | 'sequence' | 'class' | 'auto'` (Optional)
- `max_nodes`: Number (Rate limiter on recursion)
- `refresh_cache`: Boolean

### 2. VisualizeCacheEntry

- `hash`: String (Deterministic key constructed from `VisualizationRequest` and
  specific disk file states)
- `ascii_diagram`: String (Rendered raw Output payload)
- `timestamp`: Number (Unix generation time)

### 3. DependencyManifest

- `type`: `'npm' | 'python_requirements'`
- `tree`: Nested Object/Dictionary mapping parent to child string arrays

## Data Flow

- LLM or User `/visualize` command populates `VisualizationRequest`.
- Core routing checks standard Ephemeral Temp Storage for deterministic
  `VisualizeCacheEntry` using a computed hash.
- If a cache hit happens, `ascii_diagram` is pushed instantly.
- If a cache miss happens:
  - If `intent` is `dependency`, parse `DependencyManifest` off disk.
  - If `intent` is `architecture`, query tool context for the current workspace
    and invoke ASCII rendering node pipeline.
- Save `ascii_diagram` and `timestamp` as new `VisualizeCacheEntry` and output
  to CLI rendering window.
