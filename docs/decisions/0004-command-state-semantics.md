# ADR 0004: Command and state semantics

Status: Accepted

## Decision

Job:
- ACTIVE
- FINISHED

Page:
- PENDING
- WORKING
- PAUSED
- COMPLETED

Commands:
- `trx next` is read-only
- `trx start` starts next pending page
- `trx start N` explicitly starts page N
- `trx pause` pauses active timing
- `trx resume` resumes paused timing
- `trx done` completes current page only
- `trx finish` closes the job
- `trx reopen` reopens the job without reopening a page

`resume` is reserved for timer semantics.
