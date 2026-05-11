# /draft

Draft a proposal section for an evaluated RFP.

## Usage
/draft <slug> <section>

Supported sections:
- exec-summary (400-600 words)
- technical-approach (1,200-1,800 words)
- methodology (600-1,000 words)
- past-performance (600-1,000 words)
- management-plan (600-1,000 words)

## What it does
1. Loads the RFP and evaluation from rfps/<slug>/
2. Generates the requested section using win themes from the evaluation
3. Saves to rfps/<slug>/draft/<section>.md

## Example
/draft doi-cloud-migration exec-summary
/draft va-telehealth technical-approach
