import type {
  Capability,
  Certification,
  Disqualifier,
  Evaluation,
  LibraryItem,
  Organization,
  OrganizationProfile,
  Outcome,
  PastPerformance,
  Rfp
} from "@/lib/schemas/domain";
import { demoRfpTexts } from "@/lib/demo/sample-rfps";

const now = "2026-05-15T12:00:00.000Z";
export const demoOrganizationId = "11111111-1111-4111-8111-111111111111";

export const demoOrganization: Organization = {
  id: demoOrganizationId,
  name: "Northstar Federal Systems",
  description:
    "Boutique federal IT services firm focused on cloud migration, FedRAMP readiness, cybersecurity documentation, data engineering, and managed services.",
  revenue_range: "$5M-$10M",
  employee_count: 35,
  primary_naics: "541512"
};

export const demoProfile: OrganizationProfile = {
  id: "22222222-2222-4222-8222-222222222222",
  organization_id: demoOrganizationId,
  target_agencies: ["GSA", "DHS", "HHS", "VA"],
  target_contract_vehicles: ["GSA MAS", "8(a) sole source", "Small business set-aside"],
  target_capabilities: [
    "Cloud Migration",
    "FedRAMP Readiness",
    "Cybersecurity Documentation",
    "Data Engineering",
    "Managed Services"
  ],
  target_geographies: ["Remote", "National Capital Region", "Mid-Atlantic"],
  desired_logos: ["DHS", "GSA", "HHS", "VA"],
  minimum_margin_percent: 25,
  strategic_notes:
    "Prioritize civilian federal cloud and compliance work where Northstar can show recent federal evidence and avoid low-margin staff augmentation."
};

export const demoCapabilities: Capability[] = [
  {
    id: "cap-cloud",
    name: "Cloud Migration",
    description:
      "Cloud readiness assessments, migration planning, landing zone design, and workload transition support for federal programs.",
    maturity: "flagship",
    technologies: ["AWS", "Azure", "Terraform", "Microsoft 365", "cloud architecture"],
    proof_points: ["DHS cloud readiness support", "HHS data platform migration planning"],
    tags: ["cloud", "migration", "architecture", "aws", "azure"]
  },
  {
    id: "cap-fedramp",
    name: "FedRAMP Readiness",
    description:
      "FedRAMP advisory support, control mapping, SSP updates, POA&M cleanup, and authorization package preparation.",
    maturity: "strong",
    technologies: ["FedRAMP", "NIST 800-53", "SSP", "POA&M", "control mapping"],
    proof_points: ["GSA FedRAMP Advisory Sprint", "DHS security control mapping"],
    tags: ["fedramp", "compliance", "security", "nist"]
  },
  {
    id: "cap-cyberdocs",
    name: "Cybersecurity Documentation",
    description:
      "Security documentation, risk registers, compliance matrix support, and audit response for federal systems.",
    maturity: "strong",
    technologies: ["NIST", "ATO", "SSP", "SAR", "POA&M"],
    proof_points: ["GSA cloud security package updates", "DHS compliance documentation"],
    tags: ["cybersecurity", "documentation", "ato", "controls"]
  },
  {
    id: "cap-data",
    name: "Data Engineering",
    description:
      "Data pipelines, data quality controls, ETL modernization, analytics enablement, and reporting migration.",
    maturity: "credible",
    technologies: ["Python", "SQL", "dbt", "Airflow", "Power BI", "Snowflake"],
    proof_points: ["HHS Data Pipeline Modernization"],
    tags: ["data", "analytics", "pipeline", "etl"]
  },
  {
    id: "cap-managed",
    name: "Managed Services",
    description:
      "Transition planning, operating model support, service reporting, and light managed services operations.",
    maturity: "credible",
    technologies: ["ITIL", "ServiceNow", "reporting", "SLA management"],
    proof_points: ["VA help desk modernization subcontract"],
    tags: ["managed services", "operations", "transition"]
  },
  {
    id: "cap-helpdesk",
    name: "Help Desk Modernization",
    description:
      "Service desk process redesign, knowledge base cleanup, reporting, and subcontract delivery support.",
    maturity: "credible",
    technologies: ["ServiceNow", "knowledge management", "SLA reporting"],
    proof_points: ["VA Help Desk Modernization Subcontract"],
    tags: ["help desk", "service desk", "itil", "support"]
  }
];

export const demoCertifications: Certification[] = [
  {
    id: "cert-8a",
    name: "8(a)",
    type: "Socioeconomic",
    status: "Active",
    notes: "Eligible for 8(a) set-aside and sole-source opportunities."
  },
  {
    id: "cert-gsa",
    name: "GSA Schedule",
    type: "Contract Vehicle",
    status: "Active",
    notes: "GSA MAS held for IT professional services."
  },
  {
    id: "cert-aws",
    name: "AWS Advanced Partner",
    type: "Partner",
    status: "Active",
    notes: "AWS cloud architecture and migration credentials held by delivery leads."
  },
  {
    id: "cert-azure",
    name: "Azure Solutions Partner",
    type: "Partner",
    status: "Active",
    notes: "Azure delivery capability for federal Microsoft environments."
  }
];

export const demoDisqualifiers: Disqualifier[] = [
  {
    id: "dq-clearance",
    rule_type: "facility_clearance",
    description: "No classified work requiring an active facility clearance.",
    threshold_value: "Facility clearance unavailable",
    active: true
  },
  {
    id: "dq-fixed-price",
    rule_type: "margin",
    description: "No fixed-price custom software builds under 20% margin.",
    threshold_value: "20%",
    active: true
  },
  {
    id: "dq-vehicle",
    rule_type: "contract_vehicle",
    description: "No prime bids requiring contract vehicles not held.",
    threshold_value: "Vehicle must be accessible",
    active: true
  },
  {
    id: "dq-short-window",
    rule_type: "response_window",
    description: "No response windows under 7 days unless strategic.",
    threshold_value: "7 days",
    active: true
  },
  {
    id: "dq-min-value",
    rule_type: "minimum_value",
    description: "No opportunities below $250K unless target agency foothold.",
    threshold_value: "$250K",
    active: true
  }
];

export const demoPastPerformance: PastPerformance[] = [
  {
    id: "pp-dhs-cloud",
    project_name: "DHS Cloud Readiness Support",
    customer: "DHS OCIO",
    agency: "DHS",
    role: "Prime",
    contract_vehicle: "8(a) sole source",
    period_start: "2024-01-01",
    period_end: "2025-03-31",
    dollar_value: 1450000,
    scope:
      "Cloud readiness assessment, migration planning, security control mapping, FedRAMP documentation support, and executive briefings.",
    technologies: ["AWS", "Azure", "FedRAMP", "NIST 800-53", "Terraform"],
    outcomes:
      "Delivered migration roadmap for 18 workloads and reduced authorization package defects before agency review.",
    relevant_naics: ["541512", "541519"],
    relevant_capabilities: ["Cloud Migration", "FedRAMP Readiness", "Cybersecurity Documentation"],
    reusable_narrative:
      "Northstar supported DHS with cloud readiness planning, security control mapping, and FedRAMP documentation for mission systems moving to cloud environments.",
    restrictions: "Customer name may be used; metrics require approval before external publication.",
    tags: ["dhs", "cloud", "fedramp", "readiness"]
  },
  {
    id: "pp-gsa-fedramp",
    project_name: "GSA FedRAMP Advisory Sprint",
    customer: "GSA Technology Transformation Services",
    agency: "GSA",
    role: "Prime",
    contract_vehicle: "GSA MAS",
    period_start: "2025-04-01",
    period_end: "2025-09-30",
    dollar_value: 620000,
    scope:
      "FedRAMP readiness sprint, SSP rewrite, POA&M cleanup, stakeholder workshops, and control evidence mapping.",
    technologies: ["FedRAMP", "NIST 800-53", "SSP", "POA&M"],
    outcomes:
      "Updated authorization package artifacts and clarified control ownership across security, engineering, and operations teams.",
    relevant_naics: ["541512", "541611"],
    relevant_capabilities: ["FedRAMP Readiness", "Cybersecurity Documentation"],
    reusable_narrative:
      "Northstar helped GSA prepare cloud authorization artifacts through focused FedRAMP advisory, documentation, and control mapping support.",
    restrictions: "Use only in federal cybersecurity and cloud compliance proposals.",
    tags: ["gsa", "fedramp", "cybersecurity", "documentation"]
  },
  {
    id: "pp-hhs-data",
    project_name: "HHS Data Pipeline Modernization",
    customer: "HHS Operating Division",
    agency: "HHS",
    role: "Prime",
    contract_vehicle: "Small business set-aside",
    period_start: "2023-07-01",
    period_end: "2024-08-31",
    dollar_value: 980000,
    scope:
      "Modernized batch data pipelines, improved data quality checks, and migrated operational dashboards for program leadership.",
    technologies: ["SQL", "Python", "Airflow", "Power BI", "Azure"],
    outcomes:
      "Reduced manual data cleanup and shortened weekly reporting cycles for program analysts.",
    relevant_naics: ["541512", "541511"],
    relevant_capabilities: ["Data Engineering", "Cloud Migration"],
    reusable_narrative:
      "Northstar modernized HHS data pipelines and reporting workflows, pairing engineering delivery with clear documentation and analyst adoption support.",
    restrictions: "Do not disclose system name.",
    tags: ["hhs", "data", "analytics", "pipeline"]
  },
  {
    id: "pp-va-helpdesk",
    project_name: "VA Help Desk Modernization Subcontract",
    customer: "VA prime contractor",
    agency: "VA",
    role: "Subcontractor",
    contract_vehicle: "Prime IDIQ",
    period_start: "2022-10-01",
    period_end: "2024-03-31",
    dollar_value: 740000,
    scope:
      "Help desk modernization support, knowledge base cleanup, reporting redesign, and transition support under a prime-led program.",
    technologies: ["ServiceNow", "ITIL", "Power BI", "knowledge management"],
    outcomes:
      "Improved ticket categorization and reporting discipline while supporting transition to a new operating model.",
    relevant_naics: ["541519", "541512"],
    relevant_capabilities: ["Help Desk Modernization", "Managed Services"],
    reusable_narrative:
      "As a subcontractor, Northstar supported VA service desk modernization through process redesign, reporting cleanup, and managed services transition support.",
    restrictions: "Prime approval required for naming the end customer in public materials.",
    tags: ["va", "help desk", "managed services", "subcontract"]
  }
];

export const demoLibraryItems: LibraryItem[] = [
  {
    id: "lib-overview",
    title: "Company Overview",
    category: "Company overview",
    content:
      "Northstar Federal Systems is a 35-person federal IT services firm supporting civilian agencies with cloud migration, FedRAMP readiness, cybersecurity documentation, data engineering, and managed services transition work.",
    tags: ["company", "overview", "federal"]
  },
  {
    id: "lib-capability",
    title: "Capability Statement",
    category: "Capability statement",
    content:
      "Core capabilities include cloud readiness and migration planning, FedRAMP advisory, NIST control mapping, data pipeline modernization, and service desk modernization.",
    tags: ["capabilities", "cloud", "security"]
  },
  {
    id: "lib-technical",
    title: "Technical Methodology",
    category: "Technical methodology",
    content:
      "Northstar uses discovery workshops, requirements traceability, architecture review, risk ranking, and delivery checkpoints to keep federal IT work auditable and decision-ready.",
    tags: ["methodology", "delivery"]
  },
  {
    id: "lib-management",
    title: "Management Approach",
    category: "Management approach",
    content:
      "Program management centers on clear ownership, weekly risk review, milestone tracking, and customer-ready status reporting.",
    tags: ["management", "program"]
  },
  {
    id: "lib-security",
    title: "Security Language",
    category: "Security language",
    content:
      "Security documentation aligns requirements, controls, artifacts, owners, and evidence so agency reviewers can trace each claim to a source.",
    tags: ["security", "fedramp", "nist"]
  }
];

function seedEvaluation(args: {
  id: string;
  rfpId: string;
  verdict: "BID" | "MAYBE" | "NO_BID";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  title: string;
  tldr: string;
  disqualifier?: string;
  primaryMatch: string;
  gap: string;
  wiring: string;
  effort: [number, number];
}): Evaluation {
  const hard = args.disqualifier
    ? [
        {
          id: `${args.id}-dq`,
          description: args.disqualifier,
          severity: "hard" as const,
          resolvable_with_teaming: false,
          evidence: args.disqualifier,
          citation_id: "C-001"
        }
      ]
    : [];

  return {
    id: args.id,
    rfp_id: args.rfpId,
    verdict: args.verdict,
    confidence: args.confidence,
    composite_score: args.score,
    tldr: args.tldr,
    recommendation_memo:
      args.verdict === "NO_BID"
        ? `NO-BID. ${args.tldr} The opportunity does not justify proposal effort unless the disqualifying issue changes or a qualified prime absorbs the requirement.`
        : `${args.verdict}. ${args.tldr} The bid decision should remain tied to evidence, staffing availability, and margin discipline.`,
    dimension_scores: [
      {
        key: "capability_match",
        label: "Capability Match",
        score: args.verdict === "NO_BID" ? 2.1 : args.verdict === "MAYBE" ? 3.3 : 4.4,
        weight: 0.3,
        rationale: `The RFP aligns with ${args.primaryMatch}, but the team should validate staffing and mandatory submission details.`,
        evidence: [args.primaryMatch],
        risks: [args.gap],
        improvement_actions: ["Map named staff and artifacts to each mandatory requirement before committing."]
      },
      {
        key: "past_performance_relevance",
        label: "Past Performance Relevance",
        score: args.verdict === "NO_BID" ? 2.0 : args.verdict === "MAYBE" ? 3.2 : 4.3,
        weight: 0.25,
        rationale: "Northstar has at least one comparable federal reference, with stronger evidence in civilian cloud and security work.",
        evidence: ["DHS Cloud Readiness Support", "GSA FedRAMP Advisory Sprint"],
        risks: ["Past performance may need stronger agency-specific framing."],
        improvement_actions: ["Select the closest three examples and write the relevance bridge explicitly."]
      },
      {
        key: "win_probability",
        label: "Win Probability",
        score: args.verdict === "NO_BID" ? 1.6 : args.verdict === "MAYBE" ? 2.8 : 3.9,
        weight: 0.2,
        rationale: `Win probability depends on response window, incumbent signals, and whether ${args.wiring.toLowerCase()}.`,
        evidence: [args.wiring],
        risks: [args.wiring],
        improvement_actions: ["Use Q&A to test whether requirements are open or shaped around an incumbent."]
      },
      {
        key: "margin_viability",
        label: "Margin Viability",
        score: args.verdict === "NO_BID" ? 2.2 : args.verdict === "MAYBE" ? 3.0 : 3.8,
        weight: 0.15,
        rationale: "Margin is plausible for advisory and documentation work but weaker for low-price staffing or fixed-price custom development.",
        evidence: ["Minimum margin target is 25%."],
        risks: ["Price pressure could erase the margin target."],
        improvement_actions: ["Create a rough labor mix and margin view before greenlighting full proposal work."]
      },
      {
        key: "strategic_fit",
        label: "Strategic Fit",
        score: args.verdict === "NO_BID" ? 2.4 : args.verdict === "MAYBE" ? 3.8 : 4.5,
        weight: 0.1,
        rationale: "The opportunity is stronger when it supports target agencies and repeatable cloud, cybersecurity, or data work.",
        evidence: ["Target agencies include DHS, GSA, HHS, and VA."],
        risks: ["A strategic logo does not offset missing eligibility."],
        improvement_actions: ["Separate strategic value from probability of award in the pursuit meeting."]
      },
      {
        key: "effort_timing",
        label: "Effort / Timing",
        score: args.effort[1] > 95 ? 2.5 : 3.7,
        weight: 0,
        rationale: `Estimated response effort is ${args.effort[0]}-${args.effort[1]} hours based on required volumes and decision artifacts.`,
        evidence: ["Compliance matrix and staffing plan are required."],
        risks: ["Senior technical review time may be the binding constraint."],
        improvement_actions: ["Confirm proposal owner and SME availability within one business day."]
      }
    ],
    hard_disqualifiers: hard,
    key_risks: [args.gap, args.wiring, "Proposal effort could crowd out higher-probability work."],
    win_themes:
      args.verdict === "NO_BID"
        ? ["Only pursue through a qualified partner if the disqualifier is fully absorbed."]
        : [
            "Recent federal cloud and compliance work maps to the required scope.",
            "Northstar can point to civilian agency delivery evidence instead of generic capability claims.",
            "8(a) and GSA positioning support credible small business pursuit paths."
          ],
    capability_gaps: [args.gap],
    past_performance_matches: [
      {
        project_id: "pp-dhs-cloud",
        project_name: "DHS Cloud Readiness Support",
        relevance_score: args.verdict === "NO_BID" ? 2.2 : 4.5,
        rationale:
          "Shares federal cloud readiness, security documentation, and customer environment evidence.",
        shared_evidence: ["cloud readiness", "FedRAMP documentation", "federal delivery"]
      },
      {
        project_id: "pp-gsa-fedramp",
        project_name: "GSA FedRAMP Advisory Sprint",
        relevance_score: args.verdict === "NO_BID" ? 2.0 : 4.1,
        rationale: "Supports FedRAMP advisory and security control mapping claims.",
        shared_evidence: ["FedRAMP", "SSP", "POA&M", "NIST controls"]
      }
    ],
    wiring_signals: [args.wiring],
    margin_concerns:
      args.verdict === "NO_BID"
        ? ["The pursuit does not meet Northstar's margin or eligibility discipline."]
        : ["Validate labor mix before assuming the target 25% margin is reachable."],
    effort_estimate: {
      min_hours: args.effort[0],
      max_hours: args.effort[1],
      rationale: "Estimate reflects technical volume, compliance matrix, staffing plan, and past performance package."
    },
    recommended_next_actions:
      args.verdict === "NO_BID"
        ? ["Record no-bid rationale.", "Watch for recompete or subcontract path.", "Do not assign proposal resources."]
        : [
            "Run a one-hour pursuit review with delivery and pricing.",
            "Build the compliance matrix before drafting narrative.",
            "Select past performance examples and identify gaps for Q&A."
          ],
    citations: [
      {
        id: "C-001",
        source: args.title,
        text: args.primaryMatch,
        location: "RFP excerpt"
      },
      {
        id: "C-002",
        source: "Northstar profile",
        text: "Target agencies include DHS, GSA, HHS, and VA.",
        location: "Organization profile"
      }
    ],
    compliance_requirements: [
      {
        id: "R-001",
        section: "RFP excerpt",
        requirement_text: "Offerors must submit a compliance matrix.",
        requirement_type: "Submission",
        mandatory: true,
        risk: "Low",
        owner: "Proposal Manager",
        status: "Mapped",
        source_citation: "C-001"
      },
      {
        id: "R-002",
        section: "RFP excerpt",
        requirement_text: "Offerors must submit relevant past performance examples.",
        requirement_type: "Past Performance",
        mandatory: true,
        risk: args.verdict === "NO_BID" ? "High" : "Medium",
        owner: "BD Lead",
        status: args.verdict === "NO_BID" ? "Gap" : "Mapped",
        source_citation: "C-001"
      }
    ],
    draft_scaffolds: {
      executive_summary_outline: [
        "Decision position and customer mission context",
        "Relevant Northstar evidence",
        "Risk controls and delivery discipline"
      ],
      past_performance_mapping: [
        "Map DHS cloud readiness to cloud and compliance scope",
        "Map GSA FedRAMP advisory to security documentation requirements"
      ],
      technical_approach_outline: [
        "Discovery and requirements traceability",
        "Delivery workstreams",
        "Quality checkpoints and customer reviews"
      ],
      management_approach_outline: [
        "Program governance",
        "Staffing plan",
        "Risk and issue management"
      ]
    },
    qa_checks: [
      { name: "Banned phrases", passed: true, notes: "No banned phrases detected." },
      { name: "Evidence coverage", passed: true, notes: "Each score includes evidence." },
      { name: "Verdict alignment", passed: true, notes: "Verdict follows scoring and disqualifier rules." },
      { name: "Citation coverage", passed: true, notes: "Material claims include citations." }
    ],
    model_used: "seeded-demo",
    prompt_version: "rfpops-v1",
    created_at: now
  };
}

export const demoRfps: Rfp[] = [
  {
    id: "rfp-dhs-cloud",
    organization_id: demoOrganizationId,
    title: "DHS Cloud Migration and FedRAMP Support",
    agency: "DHS",
    source: "SAM.gov",
    source_url: "https://sam.gov/opp/demo-dhs-cloud",
    solicitation_number: "DHS-26-CLOUD-001",
    due_date: "2026-06-05",
    naics: "541512",
    estimated_value: "$1.5M-$3M",
    raw_text: demoRfpTexts.dhsCloud,
    status: "Pursue",
    owner: "Maya Patel",
    outcome: "pending",
    created_at: now,
    updated_at: now
  },
  {
    id: "rfp-dod-classified",
    organization_id: demoOrganizationId,
    title: "DoD Classified Network Operations",
    agency: "DoD",
    source: "GovWin",
    source_url: "https://example.com/dod-classified",
    solicitation_number: "DOD-26-NOC-TS",
    due_date: "2026-05-25",
    naics: "541519",
    estimated_value: "$4M-$7M",
    raw_text: demoRfpTexts.dodClassified,
    status: "No-Bid",
    owner: "Marcus Chen",
    outcome: "no-bid",
    created_at: now,
    updated_at: now
  },
  {
    id: "rfp-hhs-data",
    organization_id: demoOrganizationId,
    title: "HHS Data Platform Modernization",
    agency: "HHS",
    source: "SAM.gov",
    source_url: "https://sam.gov/opp/demo-hhs-data",
    solicitation_number: "HHS-26-DATA-014",
    due_date: "2026-06-02",
    naics: "541512",
    estimated_value: "$900K-$1.8M",
    raw_text: demoRfpTexts.hhsData,
    status: "Evaluating",
    owner: "Elena Ruiz",
    outcome: "pending",
    created_at: now,
    updated_at: now
  },
  {
    id: "rfp-va-helpdesk",
    organization_id: demoOrganizationId,
    title: "VA Help Desk Staff Augmentation",
    agency: "VA",
    source: "Prime email",
    source_url: "https://example.com/va-helpdesk",
    solicitation_number: "VA-26-HD-009",
    due_date: "2026-05-29",
    naics: "541519",
    estimated_value: "$650K-$1.1M",
    raw_text: demoRfpTexts.vaHelpDesk,
    status: "Evaluating",
    owner: "Maya Patel",
    outcome: "pending",
    created_at: now,
    updated_at: now
  },
  {
    id: "rfp-gsa-cyber",
    organization_id: demoOrganizationId,
    title: "GSA Cybersecurity Documentation Support",
    agency: "GSA",
    source: "GSA eBuy",
    source_url: "https://example.com/gsa-cyber",
    solicitation_number: "GSA-26-CYBER-044",
    due_date: "2026-06-08",
    naics: "541512",
    estimated_value: "$700K-$1.4M",
    raw_text: demoRfpTexts.gsaCyber,
    status: "Pursue",
    owner: "Marcus Chen",
    outcome: "pending",
    created_at: now,
    updated_at: now
  },
  {
    id: "rfp-state-portal",
    organization_id: demoOrganizationId,
    title: "State Portal Fixed-Price App Rebuild",
    agency: "State Procurement Office",
    source: "State portal",
    source_url: "https://example.com/state-portal",
    solicitation_number: "STATE-26-PORTAL",
    due_date: "2026-05-24",
    naics: "541511",
    estimated_value: "$220K",
    raw_text: demoRfpTexts.statePortal,
    status: "No-Bid",
    owner: "Elena Ruiz",
    outcome: "no-bid",
    created_at: now,
    updated_at: now
  }
];

export const demoEvaluations: Evaluation[] = [
  seedEvaluation({
    id: "eval-dhs-cloud",
    rfpId: "rfp-dhs-cloud",
    verdict: "BID",
    confidence: "HIGH",
    score: 4.35,
    title: "DHS Cloud Migration and FedRAMP Support",
    tldr:
      "Credible BID. The RFP matches Northstar's DHS cloud readiness, FedRAMP, cybersecurity documentation, and managed services evidence.",
    primaryMatch:
      "The contractor shall support cloud migration planning, FedRAMP documentation, security control mapping, and managed services transition support.",
    gap: "Confirm availability of three current past performance examples.",
    wiring: "No severe incumbent signal appears in the excerpt.",
    effort: [58, 86]
  }),
  seedEvaluation({
    id: "eval-dod-classified",
    rfpId: "rfp-dod-classified",
    verdict: "NO_BID",
    confidence: "HIGH",
    score: 1.85,
    title: "DoD Classified Network Operations",
    tldr:
      "NO-BID. The RFP makes an active Top Secret facility clearance mandatory and Northstar does not list a facility clearance.",
    disqualifier:
      "Active Top Secret facility clearance is mandatory at proposal submission and Northstar has no facility clearance.",
    primaryMatch:
      "Offerors without an active facility clearance at time of proposal submission will be deemed non-responsive.",
    gap: "Northstar does not list facility clearance or cleared 24/7 secure operations.",
    wiring: "The clearance gate creates a non-responsive risk before technical scoring.",
    effort: [42, 70]
  }),
  seedEvaluation({
    id: "eval-hhs-data",
    rfpId: "rfp-hhs-data",
    verdict: "BID",
    confidence: "MEDIUM",
    score: 4.02,
    title: "HHS Data Platform Modernization",
    tldr:
      "BID with staffing validation. HHS data pipeline past performance is directly relevant, but proposal owners should verify depth for dashboard migration and cloud architecture.",
    primaryMatch:
      "The contractor shall provide data engineering, cloud architecture, project management, and documentation support.",
    gap: "Dashboard migration proof is thinner than data pipeline proof.",
    wiring: "No incumbent is named, but equal weighting of technical approach and past performance rewards comparable agency evidence.",
    effort: [64, 94]
  }),
  seedEvaluation({
    id: "eval-va-helpdesk",
    rfpId: "rfp-va-helpdesk",
    verdict: "MAYBE",
    confidence: "MEDIUM",
    score: 3.22,
    title: "VA Help Desk Staff Augmentation",
    tldr:
      "MAYBE. Northstar has a relevant VA subcontract reference, but the RFP is staff-augmentation heavy and margin may be weak.",
    primaryMatch:
      "The subcontractor shall provide Tier 1 and Tier 2 support process redesign, knowledge base cleanup, service desk reporting, and managed services transition support.",
    gap: "Northstar has help desk modernization evidence but limited scale for staffing-heavy delivery.",
    wiring: "Prime-led structure may limit pricing control and customer relationship value.",
    effort: [44, 76]
  }),
  seedEvaluation({
    id: "eval-gsa-cyber",
    rfpId: "rfp-gsa-cyber",
    verdict: "BID",
    confidence: "HIGH",
    score: 4.48,
    title: "GSA Cybersecurity Documentation Support",
    tldr:
      "Strong BID. GSA MAS access, FedRAMP advisory evidence, and cybersecurity documentation work match the stated requirements.",
    primaryMatch:
      "GSA requires cybersecurity documentation support for cloud authorization packages, security control traceability, system security plan updates, and FedRAMP readiness advisory support.",
    gap: "Confirm named staff availability for NIST 800-53 and POA&M work.",
    wiring: "GSA MAS access is required, which Northstar holds.",
    effort: [52, 82]
  }),
  seedEvaluation({
    id: "eval-state-portal",
    rfpId: "rfp-state-portal",
    verdict: "NO_BID",
    confidence: "HIGH",
    score: 2.08,
    title: "State Portal Fixed-Price App Rebuild",
    tldr:
      "NO-BID. The work is a low-budget fixed-price custom software rebuild with liquidated damages and weak fit to Northstar's federal cloud and compliance strengths.",
    disqualifier:
      "Fixed-price custom software rebuild appears below Northstar's margin discipline and estimated value is below the $250K threshold.",
    primaryMatch:
      "The contractor must accept a fixed-price development contract with liquidated damages and provide five comparable statewide portal implementations.",
    gap: "Northstar does not show five statewide portal implementations.",
    wiring: "Lowest price technically acceptable procedures are likely to compress margin.",
    effort: [60, 102]
  })
];

export const demoOutcomes: Outcome[] = demoRfps.map((rfp) => ({
  id: `outcome-${rfp.id}`,
  rfp_id: rfp.id,
  evaluation_id: `eval-${rfp.id.replace("rfp-", "")}`,
  final_decision:
    rfp.status === "Pursue" ? "Pursue" : rfp.status === "No-Bid" ? "No-Bid" : "Undecided",
  rfpop_influenced: true,
  submitted: rfp.outcome === "won" || rfp.outcome === "lost",
  outcome: rfp.outcome,
  loss_reason: "",
  hours_spent: rfp.status === "No-Bid" ? 4 : 26,
  notes: rfp.status === "No-Bid" ? "Decision recorded after RFPOps review." : "Pending capture decision.",
  would_make_same_decision: true,
  created_at: now,
  updated_at: now
}));
