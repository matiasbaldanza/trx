# ADR 0011: Public codebase, private job data

Status: Accepted

## Context

TRX is intended to be suitable for development in a public repository.

Real translation jobs may contain highly sensitive client documents and metadata, including names, addresses, account information, immigration records, legal records, financial records, and other personal information.

The TRX source repository must remain cleanly separated from client/job data.

## Decision

The TRX application source, documentation, tests, ADRs, and synthetic examples may live in a public repository.

Canonical real-job data remains inside the translation project's local `.trx/` directory and is private by default.

The public repository must never contain:

- real client documents
- real translated documents
- real client names
- real order/job identifiers
- source filenames copied from client work
- account numbers or other document identifiers
- client messages
- raw `.trx/` logs from real jobs
- screenshots containing client information
- fixtures derived from real client documents unless fully synthetic and non-identifying

Tests, demos, examples, snapshots, and documentation must use synthetic data.

## Repository protections

The TRX repository must ignore:

```gitignore
.trx/
*.trx-export.*
```

When TRX initializes a job directory, it should also create:

```text
.trx/.gitignore
```

with:

```gitignore
*
!.gitignore
```

This protects job data even when the surrounding translation project is itself a Git repository.

The CLI should not overwrite an existing `.trx/.gitignore` without a clear reason.

## Logging rule

Operational logs should contain only the metadata needed for workflow and analytics.

Do not log source or translated document contents by default.

Do not store secrets, authentication tokens, or API keys inside `.trx/` job records.

## Analytics and exports

Aggregated or exported data is private by default.

Future public/research export functionality should require an explicit anonymization/sanitization mode and should omit identifying fields such as:

- client names
- raw job/order identifiers
- local filesystem paths
- source filenames
- document contents
- translated contents
- account/reference numbers
- free-text notes that may contain client information

An anonymized analytical record may retain non-identifying operational dimensions such as:

- country/jurisdiction
- document type
- content category
- source format
- active seconds
- page counts
- quoted rate
- profitability metrics

Anonymization should be explicit rather than assumed.

## Incident prevention principle

If an agent or developer needs a reproduction fixture for a bug discovered on a real job, create a minimal synthetic reproduction rather than copying the client's actual log or source material into the repository.

## Consequences

Positive:
- TRX can be developed openly
- real client data remains locally isolated
- accidental commits become less likely
- future analytics can still be shared safely through explicit sanitization

Negative:
- developers must create synthetic fixtures instead of copying real job records
- debugging some client-specific edge cases may require local-only reproduction
