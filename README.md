# RFPOps

Boutique federal IT services agencies waste 15-30 hours deciding whether to bid on RFPs that were wired for someone else from day one. RFPOps cuts that to under 3 minutes: paste a URL or PDF, get a calibrated bid/no-bid recommendation grounded in your actual capabilities and past performance.

[gif placeholder — record with: `npx playwright screenshot http://localhost:3000 home.png` after running `/evaluate` on a few RFPs]

## Quick start

```bash
git clone https://github.com/reedgub/RFPOps && cd RFPOps/rfpops
cp .env.example .env && echo "ANTHROPIC_API_KEY=your-key-here" >> .env
pip install -e ".[dev]"
python scripts/fetch_samples.py   # downloads 3 fixture RFPs from SAM.gov
/evaluate tests/fixtures/rfp_doi-cloud-migration-placeholder/source.txt
```

Open the dashboard: `cd web && npm install && npm run dev` → http://localhost:3000

## Commands

| Command | Description | Example |
|---|---|---|
| `/evaluate <source>` | Parses an RFP and produces a bid/no-bid recommendation with full scoring | `/evaluate https://sam.gov/opp/abc123/view` |
| `/compliance <slug>` | Extracts every "shall/must" requirement and maps it to your profile | `/compliance doi-cloud-migration` |
| `/draft <slug> <section>` | Generates a proposal section using win themes from the evaluation | `/draft doi-cloud-migration exec-summary` |
| `/onboard` | Guided 8-question setup to create your agency profile | `/onboard` |
| `/list` | Shows all evaluated RFPs sorted by deadline with scores and verdicts | `/list` |

## How it works

The CLI commands read your agency profile from `profile/` (four markdown files you fill in once), parse the RFP into a structured document, then call the Anthropic API to score the opportunity across 6 weighted dimensions. Results are written to `rfps/<slug>/` — no database, no backend, no auth. The Next.js dashboard at `web/` reads from the same filesystem state, so the CLI writes and the dashboard reads.

## Customize the rubric

- **Weights and scoring guidance:** `config/rubric.yaml` — adjust dimension weights, score thresholds, and the banned-phrases list
- **System prompts and few-shot examples:** `core/prompts.py` — the scoring rationale voice lives here; if the output sounds generic, tighten the prompts
- **Hard no-go criteria:** `profile/disqualifiers.md` — add or remove deal-breakers specific to your agency

## Architecture

```
rfpops/
├── core/           # Python: intake, scoring, compliance, draft, onboard
├── profile/        # Your agency profile (markdown files)
├── rfps/           # Evaluated opportunities (written by CLI, read by dashboard)
├── config/         # rubric.yaml — scoring weights and thresholds
├── .claude/        # Claude Code slash commands and skills
├── web/            # Next.js dashboard (reads from rfps/ and profile/)
└── tests/          # pytest suite + fixture RFPs
```

## License

MIT. See [LICENSE](LICENSE).

Contributing: open an issue first, then a PR. Keep prompts honest — no marketing speak allowed in tool output.
