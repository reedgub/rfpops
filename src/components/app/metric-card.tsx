import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="space-y-2">
        <div className="text-xs font-semibold uppercase text-muted">{label}</div>
        <div className="font-mono text-3xl font-semibold text-foreground">{value}</div>
        {detail ? <div className="text-sm text-muted">{detail}</div> : null}
      </CardContent>
    </Card>
  );
}
