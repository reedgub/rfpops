import { NextResponse } from "next/server";
import { scoreAndPersist } from "@/lib/scoring/workflow";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await scoreAndPersist({
      title: body.title,
      sourceUrl: body.url,
      rfpText: body.text,
      userContext: {
        strategicImportance: "medium",
        knownIncumbent: "unknown",
        targetAgencyRelationship: "none"
      }
    });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to score extension payload.",
        redirectUrl: "/score?source=extension"
      },
      { status: 400, headers: corsHeaders }
    );
  }
}
