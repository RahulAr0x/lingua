import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getDailyPrompts } from "@/lib/ai";
import { todayKey } from "@/lib/utils";

export async function GET() {
  const db = getDb();
  const today = todayKey();

  const existing = await db.execute({
    sql: "SELECT prompt FROM daily_prompts WHERE date_key = ?",
    args: [today],
  });

  if (existing.rows.length > 0) {
    const raw = existing.rows[0].prompt as string;
    // Handle both old single-string format and new JSON array format
    try {
      const parsed = JSON.parse(raw);
      const prompts = Array.isArray(parsed) ? parsed : [raw];
      return NextResponse.json({ prompts });
    } catch {
      return NextResponse.json({ prompts: [raw] });
    }
  }

  const prompts = await getDailyPrompts(today);
  await db.execute({
    sql: "INSERT OR REPLACE INTO daily_prompts (date_key, prompt) VALUES (?, ?)",
    args: [today, JSON.stringify(prompts)],
  });

  return NextResponse.json({ prompts });
}
