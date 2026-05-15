import type { ScoreInput } from "@/lib/schemas/domain";

export type ExtractedRfpMetadata = {
  title: string;
  agency: string;
  naics: string;
  dueDate: string;
  solicitationNumber: string;
  estimatedValue: string;
  source: string;
  sourceUrl: string;
};

export function extractDueDays(text: string) {
  const match = text.match(/(?:due|responses? are due|proposals? are due)\D{0,20}(\d{1,3})\s+days/i);
  return match ? Number(match[1]) : undefined;
}

export function dateFromDueDays(days?: number) {
  const date = new Date();
  date.setDate(date.getDate() + (days ?? 21));
  return date.toISOString().slice(0, 10);
}

export function extractRfpMetadata(input: ScoreInput): ExtractedRfpMetadata {
  const text = input.rfpText;
  const lower = text.toLowerCase();
  const naics = text.match(/NAICS(?:\scode)?\D{0,10}(\d{6})/i)?.[1] ?? "541512";
  const dueDays = extractDueDays(text);
  const value =
    text.match(/\$[\d,.]+(?:\s?(?:million|m|k))?(?:\s?-\s?\$?[\d,.]+(?:\s?(?:million|m|k))?)?/i)?.[0] ??
    "Not stated";

  const agency = lower.includes("department of homeland security") || lower.includes("dhs")
    ? "DHS"
    : lower.includes("general services administration") || lower.includes("gsa")
      ? "GSA"
      : lower.includes("health and human services") || lower.includes("hhs")
        ? "HHS"
        : lower.includes("veterans affairs") || lower.includes("va ")
          ? "VA"
          : lower.includes("department of defense") || lower.includes("dod")
            ? "DoD"
            : lower.includes("state procurement")
              ? "State Procurement Office"
              : "Unknown agency";

  return {
    title: input.title?.trim() || text.split(/\n|\./)[0]?.slice(0, 96) || "Untitled RFP",
    agency,
    naics,
    dueDate: dateFromDueDays(dueDays),
    solicitationNumber: `${agency.replace(/\W+/g, "").toUpperCase() || "RFP"}-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 900 + 100
    )}`,
    estimatedValue: value,
    source: input.sourceUrl ? "URL" : input.fileName ? "Upload" : "Pasted text",
    sourceUrl: input.sourceUrl ?? ""
  };
}
