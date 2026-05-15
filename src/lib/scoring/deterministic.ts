import type {
  Capability,
  ComplianceRequirement,
  DimensionScore,
  Evaluation,
  PastPerformance,
  ScoreInput,
  ScoringContext
} from "@/lib/schemas/domain";
import { createId } from "@/lib/utils/id";
import { calculateCompositeScore, applyVerdictRules } from "@/lib/scoring/verdict";
import { runQaChecks } from "@/lib/scoring/qa";
import { extractDueDays } from "@/lib/scoring/metadata";
import { evaluationSchema } from "@/lib/schemas/domain";

const dimensionWeights = {
  capability_match: 0.3,
  past_performance_relevance: 0.25,
  win_probability: 0.2,
  margin_viability: 0.15,
  strategic_fit: 0.1,
  effort_timing: 0
} as const;

const requirementTerms = ["shall", "must", "required", "submit", "provide", "demonstrate", "certify", "include"];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function tokens(text: string) {
  return new Set(
    normalize(text)
      .split(/\s+/)
      .filter((token) => token.length > 2 && !["the", "and", "for", "with", "are", "this", "that"].includes(token))
  );
}

function overlap(a: string, b: string) {
  const aTokens = tokens(a);
  const bTokens = tokens(b);
  let count = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) count += 1;
  }
  return count / Math.max(1, Math.min(aTokens.size, bTokens.size));
}

function capabilityText(capability: Capability) {
  return [
    capability.name,
    capability.description,
    ...capability.technologies,
    ...capability.proof_points,
    ...capability.tags
  ].join(" ");
}

function pastPerformanceText(record: PastPerformance) {
  return [
    record.project_name,
    record.customer,
    record.agency,
    record.scope,
    record.outcomes,
    ...record.technologies,
    ...record.relevant_capabilities,
    ...record.tags
  ].join(" ");
}

function clampScore(score: number) {
  return Math.max(0, Math.min(5, Math.round(score * 10) / 10));
}

function sentenceSnippets(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function topCapabilityMatches(text: string, capabilities: Capability[]) {
  return capabilities
    .map((capability) => ({
      capability,
      score: overlap(text, capabilityText(capability))
    }))
    .sort((a, b) => b.score - a.score);
}

function topPastPerformanceMatches(text: string, pastPerformance: PastPerformance[]) {
  return pastPerformance
    .map((record) => ({
      record,
      score: overlap(text, pastPerformanceText(record))
    }))
    .sort((a, b) => b.score - a.score);
}

function detectHardDisqualifiers(input: ScoreInput, context: ScoringContext) {
  const text = input.rfpText.toLowerCase();
  const dueDays = extractDueDays(input.rfpText);
  const certNames = context.certifications.map((cert) => cert.name.toLowerCase());
  const disqualifiers = [];

  if (
    /(facility clearance|top secret|classified|secure facility|cleared personnel)/i.test(input.rfpText) &&
    !certNames.some((name) => name.includes("facility clearance"))
  ) {
    disqualifiers.push({
      id: "DQ-FCL",
      description:
        "Required facility clearance appears mandatory and Northstar does not list an active facility clearance.",
      severity: "hard" as const,
      resolvable_with_teaming: false,
      evidence:
        sentenceSnippets(input.rfpText).find((sentence) =>
          /(facility clearance|top secret|classified|secure facility|cleared personnel)/i.test(sentence)
        ) ?? "RFP references classified work or facility clearance.",
      citation_id: "C-001"
    });
  }

  if (text.includes("gsa mas") && !certNames.some((name) => name.includes("gsa"))) {
    disqualifiers.push({
      id: "DQ-GSA",
      description: "GSA MAS access is mandatory and the profile does not list that vehicle.",
      severity: "hard" as const,
      resolvable_with_teaming: true,
      evidence: "RFP requires GSA MAS access.",
      citation_id: "C-001"
    });
  }

  if (dueDays !== undefined && dueDays < 7) {
    disqualifiers.push({
      id: "DQ-DUE",
      description: `Response window is ${dueDays} days, below Northstar's 7-day threshold.`,
      severity: "hard" as const,
      resolvable_with_teaming: false,
      evidence: `Proposals are due in ${dueDays} days.`,
      citation_id: "C-001"
    });
  }

  if (/fixed-price|fixed price/i.test(input.rfpText) && /custom|rebuild|portal|development/i.test(input.rfpText)) {
    const lowValue = /\$2[0-4]\d[,0-9]*|\$[0-1]\d{2},?\d{3}/i.test(input.rfpText);
    if (lowValue || /lowest price technically acceptable|liquidated damages/i.test(input.rfpText)) {
      disqualifiers.push({
        id: "DQ-FP",
        description:
          "Fixed-price custom development appears to conflict with Northstar's margin and risk rules.",
        severity: "hard" as const,
        resolvable_with_teaming: false,
        evidence:
          sentenceSnippets(input.rfpText).find((sentence) => /fixed-price|fixed price|lowest price/i.test(sentence)) ??
          "RFP references fixed-price custom development.",
        citation_id: "C-001"
      });
    }
  }

  return disqualifiers;
}

function extractCompliance(text: string): ComplianceRequirement[] {
  const sentences = sentenceSnippets(text);
  const requirements = sentences
    .filter((sentence) => requirementTerms.some((term) => sentence.toLowerCase().includes(term)))
    .slice(0, 12)
    .map((sentence, index): ComplianceRequirement => {
      const lower = sentence.toLowerCase();
      const risk =
        /(facility clearance|top secret|fixed-price|lowest price|five comparable|mandatory)/i.test(sentence)
          ? "High"
          : /(staffing|past performance|price|transition|security)/i.test(sentence)
            ? "Medium"
            : "Low";

      return {
        id: `R-${String(index + 1).padStart(3, "0")}`,
        section: "Extracted text",
        requirement_text: sentence,
        requirement_type: lower.includes("past performance")
          ? "Past Performance"
          : lower.includes("price")
            ? "Pricing"
            : lower.includes("staff")
              ? "Staffing"
              : lower.includes("submit") || lower.includes("include")
                ? "Submission"
                : "Technical",
        mandatory: /(shall|must|required|certify)/i.test(sentence),
        risk,
        owner: risk === "High" ? "Capture Lead" : lower.includes("price") ? "Pricing" : "Proposal Manager",
        status: risk === "High" ? "Gap" : "Mapped",
        source_citation: "C-001"
      };
    });

  if (requirements.length > 0) {
    return requirements;
  }

  return [
    {
      id: "R-001",
      section: "Extracted text",
      requirement_text: "Create a compliance matrix from the full solicitation before drafting.",
      requirement_type: "Submission",
      mandatory: true,
      risk: "Medium",
      owner: "Proposal Manager",
      status: "Unassigned",
      source_citation: "C-001"
    }
  ];
}

function dimension(
  key: DimensionScore["key"],
  label: string,
  score: number,
  rationale: string,
  evidence: string[],
  risks: string[],
  improvementActions: string[]
): DimensionScore {
  return {
    key,
    label,
    score: clampScore(score),
    weight: dimensionWeights[key],
    rationale,
    evidence: evidence.length ? evidence : ["Insufficient direct evidence in the provided text."],
    risks,
    improvement_actions: improvementActions
  };
}

export async function scoreRfpDeterministically(input: ScoreInput & { context: ScoringContext; rfpId: string }) {
  const matches = topCapabilityMatches(input.rfpText, input.context.capabilities);
  const ppMatches = topPastPerformanceMatches(input.rfpText, input.context.pastPerformance);
  const topCapabilities = matches.slice(0, 3);
  const topPp = ppMatches.slice(0, 3);
  const hardDisqualifiers = detectHardDisqualifiers(input, input.context);
  const dueDays = extractDueDays(input.rfpText);
  const complianceRequirements = extractCompliance(input.rfpText);
  const lower = input.rfpText.toLowerCase();
  const targetAgencyHit = input.context.profile.target_agencies.some((agency) => lower.includes(agency.toLowerCase()));
  const targetCapabilityHit = input.context.profile.target_capabilities.some((capability) =>
    lower.includes(capability.toLowerCase().split(" ")[0])
  );
  const capabilityEvidence = topCapabilities.map(({ capability }) => capability.name);
  const pastEvidence = topPp.map(({ record }) => record.project_name);
  const maxCapabilityOverlap = topCapabilities[0]?.score ?? 0;
  const maxPpOverlap = topPp[0]?.score ?? 0;
  const highEffort = complianceRequirements.length >= 8 || (dueDays !== undefined && dueDays <= 10);
  const wiringSignals = [
    dueDays !== undefined && dueDays <= 10 ? `Short response window of ${dueDays} days.` : "",
    /incumbent|existing contract|current contractor|transition from current/i.test(input.rfpText)
      ? "Scope language references an incumbent or existing contract."
      : "",
    /specific|proprietary|named vendor|oracle|servicenow|salesforce/i.test(input.rfpText)
      ? "Technology references may narrow the field."
      : "",
    /agency-specific|prior agency|within the agency/i.test(input.rfpText)
      ? "Evaluation appears to reward prior agency-specific experience."
      : ""
  ].filter(Boolean);

  const capabilityScore = clampScore(2.2 + maxCapabilityOverlap * 7 + Math.min(1.2, topCapabilities.length * 0.25));
  const pastPerformanceScore = clampScore(2 + maxPpOverlap * 7 + Math.min(1, topPp.length * 0.2));
  const winPenalty =
    hardDisqualifiers.length * 2.2 +
    (dueDays !== undefined && dueDays < 14 ? 0.5 : 0) +
    (wiringSignals.length > 1 ? 0.35 : 0);
  const winScore = clampScore(3.4 + (targetAgencyHit ? 0.5 : 0) + maxPpOverlap * 1.8 - winPenalty);
  const marginPenalty =
    /lowest price|lpta|staff augmentation|staff-augmentation|fixed-price|fixed price|liquidated damages/i.test(
      input.rfpText
    )
      ? 0.9
      : 0;
  const marginScore = clampScore(3.7 - marginPenalty - hardDisqualifiers.length * 0.4);
  const strategicScore = clampScore(
    2.7 +
      (targetAgencyHit ? 0.8 : 0) +
      (targetCapabilityHit ? 0.7 : 0) +
      (input.userContext?.strategicImportance === "high" ? 0.4 : 0)
  );
  const effortScore = clampScore(4.1 - (highEffort ? 1.1 : 0) - (dueDays !== undefined && dueDays < 14 ? 0.6 : 0));

  const dimensions: DimensionScore[] = [
    dimension(
      "capability_match",
      "Capability Match",
      capabilityScore,
      `The strongest matches are ${capabilityEvidence.join(", ") || "not clear from the provided text"}.`,
      capabilityEvidence,
      capabilityScore < 3 ? ["Required scope is outside Northstar's strongest capabilities."] : [],
      ["Confirm named staff, delivery artifacts, and customer references for each mandatory requirement."]
    ),
    dimension(
      "past_performance_relevance",
      "Past Performance Relevance",
      pastPerformanceScore,
      `Closest references are ${pastEvidence.join(", ") || "not evident in the profile"}.`,
      pastEvidence,
      pastPerformanceScore < 3 ? ["Past performance relevance may be too thin for a strong technical score."] : [],
      ["Write a relevance bridge for each selected project, including agency, scope, and outcome fit."]
    ),
    dimension(
      "win_probability",
      "Win Probability",
      winScore,
      wiringSignals.length
        ? `Win probability is constrained by ${wiringSignals.join(" ")}`
        : "No severe incumbent or eligibility signal appears in the provided text.",
      wiringSignals.length ? wiringSignals : ["No named incumbent signal found in the provided text."],
      wiringSignals,
      ["Use Q&A and market intelligence to test whether the opportunity is open or shaped around another vendor."]
    ),
    dimension(
      "margin_viability",
      "Margin Viability",
      marginScore,
      marginPenalty
        ? "Margin risk is elevated because the RFP references price pressure, staffing-heavy work, or fixed-price delivery."
        : "Margin appears plausible if labor mix and review effort stay inside the pursuit plan.",
      [`Northstar minimum margin target is ${input.context.profile.minimum_margin_percent}%.`],
      marginPenalty ? ["Price structure may conflict with Northstar's margin target."] : [],
      ["Create a rough labor mix, subcontractor need, and margin view before full proposal approval."]
    ),
    dimension(
      "strategic_fit",
      "Strategic Fit",
      strategicScore,
      targetAgencyHit || targetCapabilityHit
        ? "The opportunity supports Northstar's target agencies or repeatable capability areas."
        : "Strategic fit is limited because the agency or scope is outside current targets.",
      [
        `Target agencies: ${input.context.profile.target_agencies.join(", ")}`,
        `Target capabilities: ${input.context.profile.target_capabilities.join(", ")}`
      ],
      strategicScore < 3 ? ["This may distract from the current beachhead."] : [],
      ["Label strategic long shots explicitly if leadership still chooses to pursue."]
    ),
    dimension(
      "effort_timing",
      "Effort / Timing",
      effortScore,
      `Estimated response effort reflects ${complianceRequirements.length} extracted requirements and ${
        dueDays ? `${dueDays} days until due date` : "an unknown due date"
      }.`,
      complianceRequirements.slice(0, 3).map((requirement) => requirement.requirement_text),
      highEffort ? ["Proposal effort may require scarce senior staff."] : [],
      ["Assign owners for compliance matrix, pricing, technical approach, and past performance within one business day."]
    )
  ];

  const composite = calculateCompositeScore(dimensions);
  const effortEstimate = {
    min_hours: highEffort ? 72 : 44,
    max_hours: highEffort ? 118 : 82,
    rationale: "Estimate covers qualification, compliance matrix, technical narrative, pricing review, and leadership approval."
  };
  const verdict = applyVerdictRules({
    compositeScore: composite,
    dimensions,
    hardDisqualifierCount: hardDisqualifiers.filter((item) => item.severity === "hard").length,
    effortHigh: effortEstimate.max_hours >= 100
  });
  const confidence =
    hardDisqualifiers.length > 0 || composite >= 4.2 || composite < 2.4 ? ("HIGH" as const) : ("MEDIUM" as const);
  const topPastMatches = topPp.map(({ record, score }) => ({
    project_id: record.id,
    project_name: record.project_name,
    relevance_score: clampScore(2 + score * 6),
    rationale: `${record.project_name} shares ${record.relevant_capabilities.slice(0, 3).join(", ")} with the RFP scope.`,
    shared_evidence: record.relevant_capabilities
  }));
  const capabilityGaps = [
    hardDisqualifiers.length ? hardDisqualifiers[0].description : "",
    capabilityScore < 3 ? "Capability evidence is weaker than the RFP scope requires." : "",
    /five comparable/i.test(input.rfpText) ? "RFP asks for five comparable implementations; profile has fewer direct examples." : "",
    /24\/7|round-the-clock/i.test(input.rfpText) ? "24/7 operations depth is not established in the profile." : ""
  ].filter(Boolean);
  const winThemes =
    verdict === "NO_BID"
      ? ["Only revisit through a partner if the disqualifying requirement is fully covered."]
      : [
          `${topCapabilities[0]?.capability.name ?? "Core delivery"} evidence maps to the stated work.`,
          `${topPastMatches[0]?.project_name ?? "Recent federal work"} can anchor the past performance story.`,
          "Compliance-first delivery discipline is a credible differentiator for this buyer."
        ];
  const citations = [
    {
      id: "C-001",
      source: input.title || "RFP text",
      text: sentenceSnippets(input.rfpText).slice(0, 2).join(" ").slice(0, 700) || input.rfpText.slice(0, 700),
      location: "Provided RFP text"
    },
    {
      id: "C-002",
      source: "Organization profile",
      text: `${input.context.organization.name} target agencies include ${input.context.profile.target_agencies.join(", ")}.`,
      location: "Organization profile"
    }
  ];

  const evaluation: Evaluation = {
    id: createId("eval"),
    rfp_id: input.rfpId,
    verdict,
    confidence,
    composite_score: composite,
    tldr:
      verdict === "BID"
        ? `BID. ${input.title ?? "This opportunity"} is a credible fit if staffing and pricing check out.`
        : verdict === "MAYBE"
          ? `MAYBE. ${input.title ?? "This opportunity"} has enough fit to investigate, but the bid should not proceed without resolving the named risks.`
          : `NO-BID. ${hardDisqualifiers[0]?.description ?? "The score and risk profile do not justify proposal effort."}`,
    recommendation_memo:
      verdict === "BID"
        ? `This is a credible bid because capability match, past performance relevance, and strategic fit are strong enough to justify a pursuit review. Keep the decision conditional on margin and named staff availability.`
        : verdict === "MAYBE"
          ? `This is a disciplined maybe, not a default yes. The opportunity needs specific next actions before leadership commits proposal capacity. If those actions do not improve evidence, no-bid it.`
          : `Do not commit proposal resources. ${hardDisqualifiers[0]?.description ?? "The opportunity is weak against Northstar's fit, margin, and win-probability rules."}`,
    dimension_scores: dimensions,
    hard_disqualifiers: hardDisqualifiers,
    key_risks: [
      ...capabilityGaps,
      ...(wiringSignals.length ? wiringSignals : ["Unknown incumbent position should be checked before a full bid."]),
      marginScore < 3 ? "Margin may fall below Northstar's target." : ""
    ].filter(Boolean),
    win_themes: winThemes,
    capability_gaps: capabilityGaps.length ? capabilityGaps : ["No material capability gap found in the provided text."],
    past_performance_matches: topPastMatches,
    wiring_signals: wiringSignals.length ? wiringSignals : ["No severe wiring signal found in the provided text."],
    margin_concerns:
      marginScore < 3
        ? ["Pricing or contract type may put the 25% margin target at risk."]
        : ["No major margin concern detected from the provided text."],
    effort_estimate: effortEstimate,
    recommended_next_actions:
      verdict === "NO_BID"
        ? ["Record the no-bid reason.", "Do not assign proposal writers.", "Monitor for a future version with the disqualifier removed."]
        : [
            "Hold a pursuit review with delivery, pricing, and BD.",
            "Complete the compliance matrix before drafting.",
            "Choose past performance examples and identify any Q&A needed."
          ],
    citations,
    compliance_requirements: complianceRequirements,
    draft_scaffolds: {
      executive_summary_outline: [
        "Customer problem and decision context",
        "Northstar evidence that matches the RFP",
        "Delivery approach and risk controls",
        "Why the bid is credible"
      ],
      past_performance_mapping: topPastMatches.map(
        (match) => `${match.project_name}: connect ${match.shared_evidence.slice(0, 3).join(", ")} to RFP requirements.`
      ),
      technical_approach_outline: [
        "Discovery and requirement confirmation",
        "Workstream plan mapped to mandatory requirements",
        "Security, data, or operations controls",
        "Quality review and customer checkpoints"
      ],
      management_approach_outline: [
        "Program governance and roles",
        "Staffing plan and escalation model",
        "Risk register and reporting cadence",
        "Transition and closeout plan"
      ]
    },
    qa_checks: [],
    model_used: "deterministic-local",
    prompt_version: "rfpops-v1",
    created_at: new Date().toISOString()
  };

  evaluation.qa_checks = runQaChecks(evaluation);
  return evaluationSchema.parse(evaluation);
}
