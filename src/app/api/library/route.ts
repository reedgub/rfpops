import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";

export async function GET() {
  const repository = getRepository();
  const items = await repository.listLibraryItems();
  return NextResponse.json({ mode: repository.mode, items });
}

export async function POST(request: Request) {
  const repository = getRepository();
  const item = await request.json();
  const saved = await repository.upsertLibraryItem(item);
  return NextResponse.json({ mode: repository.mode, item: saved });
}

export async function DELETE(request: Request) {
  const repository = getRepository();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }
  await repository.deleteLibraryItem(id);
  return NextResponse.json({ mode: repository.mode, ok: true });
}
