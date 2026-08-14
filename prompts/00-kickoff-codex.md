# Codex Kickoff — Build the smallest usable TRX now

You are working in the TRX repository.

Read first:
- `AGENTS.md`
- `README.md`
- `docs/PRODUCT.md`
- `docs/ROADMAP.md`
- `docs/architecture/BOUNDARIES.md`
- all ADRs in `docs/decisions/`
- `docs/FIRST-JOB.md`

## Immediate objective

Build Phase 0 only:

> a reliable, low-friction translation work timer/logger that can be dogfooded immediately on a live paid job.

The larger TRX roadmap matters for architectural direction, but must NOT delay the timer/logger.

## Critical architectural requirement

The CLI is an adapter.

Do not put timer state transitions, job logic, page selection, or reporting math directly inside prompt/menu callbacks.

Use a simple structure such as:

```text
src/
  core/
  storage/
  cli/
```

The core must be importable TypeScript.

Do not create a monorepo yet.

## Stack

- TypeScript
- Node.js
- pnpm
- ESM
- minimal dependencies
- prefer `@clack/prompts`

Product/repo:
- TRX / `trx`

Executable:
- `trx`

Local project data:
- `.trx/`

Must work with:

```bash
pnpm install
pnpm build
pnpm link --global
trx
```

## Required commands

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

## ADHD/context UX requirement

Bare `trx` must quickly answer:

- what job am I in?
- what is my progress?
- what page am I on?
- is the timer running/paused?
- what page is next?
- what should I do now?

After major actions, print the next useful action.

Example after `trx done`:

```text
✓ Page 8 completed — 08:42

Progress: 7 / 25

NEXT
Page 9 — Notarial Certification

Run:
  trx start
```

Do not require the user to remember workflow state.

## Storage

Project-local:

```text
.trx/
  job.json
  manifest.json
  events.jsonl
  state.json
```

Simplify if needed, but preserve:
- versioned persisted schema
- durable event history
- current state
- page manifest

Walk upward from cwd to find `.trx/`.

## Timer correctness

Active time excludes pauses.

Use an injectable/controllable clock in core logic.

Example:

```text
start
10 min
pause
30 min
resume
5 min
done
```

must record ~15 active minutes.

## Command semantics

`trx next`
- informational
- never mutates state

`trx start`
- starts next pending billable page

`trx start N`
- explicitly starts page N
- supports out-of-order work

`trx done`
- completes current page only
- does NOT finish job

`trx finish`
- closes entire job
- refuse or clearly warn if pages remain

`trx reopen`
- reopens job
- does not reopen page

## Bare trx

State-aware menu.

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

ALL COMPLETE:
- View report
- Finish job
- Quit

Highlight most likely next action.

## Init / manifest

Must support:
- job id
- source language
- target language
- default country
- quoted billable pages
- quoted total
- currency
- optional net factor
- explicit list/ranges of billable physical PDF pages

First job:

```text
job_id: SYN-ES-EN-AR-001
source_language: es
target_language: en
default_country: AR
quoted_pages: 25
quoted_total: 250
currency: USD
net_factor: 0.80
billable_pdf_pages: 2-11,13-19,21-24,26-29
```

Do not over-polish range parsing if it slows delivery.

## Page metadata

Support storing:
- pdf_page
- document_type
- document_label
- content_category
- source_format: native | scanned | mixed
- country
- optional region

Do not force every field before timing starts.

Allow inherited defaults.

## Reporting

Minimum:
- completed / total pages
- total active time
- average time/page
- median time/page
- pages/hour
- quoted total
- net revenue via net_factor
- effective hourly rate

## Tests

At minimum:
- project discovery walking upward
- start/pause/resume/done timing
- done does not finish job
- next does not mutate
- start without page chooses next pending page
- out-of-order page start
- finish/reopen
- report calculations
- core logic can be imported without CLI



## Git workflow requirement

Use Git throughout implementation.

Before changing files:
- inspect `git status`
- inspect recent history
- preserve unrelated user changes

Prefer a small number of meaningful atomic commits. Use prefixes such as:

```text
plan:
docs:
adr:
chore:
feat:
fix:
test:
refactor:
```

A reasonable Phase 0 history might resemble:

```text
plan: define dogfoodable Phase 0 implementation
chore: initialize TypeScript CLI package
feat: add local job storage and discovery
feat: add timer and page state transitions
test: cover timer and lifecycle behavior
feat: add state-aware interactive CLI
feat: add timing and profitability report
```

This is illustrative, not mandatory. Do not manufacture commits just to match it.

Before every commit:
- review staged diff
- run relevant checks
- ensure no real client data or `.trx/` job records are included

Do not use destructive Git operations or rewrite existing user history.

In the final response, include the commits created and whether the working tree is clean.


## Delivery sequence

1. Briefly summarize the smallest architecture.
2. Implement immediately.
3. Run tests.
4. Run build.
5. `pnpm link --global`.
6. Create a temporary sample translation project.
7. Run the globally linked `trx`.
8. Exercise:
   - init
   - bare menu
   - start
   - pause
   - resume
   - done
   - next
   - status
   - report
9. Fix only blockers to real use.
10. Stop.

Do not add:
- OCR
- PDF parsing
- AI integration
- quote automation
- aggregation commands
- historical imports
- desktop/web/mobile app
- database
- cloud sync

Those are roadmap items, not Phase 0.



## Public repo / privacy requirement

Assume this source repository may be public.

Before declaring Phase 0 complete:

- ensure root `.gitignore` ignores `.trx/` and `*.trx-export.*`
- make `trx init` create `.trx/.gitignore` with:

```gitignore
*
!.gitignore
```

- do not use the real client/job data from `docs/FIRST-JOB.md` as committed test fixtures
- all automated tests/fixtures must use synthetic job IDs, names, paths, and metadata
- do not store source or translated document text in Phase 0 logs
- do not copy a real `.trx/` directory into the repo during smoke testing
- use a temporary synthetic project for tests and CLI smoke checks

The real live job is for local dogfooding after implementation, not a repository fixture.

## Final response format

End with exactly:

### Current state
What is working.

### Start dogfooding now
Exact commands to use in the real translation directory.

### Next action
One single next action for the user.

### Known limitations
Only limitations that matter during this live job.
