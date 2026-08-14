# TRX Roadmap

## North star

Progressively agenticize the translation workflow while keeping deterministic operations deterministic and preserving structured data for analysis.

The roadmap should be driven by dogfooding on real work.

---

## Phase 0 — Work timer + durable log

### Goal

Use TRX immediately during paid translation work.

### Deliverables

- TypeScript CLI
- pnpm global link
- project-local `.trx/`
- job metadata
- manifest of billable physical PDF pages
- page/work-unit timing
- pause/resume
- page completion
- status/current/next
- basic report
- interactive bare `trx`
- clear next-action/context UX
- importable core logic
- durable versioned events

### Explicit non-goals

- OCR
- PDF parsing
- AI translation integration
- quote generation
- historical imports
- dashboards
- central database
- web/desktop UI

### Exit condition

It survives a real paid job and produces data worth keeping.

---

## Phase 0.1 — Dogfood friction fixes

Only fix problems observed in actual use.

Likely candidates:
- faster transitions between pages
- correcting accidental completion
- metadata editing
- skipping non-billable pages
- better progress/context display
- reduced prompts
- robust interruption handling
- autosuggest next action

Do not add roadmap features merely because they are interesting.

---

## Phase 1 — Core extraction

### Trigger

A second real interface or consumer appears.

Examples:
- desktop app
- service/API
- test harness
- background agent
- web app

### Goal

Extract reusable logic without changing behavior.

Potential structure:

```text
packages/
  core/
  storage-local/

apps/
  cli/
```

Later:

```text
apps/
  desktop/
  web/
  mobile/
```

### Core responsibilities

- job state
- manifests
- page/work-unit state
- timing
- event schema
- reporting calculations
- domain types
- validation

### Adapter responsibilities

- CLI prompts
- filesystem storage
- future GUI
- future HTTP/API
- future agent orchestration

Do not extract merely for aesthetics.

---

## Phase 2 — Aggregation + export

### Goal

Combine many project-local `.trx/` records into a normalized dataset.

Potential commands:

```bash
trx aggregate PATH
trx export --format csv
```

Potential dimensions:

```text
job_id
project_path
page
document_type
content_category
source_format
country
region
active_seconds
quoted_revenue
net_revenue
measurement_method
measurement_confidence
```

### Questions enabled

- Which document types take longest?
- Which source formats are least profitable?
- Which jurisdictions create more overhead?
- How many pages/hour are realistic?
- Where does flat-rate pricing fail?

---

## Phase 3 — Historical postmortem / reconstruction

### Goal

Use old work to enrich the dataset.

Potential sources:
- manual Excel timesheets
- filesystem timestamps
- platform/order timestamps
- manual estimates

Potential workflows:

```bash
trx import timesheet.xlsx
trx reconstruct ./old-project
```

### Rule

Never present reconstructed estimates as direct measurements.

Store provenance and confidence.

---

## Phase 4 — Intake + document analysis

### Goal

Turn incoming files into a structured job/manifest.

Potential deterministic tools:
- PDF page count
- image extraction
- blank-page detection
- text-layer detection
- checksums
- splitting/merging

Potential model-assisted operations:
- document identification
- country/jurisdiction detection
- document grouping
- content category
- document descriptions

### Output

A structured manifest suitable for quoting and production.

---

## Phase 5 — Quoting + profitability prediction

### Goal

Use:
- manifest
- current pricing rules
- historical timing
- historical profitability

to generate better quotes.

Potential output:
- billable page count
- document list
- expected production time
- expected difficulty
- base quote
- risk adjustment
- expected hourly return
- client-facing quote text

This is where the data produced by Phase 0 starts materially improving business decisions.

---

## Phase 6 — Translation production assistance

### Goal

Coordinate translation work page/document by page/document.

Potential capabilities:
- translation prompts/workflows
- terminology memory
- repeated-field consistency
- stamps/seals/handwriting handling
- structured source/target pairing
- confidence flags
- human review checkpoints

The system should preserve the human translator as the accountable reviewer.

---

## Phase 7 — QA + deterministic checks

Potential checks:
- source/target page count
- omission detection
- repeated proper names
- dates/numbers consistency
- required stamps/signatures represented
- formatting expectations
- certification presence
- file naming
- deliverable completeness

Models may review semantics; deterministic code should handle reproducible checks.

---

## Phase 8 — Deliverables + communication

Potential capabilities:
- assemble translation + source
- affidavit/certification generation
- predictable naming
- packaging
- delivery manifests
- client messages
- revision tracking

---

## Phase 9 — Multi-interface TRX

Possible interfaces:
- CLI
- desktop
- web
- mobile companion

Likely architecture:

```text
packages/
  core/
  analytics/
  storage/
  document-tools/
  agent-tools/

apps/
  cli/
  desktop/
  web/
  mobile/
```

Do not commit to this structure until real consumers require it.

---

## Phase 10 — Agentic service

### Goal

TRX can orchestrate translation jobs using:
- deterministic tools
- agent/model capabilities
- human approval gates
- structured job state
- historical analytics

Potential agent loop:

```text
inspect job state
→ determine next safe action
→ call deterministic/model tool
→ record result
→ request human review where needed
→ continue
```

The service should remain inspectable and auditable.

---

## Development rule

Every phase should answer:

> What real paid workflow problem does this solve now?

If the answer is unclear, defer it.
