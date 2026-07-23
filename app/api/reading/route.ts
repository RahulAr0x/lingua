import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateReadingPassage, type ReadingTopic } from "@/lib/ai";
import { generateId, todayKey } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const db = getDb();
  const topic = (req.nextUrl.searchParams.get("topic") ?? "philosophy") as ReadingTopic;
  const date = todayKey();

  const existing = await db.execute({
    sql: "SELECT title, passage FROM reading_passages WHERE date_key = ? AND topic = ?",
    args: [date, topic],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json({
      topic,
      title: existing.rows[0].title,
      passage: existing.rows[0].passage,
      cached: true,
    });
  }

  const { title, passage } = await generateReadingPassage(topic);

  await db.execute({
    sql: "INSERT OR IGNORE INTO reading_passages (id, date_key, topic, title, passage) VALUES (?, ?, ?, ?, ?)",
    args: [generateId(), date, topic, title, passage],
  });

  return NextResponse.json({ topic, title, passage, cached: false });
}
