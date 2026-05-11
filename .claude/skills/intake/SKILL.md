# Intake Skill

Fetches and parses RFP source material into a structured document.

## Inputs
- RFP source: URL, PDF file path, or raw text via stdin

## Process
1. Detect source type (URL, PDF, or text)
2. Fetch or read raw content
3. Extract key fields: title, agency, solicitation number, NAICS, set-aside status, period of performance, contract value, due date, and requirements sections
4. Output structured RFPDocument object

## Outputs
- rfps/<slug>/rfp_extracted.json — structured RFP data
- rfps/<slug>/rfp_raw.txt — raw source text for reference
