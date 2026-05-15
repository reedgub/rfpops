create extension if not exists pgcrypto;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  revenue_range text,
  employee_count integer,
  primary_naics text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table organization_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  target_agencies text[],
  target_contract_vehicles text[],
  target_capabilities text[],
  target_geographies text[],
  desired_logos text[],
  minimum_margin_percent numeric,
  strategic_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table capabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  description text,
  maturity text,
  technologies text[],
  proof_points text[],
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  type text,
  status text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table disqualifiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  rule_type text,
  description text not null,
  threshold_value text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table past_performance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  project_name text not null,
  customer text,
  agency text,
  role text,
  contract_vehicle text,
  period_start date,
  period_end date,
  dollar_value numeric,
  scope text,
  technologies text[],
  outcomes text,
  relevant_naics text[],
  relevant_capabilities text[],
  reusable_narrative text,
  restrictions text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table library_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  category text,
  content text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table rfps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  agency text,
  source text,
  source_url text,
  solicitation_number text,
  due_date date,
  naics text,
  estimated_value text,
  raw_text text,
  status text default 'New',
  owner text,
  outcome text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  rfp_id uuid references rfps(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  verdict text not null,
  confidence text not null,
  composite_score numeric not null,
  tldr text,
  recommendation_memo text,
  effort_min_hours integer,
  effort_max_hours integer,
  raw_json jsonb not null,
  qa_json jsonb,
  model_used text,
  prompt_version text,
  created_at timestamptz default now()
);

create table compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid references evaluations(id) on delete cascade,
  requirement_id text,
  section text,
  requirement_text text not null,
  requirement_type text,
  mandatory boolean,
  risk text,
  owner text,
  status text,
  source_citation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table outcomes (
  id uuid primary key default gen_random_uuid(),
  rfp_id uuid references rfps(id) on delete cascade,
  evaluation_id uuid references evaluations(id) on delete cascade,
  final_decision text,
  rfpop_influenced boolean,
  submitted boolean,
  outcome text,
  loss_reason text,
  hours_spent integer,
  notes text,
  would_make_same_decision boolean,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  event_name text,
  properties jsonb,
  created_at timestamptz default now()
);

create index idx_organization_profiles_org on organization_profiles(organization_id);
create index idx_capabilities_org on capabilities(organization_id);
create index idx_certifications_org on certifications(organization_id);
create index idx_disqualifiers_org on disqualifiers(organization_id);
create index idx_past_performance_org on past_performance(organization_id);
create index idx_library_items_org on library_items(organization_id);
create index idx_rfps_org on rfps(organization_id);
create index idx_rfps_status on rfps(status);
create index idx_rfps_due_date on rfps(due_date);
create index idx_evaluations_org on evaluations(organization_id);
create index idx_evaluations_rfp on evaluations(rfp_id);
create index idx_evaluations_verdict on evaluations(verdict);
create index idx_compliance_eval on compliance_requirements(evaluation_id);
create index idx_outcomes_rfp on outcomes(rfp_id);
create index idx_usage_events_org on usage_events(organization_id);

alter table organizations enable row level security;
alter table organization_profiles enable row level security;
alter table capabilities enable row level security;
alter table certifications enable row level security;
alter table disqualifiers enable row level security;
alter table past_performance enable row level security;
alter table library_items enable row level security;
alter table rfps enable row level security;
alter table evaluations enable row level security;
alter table compliance_requirements enable row level security;
alter table outcomes enable row level security;
alter table usage_events enable row level security;

comment on table organizations is 'MVP enables RLS but uses permissive policies for pilot speed. Production should scope policies to authenticated organization membership.';

create policy "mvp service and anon read organizations" on organizations for select using (true);
create policy "mvp service and anon write organizations" on organizations for all using (true) with check (true);
create policy "mvp service and anon read organization_profiles" on organization_profiles for select using (true);
create policy "mvp service and anon write organization_profiles" on organization_profiles for all using (true) with check (true);
create policy "mvp service and anon read capabilities" on capabilities for select using (true);
create policy "mvp service and anon write capabilities" on capabilities for all using (true) with check (true);
create policy "mvp service and anon read certifications" on certifications for select using (true);
create policy "mvp service and anon write certifications" on certifications for all using (true) with check (true);
create policy "mvp service and anon read disqualifiers" on disqualifiers for select using (true);
create policy "mvp service and anon write disqualifiers" on disqualifiers for all using (true) with check (true);
create policy "mvp service and anon read past_performance" on past_performance for select using (true);
create policy "mvp service and anon write past_performance" on past_performance for all using (true) with check (true);
create policy "mvp service and anon read library_items" on library_items for select using (true);
create policy "mvp service and anon write library_items" on library_items for all using (true) with check (true);
create policy "mvp service and anon read rfps" on rfps for select using (true);
create policy "mvp service and anon write rfps" on rfps for all using (true) with check (true);
create policy "mvp service and anon read evaluations" on evaluations for select using (true);
create policy "mvp service and anon write evaluations" on evaluations for all using (true) with check (true);
create policy "mvp service and anon read compliance_requirements" on compliance_requirements for select using (true);
create policy "mvp service and anon write compliance_requirements" on compliance_requirements for all using (true) with check (true);
create policy "mvp service and anon read outcomes" on outcomes for select using (true);
create policy "mvp service and anon write outcomes" on outcomes for all using (true) with check (true);
create policy "mvp service and anon read usage_events" on usage_events for select using (true);
create policy "mvp service and anon write usage_events" on usage_events for all using (true) with check (true);
