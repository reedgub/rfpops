import { AppShell } from "@/components/layout/app-shell";
import { PastPerformanceManager } from "@/components/forms/past-performance-manager";
import { getRepository } from "@/lib/data/repository";

export default async function PastPerformancePage() {
  const repository = getRepository();
  const records = await repository.listPastPerformance();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Past Performance</h1>
        <p className="mt-2 text-muted">
          Structured references used by the scorer to judge relevance, credibility, and gaps.
        </p>
      </div>
      <PastPerformanceManager initialRecords={records} />
    </AppShell>
  );
}
