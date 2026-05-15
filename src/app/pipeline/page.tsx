import { AppShell } from "@/components/layout/app-shell";
import { PipelineTable } from "@/components/rfp/pipeline-table";
import { getRepository } from "@/lib/data/repository";

export default async function PipelinePage() {
  const repository = getRepository();
  const rfps = await repository.listRfps();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Pipeline</h1>
        <p className="mt-2 text-muted">
          System of record for evaluated opportunities, capture status, owners, and outcomes.
        </p>
      </div>
      <PipelineTable initialRfps={rfps} />
    </AppShell>
  );
}
