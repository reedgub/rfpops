import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ScoreForm } from "@/components/forms/score-form";

export default function ScorePage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Score an RFP</h1>
        <p className="mt-2 text-muted">
          Paste text, provide a procurement URL, or upload a file. RFPOps will save the evaluation to the pipeline.
        </p>
      </div>
      <Suspense fallback={<div className="rounded-lg border border-line bg-panel p-6 text-muted">Loading scoring form...</div>}>
        <ScoreForm />
      </Suspense>
    </AppShell>
  );
}
