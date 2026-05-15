import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Gauge, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerdictBadge } from "@/components/scoring/verdict-badge";
import { demoEvaluations, demoRfps } from "@/lib/demo/seed";

const steps = [
  "Upload or paste an RFP",
  "Compare against your company profile",
  "Get a BID / MAYBE / NO-BID recommendation",
  "Generate compliance matrix",
  "Track outcomes"
];

const pricing = [
  ["Design Partner Pilot", "$1,500/mo", "High-touch onboarding, 100 scored RFPs, rubric review"],
  ["Solo", "$500/mo", "Founder-led teams scoring recurring opportunities"],
  ["Team", "$1,500/mo", "BD and capture teams with shared profiles and outcomes"],
  ["Agency", "Custom", "Multi-workspace controls, support, and security review"]
];

export default function MarketingPage() {
  const featured = demoEvaluations[0];
  const noBid = demoEvaluations[1];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/40 bg-gold/10 font-mono text-sm font-bold text-gold">
            RFP
          </div>
          <div>
            <div className="font-semibold">RFPOps</div>
            <div className="text-xs text-muted">Bid-decision intelligence</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#problem">Problem</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Pricing</a>
          <Link href="/dashboard" className="text-foreground">
            Demo
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden border-y border-line bg-[#0b0f16]">
        <div className="absolute inset-0 opacity-45">
          <div className="grid h-full grid-cols-12 gap-4 p-6">
            <div className="col-span-7 hidden rounded-lg border border-line bg-surface/80 p-5 lg:block">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted">Pipeline</div>
                  <div className="text-xl font-semibold">{demoRfps[0].title}</div>
                </div>
                <VerdictBadge verdict={featured.verdict} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {featured.dimension_scores.slice(0, 3).map((dimension) => (
                  <div key={dimension.key} className="rounded-md border border-line bg-background/70 p-3">
                    <div className="text-xs text-muted">{dimension.label}</div>
                    <div className="font-mono text-2xl text-gold">{dimension.score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-5 hidden rounded-lg border border-line bg-surface/80 p-5 lg:block">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Disqualifier check</div>
                <VerdictBadge verdict={noBid.verdict} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{noBid.tldr}</p>
            </div>
          </div>
        </div>
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-6 py-20">
          <Badge tone="gold" className="mb-6 w-fit">
            Built for boutique federal IT services firms
          </Badge>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-foreground md:text-7xl">
            Stop writing proposals you were never going to win.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            RFPOps scores RFPs against your capabilities, past performance, disqualifiers, and strategic
            goals before your team commits 80 hours to a response.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/score"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 bg-gold px-5 py-3 font-semibold text-black hover:bg-[#d7b969]"
            >
              Score an RFP <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pipeline"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-5 py-3 font-semibold text-foreground hover:bg-slate-800"
            >
              View demo pipeline
            </Link>
          </div>
        </div>
      </section>

      <section id="problem" className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3">
        {[
          ["The real cost is upstream", "A serious response can consume 60-120 hours before you know whether the pursuit was credible."],
          ["Fit lives in scattered memory", "Capabilities, certifications, disqualifiers, and past performance rarely sit in one decision system."],
          ["Optimism hides weak odds", "RFPOps separates strong-fit bids from strategic long shots and clear no-bids."]
        ].map(([title, body]) => (
          <Card key={title}>
            <CardContent className="space-y-3">
              <XCircle className="h-5 w-5 text-nobid" />
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="leading-7 text-muted">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="workflow" className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <Badge tone="blue">How it works</Badge>
              <h2 className="mt-4 text-3xl font-semibold">A capture analyst workflow, not a chat box.</h2>
            </div>
            <ShieldCheck className="hidden h-10 w-10 text-gold md:block" />
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-line bg-background p-4">
                <div className="mb-4 font-mono text-sm text-gold">0{index + 1}</div>
                <p className="text-sm leading-6 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted">Evaluation memo</div>
                <h3 className="text-2xl font-semibold">{demoRfps[0].title}</h3>
              </div>
              <VerdictBadge verdict={featured.verdict} />
            </div>
            <p className="mb-6 leading-7 text-slate-300">{featured.recommendation_memo}</p>
            <div className="grid gap-3 md:grid-cols-3">
              {featured.dimension_scores.slice(0, 3).map((dimension) => (
                <div key={dimension.key} className="rounded-md border border-line bg-surface p-4">
                  <div className="text-xs text-muted">{dimension.label}</div>
                  <div className="mt-2 font-mono text-3xl font-semibold text-gold">{dimension.score.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              <h3 className="text-lg font-semibold">Compliance matrix preview</h3>
            </div>
            <div className="space-y-3">
              {featured.compliance_requirements.map((requirement) => (
                <div key={requirement.id} className="rounded-md border border-line bg-surface p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-gold">{requirement.id}</span>
                    <Badge tone={requirement.risk === "High" ? "nobid" : requirement.risk === "Medium" ? "maybe" : "bid"}>
                      {requirement.risk}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{requirement.requirement_text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="pricing" className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex items-center gap-3">
            <Gauge className="h-6 w-6 text-gold" />
            <h2 className="text-3xl font-semibold">Pricing preview</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {pricing.map(([name, price, note]) => (
              <Card key={name} className="shadow-none">
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <div className="font-mono text-3xl text-gold">{price}</div>
                  <p className="text-sm leading-6 text-muted">{note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 text-bid" />
          <p className="max-w-3xl text-sm leading-6 text-muted">
            Your documents stay in your workspace. Customer documents are not used to train foundation models.
          </p>
        </div>
        <footer className="text-sm text-muted">RFPOps MVP - May 2026</footer>
      </section>
    </main>
  );
}
