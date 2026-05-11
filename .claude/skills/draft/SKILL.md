# Draft Skill

Generates proposal section drafts for a specific RFP using win themes from the evaluation.

## Inputs
- RFP slug (loads rfps/<slug>/evaluation.md and rfps/<slug>/rfp_extracted.json)
- Section name (exec-summary, technical-approach, methodology, past-performance, management-plan)

## Process
1. Load RFP data and evaluation win themes from rfps/<slug>/
2. Select section template and target word count range
3. Generate section content grounded in agency profile and RFP requirements
4. Enforce banned phrase list from config/rubric.yaml

## Outputs
- rfps/<slug>/draft/<section>.md — drafted proposal section
