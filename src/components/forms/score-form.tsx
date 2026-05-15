"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileUp, Link2, Loader2, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { sampleBidRfp, sampleNoBidRfp } from "@/lib/demo/sample-rfps";

const progressSteps = [
  "Parsing RFP",
  "Extracting requirements",
  "Comparing profile",
  "Checking disqualifiers",
  "Scoring dimensions",
  "Generating recommendation",
  "Building compliance matrix"
];

export function ScoreForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"paste" | "url" | "upload">("paste");
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [sourceUrl, setSourceUrl] = useState(searchParams.get("url") ?? "");
  const [rfpText, setRfpText] = useState("");
  const [fileName, setFileName] = useState("");
  const [pursuitRole, setPursuitRole] = useState("prime");
  const [strategicImportance, setStrategicImportance] = useState("medium");
  const [knownIncumbent, setKnownIncumbent] = useState("unknown");
  const [incumbentNotes, setIncumbentNotes] = useState("");
  const [targetAgencyRelationship, setTargetAgencyRelationship] = useState("weak");
  const [teamingPartner, setTeamingPartner] = useState("");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [error, setError] = useState("");

  const disabled = useMemo(() => rfpText.trim().length < 40, [rfpText]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      setRfpText(await file.text());
      return;
    }
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setError("PDF metadata captured. Paste extracted text below so RFPOps does not pretend parsing succeeded.");
      return;
    }
    setError("Unsupported file type. Upload TXT or paste extracted PDF text.");
  }

  async function submit() {
    setError("");
    for (let index = 0; index < progressSteps.length; index += 1) {
      setActiveStep(index);
      await new Promise((resolve) => setTimeout(resolve, 180));
    }

    const response = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        sourceUrl,
        rfpText,
        fileName,
        userContext: {
          pursuitRole,
          strategicImportance,
          knownIncumbent,
          incumbentNotes,
          targetAgencyRelationship,
          teamingPartner
        }
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Scoring failed.");
      setActiveStep(null);
      return;
    }

    const data = await response.json();
    router.push(data.redirectUrl);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>RFP Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["paste", ClipboardPaste, "Paste text"],
              ["url", Link2, "Paste URL"],
              ["upload", FileUp, "Upload file"]
            ].map(([value, Icon, label]) => {
              const IconComponent = Icon as typeof ClipboardPaste;
              return (
                <button
                  key={value as string}
                  onClick={() => setMode(value as "paste" | "url" | "upload")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm ${
                    mode === value ? "border-gold/40 bg-gold/10 text-foreground" : "border-line bg-surface text-muted"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {label as string}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>RFP title</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="DHS Cloud Migration..." />
            </div>
            <div className="space-y-2">
              <Label>Source URL</Label>
              <Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://sam.gov/..." />
            </div>
          </div>

          {mode === "upload" ? (
            <div className="rounded-md border border-line bg-surface p-4">
              <Label>Upload PDF or TXT</Label>
              <Input className="mt-2" type="file" accept=".pdf,.txt,text/plain,application/pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
              {fileName ? <p className="mt-2 text-sm text-muted">Captured file: {fileName}</p> : null}
              <p className="mt-2 text-sm leading-6 text-muted">
                TXT files are read in-browser. For PDFs in this MVP, paste extracted text below after selecting the file.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>RFP text</Label>
            <Textarea
              className="min-h-[330px]"
              value={rfpText}
              onChange={(event) => setRfpText(event.target.value)}
              placeholder="Paste solicitation, statement of work, evaluation factors, submission requirements, or extracted PDF text..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setTitle(sampleBidRfp.title);
                setRfpText(sampleBidRfp.text);
              }}
            >
              Load BID sample
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setTitle(sampleNoBidRfp.title);
                setRfpText(sampleNoBidRfp.text);
              }}
            >
              Load NO-BID sample
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Optional Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label>Prime or subcontracting?</Label>
                <Select value={pursuitRole} onChange={(event) => setPursuitRole(event.target.value)}>
                  <option value="prime">Prime</option>
                  <option value="subcontractor">Subcontractor</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Strategic importance</Label>
                <Select value={strategicImportance} onChange={(event) => setStrategicImportance(event.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Known incumbent?</Label>
                <Select value={knownIncumbent} onChange={(event) => setKnownIncumbent(event.target.value)}>
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Agency relationship</Label>
                <Select value={targetAgencyRelationship} onChange={(event) => setTargetAgencyRelationship(event.target.value)}>
                  <option value="none">None</option>
                  <option value="weak">Weak</option>
                  <option value="strong">Strong</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Incumbent notes</Label>
              <Textarea value={incumbentNotes} onChange={(event) => setIncumbentNotes(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Known teaming partner</Label>
              <Input value={teamingPartner} onChange={(event) => setTeamingPartner(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progressSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm">
                {activeStep === index ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <span className="h-4 w-4 rounded-full border border-line" />}
                <span className={activeStep !== null && index <= activeStep ? "text-foreground" : "text-muted"}>{step}</span>
              </div>
            ))}
            {error ? <p className="rounded-md border border-nobid/40 bg-nobid/10 p-3 text-sm text-red-100">{error}</p> : null}
            <Button className="w-full" onClick={submit} disabled={disabled || activeStep !== null}>
              {activeStep !== null ? "Scoring..." : "Score RFP"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
