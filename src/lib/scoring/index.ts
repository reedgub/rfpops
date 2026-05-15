import type { Evaluation, ScoreInput, ScoringContext } from "@/lib/schemas/domain";
import { scoreWithAnthropic } from "@/lib/ai/anthropic";
import { scoreRfpDeterministically } from "@/lib/scoring/deterministic";

export async function scoreRfp(
  input: ScoreInput & { context: ScoringContext; rfpId: string }
): Promise<Evaluation> {
  const anthropicResult = await scoreWithAnthropic(input);
  if (anthropicResult) {
    return anthropicResult;
  }

  return scoreRfpDeterministically(input);
}
