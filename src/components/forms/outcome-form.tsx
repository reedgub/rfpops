"use client";

import { useState, useTransition } from "react";
import type { Outcome, RfpWithEvaluation } from "@/lib/schemas/domain";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export function OutcomeForm({ rfp }: { rfp: RfpWithEvaluation }) {
  const [outcome, setOutcome] = useState<Outcome | undefined>(rfp.outcome_record);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!outcome) return null;

  function update<K extends keyof Outcome>(key: K, value: Outcome[K]) {
    setOutcome((current) => (current ? { ...current, [key]: value } : current));
  }

  function save() {
    if (!outcome) return;
    startTransition(async () => {
      const response = await fetch(`/api/rfps/${rfp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: outcome.outcome,
          outcome_record: outcome
        })
      });
      setSaved(response.ok);
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Final human decision</Label>
        <Select value={outcome.final_decision} onChange={(event) => update("final_decision", event.target.value)}>
          {["Undecided", "Pursue", "No-Bid", "Hold", "Partner-led"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Outcome</Label>
        <Select value={outcome.outcome} onChange={(event) => update("outcome", event.target.value as Outcome["outcome"])}>
          {["pending", "won", "lost", "canceled", "no-bid"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </div>
      <label className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm">
        <input
          type="checkbox"
          checked={outcome.rfpop_influenced}
          onChange={(event) => update("rfpop_influenced", event.target.checked)}
        />
        Did RFPOps influence the decision?
      </label>
      <label className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm">
        <input type="checkbox" checked={outcome.submitted} onChange={(event) => update("submitted", event.target.checked)} />
        Submitted?
      </label>
      <div className="space-y-2">
        <Label>Loss reason</Label>
        <Input value={outcome.loss_reason} onChange={(event) => update("loss_reason", event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Hours spent</Label>
        <Input
          type="number"
          value={outcome.hours_spent}
          onChange={(event) => update("hours_spent", Number(event.target.value))}
        />
      </div>
      <label className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm md:col-span-2">
        <input
          type="checkbox"
          checked={outcome.would_make_same_decision}
          onChange={(event) => update("would_make_same_decision", event.target.checked)}
        />
        Would you make the same decision again?
      </label>
      <div className="space-y-2 md:col-span-2">
        <Label>Notes</Label>
        <Textarea value={outcome.notes} onChange={(event) => update("notes", event.target.value)} />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save outcome"}
        </Button>
        {saved ? <span className="text-sm text-bid">Outcome saved.</span> : null}
      </div>
    </div>
  );
}
