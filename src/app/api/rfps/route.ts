import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { createId } from "@/lib/utils/id";
import type { Rfp } from "@/lib/schemas/domain";

export async function GET() {
  const repository = getRepository();
  const rfps = await repository.listRfps();
  return NextResponse.json({ mode: repository.mode, rfps });
}

export async function POST(request: Request) {
  const repository = getRepository();
  const context = await repository.getScoringContext();
  const body = await request.json();
  const now = new Date().toISOString();
  const rfp: Rfp = {
    id: createId("rfp"),
    organization_id: context.organization.id,
    title: body.title ?? "Untitled opportunity",
    agency: body.agency ?? "Unknown agency",
    source: body.source ?? "Manual",
    source_url: body.source_url ?? "",
    solicitation_number: body.solicitation_number ?? "",
    due_date: body.due_date ?? new Date().toISOString().slice(0, 10),
    naics: body.naics ?? context.organization.primary_naics,
    estimated_value: body.estimated_value ?? "Not stated",
    raw_text: body.raw_text ?? "",
    status: body.status ?? "New",
    owner: body.owner ?? "Unassigned",
    outcome: "pending",
    created_at: now,
    updated_at: now
  };

  const saved = await repository.createRfp(rfp);
  return NextResponse.json({ mode: repository.mode, rfp: saved });
}
