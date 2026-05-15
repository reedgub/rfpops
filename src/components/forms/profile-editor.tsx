"use client";

import { useState, useTransition } from "react";
import type { Capability, Certification, Disqualifier } from "@/lib/schemas/domain";
import type { ProfileBundle } from "@/lib/data/repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

function csv(value: string[]) {
  return value.join(", ");
}

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfileEditor({ initialProfile }: { initialProfile: ProfileBundle }) {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (response.ok) setSaved(true);
    });
  }

  function updateCapability(index: number, patch: Partial<Capability>) {
    setProfile((current) => ({
      ...current,
      capabilities: current.capabilities.map((capability, itemIndex) =>
        itemIndex === index ? { ...capability, ...patch } : capability
      )
    }));
  }

  function updateCertification(index: number, patch: Partial<Certification>) {
    setProfile((current) => ({
      ...current,
      certifications: current.certifications.map((certification, itemIndex) =>
        itemIndex === index ? { ...certification, ...patch } : certification
      )
    }));
  }

  function updateDisqualifier(index: number, patch: Partial<Disqualifier>) {
    setProfile((current) => ({
      ...current,
      disqualifiers: current.disqualifiers.map((disqualifier, itemIndex) =>
        itemIndex === index ? { ...disqualifier, ...patch } : disqualifier
      )
    }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input
              value={profile.organization.name}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  organization: { ...current.organization, name: event.target.value }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Revenue range</Label>
            <Input
              value={profile.organization.revenue_range}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  organization: { ...current.organization, revenue_range: event.target.value }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Employee count</Label>
            <Input
              type="number"
              value={profile.organization.employee_count}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  organization: { ...current.organization, employee_count: Number(event.target.value) }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Primary NAICS</Label>
            <Input
              value={profile.organization.primary_naics}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  organization: { ...current.organization, primary_naics: event.target.value }
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={profile.organization.description}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  organization: { ...current.organization, description: event.target.value }
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strategic Goals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            ["Target agencies", "target_agencies"],
            ["Target contract vehicles", "target_contract_vehicles"],
            ["Target capabilities", "target_capabilities"],
            ["Target geographies", "target_geographies"],
            ["Desired logos", "desired_logos"]
          ].map(([label, key]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                value={csv(profile.profile[key as keyof typeof profile.profile] as string[])}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    profile: { ...current.profile, [key]: list(event.target.value) }
                  }))
                }
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label>Minimum margin</Label>
            <Input
              type="number"
              value={profile.profile.minimum_margin_percent}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  profile: { ...current.profile, minimum_margin_percent: Number(event.target.value) }
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Strategic notes</Label>
            <Textarea
              value={profile.profile.strategic_notes}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  profile: { ...current.profile, strategic_notes: event.target.value }
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.capabilities.map((capability, index) => (
            <div key={capability.id} className="grid gap-3 rounded-md border border-line bg-surface p-4 md:grid-cols-2">
              <Input value={capability.name} onChange={(event) => updateCapability(index, { name: event.target.value })} />
              <Select
                value={capability.maturity}
                onChange={(event) => updateCapability(index, { maturity: event.target.value as Capability["maturity"] })}
              >
                {["emerging", "credible", "strong", "flagship"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              <Textarea
                className="md:col-span-2"
                value={capability.description}
                onChange={(event) => updateCapability(index, { description: event.target.value })}
              />
              <Input
                value={csv(capability.technologies)}
                onChange={(event) => updateCapability(index, { technologies: list(event.target.value) })}
                placeholder="Technologies"
              />
              <Input
                value={csv(capability.tags)}
                onChange={(event) => updateCapability(index, { tags: list(event.target.value) })}
                placeholder="Tags"
              />
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              setProfile((current) => ({
                ...current,
                capabilities: [
                  ...current.capabilities,
                  {
                    id: crypto.randomUUID(),
                    name: "New Capability",
                    description: "",
                    maturity: "emerging",
                    technologies: [],
                    proof_points: [],
                    tags: []
                  }
                ]
              }))
            }
          >
            Add capability
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certifications / Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.certifications.map((certification, index) => (
              <div key={certification.id} className="grid gap-2 rounded-md border border-line bg-surface p-3">
                <Input value={certification.name} onChange={(event) => updateCertification(index, { name: event.target.value })} />
                <Input value={certification.status} onChange={(event) => updateCertification(index, { status: event.target.value })} />
                <Textarea value={certification.notes} onChange={(event) => updateCertification(index, { notes: event.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disqualifiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.disqualifiers.map((disqualifier, index) => (
              <div key={disqualifier.id} className="grid gap-2 rounded-md border border-line bg-surface p-3">
                <Input value={disqualifier.rule_type} onChange={(event) => updateDisqualifier(index, { rule_type: event.target.value })} />
                <Textarea
                  value={disqualifier.description}
                  onChange={(event) => updateDisqualifier(index, { description: event.target.value })}
                />
                <Input
                  value={disqualifier.threshold_value}
                  onChange={(event) => updateDisqualifier(index, { threshold_value: event.target.value })}
                />
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={disqualifier.active}
                    onChange={(event) => updateDisqualifier(index, { active: event.target.checked })}
                  />
                  Active
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
        {saved ? <span className="text-sm text-bid">Profile saved.</span> : null}
      </div>
    </div>
  );
}
