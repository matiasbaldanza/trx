# Privacy and Client Data Boundary

TRX may be developed in a public repository, but real translation work must remain private.

## Public repository

Allowed:
- source code
- architecture docs
- ADRs
- synthetic tests
- synthetic fixtures
- generic document taxonomies
- anonymized examples created specifically for documentation

Not allowed:
- client PDFs/images
- translated client files
- raw real-job `.trx/` directories
- client/order identifiers
- client messages
- screenshots containing client information
- fixtures copied from real documents
- real filenames that identify a client or matter

## Real job storage

Real jobs live outside the TRX source repository.

Example:

```text
~/code/active/trx/                     # public source repo

~/translation-jobs/
└── Client Job/
    ├── source.pdf                     # private
    ├── deliverables/                  # private
    └── .trx/                          # private operational data
```

TRX should create `.trx/.gitignore` automatically:

```gitignore
*
!.gitignore
```

This makes job telemetry private-by-default even if the translation project uses Git.

## Logging minimization

The Phase 0 timer/logger should record structured operational facts, not document contents.

Prefer fields such as:
- page number
- document type
- content category
- country/region
- source format
- timing events
- quote/profitability numbers

Avoid storing:
- extracted source text
- translated text
- personal names
- document numbers
- account numbers
- client correspondence

unless a later feature explicitly requires them and the storage/privacy design has been reviewed.

## Future agentic features

As TRX gains model-assisted intake, translation, QA, communication, and delivery features, each new capability should explicitly document:

1. what client data it reads
2. what data it persists
3. where that data is stored
4. whether data leaves the local machine
5. which provider/service receives it
6. how logs avoid retaining source content unnecessarily

This is a design requirement, not an afterthought.

## Export rule

All exports are private by default.

Future public analytical exports should require an explicit anonymization step.
