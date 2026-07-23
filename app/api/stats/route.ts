import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const [sessions, wordList, lessons] = await Promise.all([
    db.execute("SELECT created_at, score, word_count FROM sessions ORDER BY created_at DESC LIMIT 30"),
    db.execute("SELECT COUNT(*) as total, SUM(mastered) as mastered FROM word_list"),
    db.execute("SELECT COUNT(*) as total FROM micro_lessons WHERE dismissed = 0"),
  ]);

  const recent = sessions.rows.slice(0, 7);
  const avgScore = recent.length
    ? Math.round(recent.reduce((s, r) => s + ((r.score as number) ?? 0), 0) / recent.length)
    : 0;

  return NextResponse.json({
    total_sessions: sessions.rows.length,
    avg_score: avgScore,
    total_words_typed: sessions.rows.reduce((s, r) => s + ((r.word_count as number) ?? 0), 0),
    word_list_size: Number(wordList.rows[0]?.total ?? 0),
    mastered_words: Number(wordList.rows[0]?.mastered ?? 0),
    pending_lessons: Number(lessons.rows[0]?.total ?? 0),
    recent_sessions: sessions.rows.slice(0, 7),
  });
}
