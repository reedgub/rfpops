import { NextResponse } from "next/server";
import { scoreAndPersist } from "@/lib/scoring/workflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await scoreAndPersist(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to score RFP."
      },
      { status: 400 }
    );
  }
}
