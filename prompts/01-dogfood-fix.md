# Codex Prompt — Fix Only What Dogfooding Exposed

Read:
- `AGENTS.md`
- current implementation
- relevant ADRs

I will provide issues observed while using TRX on real paid translation work.

For each issue:

1. reproduce if practical
2. make the smallest safe fix
3. add/update regression tests
4. run tests
5. run build
6. avoid unrelated refactors
7. preserve logged data compatibility where possible

Prioritize:
- timer correctness
- preventing lost events
- context recovery
- showing the next action
- reducing keystrokes
- correct next-page selection
- accurate progress/reporting

Do not implement roadmap features unless they are directly required to fix the observed problem.

End with:

### Current state
### Next action
