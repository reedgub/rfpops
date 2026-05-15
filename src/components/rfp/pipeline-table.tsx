"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Archive, ExternalLink, Save } from "lucide-react";
import type { RfpWithEvaluation } from "@/lib/schemas/domain";
import { VerdictBadge } from "@/components/scoring/verdict-badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatDate } from "@/lib/utils/format";

const statuses = ["New", "Evaluating", "Pursue", "No-Bid", "Drafting", "Submitted", "Won", "Lost", "Archived"];
const outcomes = ["pending", "won", "lost", "canceled", "no-bid"];

export function PipelineTable({ initialRfps }: { initialRfps: RfpWithEvaluation[] }) {
  const [rfps, setRfps] = useState(initialRfps);
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return rfps.filter((rfp) => {
      const score = rfp.evaluation?.composite_score ?? 0;
      return (
        (verdictFilter === "all" || rfp.evaluation?.verdict === verdictFilter) &&
        (statusFilter === "all" || rfp.status === statusFilter) &&
        (!agencyFilter || rfp.agency.toLowerCase().includes(agencyFilter.toLowerCase())) &&
        (!scoreMin || score >= Number(scoreMin)) &&
        (!scoreMax || score <= Number(scoreMax))
      );
    });
  }, [agencyFilter, rfps, scoreMax, scoreMin, statusFilter, verdictFilter]);

  function updateRfp(id: string, patch: Record<string, unknown>) {
    startTransition(async () => {
      const response = await fetch(`/api/rfps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (response.ok) {
        const data = await response.json();
        setRfps((current) => current.map((rfp) => (rfp.id === id ? data.rfp : rfp)));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-line bg-panel p-4 md:grid-cols-5">
        <Select value={verdictFilter} onChange={(event) => setVerdictFilter(event.target.value)}>
          <option value="all">All verdicts</option>
          <option value="BID">BID</option>
          <option value="MAYBE">MAYBE</option>
          <option value="NO_BID">NO-BID</option>
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </Select>
        <Input placeholder="Agency" value={agencyFilter} onChange={(event) => setAgencyFilter(event.target.value)} />
        <Input placeholder="Score min" value={scoreMin} onChange={(event) => setScoreMin(event.target.value)} />
        <Input placeholder="Score max" value={scoreMax} onChange={(event) => setScoreMax(event.target.value)} />
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                {[
                  "Opportunity",
                  "Agency / Buyer",
                  "Source",
                  "Solicitation #",
                  "Due date",
                  "NAICS",
                  "Verdict",
                  "Score",
                  "Confidence",
                  "Status",
                  "Owner",
                  "Outcome",
                  "Actions"
                ].map((heading) => (
                  <th key={heading} className="border-b border-line px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-panel/60">
              {filtered.map((rfp) => (
                <tr key={rfp.id} className="align-top hover:bg-surface">
                  <td className="px-3 py-3">
                    <Link href={`/pipeline/${rfp.id}`} className="font-medium text-foreground hover:text-gold">
                      {rfp.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{rfp.agency}</td>
                  <td className="px-3 py-3 text-muted">{rfp.source}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted">{rfp.solicitation_number}</td>
                  <td className="px-3 py-3 text-slate-300">{formatDate(rfp.due_date)}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted">{rfp.naics}</td>
                  <td className="px-3 py-3">{rfp.evaluation ? <VerdictBadge verdict={rfp.evaluation.verdict} /> : null}</td>
                  <td className="px-3 py-3 font-mono text-gold">{rfp.evaluation?.composite_score.toFixed(1) ?? "-"}</td>
                  <td className="px-3 py-3 text-muted">{rfp.evaluation?.confidence ?? "-"}</td>
                  <td className="px-3 py-3">
                    <Select value={rfp.status} onChange={(event) => updateRfp(rfp.id, { status: event.target.value })}>
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      defaultValue={rfp.owner}
                      onBlur={(event) => updateRfp(rfp.id, { owner: event.target.value })}
                      aria-label="Owner"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Select
                      value={rfp.outcome}
                      onChange={(event) =>
                        updateRfp(rfp.id, {
                          outcome: event.target.value,
                          outcome_record: { outcome: event.target.value }
                        })
                      }
                    >
                      {outcomes.map((outcome) => (
                        <option key={outcome}>{outcome}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Link href={`/pipeline/${rfp.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-muted hover:text-gold">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Archive"
                        onClick={() => updateRfp(rfp.id, { status: "Archived" })}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted">
        <Save className="h-4 w-4" />
        {isPending ? "Saving change..." : "Changes persist to Supabase when configured, otherwise to the demo store for this session."}
      </div>
    </div>
  );
}
