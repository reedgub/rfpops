# RFPOps

> Paste an RFP URL or PDF. Get a calibrated bid/no-bid recommendation in under 3 minutes.

Boutique federal IT services agencies waste 15–30 hours per RFP deciding whether to bid — only to lose to an incumbent who was wired in from the start. RFPOps fixes the front end of the proposal pipeline: fast, grounded evaluation so you spend proposal budget only where it's worth spending.

Built as a [Claude Code](https://claude.ai/code) native tool. No backend, no database, no SaaS subscription. Your profile lives in markdown files. Your evaluations live in a folder. The reasoning comes from Claude.

---

## What it does

```
/evaluate https://sam.gov/opp/W912HQ24R0001/view
```

```
══════════════════════════════════════════════════════════════
  DOI Cloud Migration · Due: Jun 14, 2026 · 14 days
  VERDICT: NO-BID · Confidence: HIGH · Composite: 2.8/5.0
══════════════════════════════════════════════════════════════
  Capability Match     5/5  ✓
  Past Performance     4/5  ✓
  Win Probability      1/5  ✗  Incumbent signals in SOW §3.4
  Margin Viability     3/5  ~
  Strategic Fit        4/5  ✓
  Disqualifiers        PASS
──────────────────────────────────────────────────────────────
  Strong technical fit but the SOW is written around the
  incumbent's tooling. Section 3.4 names proprietary systems
  they built. No industry day held. Re-evaluate in 18 months.
──────────────────────────────────────────────────────────────
  Full reasoning: rfps/doi-cloud-migration/evaluation.md
══════════════════════════════════════════════════════════════
```

---

## Quick start

**Prerequisites:** Python 3.11+, Node 20+, an [Anthropic API key](https://console.anthropic.com)

```bash
git clone https://github.com/reedgub/rfpops && cd rfpops
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=your-key-here
pip install -e ".[dev]"
/onboard                    # set up your agency profile (5 minutes)
/evaluate <rfp-url-or-pdf>  # run your first evaluation
```

Open the dashboard:
```bash
cd web && npm install && npm run dev
# → http://localhost:3000
```

---

## Commands

| Command | What it does |
|---|---|
| `/evaluate <url\|pdf\|->` | Parses an RFP, scores it across 6 dimensions, writes evaluation to `rfps/<slug>/` |
| `/compliance <slug>` | Extracts every "shall/must" requirement, maps each to your profile, flags gaps |
| `/draft <slug> <section>` | Generates a proposal section grounded in the evaluation's win themes |
| `/onboard` | Guided setup to create your agency profile from scratch |
| `/list` | Deadline-sorted table of all evaluated RFPs with verdicts and scores |

**Supported draft sections:** `exec-summary` · `technical-approach` · `methodology` · `past-performance` · `management-plan`

---

## How it works

```
rfpops/
├── core/           # Python: intake, scoring, compliance, draft, onboard
├── profile/        # Your agency (4 markdown files — edit once, use forever)
├── rfps/           # One directory per evaluated opportunity
├── config/         # rubric.yaml — dimension weights, thresholds, banned phrases
├── .claude/        # Claude Code slash commands + skill docs
└── web/            # Next.js dashboard (reads rfps/ and profile/ server-side)
```

**No database.** State lives in `rfps/` — one directory per opportunity containing `evaluation.json`, `evaluation.md`, `compliance.md`, and `draft/` subdirectory.

**No backend.** The Next.js dashboard uses server components to read from the filesystem directly. The CLI writes; the dashboard reads.

**No auth.** Single-user, local-only by design.

---

## Scoring model

Six dimensions, weighted composite score (1–5 scale):

| Dimension | Weight | What it measures |
|---|---|---|
| Capability Match | 30% | Services, certifications, tech stack vs. RFP requirements |
| Past Performance | 25% | Relevance and comparability of prior contracts |
| Win Probability | 20% | Competition signals, incumbent presence, set-aside status |
| Margin Viability | 15% | Contract value vs. agency size and overhead |
| Strategic Fit | 10% | New logos, domain expansion, capability building |
| Disqualifiers | GATE | Any fail = automatic NO-BID, regardless of other scores |

**Score thresholds:** ≥ 3.5 → BID · 2.5–3.4 → MAYBE · < 2.5 → NO-BID

Every rationale cites specific RFP content — a section number, page reference, or verbatim quote. Generic statements are not allowed by the prompt.

---

## Customizing the rubric

**Dimension weights and score thresholds** — `config/rubric.yaml`

**Scoring voice and few-shot examples** — `core/prompts.py`
The two hand-written exemplar evaluations in `SCORING_FEW_SHOTS` are the single biggest lever for output quality. If evaluations sound generic, rewrite these first.

**Your agency profile** — `profile/`
| File | Contents |
|---|---|
| `capabilities.md` | Services, certifications, NAICS codes, tech stack |
| `past-performance.md` | 3–6 detailed past contracts (see format in the sample) |
| `team.md` | Key personnel, clearances, certifications |
| `disqualifiers.md` | Hard no-go criteria — anything here triggers automatic NO-BID |

---

## Development

```bash
make install    # pip install -e ".[dev]" + npm install in web/
make test       # pytest with coverage
make web        # npm run dev in web/
make sample     # run /evaluate on a fixture RFP
make clean      # remove rfps/*, __pycache__, .next
```

```bash
python scripts/fetch_samples.py   # download 3 real RFPs from SAM.gov
pytest --cov=core --cov-report=term-missing
```

---

## License

MIT — see [LICENSE](LICENSE).

**Contributing:** Open an issue before a PR. The most important rule: no banned phrases in tool output. `leverage`, `synergy`, `best-in-class`, `seamlessly` — if the prompts produce these, the prompts are wrong.
