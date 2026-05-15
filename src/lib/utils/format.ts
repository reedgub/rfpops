import { format, parseISO } from "date-fns";
import type { Verdict } from "@/lib/schemas/domain";

export function formatDate(date: string) {
  try {
    return format(parseISO(date), "MMM d, yyyy");
  } catch {
    return date;
  }
}

export function verdictTone(verdict?: Verdict) {
  if (verdict === "BID") return "bid";
  if (verdict === "MAYBE") return "maybe";
  return "nobid";
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
