import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { analyzeWritingSession } from "@/lib/ai";
import { generateId } from "@/lib/utils";
import type { SessionAnalysis } from "@/lib/types";

export async function POST(req: NextRequest) {
  const db = getDb();
  const { session_id, content, duration } = await req.json();

  // Fetch top recurring errors for context
  const errorHistory = await db.execute(`
    SELECT word, error_type, COUNT(*) as cnt
    FROM word_errors
    GROUP BY word, error_type
    ORDER BY cnt DESC
    LIMIT 8
  `);
  const recurringErrors = errorHistory.rows.map((r) => ({
    word: r.word as string,
    error_type: r.error_type as string,
    count: Number(r.cnt),
  }));

  const analysis: SessionAnalysis = await analyzeWritingSession(content, duration, recurringErrors);

  await db.execute({
    sql: "UPDATE sessions SET analysis = ?, score = ? WHERE id = ?",
    args: [JSON.stringify(analysis), analysis.overall_score, session_id],
  });

  for (const err of analysis.spelling_errors) {
    const word = err.word.toLowerCase();
    const existing = await db.execute({
      sql: "SELECT id FROM word_list WHERE word = ?",
      args: [word],
    });
    if (existing.rows.length > 0) {
      await db.execute({
        sql: "UPDATE word_list SET error_count = error_count + 1, last_seen = ? WHERE word = ?",
        args: [new Date().toISOString(), word],
      });
    } else {
      await db.execute({
        sql: "INSERT INTO word_list (id, word, error_count, last_seen) VALUES (?, ?, 1, ?)",
        args: [generateId(), word, new Date().toISOString()],
      });
    }
  }

  const now = new Date().toISOString();
  for (const err of analysis.spelling_errors) {
    await db.execute({
      sql: "INSERT INTO word_errors (id, session_id, word, error_type, context, suggestion, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [generateId(), session_id, err.word, "spelling", err.context, err.correction, now],
    });
  }
  for (const issue of analysis.grammar_issues) {
    await db.execute({
      sql: "INSERT INTO word_errors (id, session_id, word, error_type, context, suggestion, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [generateId(), session_id, issue.text, issue.type, issue.text, issue.correction, now],
    });
  }

  return NextResponse.json(analysis);
}
