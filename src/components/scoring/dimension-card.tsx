import type { DimensionScore } from "@/lib/schemas/domain";
import { Card, CardContent } from "@/components/ui/card";

export function DimensionCard({ dimension }: { dimension: DimensionScore }) {
  return (
    <Card className="shadow-none">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-foreground">{dimension.label}</div>
            <div className="text-xs text-muted">{dimension.weight ? `${dimension.weight * 100}% weight` : "Displayed"}</div>
          </div>
          <div className="font-mono text-2xl font-semibold text-gold">{dimension.score.toFixed(1)}</div>
        </div>
        <p className="text-sm leading-6 text-slate-300">{dimension.rationale}</p>
        <div className="space-y-1 text-xs text-muted">
          {dimension.evidence.slice(0, 2).map((evidence) => (
            <div key={evidence} className="rounded border border-line bg-surface px-2 py-1">
              {evidence}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
