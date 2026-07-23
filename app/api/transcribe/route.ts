import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { compareReadingTranscript } from "@/lib/ai";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get("audio") as Blob | null;
  const passage = formData.get("passage") as string | null;

  if (!audio || !passage) {
    return NextResponse.json({ error: "Missing audio or passage" }, { status: 400 });
  }

  const groq = getGroqClient();

  const audioFile = new File(
    [await audio.arrayBuffer()],
    "recording.webm",
    { type: audio.type || "audio/webm" }
  );

  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3-turbo",
    language: "en",
  });

  const transcript = transcription.text;
  const comparison = await compareReadingTranscript(transcript, passage);

  return NextResponse.json({ transcript, comparison });
}
