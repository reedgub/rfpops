insert into organizations (id, name, description, revenue_range, employee_count, primary_naics)
values (
  '11111111-1111-4111-8111-111111111111',
  'Northstar Federal Systems',
  'Boutique federal IT services firm focused on cloud migration, FedRAMP readiness, cybersecurity documentation, data engineering, and managed services.',
  '$5M-$10M',
  35,
  '541512'
);

insert into organization_profiles (
  id,
  organization_id,
  target_agencies,
  target_contract_vehicles,
  target_capabilities,
  target_geographies,
  desired_logos,
  minimum_margin_percent,
  strategic_notes
)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  array['GSA','DHS','HHS','VA'],
  array['GSA MAS','8(a) sole source','Small business set-aside'],
  array['Cloud Migration','FedRAMP Readiness','Cybersecurity Documentation','Data Engineering','Managed Services'],
  array['Remote','National Capital Region','Mid-Atlantic'],
  array['DHS','GSA','HHS','VA'],
  25,
  'Prioritize civilian federal cloud and compliance work where Northstar can show recent federal evidence and avoid low-margin staff augmentation.'
);

insert into capabilities (organization_id, name, description, maturity, technologies, proof_points, tags)
values
('11111111-1111-4111-8111-111111111111','Cloud Migration','Cloud readiness assessments, migration planning, landing zone design, and workload transition support for federal programs.','flagship',array['AWS','Azure','Terraform'],array['DHS cloud readiness support','HHS data platform migration planning'],array['cloud','migration','architecture']),
('11111111-1111-4111-8111-111111111111','FedRAMP Readiness','FedRAMP advisory support, control mapping, SSP updates, POA&M cleanup, and authorization package preparation.','strong',array['FedRAMP','NIST 800-53','SSP','POA&M'],array['GSA FedRAMP Advisory Sprint'],array['fedramp','compliance','security']),
('11111111-1111-4111-8111-111111111111','Cybersecurity Documentation','Security documentation, risk registers, compliance matrix support, and audit response for federal systems.','strong',array['NIST','ATO','SSP','SAR','POA&M'],array['GSA cloud security package updates'],array['cybersecurity','documentation']),
('11111111-1111-4111-8111-111111111111','Data Engineering','Data pipelines, data quality controls, ETL modernization, analytics enablement, and reporting migration.','credible',array['Python','SQL','Airflow','Power BI'],array['HHS Data Pipeline Modernization'],array['data','analytics','pipeline']),
('11111111-1111-4111-8111-111111111111','Managed Services','Transition planning, operating model support, service reporting, and light managed services operations.','credible',array['ITIL','ServiceNow','SLA management'],array['VA help desk modernization subcontract'],array['managed services','operations']),
('11111111-1111-4111-8111-111111111111','Help Desk Modernization','Service desk process redesign, knowledge base cleanup, reporting, and subcontract delivery support.','credible',array['ServiceNow','knowledge management'],array['VA Help Desk Modernization Subcontract'],array['help desk','service desk']);

insert into certifications (organization_id, name, type, status, notes)
values
('11111111-1111-4111-8111-111111111111','8(a)','Socioeconomic','Active','Eligible for 8(a) set-aside and sole-source opportunities.'),
('11111111-1111-4111-8111-111111111111','GSA Schedule','Contract Vehicle','Active','GSA MAS held for IT professional services.'),
('11111111-1111-4111-8111-111111111111','AWS Advanced Partner','Partner','Active','AWS cloud credentials held by delivery leads.'),
('11111111-1111-4111-8111-111111111111','Azure Solutions Partner','Partner','Active','Azure delivery capability for federal Microsoft environments.');

insert into disqualifiers (organization_id, rule_type, description, threshold_value, active)
values
('11111111-1111-4111-8111-111111111111','facility_clearance','No classified work requiring an active facility clearance.','Facility clearance unavailable',true),
('11111111-1111-4111-8111-111111111111','margin','No fixed-price custom software builds under 20% margin.','20%',true),
('11111111-1111-4111-8111-111111111111','contract_vehicle','No prime bids requiring contract vehicles not held.','Vehicle must be accessible',true),
('11111111-1111-4111-8111-111111111111','response_window','No response windows under 7 days unless strategic.','7 days',true),
('11111111-1111-4111-8111-111111111111','minimum_value','No opportunities below $250K unless target agency foothold.','$250K',true);

insert into past_performance (
  organization_id,
  project_name,
  customer,
  agency,
  role,
  contract_vehicle,
  period_start,
  period_end,
  dollar_value,
  scope,
  technologies,
  outcomes,
  relevant_naics,
  relevant_capabilities,
  reusable_narrative,
  restrictions,
  tags
)
values
('11111111-1111-4111-8111-111111111111','DHS Cloud Readiness Support','DHS OCIO','DHS','Prime','8(a) sole source','2024-01-01','2025-03-31',1450000,'Cloud readiness assessment, migration planning, security control mapping, FedRAMP documentation support, and executive briefings.',array['AWS','Azure','FedRAMP','NIST 800-53'], 'Delivered migration roadmap for 18 workloads and reduced authorization package defects before agency review.', array['541512','541519'], array['Cloud Migration','FedRAMP Readiness','Cybersecurity Documentation'], 'Northstar supported DHS with cloud readiness planning, security control mapping, and FedRAMP documentation.', 'Customer name may be used; metrics require approval.', array['dhs','cloud','fedramp']),
('11111111-1111-4111-8111-111111111111','GSA FedRAMP Advisory Sprint','GSA Technology Transformation Services','GSA','Prime','GSA MAS','2025-04-01','2025-09-30',620000,'FedRAMP readiness sprint, SSP rewrite, POA&M cleanup, stakeholder workshops, and control evidence mapping.',array['FedRAMP','NIST 800-53','SSP','POA&M'], 'Updated authorization package artifacts and clarified control ownership.', array['541512','541611'], array['FedRAMP Readiness','Cybersecurity Documentation'], 'Northstar helped GSA prepare cloud authorization artifacts through FedRAMP advisory and documentation support.', 'Use only in federal cybersecurity and cloud compliance proposals.', array['gsa','fedramp','cybersecurity']),
('11111111-1111-4111-8111-111111111111','HHS Data Pipeline Modernization','HHS Operating Division','HHS','Prime','Small business set-aside','2023-07-01','2024-08-31',980000,'Modernized batch data pipelines, improved data quality checks, and migrated operational dashboards.',array['SQL','Python','Airflow','Power BI'], 'Reduced manual data cleanup and shortened weekly reporting cycles.', array['541512','541511'], array['Data Engineering','Cloud Migration'], 'Northstar modernized HHS data pipelines and reporting workflows.', 'Do not disclose system name.', array['hhs','data','analytics']),
('11111111-1111-4111-8111-111111111111','VA Help Desk Modernization Subcontract','VA prime contractor','VA','Subcontractor','Prime IDIQ','2022-10-01','2024-03-31',740000,'Help desk modernization support, knowledge base cleanup, reporting redesign, and transition support.',array['ServiceNow','ITIL','Power BI'], 'Improved ticket categorization and reporting discipline.', array['541519','541512'], array['Help Desk Modernization','Managed Services'], 'Northstar supported VA service desk modernization through process redesign and reporting cleanup.', 'Prime approval required for naming the end customer.', array['va','help desk','managed services']);

insert into library_items (organization_id, title, category, content, tags)
values
('11111111-1111-4111-8111-111111111111','Company Overview','Company overview','Northstar Federal Systems is a 35-person federal IT services firm supporting civilian agencies with cloud migration, FedRAMP readiness, cybersecurity documentation, data engineering, and managed services transition work.',array['company','overview','federal']),
('11111111-1111-4111-8111-111111111111','Capability Statement','Capability statement','Core capabilities include cloud readiness and migration planning, FedRAMP advisory, NIST control mapping, data pipeline modernization, and service desk modernization.',array['capabilities','cloud','security']),
('11111111-1111-4111-8111-111111111111','Technical Methodology','Technical methodology','Northstar uses discovery workshops, requirements traceability, architecture review, risk ranking, and delivery checkpoints to keep federal IT work auditable and decision-ready.',array['methodology','delivery']),
('11111111-1111-4111-8111-111111111111','Management Approach','Management approach','Program management centers on clear ownership, weekly risk review, milestone tracking, and customer-ready status reporting.',array['management','program']),
('11111111-1111-4111-8111-111111111111','Security Language','Security language','Security documentation aligns requirements, controls, artifacts, owners, and evidence so agency reviewers can trace each claim to a source.',array['security','fedramp','nist']);

insert into rfps (id, organization_id, title, agency, source, source_url, solicitation_number, due_date, naics, estimated_value, raw_text, status, owner, outcome)
values
('33333333-3333-4333-8333-333333333331','11111111-1111-4111-8111-111111111111','DHS Cloud Migration and FedRAMP Support','DHS','SAM.gov','https://sam.gov/opp/demo-dhs-cloud','DHS-26-CLOUD-001','2026-06-05','541512','$1.5M-$3M','The Department of Homeland Security seeks a small business contractor to support cloud migration planning, FedRAMP documentation, security control mapping, and managed services transition support. The contractor shall demonstrate prior experience supporting federal cloud readiness or FedRAMP advisory efforts within the last three years.','Pursue','Maya Patel','pending'),
('33333333-3333-4333-8333-333333333332','11111111-1111-4111-8111-111111111111','DoD Classified Network Operations','DoD','GovWin','https://example.com/dod-classified','DOD-26-NOC-TS','2026-05-25','541519','$4M-$7M','The Department of Defense requires a contractor with an active Top Secret facility clearance to provide classified network operations. Offerors without an active facility clearance at time of proposal submission will be deemed non-responsive.','No-Bid','Marcus Chen','no-bid'),
('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','HHS Data Platform Modernization','HHS','SAM.gov','https://sam.gov/opp/demo-hhs-data','HHS-26-DATA-014','2026-06-02','541512','$900K-$1.8M','The Department of Health and Human Services requests support for data platform modernization, cloud data pipelines, data quality controls, dashboard migration, and secure analytics operations.','Evaluating','Elena Ruiz','pending'),
('33333333-3333-4333-8333-333333333334','11111111-1111-4111-8111-111111111111','VA Help Desk Staff Augmentation','VA','Prime email','https://example.com/va-helpdesk','VA-26-HD-009','2026-05-29','541519','$650K-$1.1M','The Department of Veterans Affairs seeks help desk modernization support under an existing prime contract. The work is staff-augmentation heavy and includes strict service-level metrics.','Evaluating','Maya Patel','pending'),
('33333333-3333-4333-8333-333333333335','11111111-1111-4111-8111-111111111111','GSA Cybersecurity Documentation Support','GSA','GSA eBuy','https://example.com/gsa-cyber','GSA-26-CYBER-044','2026-06-08','541512','$700K-$1.4M','The General Services Administration requires cybersecurity documentation support for cloud authorization packages, security control traceability, system security plan updates, and FedRAMP readiness advisory support. GSA MAS access is required.','Pursue','Marcus Chen','pending'),
('33333333-3333-4333-8333-333333333336','11111111-1111-4111-8111-111111111111','State Portal Fixed-Price App Rebuild','State Procurement Office','State portal','https://example.com/state-portal','STATE-26-PORTAL','2026-05-24','541511','$220K','The State Procurement Office seeks a fixed-price vendor to rebuild a public benefits portal and deliver a complete production launch in four months. Lowest price technically acceptable procedures will be used.','No-Bid','Elena Ruiz','no-bid');

create or replace function seed_eval_json(eval_id uuid, rfp_id uuid, verdict text, confidence text, score numeric, tldr text, memo text, disq text)
returns jsonb
language sql
as $$
  select jsonb_build_object(
    'id', eval_id::text,
    'rfp_id', rfp_id::text,
    'verdict', verdict,
    'confidence', confidence,
    'composite_score', score,
    'tldr', tldr,
    'recommendation_memo', memo,
    'dimension_scores', jsonb_build_array(
      jsonb_build_object('key','capability_match','label','Capability Match','score',case when verdict='NO_BID' then 2.1 else 4.3 end,'weight',0.3,'rationale','Capability fit is strongest where the RFP maps to Northstar cloud, cybersecurity, data, or managed services evidence.','evidence',jsonb_build_array('Northstar profile capabilities'),'risks',jsonb_build_array('Validate mandatory scope details'),'improvement_actions',jsonb_build_array('Map staff and proof points to each requirement')),
      jsonb_build_object('key','past_performance_relevance','label','Past Performance Relevance','score',case when verdict='NO_BID' then 2.0 else 4.1 end,'weight',0.25,'rationale','DHS, GSA, HHS, and VA references provide the strongest support for similar civilian work.','evidence',jsonb_build_array('DHS Cloud Readiness Support','GSA FedRAMP Advisory Sprint'),'risks',jsonb_build_array('Agency-specific evidence may need a clearer bridge'),'improvement_actions',jsonb_build_array('Select the three closest examples')),
      jsonb_build_object('key','win_probability','label','Win Probability','score',case when verdict='NO_BID' then 1.6 when verdict='MAYBE' then 2.8 else 3.8 end,'weight',0.2,'rationale','Win probability depends on eligibility, response window, incumbent signals, and evaluation weighting.','evidence',jsonb_build_array('RFP excerpt'),'risks',jsonb_build_array('Unknown incumbent position'),'improvement_actions',jsonb_build_array('Use Q&A to test openness')),
      jsonb_build_object('key','margin_viability','label','Margin Viability','score',case when verdict='NO_BID' then 2.1 when verdict='MAYBE' then 3.0 else 3.8 end,'weight',0.15,'rationale','Margin is stronger for advisory and documentation work than low-price staffing or fixed-price development.','evidence',jsonb_build_array('Minimum margin target is 25%'),'risks',jsonb_build_array('Price pressure may compress margin'),'improvement_actions',jsonb_build_array('Build a rough labor mix before approval')),
      jsonb_build_object('key','strategic_fit','label','Strategic Fit','score',case when verdict='NO_BID' then 2.4 else 4.2 end,'weight',0.1,'rationale','Fit is strongest for target agencies and repeatable federal IT capabilities.','evidence',jsonb_build_array('Target agencies include DHS, GSA, HHS, and VA'),'risks',jsonb_build_array('A target logo does not offset eligibility gaps'),'improvement_actions',jsonb_build_array('Separate strategic value from win probability')),
      jsonb_build_object('key','effort_timing','label','Effort / Timing','score',3.4,'weight',0,'rationale','Response effort includes compliance matrix, staffing plan, past performance, and price review.','evidence',jsonb_build_array('Compliance matrix and staffing plan are expected'),'risks',jsonb_build_array('Senior review time may be constrained'),'improvement_actions',jsonb_build_array('Assign owners within one business day'))
    ),
    'hard_disqualifiers', case when disq='' then '[]'::jsonb else jsonb_build_array(jsonb_build_object('id','DQ-001','description',disq,'severity','hard','resolvable_with_teaming',false,'evidence',disq,'citation_id','C-001')) end,
    'key_risks', jsonb_build_array(coalesce(nullif(disq,''),'Validate staffing, margin, and incumbent signals before committing.')),
    'win_themes', jsonb_build_array('Recent federal delivery evidence supports the strongest fit areas.'),
    'capability_gaps', jsonb_build_array(case when disq='' then 'No material capability gap found in seed evaluation.' else disq end),
    'past_performance_matches', jsonb_build_array(jsonb_build_object('project_id','pp-dhs-cloud','project_name','DHS Cloud Readiness Support','relevance_score',4.2,'rationale','Shares federal cloud, documentation, or delivery context.','shared_evidence',jsonb_build_array('cloud','federal','documentation'))),
    'wiring_signals', jsonb_build_array('No severe wiring signal found in seed evaluation.'),
    'margin_concerns', jsonb_build_array('Validate labor mix before assuming target margin is reachable.'),
    'effort_estimate', jsonb_build_object('min_hours',52,'max_hours',88,'rationale','Estimate covers qualification, compliance matrix, narrative, pricing, and review.'),
    'recommended_next_actions', jsonb_build_array('Run a pursuit review.','Complete the compliance matrix.','Select past performance examples.'),
    'citations', jsonb_build_array(jsonb_build_object('id','C-001','source','Seed RFP','text','Seeded RFP excerpt and Northstar profile evidence.','location','Seed')),
    'compliance_requirements', jsonb_build_array(jsonb_build_object('id','R-001','section','Seed','requirement_text','Offerors must submit a compliance matrix and relevant past performance.','requirement_type','Submission','mandatory',true,'risk','Medium','owner','Proposal Manager','status','Mapped','source_citation','C-001')),
    'draft_scaffolds', jsonb_build_object('executive_summary_outline',jsonb_build_array('Decision context','Relevant Northstar evidence','Delivery controls'),'past_performance_mapping',jsonb_build_array('Map DHS and GSA references to requirements'),'technical_approach_outline',jsonb_build_array('Discovery','Workstreams','Quality review'),'management_approach_outline',jsonb_build_array('Governance','Staffing','Risk review')),
    'qa_checks', jsonb_build_array(jsonb_build_object('name','Seed QA','passed',true,'notes','Seed evaluation is schema-shaped.')),
    'model_used','seeded-demo',
    'prompt_version','rfpops-v1',
    'created_at',now()::text
  );
$$;

insert into evaluations (id, rfp_id, organization_id, verdict, confidence, composite_score, tldr, recommendation_memo, effort_min_hours, effort_max_hours, raw_json, qa_json, model_used, prompt_version)
values
('44444444-4444-4444-8444-444444444441','33333333-3333-4333-8333-333333333331','11111111-1111-4111-8111-111111111111','BID','HIGH',4.35,'Credible BID. The RFP matches Northstar cloud readiness, FedRAMP, cybersecurity documentation, and managed services evidence.','Proceed to pursuit review with staffing and margin gates.',52,88,seed_eval_json('44444444-4444-4444-8444-444444444441','33333333-3333-4333-8333-333333333331','BID','HIGH',4.35,'Credible BID. The RFP matches Northstar cloud readiness, FedRAMP, cybersecurity documentation, and managed services evidence.','Proceed to pursuit review with staffing and margin gates.',''),'[]','seeded-demo','rfpops-v1'),
('44444444-4444-4444-8444-444444444442','33333333-3333-4333-8333-333333333332','11111111-1111-4111-8111-111111111111','NO_BID','HIGH',1.85,'NO-BID. Active facility clearance is mandatory and Northstar does not list one.','Do not commit proposal resources.',42,70,seed_eval_json('44444444-4444-4444-8444-444444444442','33333333-3333-4333-8333-333333333332','NO_BID','HIGH',1.85,'NO-BID. Active facility clearance is mandatory and Northstar does not list one.','Do not commit proposal resources.','Active Top Secret facility clearance is mandatory and Northstar has no facility clearance.'),'[]','seeded-demo','rfpops-v1'),
('44444444-4444-4444-8444-444444444443','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','BID','MEDIUM',4.02,'BID with staffing validation. HHS data pipeline evidence is directly relevant.','Proceed if dashboard migration and cloud architecture staffing are validated.',64,94,seed_eval_json('44444444-4444-4444-8444-444444444443','33333333-3333-4333-8333-333333333333','BID','MEDIUM',4.02,'BID with staffing validation. HHS data pipeline evidence is directly relevant.','Proceed if dashboard migration and cloud architecture staffing are validated.',''),'[]','seeded-demo','rfpops-v1'),
('44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333334','11111111-1111-4111-8111-111111111111','MAYBE','MEDIUM',3.22,'MAYBE. VA help desk evidence is relevant, but staffing-heavy delivery may weaken margin.','Treat as conditional until prime role, labor mix, and margin are clear.',44,76,seed_eval_json('44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333334','MAYBE','MEDIUM',3.22,'MAYBE. VA help desk evidence is relevant, but staffing-heavy delivery may weaken margin.','Treat as conditional until prime role, labor mix, and margin are clear.',''),'[]','seeded-demo','rfpops-v1'),
('44444444-4444-4444-8444-444444444445','33333333-3333-4333-8333-333333333335','11111111-1111-4111-8111-111111111111','BID','HIGH',4.48,'Strong BID. GSA MAS access, FedRAMP advisory, and cybersecurity documentation match the requirements.','Proceed to pursuit review and confirm named staff.',52,82,seed_eval_json('44444444-4444-4444-8444-444444444445','33333333-3333-4333-8333-333333333335','BID','HIGH',4.48,'Strong BID. GSA MAS access, FedRAMP advisory, and cybersecurity documentation match the requirements.','Proceed to pursuit review and confirm named staff.',''),'[]','seeded-demo','rfpops-v1'),
('44444444-4444-4444-8444-444444444446','33333333-3333-4333-8333-333333333336','11111111-1111-4111-8111-111111111111','NO_BID','HIGH',2.08,'NO-BID. Low-budget fixed-price custom development conflicts with Northstar fit and margin discipline.','Do not commit proposal resources.',60,102,seed_eval_json('44444444-4444-4444-8444-444444444446','33333333-3333-4333-8333-333333333336','NO_BID','HIGH',2.08,'NO-BID. Low-budget fixed-price custom development conflicts with Northstar fit and margin discipline.','Do not commit proposal resources.','Fixed-price custom development appears below Northstar margin discipline and value threshold.'),'[]','seeded-demo','rfpops-v1');

insert into outcomes (rfp_id, evaluation_id, final_decision, rfpop_influenced, submitted, outcome, loss_reason, hours_spent, notes, would_make_same_decision)
values
('33333333-3333-4333-8333-333333333331','44444444-4444-4444-8444-444444444441','Pursue',true,false,'pending','',26,'Pending capture review.',true),
('33333333-3333-4333-8333-333333333332','44444444-4444-4444-8444-444444444442','No-Bid',true,false,'no-bid','',4,'No-bid due facility clearance.',true),
('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444443','Undecided',true,false,'pending','',18,'Reviewing staffing.',true),
('33333333-3333-4333-8333-333333333334','44444444-4444-4444-8444-444444444444','Undecided',true,false,'pending','',14,'Need prime labor mix.',true),
('33333333-3333-4333-8333-333333333335','44444444-4444-4444-8444-444444444445','Pursue',true,false,'pending','',22,'Strong GSA fit.',true),
('33333333-3333-4333-8333-333333333336','44444444-4444-4444-8444-444444444446','No-Bid',true,false,'no-bid','',4,'No-bid due fixed-price margin risk.',true);
