import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";

export async function GET() {
  const repository = getRepository();
  const records = await repository.listPastPerformance();
  return NextResponse.json({ mode: repository.mode, records });
}

export async function POST(request: Request) {
  const repository = getRepository();
  const record = await request.json();
  const saved = await repository.upsertPastPerformance(record);
  return NextResponse.json({ mode: repository.mode, record: saved });
}

export async function DELETE(request: Request) {
  const repository = getRepository();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }
  await repository.deletePastPerformance(id);
  return NextResponse.json({ mode: repository.mode, ok: true });
}
