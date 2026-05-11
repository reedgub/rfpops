# Evaluate Skill

Performs RFP intake, extraction, and bid/no-bid scoring.

## Inputs
- RFP source (URL, PDF path, or raw text)
- Agency profile (from profile/ directory)

## Process
1. Parse RFP into structured RFPDocument
2. Load AgencyProfile from profile/
3. Score across 6 dimensions using SCORING_SYSTEM_PROMPT
4. Check disqualifiers (gate condition)
5. Compute composite weighted score
6. Generate verdict and write evaluation

## Outputs
- rfps/<slug>/evaluation.md — human-readable evaluation
- rfps/<slug>/evaluation.json — machine-readable data
- rfps/<slug>/rfp_extracted.json — parsed RFP data

## Quality Gates
- Every rationale must cite specific RFP content
- No banned phrases in output
- Disqualifier check must run before scoring
