# memory-bridge

**Cross-harness project memory for AI coding agents.**

Memory Bridge transforms project context into versioned, human-readable files stored in the repo. Switch between OpenCode, Antigravity, Claude Code, Codex — `.memory/` stays. It travels with Git. It's auditable. It belongs to the project, not to any single agent harness.

```
                    ┌─────────────────────────┐
                    │   NEUTRAL MEMORY        │
                    │   .memory/              │
                    │   (Markdown + JSON)     │
                    └───────────┬─────────────┘
                                │
            ┌───────────┬───────┴───────┬───────────┐
            │           │               │           │
       ┌────▼───┐  ┌────▼────┐   ┌──────▼───┐  ┌────▼───┐
       │OpenCode│  │Antigrav.│   │Claude    │  │ Codex  │
       │plugin  │  │.gemini/ │   │Code (v2) │  │(v2)    │
       └────────┘  └─────────┘   └──────────┘  └────────┘
        read/write  read via      planned       planned
                    sync
```

## The problem

Every agent harness stores memory in its own format — OpenCode plugins use local vector DBs, Claude Code uses `CLAUDE.md`, Antigravity uses `.gemini/`. They don't talk to each other.

Build 3 hours of context in OpenCode, then open the same project in Antigravity: **zero memory carried over.** You start from scratch. Context dies trapped in the harness that created it.

## The solution

A **neutral memory layer** outside any harness, versioned in the repo. Any agent working on the project reads the same base. A decision made in OpenCode is available when you open Antigravity. Context survives tool switches.

This is the **Git for agent memory** — a shared format that every tool understands.


## Store layout

```
.memory/
├── entries/              # explicit memories, markdown with frontmatter
│   └── 20260730-0001-*.md
├── decisions/            # optional ADR mirror
├── conventions.md        # human-maintained conventions
├── context.md            # context not in the source code itself
├── preferences.md        # user/team preferences
└── index.json            # searchable metadata index
```

`index.json` tracks every entry with `id`, `type`, `tags`, `summary`, `createdAt`, `updatedAt`, `source`, and `path`. Markdown remains the canonical readable format. No cloud, no embeddings, no vector DB, no automatic capture — memory is explicit and under version control.

## Installation

```bash
git clone <repo>
cd memory-bridge
npm install
npm run build
npm link                  # makes `memory-bridge` available globally
```

### OpenCode plugin

Add to your OpenCode config:

```json
{ "plugin": ["file:///absolute/path/to/memory-bridge/dist/index.js"] }
```

The plugin exposes tools `remember(text, tags?)` and `memory_search(query)`, and injects project memory into the first message of every session.

## Usage

### CLI

```bash
# Add a memory
memory-bridge add "This service has no NAT and uses public IP" --tag infra --tag network

# Add with flags before text (now works)
memory-bridge add --tag terraform --tag aws "Always pin provider versions"

# Search by text or tag
memory-bridge search NAT
memory-bridge search terraform aws

# List all memories
memory-bridge list

# Show full status (memory dump)
memory-bridge status

# Project to Antigravity format
memory-bridge sync --to antigravity     # writes .gemini/memory-bridge.md

# Project to OpenCode format
memory-bridge sync --to opencode        # writes .opencode/memory-bridge.md
```

### OpenCode tools (when plugin is loaded)

| Tool | Description |
|------|-------------|
| `remember(text, tags?)` | Records explicit memory with `source: opencode`. Rejects exact duplicates. |
| `memory_search(query)` | Searches `.memory/` index by text/tag. Case-insensitive. |

The plugin automatically injects project memory into session context on the first user message — the agent sees your conventions, context, and past decisions from the start.

### Antigravity integration

```bash
memory-bridge sync --to antigravity
```

Produces `.gemini/memory-bridge.md`. Configure your Antigravity project instructions to read this file. Never edit the generated file — it's a read-only projection. Edit `.memory/` and re-sync.

## Conflict rules

- The canonical store (`.memory/`) is **never overwritten** by generated projections or reverse syncs.
- `memory-bridge add` rejects exact duplicate text with an explicit error.
- Lock-based concurrency protection prevents race conditions in `addMemory`.
- Future reverse adapters must preserve origin timestamps and warn on conflict.

## Validation

```bash
npm test                    # 4 tests: storage, dedup, antigravity sync, opencode sync
npm run typecheck           # strict TypeScript, zero errors
npm pack --dry-run          # verify package contents
```

## Design principles

1. **Neutral format** — Markdown + JSON, readable by humans and any harness
2. **Versioned** — lives in the repo, travels with Git, auditable via diff
3. **Explicit** — nothing is captured automatically; you control what the agent "remembers"
4. **Local-first** — no cloud dependency, no third-party service, no lock-in
5. **Portable** — change harness, keep context. Same principle as ADRs

## Roadmap

- [x] Core store (entries, index, CRUD)
- [x] OpenCode plugin (tools + auto-inject)
- [x] Antigravity adapter (`.gemini/` projection)
- [x] OpenCode adapter (`.opencode/` projection)
- [x] Lock-based concurrency protection
- [ ] Claude Code adapter (bidirectional)
- [ ] Codex adapter
- [ ] Reverse sync (harness → `.memory/`)
- [ ] Optional semantic search (embedding)
