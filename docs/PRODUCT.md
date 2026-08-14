# Product Direction

## Product thesis

TRX is a translation-operations system intended to reduce manual coordination, improve consistency, capture operational data, and progressively automate translation workflows.

The system should grow from real paid work rather than from speculative platform design.

## Primary loop

```text
receive files
→ analyze
→ quote
→ client approval
→ produce translations
→ QA
→ assemble deliverables
→ deliver
→ analyze performance/profitability
→ improve future quoting/workflow
```

Each stage should produce structured artifacts that later stages can consume.

## Deterministic vs agentic boundary

Use deterministic tools for operations that should be reproducible.

Use models/agents where interpretation, language, ambiguity, or judgment are genuinely needed.

This distinction is central to system trustworthiness.

## Job record as the center

A TRX job should eventually become the canonical operational record for:

- source files
- page/document manifest
- languages
- country/jurisdiction
- quote
- client-approved scope
- production timing
- translation state
- QA results
- delivery state
- financial outcome
- postmortem metrics

The CLI timer is the first producer of this job record.

## User experience principle

TRX should reduce cognitive load.

The system should always make current context recoverable.

Every interface should prioritize:
- current job
- current stage
- current work unit
- completed work
- next work unit
- next recommended action

This is especially important during fragmented, interrupted, or high-pressure work.

## Page/document metadata

Potential dimensions:

### Source format
- native
- scanned
- mixed

### Document type
Examples:
- birth_certificate
- marriage_certificate
- bank_statement
- tax_registration_certificate
- apostille
- power_of_attorney
- deed_of_donation
- shareholders_meeting_minutes

### Content category
Examples:
- vital_record
- financial
- tax
- legal_notarial
- legal_corporate
- academic
- court_judicial
- immigration

### Geography
- country
- optional region/state/province
- optional locality later

Defaults should inherit downward.

## Performance metrics

Primary:
- active seconds/page
- total active time
- pages/hour
- average minutes/page
- median minutes/page

Economic:
- quoted revenue
- net factor
- actual proceeds later
- effective hourly rate

Future:
- admin time
- QA time
- revision/rework time
- delivery time
- AI-assisted vs manual
- page density
- complexity
- channel/client/platform economics

## Data quality principle

Measured facts must remain separate from derived metrics.

Direct measurements must remain distinguishable from reconstructed estimates.

## Historical reconstruction

Future versions may ingest or reconstruct:
- manual Excel timesheets
- filesystem creation/modification timestamps
- platform order timestamps
- manual estimates

Every reconstructed observation should store:
- method
- source
- confidence

## Privacy boundary

The TRX source code may be public, while real translation jobs remain private.

Client source documents, translated documents, raw job telemetry, and identifying metadata must not be required inside the source repository.

Operational logging should follow data minimization: capture what is needed for workflow and analytics without storing document contents by default.

Future features that send job data to external services must make that boundary explicit.

