import type { Verdict } from "@/lib/schemas/domain";
import { Badge } from "@/components/ui/badge";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const tone = verdict === "BID" ? "bid" : verdict === "MAYBE" ? "maybe" : "nobid";
  return <Badge tone={tone}>{verdict === "NO_BID" ? "NO-BID" : verdict}</Badge>;
}
