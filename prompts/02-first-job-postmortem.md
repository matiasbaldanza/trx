# Codex Prompt — First TRX Job Postmortem

The first real translation job has been completed.

Do not start by adding features.

Inspect:
- `.trx/job.json`
- `.trx/manifest.json`
- `.trx/events.jsonl`
- `.trx/state.json`
- implementation
- tests

Evaluate:

1. Can active time be reconstructed reliably from events?
2. Can normal CLI usage lose or corrupt timing data?
3. Does the data model aggregate cleanly across future jobs?
4. Which metadata collected during the live job was useful?
5. Which prompts/actions created unnecessary friction?
6. Did TRX consistently make current/next context obvious?
7. Are there schema changes worth making before many more jobs are logged?
8. Is the current core/CLI separation sufficient for a future second interface?
9. What should remain deferred?

Then implement only high-value, low-risk fixes that protect:
- data quality
- timing correctness
- context recovery
- future aggregation

Do not yet build:
- historical reconstruction
- aggregation dashboards
- OCR
- PDF analysis
- quote automation
- desktop/web/mobile

End with:

### What the first job taught us
### Changes made
### Next recommended milestone
