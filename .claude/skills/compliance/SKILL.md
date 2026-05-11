# Compliance Skill

Extracts requirements from an evaluated RFP and maps them to agency capabilities.

## Inputs
- RFP slug (used to load rfps/<slug>/rfp_extracted.json)
- Agency profile (from profile/capabilities.md and profile/team.md)

## Process
1. Load parsed RFP from rfps/<slug>/rfp_extracted.json
2. Extract all "shall" and "must" statements as discrete requirements
3. For each requirement, assess whether the agency can comply (Met, Partial, Gap)
4. Generate compliance rationale citing specific capability or personnel evidence

## Outputs
- rfps/<slug>/compliance.md — formatted compliance matrix table
- Terminal output of the same table
