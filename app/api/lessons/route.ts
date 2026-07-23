import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateMicroLesson } from "@/lib/ai";
import { generateId } from "@/lib/utils";

export async function GET() {
  const db = getDb();
  const rows = await db.execute(
    "SELECT * FROM micro_lessons WHERE dismissed = 0 ORDER BY trigger_count DESC, created_at DESC"
  );
  return NextResponse.json(
    rows.rows.map((r) => ({
      ...r,
      lesson_content: JSON.parse(r.lesson_content as string),
      dismissed: r.dismissed === 1,
    }))
  );
}

// Check if any error pattern has hit 3+ occurrences and generate a micro-lesson
export async function POST(req: NextRequest) {
  const db = getDb();
  const { session_id } = await req.json();

  // Find error patterns with 3+ occurrences across sessions that don't have a lesson yet
  const patterns = await db.execute(`
    SELECT error_type, word, context, suggestion, COUNT(*) as cnt
    FROM word_errors
    GROUP BY error_type, word
    HAVING cnt >= 3
  `);

  const lessons: string[] = [];

  for (const row of patterns.rows) {
    const existing = await db.execute({
      sql: "SELECT id FROM micro_lessons WHERE pattern = ? AND error_type = ?",
      args: [row.word as string, row.error_type as string],
    });
    if (existing.rows.length > 0) {
      // Update trigger count
      await db.execute({
        sql: "UPDATE micro_lessons SET trigger_count = trigger_count + 1 WHERE pattern = ? AND error_type = ?",
        args: [row.word as string, row.error_type as string],
      });
      continue;
    }

    // Get examples for this pattern
    const exampleRows = await db.execute({
      sql: "SELECT word, context FROM word_errors WHERE word = ? AND error_type = ? LIMIT 3",
      args: [row.word as string, row.error_type as string],
    });
    const examples = exampleRows.rows.map((e) => ({
      wrong: e.word as string,
      context: e.context as string,
    }));

    const content = await generateMicroLesson(
      row.word as string,
      row.error_type as string,
      examples
    );

    const id = generateId();
    await db.execute({
      sql: "INSERT INTO micro_lessons (id, error_type, pattern, lesson_content, trigger_count, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, row.error_type as string, row.word as string, JSON.stringify(content), row.cnt as number, new Date().toISOString()],
    });
    lessons.push(id);
  }

  return NextResponse.json({ generated: lessons.length });
}

export async function PATCH(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  await db.execute({
    sql: "UPDATE micro_lessons SET dismissed = 1 WHERE id = ?",
    args: [id],
  });
  return NextResponse.json({ ok: true });
}
