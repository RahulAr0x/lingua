import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rows = await db.execute(
    "SELECT * FROM word_list ORDER BY error_count DESC, last_seen DESC"
  );
  return NextResponse.json(
    rows.rows.map((r) => ({ ...r, mastered: r.mastered === 1 }))
  );
}

export async function PATCH(req: NextRequest) {
  const db = getDb();
  const { id, mastered, notes } = await req.json();
  if (mastered !== undefined) {
    await db.execute({
      sql: "UPDATE word_list SET mastered = ? WHERE id = ?",
      args: [mastered ? 1 : 0, id],
    });
  }
  if (notes !== undefined) {
    await db.execute({
      sql: "UPDATE word_list SET notes = ? WHERE id = ?",
      args: [notes, id],
    });
  }
  return NextResponse.json({ ok: true });
}
