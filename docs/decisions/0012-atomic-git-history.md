# ADR 0012: Maintain an atomic, reviewable Git history

Status: Accepted

## Context

TRX is intended to evolve from a small CLI into a larger translation-operations system. Its architecture and behavior will change through dogfooding, extraction, and new interfaces.

A clear Git history makes decisions easier to inspect, revert, cherry-pick, and understand across agents and future contributors.

## Decision

Use Git from project initialization and prefer atomic commits containing one coherent change.

Use descriptive Conventional Commit-style prefixes where practical:

- `plan:`
- `docs:`
- `adr:`
- `chore:`
- `feat:`
- `fix:`
- `test:`
- `refactor:`
- `perf:`

Planning, documentation, and ADR changes may be committed independently from implementation when they form coherent changes.

Agents must inspect status/diffs before committing and must not include real client data, local `.trx/` records, secrets, or unrelated user changes.

Destructive history operations and rewriting user-authored commits require explicit user instruction.

## Consequences

Positive:
- easier review and rollback
- architecture decisions remain visible in history
- future agents can understand project evolution
- individual capabilities can be cherry-picked or reverted

Negative:
- requires modest discipline during rapid development

For urgent dogfooding milestones, atomicity should remain practical rather than ceremonial.
