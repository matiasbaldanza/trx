# ADR 0003: Versioned schemas and provenance

Status: Accepted

## Context

Future datasets may mix live timer measurements with reconstructed historical work.

These sources differ in reliability.

## Decision

All persisted data includes `schema_version`.

Measurements can carry provenance such as:

```json
{
  "measurement": {
    "method": "timer",
    "confidence": "high"
  }
}
```

Future methods:
- timesheet_reconstruction
- filesystem_reconstruction
- platform_reconstruction
- manual_estimate

## Consequences

Historical reconstruction can be useful without creating false equivalence with directly measured data.
