# ADR 0009: Delay monorepo until a second real consumer exists

Status: Accepted

## Context

TRX may later include CLI, desktop, web, mobile, and agent services.

A monorepo is a plausible future structure, but the current deadline requires a working CLI immediately.

## Decision

Phase 0 uses a single package with clean internal module boundaries.

Adopt a pnpm workspace/monorepo when a second real consumer needs shared code.

Likely future shape:

```text
packages/
  core/
  storage-local/
  analytics/

apps/
  cli/
  desktop/
  web/
```

## Consequences

We avoid premature workspace overhead while keeping extraction straightforward.
