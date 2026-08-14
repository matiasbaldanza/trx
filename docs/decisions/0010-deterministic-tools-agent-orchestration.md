# ADR 0010: Deterministic tools under agent orchestration

Status: Accepted

## Context

TRX aims to become agentic, but many translation operations are deterministic and should not depend on model variability.

## Decision

Prefer deterministic code for reproducible operations such as:
- page counting
- blank detection
- file operations
- timers
- calculations
- naming
- checksums
- structured QA checks

Use models/agents for:
- language translation
- classification
- interpretation
- ambiguity
- terminology judgment
- communication drafting
- semantic review

Agents should orchestrate tools and record results.

## Consequences

The future system remains more reliable, testable, and auditable.
