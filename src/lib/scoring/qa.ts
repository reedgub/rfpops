import type { Evaluation } from "@/types";
import { checkVerdictAlignment } from "@/lib/scoring/verdict";

export const bannedPhrases = [
  "leverage",
  "synergy",
  "world-class",
  "best-in-class",
  "robust",
  "seamless",
  "empower",
  "cutting-edge",
  "unlock value",
  "drive transformation",
  "holistic",
  "innovative solution",
  "next-generation",
  "game-changing",
  "tailored solution",
  "strategic partner",
  "proven track record"
];

type QaCheck = Evaluation["qa_checks"][number];

function materialText(evaluation: Evaluation) {
  return [
    evaluation.tldr,
    evaluation.recommendation_memo,
    ...evaluation.dimension_scores.flatMap((dimension) => [
      dimension.rationale,
      ...dimension.evidence,
      ...dimension.risks,
      ...dimension.improvement_actions
    ]),
    ...evaluation.key_risks,
    ...evaluation.win_themes,
    ...evaluation.capability_gaps,
    ...evaluation.wiring_signals,
    ...evaluation.margin_concerns,
    ...evaluation.recommended_next_actions,
    ...evaluation.citations.map((citation) => citation.text),
    ...evaluation.compliance_requirements.map((requirement) => requirement.requirement_text)
  ]
    .join(" ")
    .toLowerCase();
}

export function runQaChecks(evaluation: Evaluation): QaCheck[] {
  const text = materialText(evaluation);
  const detected = bannedPhrases.filter((phrase) => text.includes(phrase));
  const dimensionsHaveEvidence = evaluation.dimension_scores.every(
    (dimension) => dimension.evidence.length > 0 && dimension.rationale.trim().length > 0
  );
  const verdictAlignment = checkVerdictAlignment(evaluation);
  const citationsExist = evaluation.citations.length > 0;
  const unsupportedClaims = evaluation.dimension_scores.filter(
    (dimension) => dimension.rationale.length > 0 && dimension.evidence.length === 0
  );

  return [
    {
      name: "Banned phrases",
      passed: detected.length === 0,
      notes: detected.length ? `Remove: ${detected.join(", ")}` : "No banned phrases detected."
    },
    {
      name: "Evidence coverage",
      passed: dimensionsHaveEvidence,
      notes: dimensionsHaveEvidence
        ? "Each dimension includes evidence."
        : "One or more dimensions are missing evidence."
    },
    {
      name: "Verdict alignment",
      passed: verdictAlignment.passed,
      notes: verdictAlignment.passed
        ? "Verdict follows score and disqualifier rules."
        : `Expected ${verdictAlignment.expected} based on rules.`
    },
    {
      name: "Citation coverage",
      passed: citationsExist,
      notes: citationsExist ? "Citations are present." : "No citations were returned."
    },
    {
      name: "Unsupported claims",
      passed: unsupportedClaims.length === 0,
      notes: unsupportedClaims.length
        ? "Some rationales lack evidence."
        : "No unsupported dimension claims detected."
    }
  ];
}
