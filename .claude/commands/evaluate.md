# /evaluate

Evaluate an RFP and produce a bid/no-bid recommendation.

## Usage
/evaluate <rfp-source>

Where <rfp-source> is one of:
- A URL (https://...)
- A path to a PDF file
- `-` to read from stdin

## What it does
1. Parses the RFP (URL, PDF, or text)
2. Loads the agency profile from profile/
3. Scores the opportunity across 6 dimensions
4. Saves the evaluation to rfps/<slug>/
5. Prints a formatted summary

## Example
/evaluate https://sam.gov/opp/abc123/view
/evaluate /path/to/solicitation.pdf
cat rfp.txt | /evaluate -
