"use client";

import { useState, useTransition } from "react";
import type { PastPerformance } from "@/lib/schemas/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

function csv(values: string[]) {
  return values.join(", ");
}

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function blankRecord(): PastPerformance {
  return {
    id: crypto.randomUUID(),
    project_name: "New past performance",
    customer: "",
    agency: "",
    role: "Prime",
    contract_vehicle: "",
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    dollar_value: 0,
    scope: "",
    technologies: [],
    outcomes: "",
    relevant_naics: [],
    relevant_capabilities: [],
    reusable_narrative: "",
    restrictions: "",
    tags: []
  };
}

export function PastPerformanceManager({ initialRecords }: { initialRecords: PastPerformance[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [activeId, setActiveId] = useState(initialRecords[0]?.id ?? "");
  const [saved, setSaved] = useState("");
  const [isPending, startTransition] = useTransition();
  const active = records.find((record) => record.id === activeId) ?? records[0];

  function update(patch: Partial<PastPerformance>) {
    setRecords((current) => current.map((record) => (record.id === active.id ? { ...record, ...patch } : record)));
  }

  function save(record: PastPerformance) {
    startTransition(async () => {
      const response = await fetch("/api/past-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      if (response.ok) setSaved(record.id);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/past-performance?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (response.ok) {
        setRecords((current) => current.filter((record) => record.id !== id));
        setActiveId(records.find((record) => record.id !== id)?.id ?? "");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="shadow-none">
        <CardContent className="space-y-3">
          {records.map((record) => (
            <button
              key={record.id}
              onClick={() => setActiveId(record.id)}
              className={`w-full rounded-md border p-3 text-left ${
                record.id === active?.id ? "border-gold/40 bg-gold/10" : "border-line bg-surface"
              }`}
            >
              <div className="font-medium">{record.project_name}</div>
              <div className="text-sm text-muted">
                {record.agency} - {record.role}
              </div>
            </button>
          ))}
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              const record = blankRecord();
              setRecords((current) => [record, ...current]);
              setActiveId(record.id);
            }}
          >
            Add record
          </Button>
        </CardContent>
      </Card>

      {active ? (
        <Card>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project name</Label>
              <Input value={active.project_name} onChange={(event) => update({ project_name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Customer / agency</Label>
              <Input value={active.customer} onChange={(event) => update({ customer: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Agency</Label>
              <Input value={active.agency} onChange={(event) => update({ agency: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Prime or subcontractor</Label>
              <Select value={active.role} onChange={(event) => update({ role: event.target.value as PastPerformance["role"] })}>
                <option>Prime</option>
                <option>Subcontractor</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contract vehicle</Label>
              <Input value={active.contract_vehicle} onChange={(event) => update({ contract_vehicle: event.target.value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Period start</Label>
                <Input type="date" value={active.period_start} onChange={(event) => update({ period_start: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Period end</Label>
                <Input type="date" value={active.period_end} onChange={(event) => update({ period_end: event.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dollar value</Label>
              <Input type="number" value={active.dollar_value} onChange={(event) => update({ dollar_value: Number(event.target.value) })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Scope</Label>
              <Textarea value={active.scope} onChange={(event) => update({ scope: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <Input value={csv(active.technologies)} onChange={(event) => update({ technologies: list(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Relevant NAICS</Label>
              <Input value={csv(active.relevant_naics)} onChange={(event) => update({ relevant_naics: list(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Relevant capabilities</Label>
              <Input
                value={csv(active.relevant_capabilities)}
                onChange={(event) => update({ relevant_capabilities: list(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Relevance tags</Label>
              <Input value={csv(active.tags)} onChange={(event) => update({ tags: list(event.target.value) })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Outcomes</Label>
              <Textarea value={active.outcomes} onChange={(event) => update({ outcomes: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Reusable narrative</Label>
              <Textarea value={active.reusable_narrative} onChange={(event) => update({ reusable_narrative: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Restrictions on reuse</Label>
              <Textarea value={active.restrictions} onChange={(event) => update({ restrictions: event.target.value })} />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Button onClick={() => save(active)} disabled={isPending}>
                {isPending ? "Saving..." : "Save record"}
              </Button>
              <Button variant="danger" onClick={() => remove(active.id)}>
                Delete
              </Button>
              {saved === active.id ? <span className="text-sm text-bid">Saved.</span> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
