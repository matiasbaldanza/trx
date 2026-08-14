# ADR 0002: Events are primary; metrics are derived

Status: Accepted

## Context

TRX needs reliable timing now and richer analytics later.

Final totals alone would discard history needed for correction, auditing, and future analysis.

## Decision

Use append-oriented JSONL events as durable activity history where practical.

Possible events:
- job_initialized
- page_started
- timer_paused
- timer_resumed
- page_completed
- metadata_updated
- job_finished
- job_reopened

Reports derive metrics from recorded facts/events.

A small mutable state cache is allowed for UX.

## Consequences

Positive:
- auditable history
- richer future analytics
- schema can evolve
- corrections can retain provenance

Negative:
- modestly more complexity than one mutable JSON file
