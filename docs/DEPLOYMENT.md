# Deployment

## Vercel

1. Create a Vercel project from the GitHub repository.
2. Set the framework to Next.js.
3. Add environment variables from `.env.example`.
4. Deploy the main branch or the feature branch.

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial_schema.sql` in the SQL editor or through the Supabase CLI.
3. Run `supabase/seed.sql` for demo data.
4. Copy the project URL, anon key, and service role key into Vercel environment variables.

## Environment Variables

Required for Supabase mode:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional for AI scoring:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`

Without Anthropic, the deterministic scorer is used.

## Local Build

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

## Extension Build

```bash
npm run -w extension build
```

Load `extension/dist` as an unpacked Chrome extension.
