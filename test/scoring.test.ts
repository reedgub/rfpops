import { describe, expect, it } from "vitest";
import { scoreRfpDeterministically } from "@/lib/scoring/deterministic";
import { applyVerdictRules } from "@/lib/scoring/verdict";
import { sampleBidRfp, sampleNoBidRfp } from "@/lib/demo/sample-rfps";
import {
  demoCapabilities,
  demoCertifications,
  demoDisqualifiers,
  demoOrganization,
  demoPastPerformance,
  demoProfile
} from "@/lib/demo/seed";
import type { DimensionScore, ScoringContext } from "@/lib/schemas/domain";

const context: ScoringContext = {
  organization: demoOrganization,
  profile: demoProfile,
  capabilities: demoCapabilities,
  certifications: demoCertifications,
  disqualifiers: demoDisqualifiers,
  pastPerformance: demoPastPerformance
};

function dimensions(score: number): DimensionScore[] {
  return [
    ["capability_match", 0.3],
    ["past_performance_relevance", 0.25],
    ["win_probability", 0.2],
    ["margin_viability", 0.15],
    ["strategic_fit", 0.1],
    ["effort_timing", 0]
  ].map(([key, weight]) => ({
    key: key as DimensionScore["key"],
    label: String(key),
    score,
    weight: Number(weight),
    rationale: "Evidence-backed rationale.",
    evidence: ["Evidence"],
    risks: [],
    improvement_actions: []
  }));
}

describe("verdict rules", () => {
  it("returns BID for composite >= 4 with no hard disqualifier", () => {
    expect(
      applyVerdictRules({
        compositeScore: 4.2,
        dimensions: dimensions(4.2),
        hardDisqualifierCount: 0,
        effortHigh: false
      })
    ).toBe("BID");
  });

  it("returns NO_BID when a hard disqualifier exists", () => {
    expect(
      applyVerdictRules({
        compositeScore: 4.8,
        dimensions: dimensions(4.8),
        hardDisqualifierCount: 1,
        effortHigh: false
      })
    ).toBe("NO_BID");
  });
});

describe("deterministic scorer", () => {
  it("scores the DHS sample as BID or strong MAYBE", async () => {
    const evaluation = await scoreRfpDeterministically({
      title: sampleBidRfp.title,
      rfpText: sampleBidRfp.text,
      context,
      rfpId: "rfp-test-bid"
    });

    expect(["BID", "MAYBE"]).toContain(evaluation.verdict);
    expect(evaluation.composite_score).toBeGreaterThanOrEqual(3);
    expect(evaluation.compliance_requirements.length).toBeGreaterThan(0);
  });

  it("scores the DoD clearance sample as NO_BID", async () => {
    const evaluation = await scoreRfpDeterministically({
      title: sampleNoBidRfp.title,
      rfpText: sampleNoBidRfp.text,
      context,
      rfpId: "rfp-test-nobid"
    });

    expect(evaluation.verdict).toBe("NO_BID");
    expect(evaluation.hard_disqualifiers[0]?.description).toContain("facility clearance");
  });
});
