import { getRepository } from "@/lib/data/repository";
import { scoreInputSchema, type Outcome, type Rfp } from "@/lib/schemas/domain";
import { createId } from "@/lib/utils/id";
import { extractRfpMetadata } from "@/lib/scoring/metadata";
import { scoreRfp } from "@/lib/scoring";

export async function scoreAndPersist(rawInput: unknown) {
  const input = scoreInputSchema.parse(rawInput);
  const repository = getRepository();
  const context = await repository.getScoringContext();
  const metadata = extractRfpMetadata(input);
  const now = new Date().toISOString();
  const rfpId = createId("rfp");
  const evaluation = await scoreRfp({
    ...input,
    context,
    rfpId,
    title: input.title || metadata.title
  });

  const status = evaluation.verdict === "BID" ? "Pursue" : evaluation.verdict === "NO_BID" ? "No-Bid" : "Evaluating";
  const rfp: Rfp = {
    id: rfpId,
    organization_id: context.organization.id,
    title: metadata.title,
    agency: metadata.agency,
    source: metadata.source,
    source_url: metadata.sourceUrl,
    solicitation_number: metadata.solicitationNumber,
    due_date: metadata.dueDate,
    naics: metadata.naics,
    estimated_value: metadata.estimatedValue,
    raw_text: input.rfpText,
    status,
    owner: "Unassigned",
    outcome: evaluation.verdict === "NO_BID" ? "no-bid" : "pending",
    created_at: now,
    updated_at: now
  };

  const outcome: Outcome = {
    id: createId("outcome"),
    rfp_id: rfp.id,
    evaluation_id: evaluation.id,
    final_decision: evaluation.verdict === "NO_BID" ? "No-Bid" : "Undecided",
    rfpop_influenced: true,
    submitted: false,
    outcome: rfp.outcome,
    loss_reason: "",
    hours_spent: evaluation.verdict === "NO_BID" ? 4 : 0,
    notes: evaluation.verdict === "NO_BID" ? "No-bid recorded from RFPOps evaluation." : "",
    would_make_same_decision: true,
    created_at: now,
    updated_at: now
  };

  const saved = await repository.createRfpWithEvaluation({ rfp, evaluation, outcome });

  return {
    mode: repository.mode,
    rfp: saved,
    evaluation,
    redirectUrl: `/pipeline/${rfp.id}`
  };
}
