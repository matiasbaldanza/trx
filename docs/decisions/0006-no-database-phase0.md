# ADR 0006: No database in Phase 0

Status: Accepted

## Decision

Use JSON/JSONL only.

Do not introduce SQLite, ORM layers, remote persistence, or cloud synchronization for the first timer/logger release.

## Reason

The immediate acceptance test is a live paid translation job. Simplicity and inspectability are more valuable than infrastructure.
