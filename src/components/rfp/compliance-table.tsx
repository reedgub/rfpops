"use client";

import { useMemo, useState } from "react";
import type { ComplianceRequirement } from "@/lib/schemas/domain";
import { Badge } from "@/components/ui/badge";

type SortKey = keyof Pick<ComplianceRequirement, "id" | "risk" | "owner" | "status" | "requirement_type">;

export function ComplianceTable({ requirements }: { requirements: ComplianceRequirement[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const sorted = useMemo(
    () =>
      requirements
        .slice()
        .sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]))),
    [requirements, sortKey]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              {[
                ["id", "Requirement ID"],
                ["section", "RFP section"],
                ["requirement_text", "Requirement text"],
                ["requirement_type", "Type"],
                ["mandatory", "Mandatory?"],
                ["risk", "Risk"],
                ["owner", "Owner"],
                ["status", "Status"],
                ["source_citation", "Source citation"]
              ].map(([key, label]) => (
                <th key={key} className="border-b border-line px-3 py-3 font-medium">
                  {"id risk owner status requirement_type".includes(key) ? (
                    <button onClick={() => setSortKey(key as SortKey)}>{label}</button>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/60">
            {sorted.map((requirement) => (
              <tr key={requirement.id} className="align-top">
                <td className="px-3 py-3 font-mono text-xs text-gold">{requirement.id}</td>
                <td className="px-3 py-3 text-muted">{requirement.section}</td>
                <td className="max-w-xl px-3 py-3 leading-6 text-slate-300">{requirement.requirement_text}</td>
                <td className="px-3 py-3 text-muted">{requirement.requirement_type}</td>
                <td className="px-3 py-3 text-muted">{requirement.mandatory ? "Yes" : "No"}</td>
                <td className="px-3 py-3">
                  <Badge tone={requirement.risk === "High" ? "nobid" : requirement.risk === "Medium" ? "maybe" : "bid"}>
                    {requirement.risk}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted">{requirement.owner}</td>
                <td className="px-3 py-3 text-muted">{requirement.status}</td>
                <td className="px-3 py-3 font-mono text-xs text-muted">{requirement.source_citation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
