# Security

## Data Handling

RFP text, profile data, past performance, evaluations, and outcomes stay in the configured workspace. In demo mode, data is held in memory for the active server session.

## Document Retention

The MVP exposes retention posture in settings but does not enforce document deletion schedules. Production should add retention jobs, deletion audit logs, and customer-visible export/delete controls.

## Model Provider Assumptions

When `ANTHROPIC_API_KEY` is present, RFP text and profile context are sent to Anthropic for scoring. When the key is missing, the local deterministic scorer runs and no model provider receives document text.

## No-Training Posture

Customer documents are not used to train foundation models. Production terms should include this explicitly with provider-specific data processing references.

## RLS Notes

The Supabase migration enables row-level security but ships permissive MVP policies. Production should replace those policies with organization-scoped policies based on authenticated membership claims.

## Future SOC 2 Notes

Before enterprise deployment, add audit logs, least-privilege service keys, admin access review, backup policy, incident response process, vendor review, encryption documentation, and formal change control.

## Extension Permission Philosophy

The extension requests broad host access so it can detect procurement pages across portals. It only captures visible page text after user action or the injected score button. Production should narrow permissions as portal support matures.
