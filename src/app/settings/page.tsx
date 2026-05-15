import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { getRepository } from "@/lib/data/repository";

export default async function SettingsPage() {
  const repository = getRepository();
  const profile = await repository.getProfileBundle();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted">Workspace controls, model posture, retention, users, and pilot billing.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace name</Label>
              <Input defaultValue={profile.organization.name} />
            </div>
            <div className="space-y-2">
              <Label>Default NAICS</Label>
              <Input defaultValue={profile.organization.primary_naics} />
            </div>
            <Button variant="secondary">Save workspace settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users / Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Marcus Chen", "Owner", "Active"],
              ["Maya Patel", "BD Lead", "Active"],
              ["Elena Ruiz", "Capture", "Invited"]
            ].map(([name, role, status]) => (
              <div key={name} className="flex items-center justify-between rounded-md border border-line bg-surface p-3">
                <div>
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-muted">{role}</div>
                </div>
                <Badge tone={status === "Active" ? "bid" : "maybe"}>{status}</Badge>
              </div>
            ))}
            <Button variant="secondary">Invite user</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>RFP document retention</Label>
              <Select defaultValue="365">
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">365 days</option>
                <option value="forever">Retain until deleted</option>
              </Select>
            </div>
            <div className="rounded-md border border-line bg-surface p-3 text-sm leading-6 text-muted">
              Demo mode stores data in server memory for the active session. Supabase mode stores workspace data in your
              project database.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Model Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select defaultValue={process.env.ANTHROPIC_API_KEY ? "anthropic" : "deterministic"}>
                <option value="anthropic">Anthropic</option>
                <option value="deterministic">Deterministic local scorer</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input defaultValue={process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest"} />
            </div>
            <Badge tone={process.env.ANTHROPIC_API_KEY ? "bid" : "maybe"}>
              {process.env.ANTHROPIC_API_KEY ? "Anthropic key detected" : "Demo scorer active"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted">
            <p>Customer documents are not used to train foundation models.</p>
            <p>Supabase row-level security is enabled in the migration with permissive MVP policies documented.</p>
            <p>Production hardening should add organization-scoped auth claims, audit logging, deletion workflows, and DPA review.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {["Pilot", "Team", "Agency"].map((plan) => (
                <div key={plan} className="rounded-md border border-line bg-surface p-3">
                  <div className="font-semibold">{plan}</div>
                  <div className="mt-2 text-sm text-muted">Contact to activate pilot.</div>
                </div>
              ))}
            </div>
            <Button>Contact to activate pilot</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
