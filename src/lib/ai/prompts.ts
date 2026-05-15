import type { ScoreInput, ScoringContext } from "@/lib/schemas/domain";
import { bannedPhrases } from "@/lib/scoring/qa";

export const RFPOPS_SYSTEM_PROMPT =
  "You are RFPOps, a skeptical senior capture analyst for boutique federal IT and professional services firms. Your job is not to help the user justify bidding. Your job is to help them make a disciplined bid/no-bid decision. Be specific, evidence-grounded, and commercially honest. Do not use generic AI language. Do not overstate certainty. Cite concrete RFP details and company profile evidence. If the firm should not bid, say so directly.";

export function buildScoringPrompt(input: ScoreInput & { context: ScoringContext; rfpId: string }) {
  return JSON.stringify(
    {
      task:
        "Return JSON only. No markdown. No prose outside JSON. Produce a bid/no-bid evaluation that matches the required schema exactly.",
      instructions: [
        "Every material claim must cite RFP or company profile evidence.",
        "If evidence is insufficient, state uncertainty.",
        "Do not invent requirements.",
        "Do not invent past performance.",
        "Use MAYBE only when specific next actions could resolve uncertainty.",
        "If a hard disqualifier fires, recommend NO_BID unless teaming clearly resolves it.",
        "Do not use banned phrases."
      ],
      rfp: {
        id: input.rfpId,
        title: input.title,
        sourceUrl: input.sourceUrl,
        fileName: input.fileName,
        text: input.rfpText
      },
      userContext: input.userContext ?? {},
      organizationProfile: input.context,
      scoringRubric: {
        dimensions: [
          ["capability_match", 0.3],
          ["past_performance_relevance", 0.25],
          ["win_probability", 0.2],
          ["margin_viability", 0.15],
          ["strategic_fit", 0.1],
          ["effort_timing", 0]
        ],
        verdictRules: [
          "Hard disqualifier means NO_BID unless explicitly resolvable with teaming.",
          "Composite >= 4.0 and no hard disqualifier means BID.",
          "Composite >= 3.0 and < 4.0 means MAYBE.",
          "Composite < 3.0 means NO_BID.",
          "If win probability < 2.0 and effort is high, downgrade to NO_BID.",
          "If capability match < 2.5 and past performance < 2.5, downgrade to NO_BID."
        ]
      },
      requiredJsonSchema:
        "Return an object with id, rfp_id, verdict, confidence, composite_score, tldr, recommendation_memo, dimension_scores[6], hard_disqualifiers, key_risks, win_themes, capability_gaps, past_performance_matches, wiring_signals, margin_concerns, effort_estimate, recommended_next_actions, citations, compliance_requirements, draft_scaffolds, qa_checks, model_used, prompt_version, created_at.",
      bannedPhrases,
      qaRequirements: [
        "Check banned phrases.",
        "Every dimension has evidence.",
        "Verdict aligns with score and disqualifiers.",
        "Citations exist.",
        "No empty rationales.",
        "Unsupported claims are flagged."
      ]
    },
    null,
    2
  );
}

export function buildRepairPrompt(invalidJson: string, validationError: string) {
  return [
    "Repair this RFPOps scoring JSON so it matches the required schema.",
    "Return JSON only.",
    "Do not add markdown.",
    `Validation error: ${validationError}`,
    "Invalid JSON:",
    invalidJson
  ].join("\n");
}
