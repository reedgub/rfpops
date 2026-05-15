# RFPOps Architecture

RFPOps is a Next.js monorepo with a web app, API routes, scoring pipeline, Supabase schema, seeded demo store, and Chrome extension scaffold.

## System Overview

- Web app: Next.js 15 App Router under `src/app`.
- API routes: Next route handlers under `src/app/api`.
- Data layer: `src/lib/data/repository.ts` chooses Supabase when configured or demo memory when not.
- Scoring: `src/lib/scoring` exposes `scoreRfp` with Anthropic first and deterministic fallback.
- Extension: `extension` is a Manifest V3 Vite app that detects likely RFP pages and sends text to the web app.

## Web App

The web app is the system of record for profile, past performance, pipeline, evaluations, compliance matrix, outcomes, and analytics. Pages are server-rendered where possible and use client components for forms, tabs, filters, charts, and inline updates.

## Scoring Pipeline

`POST /api/score` validates input, loads the organization context, extracts basic RFP metadata, runs the scoring engine, saves the RFP and evaluation, and returns a pipeline detail URL.

If `ANTHROPIC_API_KEY` exists, RFPOps asks Anthropic for strict JSON and validates it with Zod. If validation fails twice or the key is missing, the deterministic scorer runs.

## Data Layer

Demo mode uses seeded in-memory data from `src/lib/demo/seed.ts`. It supports scoring new RFPs, editing profile data, updating pipeline status, and editing records for the active server session.

Supabase mode uses the service role key from environment variables. The MVP repository methods cover the same app flows, with schema in `supabase/migrations/0001_initial_schema.sql`.

## Extension

The extension detects likely RFP pages from URL and page text signals, injects a floating "Score with RFPOps" button, captures visible text, and posts to `http://localhost:3000/api/extension/score`.

## Supabase

The migration creates organizations, profiles, capabilities, certifications, disqualifiers, past performance, library items, RFPs, evaluations, compliance requirements, outcomes, and usage events. RLS is enabled with permissive MVP policies. Production should replace those policies with organization-scoped membership checks.
