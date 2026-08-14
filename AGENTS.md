# AGENTS.md — TRX

## Mission

Build `trx`, a local-first translation operations system that gradually agenticizes real translation work.

TRX is not just a timer and not just a CLI.

The long-term product may include:
- CLI
- desktop app
- web app
- mobile companion
- agentic workflows
- deterministic tools
- analytics
- reusable/importable core logic

The immediate goal is much smaller:

> Build a reliable, low-friction timer/logger that can be dogfooded on a live paid translation job now.

The data produced by this first version must be useful later as input to the larger TRX system.

## Core product idea

TRX should combine:

### Deterministic operations
Examples:
- PDF/page counting
- blank-page detection
- file splitting/merging
- image extraction
- timers
- timestamps
- page manifests
- pricing formulas
- checksums
- output naming
- QA checks
- logging
- analytics
- packaging deliverables

### Model/agent operations
Examples:
- document identification
- country/jurisdiction identification
- translation
- handwriting interpretation
- stamp/seal interpretation
- terminology decisions
- quote descriptions
- QA/review
- client communication
- exception handling

Principle:

> Agents orchestrate tools; agents should not pretend to be deterministic tools when deterministic logic is available.

## Immediate delivery constraint

Phase 0 must be small enough to build, test, globally link, and use immediately.

Do not expand scope before the basic timer/logger works.

The first live job is the acceptance test.

## ADHD / context principle

The user benefits from strong context recovery and explicit next actions.

TRX should behave like an operational copilot, not a silent logger.

Whenever practical, commands and menus should answer:

1. Where am I?
2. What am I working on?
3. What did I just finish?
4. What is next?
5. What single action should I take now?

Avoid dumping long menus or requiring the user to remember state.

Prefer:
- clear current job name/id
- current page/work unit
- progress
- elapsed active time
- next page
- suggested next command/action

Example after `trx done`:

```text
✓ Page 8 completed — 08:42

Progress: 7 / 25

NEXT
Page 9 — Notarial Certification

Run:
  trx start
```

Bare `trx` should act as a fast context refresher.

## Architecture principle

Business logic must not live inside CLI handlers.

The CLI is one adapter/interface.

Core timing, job state, event handling, reporting, and storage abstractions should be importable from normal TypeScript modules so they can later power:
- desktop UI
- web API/server
- mobile companion
- tests
- automation/agents

Do not over-engineer this into a framework now.

For Phase 0, a simple separation such as:

```text
src/
  core/
  storage/
  cli/
```

is enough.

If a monorepo would materially delay the live dogfood build, do not introduce it yet.

Preferred migration path:

```text
Phase 0:
single package with clean internal modules

Later:
packages/core
packages/storage-local
apps/cli
apps/desktop
apps/web
```

Extract only when there is a second real consumer.

## Product principles

1. Local-first
   - canonical job data belongs with the translation project
   - project-local directory is `.trx/`
   - global state may only store convenience pointers such as recent/current projects

2. Low friction
   - bare `trx` is a primary interface
   - common actions require few keystrokes
   - known metadata is inherited
   - do not repeatedly ask the same question

3. Durable analytical records
   - logs should aggregate across many projects later
   - raw events and source facts are primary
   - derived metrics are computed
   - use versioned schemas

4. Honest provenance
   - live timer measurements must be distinguishable from reconstructed/imported historical data
   - future imports may come from spreadsheets, file timestamps, platform data, or manual estimates

5. Explicit state
   - `done` completes current page/work unit
   - `finish` closes the whole job
   - `resume` resumes a paused timer only

6. Boring storage
   - JSON / JSONL
   - no database in Phase 0

7. Reusable logic
   - domain logic should not depend on terminal UI
   - CLI prompts call domain functions, not the reverse

8. Dogfood-driven evolution
   - build the smallest vertical slice
   - use it on paid work
   - fix observed friction
   - extract modules only when pressure from real use justifies it

## Technical constraints — Phase 0

- TypeScript
- Node.js
- pnpm
- ESM
- minimal dependencies
- prefer `@clack/prompts`
- tests use controllable/injectable clock where needed
- `pnpm build` must succeed
- `pnpm link --global` must expose `trx`
- running `trx` in a child directory must discover the nearest parent `.trx/`

## Package / command naming

Working product/repo name:
- `trx`

CLI:
- `trx`

Local project state:
- `.trx/`

If package publishing later requires a distinct npm package name, choose that at publish time. Do not distort the product architecture around npm naming now.

## Phase 0 command surface

Required:

- `trx`
- `trx init`
- `trx status`
- `trx current`
- `trx next`
- `trx start [page]`
- `trx pause`
- `trx resume`
- `trx done`
- `trx report`
- `trx finish`
- `trx reopen`

Optional only if trivial:
- `trx where`
- `trx last`

Do not add more before dogfooding.

## State model

Job:
- `ACTIVE`
- `FINISHED`

Page/work unit:
- `PENDING`
- `WORKING`
- `PAUSED`
- `COMPLETED`

Rules:
- one active/paused work unit at a time
- `trx next` is read-only
- `trx done` never finishes the job
- `trx finish` should refuse or clearly warn if pending work remains
- `trx reopen` reopens the job without reopening a page

## Phase 0 storage

Suggested:

```text
translation-project/
└── .trx/
    ├── job.json
    ├── manifest.json
    ├── events.jsonl
    └── state.json
```

Not every file must exist if implementation is simpler, but keep responsibilities clear.

- `job.json`: job/business metadata
- `manifest.json`: physical/billable page map and known document metadata
- `events.jsonl`: durable activity/event history
- `state.json`: convenient current state/cache

All persisted records must include `schema_version`.

## Data model

Job-level fields may include:
- `schema_version`
- `job_id`
- `source_language`
- `target_language`
- `default_country`
- `default_region`
- `quoted_pages`
- `quoted_total`
- `currency`
- `net_factor`
- `status`
- `created_at`
- `finished_at`

Page/work-unit fields may include:
- `pdf_page`
- `billable_page`
- `document_type`
- `document_label`
- `content_category`
- `source_format`
  - `native`
  - `scanned`
  - `mixed`
- `country`
- `region`
- `status`
- timing facts
- measurement provenance

Keep `document_type` separate from `content_category`.

Examples:
- `bank_statement` → `financial`
- `birth_certificate` → `vital_record`
- `deed_of_donation` → `legal_notarial`
- `shareholders_meeting_minutes` → `legal_corporate`

Do not over-engineer taxonomy.

## Measurement provenance

Direct timer:

```json
{
  "measurement": {
    "method": "timer",
    "confidence": "high"
  }
}
```

Future methods may include:
- `timesheet_reconstruction`
- `filesystem_reconstruction`
- `manual_estimate`
- `platform_reconstruction`

Do not build historical import in Phase 0.

## Bare `trx`

Bare `trx` is both:
- interactive menu
- context refresher

It should prominently show:
- current job
- current state
- progress
- current page, if any
- next page
- most likely next action

State-aware actions:

READY:
- Start next page
- Start another page
- View status
- View report
- Finish job
- Quit

WORKING:
- Complete page
- Pause
- View current
- View status
- Quit

PAUSED:
- Resume
- Complete page
- View current
- View status
- Quit

All pages complete:
- View report
- Finish job
- Quit

Highlight the most likely next action.

## Reporting — Phase 0

Minimum:
- completed / total billable pages
- total active time
- average active time per page
- median active time per page
- pages/hour

When quote data exists:
- quoted total
- net revenue using optional `net_factor`
- effective hourly rate based on active time

Future aggregation should support:
- document type
- content category
- source format
- country
- region
- client/channel
- AI-assisted vs manual
- revision/rework
- actual settled proceeds

Do not build these future dimensions unless already cheap to record.

## Working style for agents

- Read repo docs before changing architecture.
- State the smallest implementation plan.
- Prefer atomic commits.
- Resolve minor ambiguity with the simplest option.
- Avoid speculative abstractions.
- Run tests and real CLI smoke checks before declaring success.
- If a refactor does not improve current dogfood use or protect future data, defer it.
- Always end implementation reports with:
  - current state
  - exact next action
  - known blocker, if any

## Definition of done — first dogfoodable release

Ready to use when:

1. `pnpm install`
2. `pnpm build`
3. tests pass
4. `pnpm link --global`
5. `trx init` creates a local `.trx/`
6. bare `trx` shows a useful context-aware menu
7. `start/pause/resume/done` correctly account active time
8. `next` does not mutate
9. `status/current` are useful
10. `report` shows timing + profitability basics
11. nested-directory discovery works
12. temporary sample job was exercised end-to-end
13. core logic is not embedded in terminal-prompt callbacks

Once this works: stop and dogfood.

## Public repository / client privacy boundary

Assume the TRX source repository may be public.

Never add real client materials or identifying operational records to the repository.

Repository-safe content:
- source code
- ADRs/docs
- synthetic fixtures
- synthetic examples
- anonymized generic taxonomies

Never commit:
- client PDFs/images
- translated client documents
- raw real-job `.trx/` data
- real client names
- real job/order IDs
- client messages
- identifying source filenames
- account/reference numbers
- screenshots containing client data
- fixtures copied directly from real client files

Use synthetic reproductions for tests and bug fixtures.

The root repository must ignore `.trx/` and `*.trx-export.*`.

`trx init` should create `.trx/.gitignore` containing:

```gitignore
*
!.gitignore
```

Do not overwrite an existing `.trx/.gitignore` unnecessarily.

Logs should minimize sensitive content. Phase 0 should record operational metadata and timing, not source/translated text.

Any future feature that sends client data to an external model/service must document the data boundary and persistence behavior before implementation.

Future aggregate/export commands must treat output as private by default. Public sharing must require explicit anonymization/sanitization.

## Git workflow

Use Git from the beginning.

Keep commits atomic: one coherent change or decision per commit. A commit should be small enough to review, revert, or cherry-pick independently.

Never add `Co-authored-by` trailers. Never attribute commits to Cursor, Grok, ChatGPT, Codex, or any other model, editor, or tool. Commit author and committer must be the human owner only. If a tool injects a co-author trailer, strip it before the commit is published.

Do not mix unrelated documentation, refactors, features, tests, and fixes in one commit when they can reasonably be separated.

Before committing:
- inspect `git status`
- inspect the diff
- run the relevant tests/checks
- ensure no client/job data, `.trx/` data, secrets, generated junk, or identifying fixtures are staged
- stage only files that belong to that commit

Use Conventional Commit-style prefixes where practical:

```text
plan: define Phase 0 implementation sequence
docs: document local-first job storage
adr: record CLI-as-adapter decision
chore: initialize TypeScript and pnpm tooling
feat: add project discovery
feat: add page timer state transitions
feat: add interactive trx menu
test: cover pause and resume accounting
fix: prevent done from finishing the job
refactor: extract reporting calculations from CLI
```

Preferred prefixes:
- `plan:` implementation plans, milestone/task decomposition
- `docs:` documentation changes
- `adr:` architecture decision records
- `feat:` user-visible capability
- `fix:` bug fix
- `test:` tests without a primary behavior change
- `refactor:` structural change with no intended behavior change
- `chore:` tooling, dependencies, repository maintenance
- `perf:` performance improvement

Commit messages should describe the actual change, not the activity performed.

Good:

```text
feat: add upward .trx project discovery
test: cover paused time exclusion
docs: document Phase 0 dogfood workflow
```

Avoid:

```text
update files
work in progress
changes
codex stuff
```

### Planning and documentation commits

Plans and architecture/documentation changes are valuable repository history and may be committed separately before implementation.

For example:

```text
plan: define dogfoodable timer milestone
adr: keep CLI separate from core domain logic
chore: initialize TypeScript CLI package
feat: implement local job initialization
test: cover timer state transitions
feat: add state-aware interactive menu
```

Do not create empty or ceremonial commits merely to match this sequence. Commit boundaries should reflect real coherent changes.

### During agent work

Before beginning a substantial task:
1. inspect current Git status and recent history
2. avoid overwriting unrelated user changes
3. make the smallest implementation plan
4. work in reviewable increments
5. commit completed increments atomically when appropriate

Never use destructive Git operations such as hard reset, forced checkout, history rewriting, or force push unless explicitly requested.

Do not amend or rewrite user-authored commits unless explicitly requested.

At the end of a task, report:
- commits created
- current working-tree status
- whether tests/build pass
- the single next recommended action

For the urgent Phase 0 build, Git discipline must not become ceremony that delays dogfooding. Prefer a handful of meaningful atomic commits over dozens of tiny commits.

