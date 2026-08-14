# Codex Prompt — Extract TRX Core Only When a Second Consumer Exists

Use this prompt only when there is a concrete second consumer such as:
- desktop app
- web service
- agent service
- mobile companion

Read all ADRs first.

Goal:
extract reusable TRX domain logic without changing observable CLI behavior.

Prefer a pnpm workspace such as:

```text
packages/
  core/
  storage-local/

apps/
  cli/
```

Move only logic that has a real shared consumer.

Core may include:
- domain types
- job/page state transitions
- timing
- manifests
- reporting calculations
- validation

Keep:
- terminal prompts
- terminal rendering
- local filesystem UX

out of core.

Add integration tests proving the CLI still works after extraction.

Do not expand product scope during extraction.
