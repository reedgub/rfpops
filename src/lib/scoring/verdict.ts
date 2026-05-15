import type { DimensionScore, Evaluation, Verdict } from "@/lib/schemas/domain";

const weightedKeys = new Set([
  "capability_match",
  "past_performance_relevance",
  "win_probability",
  "margin_viability",
  "strategic_fit"
]);

export function calculateCompositeScore(dimensions: DimensionScore[]) {
  const weightedTotal = dimensions
    .filter((dimension) => weightedKeys.has(dimension.key))
    .reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0);

  return Math.round(weightedTotal * 100) / 100;
}

export function applyVerdictRules(input: {
  compositeScore: number;
  dimensions: DimensionScore[];
  hardDisqualifierCount: number;
  effortHigh: boolean;
}): Verdict {
  const scoreFor = (key: DimensionScore["key"]) =>
    input.dimensions.find((dimension) => dimension.key === key)?.score ?? 0;

  if (input.hardDisqualifierCount > 0) {
    return "NO_BID";
  }

  if (scoreFor("win_probability") < 2 && input.effortHigh) {
    return "NO_BID";
  }

  if (scoreFor("capability_match") < 2.5 && scoreFor("past_performance_relevance") < 2.5) {
    return "NO_BID";
  }

  if (input.compositeScore >= 4) {
    return "BID";
  }

  if (input.compositeScore >= 3) {
    return "MAYBE";
  }

  return "NO_BID";
}

export function verdictLabel(verdict: Verdict) {
  return verdict === "NO_BID" ? "NO-BID" : verdict;
}

export function checkVerdictAlignment(evaluation: Pick<Evaluation, "verdict" | "dimension_scores" | "composite_score" | "hard_disqualifiers" | "effort_estimate">) {
  const expected = applyVerdictRules({
    compositeScore: evaluation.composite_score,
    dimensions: evaluation.dimension_scores,
    hardDisqualifierCount: evaluation.hard_disqualifiers.filter((item) => item.severity === "hard").length,
    effortHigh: evaluation.effort_estimate.max_hours >= 100
  });

  return {
    expected,
    passed: expected === evaluation.verdict
  };
}
