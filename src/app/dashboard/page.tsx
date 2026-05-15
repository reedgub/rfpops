import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/app/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerdictDistributionChart, ScoreTrendChart, HorizontalBarChart } from "@/components/charts/dashboard-charts";
import { getRepository } from "@/lib/data/repository";
import { buildAnalytics } from "@/lib/data/analytics";
import { formatDate, percent } from "@/lib/utils/format";
import { VerdictBadge } from "@/components/scoring/verdict-badge";

export default async function DashboardPage() {
  const repository = getRepository();
  const rfps = await repository.listRfps();
  const analytics = buildAnalytics(rfps);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-muted">
            Bid-decision health across scored opportunities, proposal effort, and open choices.
          </p>
        </div>
        <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-muted">
          Data source: <span className="text-foreground">{repository.mode}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="RFPs scored this month" value={analytics.count} detail="Seeded demo pipeline" />
        <MetricCard label="Bid rate" value={percent(analytics.bidRate)} detail="BID verdicts" />
        <MetricCard label="No-bid rate" value={percent(analytics.noBidRate)} detail="Avoided low-fit work" />
        <MetricCard label="Average score" value={analytics.averageScore.toFixed(1)} detail="0.0-5.0 composite" />
        <MetricCard label="Hours avoided" value={analytics.hoursAvoided} detail="Estimated proposal hours" />
        <MetricCard label="Open decisions" value={analytics.openDecisions} detail="New or evaluating" />
        <MetricCard label="Upcoming due dates" value={analytics.upcomingDueDates.length} detail="Next four deadlines" />
        <MetricCard label="Decision influence" value={percent(analytics.decisionInfluenceRate)} detail="Demo outcome signal" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verdict Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <VerdictDistributionChart data={analytics.verdictDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={analytics.scoreTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Common No-Bid Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={analytics.noBidReasons} labelKey="reason" valueKey="count" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Capability Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={analytics.gaps} labelKey="gap" valueKey="count" />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming Due Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.upcomingDueDates.map((rfp) => (
            <Link
              key={rfp.id}
              href={`/pipeline/${rfp.id}`}
              className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface p-3 hover:border-gold/40"
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-gold" />
                <div>
                  <div className="font-medium">{rfp.title}</div>
                  <div className="text-sm text-muted">
                    {rfp.agency} - Due {formatDate(rfp.due_date)}
                  </div>
                </div>
              </div>
              {rfp.evaluation ? <VerdictBadge verdict={rfp.evaluation.verdict} /> : null}
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
