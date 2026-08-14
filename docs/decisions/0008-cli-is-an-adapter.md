# ADR 0008: CLI is an adapter, not the domain layer

Status: Accepted

## Context

TRX may later power desktop, web, mobile, and agentic interfaces.

Embedding state transitions and calculations directly in CLI handlers would make reuse difficult.

## Decision

Core domain behavior must live in importable TypeScript modules independent of terminal prompting.

CLI handlers should:
- parse input
- prompt user
- call core functions
- render results

Core modules should contain:
- job state transitions
- page selection
- timer accounting
- reporting calculations
- domain validation

Filesystem behavior should live behind storage modules/adapters.

## Consequences

Phase 0 remains simple while preserving a low-cost path to future interfaces.
