import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const repository = getRepository();
  const rfp = await repository.getRfp(id);

  if (!rfp) {
    return NextResponse.json({ error: "RFP not found." }, { status: 404 });
  }

  return NextResponse.json({ mode: repository.mode, rfp });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const repository = getRepository();
  const patch = await request.json();
  const rfp = await repository.updateRfp(id, patch);

  if (!rfp) {
    return NextResponse.json({ error: "RFP not found." }, { status: 404 });
  }

  return NextResponse.json({ mode: repository.mode, rfp });
}
