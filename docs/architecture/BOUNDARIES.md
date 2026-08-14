# Architecture Boundaries

## Phase 0 recommendation

Do not start as a monorepo unless implementation remains trivial.

Use one package with clean internal modules.

Suggested:

```text
src/
  core/
    jobs.ts
    pages.ts
    timer.ts
    reporting.ts
    types.ts

  storage/
    local.ts
    discovery.ts
    events.ts

  cli/
    index.ts
    commands/
    ui/
```

Dependency direction:

```text
cli → core
cli → storage adapters

storage adapters → core types

core → no CLI
core → no @clack/prompts
core → ideally no filesystem assumptions
```

This allows future extraction with minimal pain.

## Extraction trigger

Move to a pnpm workspace/monorepo when at least one of these becomes real:

- desktop app needs the same core
- web service needs the same core
- agent service needs the same core
- multiple packages need independent versioning/testing

Potential later structure:

```text
pnpm-workspace.yaml

packages/
  core/
  storage-local/
  analytics/

apps/
  cli/
  desktop/
  web/
```

## Why not monorepo immediately

A monorepo adds:
- workspace configuration
- package boundaries
- build orchestration
- cross-package TypeScript config
- linking concerns

Those costs are small in isolation but unnecessary while the only consumer is the CLI.

Clean internal boundaries provide most of the future flexibility without delaying the live timer.

## Rule

Extract because there is a consumer, not because a future consumer can be imagined.
