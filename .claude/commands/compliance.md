# /compliance

Generate a compliance matrix for an evaluated RFP.

## Usage
/compliance <slug>

## What it does
1. Loads the RFP from rfps/<slug>/
2. Extracts all "shall" and "must" requirements
3. Maps each to agency capabilities or flags gaps
4. Outputs a table to the terminal and saves to rfps/<slug>/compliance.md

## Example
/compliance doi-cloud-migration-w912hq24r0001
