# RFPOps

RFPOps is the bid-decision intelligence layer for boutique federal IT and professional services firms.

It helps a founder, CEO, or BD lead decide whether to pursue an RFP before the team burns 60-120 hours on a proposal they are unlikely to win. The wedge is not proposal writing. The wedge is disciplined BID / MAYBE / NO-BID evaluation against company capabilities, certifications, disqualifiers, strategic goals, and past performance.

## MVP Scope

- Next.js web app with landing page, dashboard, score flow, pipeline, RFP detail, profile, past performance, library, insights, and settings.
- Supabase migration and seed data.
- Anthropic scoring path with strict JSON validation.
- Deterministic local scorer when no Anthropic key exists.
- Seeded Northstar Federal Systems demo data.
- Chrome Extension Manifest V3 scaffold.
- Basic tests for scoring and verdict logic.

## Tech Stack

- Next.js 15 App Router, React, TypeScript, Tailwind CSS.
- shadcn/ui-style local components, Lucide icons, Recharts.
- Zod schemas, React client forms, Supabase.
- Anthropic SDK with deterministic fallback.
- Vite React Chrome extension.
- Vitest.

## Local Setup

```bash
git clone https://github.com/reedgub/rfpops
cd rfpops
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
NEXT_PUBLIC_DEMO_MODE=true
POSTHOG_KEY=
SENTRY_DSN=
```

No variables are required for local demo mode.

## Running Without Supabase

Leave Supabase variables blank. The app uses seeded in-memory data:

- Northstar Federal Systems profile.
- Six demo RFPs with varied verdicts.
- Four past performance records.
- Library content.
- Editable profile and past performance for the active server session.
- Scoring new RFPs into the pipeline.

## Running With Supabase

1. Create a Supabase project.
2. Apply `supabase/migrations/0001_initial_schema.sql`.
3. Run `supabase/seed.sql`.
4. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Restart the app.

The migration enables RLS with permissive MVP policies. Tighten policies before real customer use.

## AI Scoring Behavior

If `ANTHROPIC_API_KEY` is present, `/api/score` sends the RFP, company profile, capabilities, disqualifiers, and past performance to Anthropic and validates the JSON response with Zod. Invalid model output is repaired once, then the deterministic scorer is used.

If the key is missing, RFPOps uses deterministic scoring:

- Keyword matching against capabilities.
- Certification and disqualifier checks.
- Past performance token overlap.
- Due date and effort heuristics.
- Compliance extraction from requirement language.

## Run Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

`npm run build` also builds the Chrome extension workspace.

## Chrome Extension

```bash
npm run -w extension build
```

Load unpacked in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `extension/dist`.

The extension detects likely RFP pages using URL and visible text signals, injects "Score with RFPOps", and posts page content to `http://localhost:3000/api/extension/score`.

## Deployment To Vercel

1. Connect the GitHub repository to Vercel.
2. Add environment variables.
3. Deploy.
4. Confirm `/dashboard`, `/pipeline`, `/score`, and `/api/score` work.
5. Confirm Supabase seed data appears if Supabase env vars are set.

## Deployment Checklist

- Apply Supabase migration.
- Seed demo or customer workspace data.
- Set Vercel env vars.
- Set `ANTHROPIC_API_KEY` only when model scoring is desired.
- Run lint, typecheck, build, and tests.
- Load and test extension from `extension/dist`.
- Replace permissive RLS policies before real customer use.

## Known Limitations

- PDF parsing is not automatic in the browser. Users paste extracted PDF text.
- Demo mode is in-memory and resets when the server restarts.
- Supabase profile editing is broad enough for MVP but should be expanded for multi-user production workflows.
- Extension auth is intentionally not built.
- Outcome analytics are meaningful for demo data but need real usage to calibrate.

## Next Product Milestones

- Auth and organization membership.
- Full Supabase CRUD for every profile subresource.
- Document storage and retention jobs.
- Better PDF extraction.
- Calibration loop from real win/loss outcomes.
- Portal-specific extension support for SAM.gov first.
