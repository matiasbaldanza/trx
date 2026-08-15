# TRX

TRX is a local-first translation operations system.

The long-term goal is to agenticize translation work by combining deterministic tools, model-assisted reasoning, structured job records, and analytics.

The first version is intentionally much smaller:

> a reliable page-by-page timer and logger that can be used on paid work immediately.

## Why start with logging

Before automating pricing, quoting, translation, QA, or delivery, TRX needs reliable operational data.

The first questions are basic:

- How long does each page actually take?
- Which document types are expensive?
- How much slower are scans?
- What is the real effective hourly rate?
- Which flat per-page prices are profitable?
- Where does human time go?

The output of Phase 0 should become input to later quoting, performance, and agentic workflows.

## Long-term shape

TRX may eventually support:

```text
INTAKE
  inspect documents
  identify language
  identify country/jurisdiction
  classify documents
  detect blank/non-billable pages

QUOTE
  build page/document manifest
  estimate production effort
  generate quote
  estimate profitability
  prepare client communication

PRODUCTION
  translate
  track terminology
  log active time
  retain structured page metadata

QA
  completeness checks
  formatting checks
  terminology consistency
  stamps/signatures/handwriting review

DELIVERY
  assemble files
  certification/affidavit workflow
  naming/package checks
  delivery manifest
  client communication

ANALYTICS
  throughput
  profitability
  document-type performance
  country/jurisdiction performance
  scan/native impact
  rework
  pricing recommendations
```

TRX should use deterministic code for deterministic operations and agents/models for interpretation, reasoning, and language work.

## Interfaces

The CLI is the first interface, not the permanent architecture.

Future interfaces may include:
- desktop app
- web app
- mobile companion
- agent/service API

Core logic should therefore remain importable and independent of terminal UI.

## Architecture strategy

Do **not** start with a heavy monorepo.

Phase 0 can use one package with clear internal boundaries:

```text
src/
  core/
  storage/
  cli/
```

When a second real consumer appears, extract:

```text
packages/
  core/
  storage-local/

apps/
  cli/
  desktop/
  web/
```

This avoids premature workspace complexity while keeping the path open.

## Core workflow — Phase 0

```bash
trx init
trx start
# translate
trx done
trx start
# translate
trx done
trx report
trx finish
```

Or:

```bash
trx
```

Bare `trx` is a primary interactive/context interface.

## ADHD-friendly operational UX

TRX should minimize working-memory requirements.

When opened, it should quickly answer:

```text
Where am I?
What am I working on?
What did I just finish?
What is next?
What should I do now?
```

The tool should not expect the user to remember the job state.

Example:

```text
TRX — #SYN-ES-EN-AR-001
ES → EN · Argentina

Progress: 7 / 25
Current: none

NEXT
Page 9 — Notarial Certification

❯ Start next page
  View status
  View report
  Quit
```

## Local storage

Each translation project owns its records:

```text
project/
└── .trx/
    ├── job.json
    ├── manifest.json
    ├── events.jsonl
    └── state.json
```

Running `trx` from a nested directory should walk upward until it finds `.trx/`.

## Phase 0 commands

```text
trx
trx init
trx status
trx current
trx next
trx start [page]
trx pause
trx resume
trx done
trx report
trx finish
trx reopen
```

`trx done` completes the current page.

`trx finish` closes the entire job.

## Installation during development

Run these commands from the TRX development repository:

```bash
pnpm install
pnpm setup --force
```

`pnpm setup --force` is pnpm’s machine-level setup. Open a new terminal after it completes, then register the current development checkout globally:

```bash
pnpm run global:install
```

You can run the install or uninstall scripts from any directory by pointing pnpm at the development repository:

```bash
pnpm --dir "/path/to/trx" run global:install
pnpm --dir "/path/to/trx" run global:uninstall
```

Then, from any translation project:

```bash
trx
```

The global command points at the development checkout. After TypeScript changes, run `pnpm run global:install` (or `pnpm build`) to rebuild `dist/`; re-registration is not normally required. Re-register if the global link was uninstalled, the package `bin` path changed, or the checkout moved.

## Data as an asset

TRX project records are designed to aggregate later.

Future analysis should be able to compare:

```text
country
region
document type
content category
source format
active time
quoted revenue
actual net revenue
pages/hour
effective hourly rate
AI-assisted vs manual
rework/revisions
```

Historical projects may later be reconstructed from:
- Excel timesheets
- filesystem timestamps
- platform timestamps
- manual estimates

Reconstructed records must preserve provenance and confidence.

## Current dogfood target

```text
Job ID: SYN-ES-EN-AR-001
ES → EN
Default country: AR
25 billable pages
Quoted: USD 250
Net factor before other fees: 0.80
```

The first milestone is not a complete agentic translation platform.

It is:

> Use TRX on this live job without slowing the translation down.

## Public repo, private jobs

The TRX codebase can be public.

Real client work must remain outside the source repository. Project-local `.trx/` data is private by default and must not be committed.

Tests and examples use synthetic data only.

When TRX initializes a job, it should create:

```text
.trx/.gitignore
```

with:

```gitignore
*
!.gitignore
```

Future analytics exports are private by default; anything intended for public sharing must be explicitly anonymized.

See `docs/PRIVACY.md` and ADR 0011.

## Authorship and LLM usage

TRX is built by [Matias Baldanza](https://github.com/matiasbaldanza) ([X](https://x.com/matiasbaldanza)). Language models assist with drafting; they are not commit co-authors.

See [LLM usage](docs/LLM-USAGE.md).
