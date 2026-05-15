"use client";

import { useState } from "react";
import type { RfpWithEvaluation } from "@/lib/schemas/domain";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerdictBadge } from "@/components/scoring/verdict-badge";
import { DimensionCard } from "@/components/scoring/dimension-card";
import { ComplianceTable } from "@/components/rfp/compliance-table";
import { OutcomeForm } from "@/components/forms/outcome-form";
import { formatDate } from "@/lib/utils/format";

const tabs = ["Evaluation", "Compliance", "Strategy", "Drafts", "Outcome"];

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm leading-6 text-slate-300">
          {items.map((item) => (
            <li key={item} className="rounded-md border border-line bg-surface p-3">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function RfpDetail({ rfp }: { rfp: RfpWithEvaluation }) {
  const [activeTab, setActiveTab] = useState("Evaluation");
  const evaluation = rfp.evaluation;

  if (!evaluation) {
    return (
      <Card>
        <CardContent>No evaluation has been generated for this opportunity yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-panel p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <VerdictBadge verdict={evaluation.verdict} />
            <Badge tone="blue">{evaluation.confidence} confidence</Badge>
            <Badge tone="gold">{evaluation.composite_score.toFixed(1)} / 5.0</Badge>
          </div>
          <h1 className="text-3xl font-semibold">{rfp.title}</h1>
          <p className="mt-2 text-muted">
            {rfp.agency} - {rfp.solicitation_number} - Due {formatDate(rfp.due_date)} - NAICS {rfp.naics}
          </p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4 text-sm text-slate-300 lg:max-w-xl">{evaluation.tldr}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md border px-4 py-2 text-sm ${
              activeTab === tab ? "border-gold/40 bg-gold/10 text-foreground" : "border-line bg-surface text-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Evaluation" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Memo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-slate-300">{evaluation.recommendation_memo}</p>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {evaluation.dimension_scores.map((dimension) => (
              <DimensionCard key={dimension.key} dimension={dimension} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ListBlock
              title="Hard Disqualifiers"
              items={
                evaluation.hard_disqualifiers.length
                  ? evaluation.hard_disqualifiers.map((item) => item.description)
                  : ["No hard disqualifier detected in the provided text."]
              }
            />
            <ListBlock title="Key Risks" items={evaluation.key_risks} />
            <ListBlock title="Win Themes" items={evaluation.win_themes} />
            <ListBlock title="Capability Gaps" items={evaluation.capability_gaps} />
            <ListBlock title="Wiring / Incumbent Signals" items={evaluation.wiring_signals} />
            <ListBlock title="Recommended Next Actions" items={evaluation.recommended_next_actions} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Past Performance Matches</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {evaluation.past_performance_matches.map((match) => (
                <div key={match.project_id} className="rounded-md border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium">{match.project_name}</div>
                    <div className="font-mono text-gold">{match.relevance_score.toFixed(1)}</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{match.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>RFP Citations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.citations.map((citation) => (
                <div key={citation.id} className="rounded-md border border-line bg-surface p-3 text-sm">
                  <div className="mb-1 font-mono text-xs text-gold">{citation.id}</div>
                  <p className="leading-6 text-slate-300">{citation.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "Compliance" ? <ComplianceTable requirements={evaluation.compliance_requirements} /> : null}

      {activeTab === "Strategy" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ListBlock
            title="Recommended Pursuit Posture"
            items={[evaluation.verdict === "BID" ? "Proceed to pursuit review with margin and staffing gates." : evaluation.verdict === "MAYBE" ? "Treat as a conditional pursuit until risks are resolved." : "Do not pursue unless the disqualifier changes."]}
          />
          <ListBlock title="Win Themes" items={evaluation.win_themes} />
          <ListBlock title="Weaknesses To Mitigate" items={evaluation.key_risks} />
          <ListBlock
            title="Questions To Ask During Q&A"
            items={[
              "Can the agency clarify mandatory certification or vehicle requirements?",
              "How will past performance similarity be evaluated?",
              "Are staffing resumes required at proposal submission?",
              "What artifacts must be included in the compliance matrix?"
            ]}
          />
          <ListBlock title="Potential Teaming Gaps" items={evaluation.capability_gaps} />
          <ListBlock
            title="What Would Make This A No-Bid?"
            items={[
              "Mandatory eligibility requirement cannot be met.",
              "Pricing model falls below the margin target.",
              "Incumbent signals become stronger after Q&A or market checks."
            ]}
          />
          <ListBlock
            title="What Would Make This Stronger?"
            items={[
              "Named delivery staff are available.",
              "Past performance examples map cleanly to evaluation factors.",
              "The agency confirms open competition and realistic response expectations."
            ]}
          />
        </div>
      ) : null}

      {activeTab === "Drafts" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ListBlock title="Executive Summary Outline" items={evaluation.draft_scaffolds.executive_summary_outline} />
          <ListBlock title="Past Performance Mapping" items={evaluation.draft_scaffolds.past_performance_mapping} />
          <ListBlock title="Technical Approach Outline" items={evaluation.draft_scaffolds.technical_approach_outline} />
          <ListBlock title="Management Approach Outline" items={evaluation.draft_scaffolds.management_approach_outline} />
        </div>
      ) : null}

      {activeTab === "Outcome" ? (
        <Card>
          <CardHeader>
            <CardTitle>Outcome Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <OutcomeForm rfp={rfp} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
