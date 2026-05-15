import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/app/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HorizontalBarChart,
  ScoreTrendChart,
  VerdictDistributionChart,
  WinLossChart
} from "@/components/charts/dashboard-charts";
import { getRepository } from "@/lib/data/repository";
import { buildAnalytics } from "@/lib/data/analytics";
import { percent } from "@/lib/utils/format";

export default async function InsightsPage() {
  const repository = getRepository();
  const rfps = await repository.listRfps();
  const analytics = buildAnalytics(rfps);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Insights</h1>
        <p className="mt-2 text-muted">
          Decision quality, no-bid discipline, score trends, and early outcome learning.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Estimated hours avoided" value={analytics.hoursAvoided} detail="No-bid recommendation effort" />
        <MetricCard label="Decision influence rate" value={percent(analytics.decisionInfluenceRate)} detail="Demo outcome signal" />
        <MetricCard label="Average score" value={analytics.averageScore.toFixed(1)} detail="Across scored RFPs" />
        <MetricCard label="Open decisions" value={analytics.openDecisions} detail="Need human action" />
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
            <CardTitle>Win / Loss By Verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <WinLossChart data={analytics.winLossByVerdict} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score By Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={analytics.avgScoreByOutcome.map((item) => ({ name: item.outcome, score: item.score }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Capability Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={analytics.gaps} labelKey="gap" valueKey="count" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top No-Bid Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={analytics.noBidReasons} labelKey="reason" valueKey="count" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
