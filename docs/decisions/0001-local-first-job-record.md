# ADR 0001: Local-first job record

Status: Accepted

## Context

TRX may eventually have multiple interfaces, but translation work is organized around project directories and their deliverables.

The operational record should remain attached to the job.

## Decision

Each project stores canonical TRX data inside:

```text
.trx/
```

The CLI searches upward from cwd to find the nearest `.trx/`.

Global state may store convenience pointers to recent/current projects but not canonical job data.

## Consequences

Positive:
- portable projects
- simple backups
- easy inspection
- compatible with future aggregation
- independent from any particular UI

Negative:
- aggregation must discover project directories
- moved directories may invalidate global convenience pointers
