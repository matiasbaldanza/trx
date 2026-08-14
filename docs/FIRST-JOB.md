# First Dogfood Job

This file is a synthetic stand-in for the first dogfood job shape. Initialize the live job locally; do not copy real job data into the repository.

## Directory

```text
2026-08 sample-documentation-job (ES to EN - AR)
```

## Job

```text
Job ID: SYN-ES-EN-AR-001
Source: ES
Target: EN
Default country: AR
Quoted pages: 25
Quoted total: USD 250
Nominal rate: USD 10/page
Net factor before additional Argentina/payment fees: 0.80
Net after factor: USD 200
```

## Physical PDF pages not translated

```text
1, 12, 20, 25, 30
```

## Billable PDF pages

```text
2-11,13-19,21-24,26-29
```

## Document map

```text
page 2
ARCA Tax Registration Certificate

pages 3–4
Shareholders' Meeting Minutes with Registry Certification

pages 5–9
Certification of Source of Funds, Accountant's Certification and Notarial Certification

page 10
Digital Notarial Legalization

page 11
Hague Apostille

pages 13–19
Bank Account Statements

pages 21–24
Salary Account Statement

pages 26–28
Deed of Donation / Notarial Testimony

page 29
Hague Apostille
```

## Suggested starter metadata

| Pages | document_type | content_category |
|---|---|---|
| 2 | tax_registration_certificate | tax |
| 3–4 | shareholders_meeting_minutes | legal_corporate |
| 5–9 | source_of_funds_certification | financial_legal |
| 10 | notarial_legalization | legal_notarial |
| 11 | apostille | legal_authentication |
| 13–19 | bank_statement | financial |
| 21–24 | salary_account_statement | financial |
| 26–28 | deed_of_donation | legal_notarial |
| 29 | apostille | legal_authentication |

Country inherits as `AR`.

Source format should be captured during use:
- native
- scanned
- mixed

## Immediate usage objective

Do not attempt to fully model this job before translating it.

Use the manifest enough to:
- identify next billable page
- time active work
- preserve document/category/source metadata
- calculate progress
- calculate profitability basics

Then dogfood.
