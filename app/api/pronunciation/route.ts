import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPronunciationLesson } from "@/lib/ai";

const UK_PHONEMES = {
  foundational: [
    "/æ/ — trap", "/ɑː/ — bath", "/ɒ/ — lot", "/ɔː/ — thought",
    "/ʊ/ — foot", "/uː/ — goose", "/ʌ/ — strut", "/ɜː/ — nurse",
    "/iː/ — fleece", "/eɪ/ — face", "/aɪ/ — price", "/ɔɪ/ — choice",
    "/aʊ/ — mouth", "/əʊ/ — goat", "/ɪə/ — near", "/eə/ — square",
  ],
  intermediate: [
    "/θ/ — think", "/ð/ — this", "/ŋ/ — sing", "/ʃ/ — ship",
    "/ʒ/ — measure", "/tʃ/ — chair", "/dʒ/ — judge",
    "Linking R", "Intrusive R", "Weak forms", "Stress in compound nouns",
  ],
  advanced: [
    "Glottal stop /ʔ/", "Vowel reduction in unstressed syllables",
    "Sentence stress and rhythm", "Intonation for questions vs statements",
    "Connected speech: elision", "Connected speech: assimilation",
    "RP vs Estuary English differences",
  ],
};

export async function GET(req: NextRequest) {
  const db = getDb();
  const level = (req.nextUrl.searchParams.get("level") ?? "foundational") as
    | "foundational"
    | "intermediate"
    | "advanced";

  const phonemes = UK_PHONEMES[level];
  const progress = await db.execute({
    sql: "SELECT phoneme, attempts, correct_attempts, last_practiced FROM pronunciation_progress WHERE level = ?",
    args: [level],
  });

  const progressMap = new Map(progress.rows.map((r) => [r.phoneme, r]));

  const items = phonemes.map((p) => {
    const prog = progressMap.get(p);
    return {
      phoneme: p,
      level,
      attempts: prog?.attempts ?? 0,
      correct_attempts: prog?.correct_attempts ?? 0,
      last_practiced: prog?.last_practiced ?? null,
    };
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { phoneme, level } = await req.json();
  const lesson = await getPronunciationLesson(phoneme, level);
  return NextResponse.json(lesson);
}

export async function PATCH(req: NextRequest) {
  const db = getDb();
  const { phoneme, level, correct } = await req.json();
  const existing = await db.execute({
    sql: "SELECT phoneme FROM pronunciation_progress WHERE phoneme = ?",
    args: [phoneme],
  });
  if (existing.rows.length > 0) {
    await db.execute({
      sql: "UPDATE pronunciation_progress SET attempts = attempts + 1, correct_attempts = correct_attempts + ?, last_practiced = ? WHERE phoneme = ?",
      args: [correct ? 1 : 0, new Date().toISOString(), phoneme],
    });
  } else {
    await db.execute({
      sql: "INSERT INTO pronunciation_progress (phoneme, level, attempts, correct_attempts, last_practiced) VALUES (?, ?, 1, ?, ?)",
      args: [phoneme, level, correct ? 1 : 0, new Date().toISOString()],
    });
  }
  return NextResponse.json({ ok: true });
}
