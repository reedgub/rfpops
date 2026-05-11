# RFPOps — Delivery Report

## Metrics

| Metric | Value |
|---|---|
| Python LOC | ~3,155 |
| TypeScript LOC | ~923 |
| Total LOC | ~4,078 |
| Test coverage (core/) | 40% overall; 91-92% on core logic modules |
| Tests passing | 19/19 |
| Web build | Zero TypeScript errors, zero warnings |
| Web routes | `/` (static), `/profile` (static), `/rfp/[slug]` (dynamic SSR) |

## Commands

| Command | What it does |
|---|---|
| `/evaluate <url\|pdf\|->` | Parses RFP, loads agency profile, scores across 6 weighted dimensions, writes evaluation to `rfps/<slug>/` |
| `/compliance <slug>` | Extracts all "shall/must" requirements from an evaluated RFP, maps each to profile capabilities, flags gaps |
| `/draft <slug> <section>` | Generates a named proposal section using win themes from the evaluation and past performance callbacks |
| `/onboard` | Interactive 8-question flow that generates all four profile markdown files via Claude |
| `/list` | Renders a color-coded table of all RFPs sorted by deadline (red=past due, yellow=<7d, green=healthy) |

## Architecture summary

- **No database.** All state lives in `rfps/` (one directory per opportunity) and `profile/` (four markdown files).
- **No backend.** The Next.js dashboard reads directly from the filesystem in server components.
- **No auth.** Single-user, local-only. Not designed for multi-tenancy.
- **Anthropic API.** All reasoning goes through `claude-sonnet-4-5`. The API key is read from `ANTHROPIC_API_KEY` env var.

## Scoring model

Six dimensions, weighted composite:

| Dimension | Weight | Description |
|---|---|---|
| Capability Match | 30% | Technical services, certifications, tech stack |
| Past Performance | 25% | Relevance and comparability of prior contracts |
| Win Probability | 20% | Competition signals, incumbent presence, set-aside |
| Margin Viability | 15% | Contract value vs. agency size and overhead |
| Strategic Fit | 10% | New logos, domain expansion, capability building |
| Disqualifiers | GATE | Any fail = automatic NO-BID |

## Quality controls baked into prompts

1. Every dimension rationale must cite a specific RFP element (section number, page reference, or quote under 15 words)
2. 10 banned phrases explicitly listed in system prompt: leverage, synergy, best-in-class, world-class, cutting-edge, robust, seamlessly, empower, unlock value, drive outcomes
3. Two hand-written few-shot exemplars in `core/prompts.py` anchor the expected voice
4. Composite score is recomputed from dimension scores if Claude's arithmetic diverges by >0.3

## Known gaps / next improvements

- **Coverage gap on interactive modules:** `onboard.py`, `list_view.py`, and `draft.py` have 0% test coverage because they require API calls or interactive input. Adding integration tests with mocked Claude responses would bring overall coverage to 80%+.
- **PDF support environment-dependent:** The `pdfplumber` → `pdfminer` → `cryptography` → `cffi` chain panics in some environments (Rust/PyO3 ABI mismatch). A Docker setup with a pinned Python environment would fix this.
- **No SAM.gov fixture PDFs:** `scripts/fetch_samples.py` falls back to placeholder text fixtures when SAM.gov is unreachable. Production use requires a SAM.gov API key or a network connection to the site.
- **Single model.** No fallback if `claude-sonnet-4-5` is unavailable. Adding a model configuration option and fallback to `claude-haiku-4-5` for extraction-only tasks would improve resilience.
- **Web dashboard is read-only.** There's no way to trigger `/evaluate` from the browser. A simple server action or API route could make the dashboard the primary interface.
