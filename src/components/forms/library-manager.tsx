"use client";

import { useMemo, useState, useTransition } from "react";
import type { LibraryItem } from "@/lib/schemas/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

const categories = [
  "Company overview",
  "Capability statement",
  "Technical methodology",
  "Management approach",
  "Quality assurance",
  "Staffing approach",
  "Security language",
  "Differentiators"
];

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function csv(value: string[]) {
  return value.join(", ");
}

function blankItem(): LibraryItem {
  return {
    id: crypto.randomUUID(),
    title: "New library item",
    category: "Company overview",
    content: "",
    tags: []
  };
}

export function LibraryManager({ initialItems }: { initialItems: LibraryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState(initialItems[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState("");
  const [isPending, startTransition] = useTransition();
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        [item.title, item.category, item.content, item.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query]
  );
  const active = items.find((item) => item.id === activeId) ?? filtered[0];

  function update(patch: Partial<LibraryItem>) {
    setItems((current) => current.map((item) => (item.id === active.id ? { ...item, ...patch } : item)));
  }

  function save(item: LibraryItem) {
    startTransition(async () => {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (response.ok) setSaved(item.id);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/library?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (response.ok) {
        setItems((current) => current.filter((item) => item.id !== id));
        setActiveId(items.find((item) => item.id !== id)?.id ?? "");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="shadow-none">
        <CardContent className="space-y-3">
          <Input placeholder="Search library" value={query} onChange={(event) => setQuery(event.target.value)} />
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`w-full rounded-md border p-3 text-left ${
                item.id === active?.id ? "border-gold/40 bg-gold/10" : "border-line bg-surface"
              }`}
            >
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted">{item.category}</div>
            </button>
          ))}
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              const item = blankItem();
              setItems((current) => [item, ...current]);
              setActiveId(item.id);
            }}
          >
            Add item
          </Button>
        </CardContent>
      </Card>

      {active ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={active.title} onChange={(event) => update({ title: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={active.category} onChange={(event) => update({ category: event.target.value })}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={csv(active.tags)} onChange={(event) => update({ tags: list(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea className="min-h-[360px]" value={active.content} onChange={(event) => update({ content: event.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => save(active)} disabled={isPending}>
                {isPending ? "Saving..." : "Save item"}
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
