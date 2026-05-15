import Anthropic from "@anthropic-ai/sdk";
import type { Evaluation, ScoreInput, ScoringContext } from "@/lib/schemas/domain";
import { evaluationSchema } from "@/lib/schemas/domain";
import { buildRepairPrompt, buildScoringPrompt, RFPOPS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { runQaChecks } from "@/lib/scoring/qa";

function textFromMessage(message: Anthropic.Messages.Message) {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

function parseJson(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(withoutFence);
}

async function createMessage(client: Anthropic, prompt: string) {
  return client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    max_tokens: 8000,
    temperature: 0.1,
    system: RFPOPS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }]
  });
}

export async function scoreWithAnthropic(
  input: ScoreInput & { context: ScoringContext; rfpId: string }
): Promise<Evaluation | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildScoringPrompt(input);
    const first = await createMessage(client, prompt);
    const firstText = textFromMessage(first);

    try {
      const parsed = evaluationSchema.parse(parseJson(firstText));
      parsed.qa_checks = runQaChecks(parsed);
      return evaluationSchema.parse(parsed);
    } catch (error) {
      const repair = await createMessage(
        client,
        buildRepairPrompt(firstText, error instanceof Error ? error.message : "Unknown validation error")
      );
      const repaired = evaluationSchema.parse(parseJson(textFromMessage(repair)));
      repaired.qa_checks = runQaChecks(repaired);
      return evaluationSchema.parse(repaired);
    }
  } catch (error) {
    console.error("Anthropic scoring failed; falling back to deterministic scorer.", error);
    return null;
  }
}
