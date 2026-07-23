import { NextRequest, NextResponse } from "next/server";
import { generateVarietyContent } from "@/lib/ai";

// Variety content is generated on-demand and cached in the response
// For a personal app, this is sufficient — no need for a DB cache
export async function GET(req: NextRequest) {
  const variety = req.nextUrl.searchParams.get("variety") as "uk" | "us" | "au" | "general" ?? "uk";
  const category = req.nextUrl.searchParams.get("category") as "formal" | "everyday" | "slang" ?? "everyday";

  const items = await generateVarietyContent(variety, category, 8);
  return NextResponse.json(items);
}
