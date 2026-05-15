import { z } from "zod";

export const verdictSchema = z.enum(["BID", "MAYBE", "NO_BID"]);
export const confidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const dimensionKeySchema = z.enum([
  "capability_match",
  "past_performance_relevance",
  "win_probability",
  "margin_viability",
  "strategic_fit",
  "effort_timing"
]);

export const dimensionScoreSchema = z.object({
  key: dimensionKeySchema,
  label: z.string(),
  score: z.number().min(0).max(5),
  weight: z.number().min(0).max(1),
  rationale: z.string().min(1),
  evidence: z.array(z.string()).min(1),
  risks: z.array(z.string()),
  improvement_actions: z.array(z.string())
});

export const citationSchema = z.object({
  id: z.string(),
  source: z.string(),
  text: z.string(),
  location: z.string().optional()
});

export const hardDisqualifierSchema = z.object({
  id: z.string(),
  description: z.string(),
  severity: z.enum(["hard", "soft"]),
  resolvable_with_teaming: z.boolean(),
  evidence: z.string(),
  citation_id: z.string().optional()
});

export const pastPerformanceMatchSchema = z.object({
  project_id: z.string(),
  project_name: z.string(),
  relevance_score: z.number().min(0).max(5),
  rationale: z.string(),
  shared_evidence: z.array(z.string())
});

export const complianceRequirementSchema = z.object({
  id: z.string(),
  section: z.string(),
  requirement_text: z.string(),
  requirement_type: z.string(),
  mandatory: z.boolean(),
  risk: z.enum(["Low", "Medium", "High"]),
  owner: z.string(),
  status: z.enum(["Unassigned", "Mapped", "Gap", "In Review", "Complete"]),
  source_citation: z.string()
});

export const draftScaffoldsSchema = z.object({
  executive_summary_outline: z.array(z.string()),
  past_performance_mapping: z.array(z.string()),
  technical_approach_outline: z.array(z.string()),
  management_approach_outline: z.array(z.string())
});

export const qaCheckSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  notes: z.string()
});

export const evaluationSchema = z.object({
  id: z.string(),
  rfp_id: z.string(),
  verdict: verdictSchema,
  confidence: confidenceSchema,
  composite_score: z.number().min(0).max(5),
  tldr: z.string().min(1),
  recommendation_memo: z.string().min(1),
  dimension_scores: z.array(dimensionScoreSchema).length(6),
  hard_disqualifiers: z.array(hardDisqualifierSchema),
  key_risks: z.array(z.string()),
  win_themes: z.array(z.string()),
  capability_gaps: z.array(z.string()),
  past_performance_matches: z.array(pastPerformanceMatchSchema),
  wiring_signals: z.array(z.string()),
  margin_concerns: z.array(z.string()),
  effort_estimate: z.object({
    min_hours: z.number().int().nonnegative(),
    max_hours: z.number().int().nonnegative(),
    rationale: z.string()
  }),
  recommended_next_actions: z.array(z.string()),
  citations: z.array(citationSchema).min(1),
  compliance_requirements: z.array(complianceRequirementSchema),
  draft_scaffolds: draftScaffoldsSchema,
  qa_checks: z.array(qaCheckSchema),
  model_used: z.string(),
  prompt_version: z.string(),
  created_at: z.string()
});

export const capabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  maturity: z.enum(["emerging", "credible", "strong", "flagship"]),
  technologies: z.array(z.string()),
  proof_points: z.array(z.string()),
  tags: z.array(z.string())
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  notes: z.string()
});

export const disqualifierSchema = z.object({
  id: z.string(),
  rule_type: z.string(),
  description: z.string(),
  threshold_value: z.string(),
  active: z.boolean()
});

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  revenue_range: z.string(),
  employee_count: z.number().int(),
  primary_naics: z.string()
});

export const organizationProfileSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  target_agencies: z.array(z.string()),
  target_contract_vehicles: z.array(z.string()),
  target_capabilities: z.array(z.string()),
  target_geographies: z.array(z.string()),
  desired_logos: z.array(z.string()),
  minimum_margin_percent: z.number(),
  strategic_notes: z.string()
});

export const pastPerformanceSchema = z.object({
  id: z.string(),
  project_name: z.string(),
  customer: z.string(),
  agency: z.string(),
  role: z.enum(["Prime", "Subcontractor"]),
  contract_vehicle: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  dollar_value: z.number(),
  scope: z.string(),
  technologies: z.array(z.string()),
  outcomes: z.string(),
  relevant_naics: z.array(z.string()),
  relevant_capabilities: z.array(z.string()),
  reusable_narrative: z.string(),
  restrictions: z.string(),
  tags: z.array(z.string())
});

export const libraryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  content: z.string(),
  tags: z.array(z.string())
});

export const rfpSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  title: z.string(),
  agency: z.string(),
  source: z.string(),
  source_url: z.string(),
  solicitation_number: z.string(),
  due_date: z.string(),
  naics: z.string(),
  estimated_value: z.string(),
  raw_text: z.string(),
  status: z.enum([
    "New",
    "Evaluating",
    "Pursue",
    "No-Bid",
    "Drafting",
    "Submitted",
    "Won",
    "Lost",
    "Archived"
  ]),
  owner: z.string(),
  outcome: z.enum(["pending", "won", "lost", "canceled", "no-bid"]),
  created_at: z.string(),
  updated_at: z.string()
});

export const outcomeSchema = z.object({
  id: z.string(),
  rfp_id: z.string(),
  evaluation_id: z.string(),
  final_decision: z.string(),
  rfpop_influenced: z.boolean(),
  submitted: z.boolean(),
  outcome: z.enum(["pending", "won", "lost", "canceled", "no-bid"]),
  loss_reason: z.string(),
  hours_spent: z.number().int().nonnegative(),
  notes: z.string(),
  would_make_same_decision: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const userContextSchema = z.object({
  pursuitRole: z.enum(["prime", "subcontractor"]).optional(),
  strategicImportance: z.enum(["low", "medium", "high"]).optional(),
  knownIncumbent: z.enum(["unknown", "yes", "no"]).optional(),
  incumbentNotes: z.string().optional(),
  targetAgencyRelationship: z.enum(["none", "weak", "strong"]).optional(),
  teamingPartner: z.string().optional(),
  fileName: z.string().optional()
});

export const scoreInputSchema = z.object({
  title: z.string().optional(),
  sourceUrl: z.string().optional(),
  rfpText: z.string().min(40, "Paste enough RFP text to evaluate the opportunity."),
  fileName: z.string().optional(),
  userContext: userContextSchema.optional()
});

export const scoringContextSchema = z.object({
  organization: organizationSchema,
  profile: organizationProfileSchema,
  capabilities: z.array(capabilitySchema),
  certifications: z.array(certificationSchema),
  disqualifiers: z.array(disqualifierSchema),
  pastPerformance: z.array(pastPerformanceSchema)
});

export type Verdict = z.infer<typeof verdictSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type DimensionKey = z.infer<typeof dimensionKeySchema>;
export type DimensionScore = z.infer<typeof dimensionScoreSchema>;
export type Evaluation = z.infer<typeof evaluationSchema>;
export type ComplianceRequirement = z.infer<typeof complianceRequirementSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;
export type Capability = z.infer<typeof capabilitySchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Disqualifier = z.infer<typeof disqualifierSchema>;
export type PastPerformance = z.infer<typeof pastPerformanceSchema>;
export type LibraryItem = z.infer<typeof libraryItemSchema>;
export type Rfp = z.infer<typeof rfpSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;
export type ScoreInput = z.infer<typeof scoreInputSchema>;
export type ScoringContext = z.infer<typeof scoringContextSchema>;
export type UserContext = z.infer<typeof userContextSchema>;

export type RfpWithEvaluation = Rfp & {
  evaluation?: Evaluation;
  outcome_record?: Outcome;
};
