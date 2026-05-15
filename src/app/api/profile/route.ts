import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";

export async function GET() {
  const repository = getRepository();
  const profile = await repository.getProfileBundle();
  return NextResponse.json({ mode: repository.mode, profile });
}

export async function PATCH(request: Request) {
  const repository = getRepository();
  const patch = await request.json();
  const profile = await repository.updateProfileBundle(patch);
  return NextResponse.json({ mode: repository.mode, profile });
}
