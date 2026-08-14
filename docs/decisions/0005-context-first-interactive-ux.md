# ADR 0005: Context-first interactive UX

Status: Accepted

## Context

TRX will often be used under deadlines, interruptions, and fragmented attention.

The interface should reduce the need to remember state.

## Decision

Bare `trx` is a primary interface and context refresher.

It should prominently surface:
- current job
- current state
- progress
- current work unit
- next work unit
- suggested next action

The highlighted menu action should follow state:
- READY → Start next page
- WORKING → Complete page
- PAUSED → Resume
- all complete → Report / Finish

## Consequences

TRX becomes useful as an operational memory aid, not just a logger.
