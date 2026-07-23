import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type { Session } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = getDb();
  const limit = req.nextUrl.searchParams.get("limit") ?? "20";
  const rows = await db.execute({
    sql: "SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?",
    args: [parseInt(limit)],
  });
  const sessions = rows.rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    duration: r.duration,
    content: r.content,
    word_count: r.word_count,
    score: r.score,
    analysis: r.analysis ? JSON.parse(r.analysis as string) : null,
  })) as unknown as Session[];
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const id = body.id ?? generateId();
  const created_at = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO sessions (id, created_at, duration, content, word_count)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET content = excluded.content, word_count = excluded.word_count`,
    args: [id, created_at, body.duration, body.content ?? "", body.word_count ?? 0],
  });
  return NextResponse.json({ id, created_at });
}

export async function PATCH(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { id } = body;

  if (body.analysis !== undefined) {
    await db.execute({
      sql: "UPDATE sessions SET analysis = ?, score = ? WHERE id = ?",
      args: [JSON.stringify(body.analysis), body.score ?? null, id],
    });
  }
  if (body.content !== undefined) {
    await db.execute({
      sql: "UPDATE sessions SET content = ?, word_count = ? WHERE id = ?",
      args: [body.content, body.word_count ?? 0, id],
    });
  }
  return NextResponse.json({ ok: true });
}
