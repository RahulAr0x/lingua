import OpenAI from "openai";
import type { SessionAnalysis, LessonContent, MicroLesson } from "./types";

const MODEL = "deepseek/deepseek-v4-flash";

function getClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://lingua.vercel.app",
      "X-Title": "Lingua English Tutor",
    },
  });
}

export async function analyzeWritingSession(
  content: string,
  durationMinutes: number,
  recurringErrors?: Array<{ word: string; error_type: string; count: number }>
): Promise<SessionAnalysis> {
  const client = getClient();

  const historyNote = recurringErrors && recurringErrors.length > 0
    ? `\n\nLearner's recurring errors from previous sessions (pay extra attention if these appear again):\n${recurringErrors.map((e) => `- "${e.word}" (${e.error_type}, appeared ${e.count} times before)`).join("\n")}`
    : "";

  const prompt = `You are an expert English language tutor helping an intermediate non-native English speaker improve their writing. The speaker is preparing for professional and daily life in the UK.${historyNote}

Analyse the following writing sample (written in ${durationMinutes} minutes) and return a JSON object with this exact structure:

{
  "spelling_errors": [{"word": "...", "correction": "...", "context": "...surrounding text..."}],
  "grammar_issues": [{"text": "...original phrase...", "correction": "...corrected phrase...", "explanation": "...why it's wrong...", "type": "subject-verb agreement|tense|article|preposition|other"}],
  "word_choice": [{"original": "...", "suggestion": "...", "reason": "...why this is better..."}],
  "structure_feedback": "...2-3 sentences on sentence structure and paragraph flow...",
  "strengths": ["...positive aspect...", "..."],
  "overall_score": 75,
  "suggested_vocab": [{"word": "...", "definition": "...", "example": "..."}]
}

Rules:
- overall_score: 0-100, calibrated for an intermediate learner (70 = solid intermediate)
- spelling_errors: UK English spelling conventions (e.g. "colour" not "color")
- suggested_vocab: 3-5 intermediate-level words relevant to the content written
- Be constructive and specific, not generic
- If recurring errors from previous sessions appear again, flag them explicitly in spelling_errors or grammar_issues
- If the text has no errors of a type, return an empty array

Writing sample:
${content}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as SessionAnalysis;
}

export async function generateMicroLesson(
  pattern: string,
  errorType: string,
  examples: Array<{ wrong: string; context: string }>
): Promise<LessonContent> {
  const client = getClient();
  const prompt = `Create a concise micro-lesson for an intermediate non-native English speaker preparing for life in the UK. They keep making this mistake: "${pattern}" (type: ${errorType}).

Examples from their writing:
${examples.map((e) => `- "${e.wrong}" in context: "${e.context}"`).join("\n")}

Return a JSON object:
{
  "title": "...",
  "explanation": "...clear, simple explanation in 2-3 sentences...",
  "examples": [
    {"wrong": "...", "correct": "...", "note": "...brief note..."},
    {"wrong": "...", "correct": "...", "note": "..."}
  ],
  "tip": "...one memorable tip or mnemonic...",
  "practice": "...one short practice sentence for the learner to complete or rewrite..."
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as LessonContent;
}

const ALL_PROMPTS = [
  // Professional & workplace
  "Describe how you prefer to organise your working day and why that approach suits you.",
  "Write about a time you had to explain a complex idea to someone unfamiliar with it.",
  "Describe the qualities you think make someone a good colleague.",
  "Write about a professional challenge you faced and the steps you took to resolve it.",
  "Describe what a productive meeting looks like to you.",
  "Write about a skill you are currently trying to improve at work or in your studies.",
  "Describe how you would introduce yourself to a new team on your first day.",
  "Write about a time you had to adapt quickly to an unexpected change.",
  // Daily UK life
  "Describe your experience with public transport and what you find most useful or frustrating about it.",
  "Write about how you go about finding a good café, restaurant, or local shop in an unfamiliar area.",
  "Describe what a typical weekend looks like for you at the moment.",
  "Write about a British custom or tradition that you find interesting or unfamiliar.",
  "Describe your neighbourhood or the area where you live and what you like about it.",
  "Write about the differences you notice between your home country and the UK in everyday life.",
  "Describe how you handle a day when things do not go according to plan.",
  // Opinion & reflection
  "What is something you have changed your mind about in the past year? Explain why.",
  "Write about something you think is often misunderstood about the place you come from.",
  "Describe a decision you made that turned out differently from what you expected.",
  "What does feeling settled in a new place mean to you, and how do you get there?",
  "Write about whether it is important to adapt your way of speaking when living in a new country.",
  "Describe what success means to you at this stage of your life.",
  "Write about a value or principle that guides how you treat other people.",
  // Personal & descriptive
  "Describe a habit you have built recently and what prompted you to start it.",
  "Write about a goal you are actively working towards and the progress you have made.",
  "Describe a meal you know how to cook well and what makes it special to you.",
  "Write about a time you felt genuinely proud of something you made or accomplished.",
  "Describe a memorable conversation you have had and why it stayed with you.",
  "Write about a book, film, or piece of music that had an effect on how you think.",
  "Describe a place — indoors or outdoors — where you feel most at ease.",
  "Write about something you find difficult to put into words and try to explain it anyway.",
];

export async function getDailyPrompts(date: string): Promise<string[]> {
  const base = parseInt(date.replace(/-/g, "")) % ALL_PROMPTS.length;
  const n = ALL_PROMPTS.length;
  return [
    ALL_PROMPTS[base % n],
    ALL_PROMPTS[(base + 7) % n],
    ALL_PROMPTS[(base + 17) % n],
  ];
}

// kept for backward compat
export async function generateDailyPrompt(date: string): Promise<string> {
  const prompts = await getDailyPrompts(date);
  return prompts[0];
}

export async function generateVarietyContent(
  variety: "uk" | "us" | "au" | "general",
  category: "formal" | "everyday" | "slang",
  count: number = 10
) {
  const client = getClient();
  const varietyLabel = { uk: "British", us: "American", au: "Australian", general: "General" }[variety];
  const prompt = `Generate ${count} vocabulary entries for ${varietyLabel} English, category: ${category}.

Return a JSON array:
[
  {
    "word": "...",
    "definition": "...",
    "example": "...natural sentence using the word...",
    "register_note": "...when/where to use this (e.g. office emails, casual conversation, avoid in formal writing)...",
    "equivalents": {"uk": "...", "us": "...", "au": "..."}
  }
]

Only include entries where the word or usage is notably different or interesting across varieties. For the "equivalents" field, only include varieties where the equivalent differs from the word itself. Category context: ${category === "slang" ? "include informal and colloquial expressions" : category === "formal" ? "include professional and academic vocabulary" : "include common everyday vocabulary and phrases"}.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const raw = response.choices[0].message.content ?? '{"items":[]}';
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.items ?? [];
  } catch {
    return [];
  }
}

export async function getPronunciationLesson(
  phoneme: string,
  level: "foundational" | "intermediate" | "advanced"
) {
  const client = getClient();
  const prompt = `Create a pronunciation lesson for the phoneme "${phoneme}" at ${level} level for a non-native English speaker learning UK English.

Return JSON:
{
  "phoneme": "${phoneme}",
  "ipa": "...",
  "level": "${level}",
  "description": "...how to physically produce this sound...",
  "examples": [{"word": "...", "ipa": "..."}, {"word": "...", "ipa": "..."}, {"word": "...", "ipa": "..."}],
  "tips": "...specific tip for non-native speakers...",
  "minimal_pairs": [{"a": "...", "b": "..."}, {"a": "...", "b": "..."}],
  "uk_us_note": "...if the sound differs between UK and US English, explain how..."
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content ?? "{}";
  return JSON.parse(raw);
}

export type ReadingTopic = "philosophy" | "history" | "geopolitics" | "literature" | "public_domain";

export interface ReadingComparison {
  accuracy_pct: number;
  missed_words: string[];
  substituted: Array<{ said: string; meant: string }>;
  extra_words: string[];
  fluency_feedback: string;
}

export async function compareReadingTranscript(
  transcript: string,
  passage: string
): Promise<ReadingComparison> {
  const client = getClient();

  const prompt = `You are comparing a learner's spoken reading of a passage against the original text.

Original passage:
"""
${passage}
"""

Learner's transcript (what they actually said):
"""
${transcript}
"""

Analyse how accurately the learner read the passage and return JSON:
{
  "accuracy_pct": <integer 0-100>,
  "missed_words": [...words in the passage that were clearly skipped],
  "substituted": [{"said": "...", "meant": "..."}, ...up to 5 most notable substitutions],
  "extra_words": [...filler words or additions not in the passage, e.g. "um", "uh", "like"],
  "fluency_feedback": "...2-3 sentences. Note what they did well first, then what to work on. Keep it encouraging and specific."
}

Rules:
- Be lenient with minor differences: articles (a/an/the swapped), capitalisation, punctuation
- Do NOT flag "um", "uh", "er", "ah" as substitutions — put them in extra_words only
- accuracy_pct reflects how much of the passage content was conveyed correctly, not character-level matching
- If the transcript is very close to the passage, accuracy_pct should be 90+
- missed_words: only flag clearly skipped words, not minor article changes`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const raw = response.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as ReadingComparison;
}

const READING_TOPIC_PROMPTS: Record<ReadingTopic, string> = {
  philosophy:
    "Write an original 180–250 word passage on a specific philosophical concept or question. Choose something concrete: stoicism, the problem of free will, empiricism, the nature of consciousness, moral luck, the ship of Theseus, or language and meaning. Write it as a clear, thoughtful short essay — no jargon, vivid examples, varied sentence length. Suitable for an intermediate-level English reader reading aloud.",
  history:
    "Write an original 180–250 word passage about a specific historical event, turning point, or figure that shaped the modern world. Write it as narrative history — precise, lively, and readable. Avoid textbook dryness. Each passage should cover something different. Suitable for an intermediate-level English reader reading aloud.",
  geopolitics:
    "Write an original 180–250 word passage explaining a geopolitical concept, alliance, or historical development that helps a reader understand how the world is organised today. Examples: the significance of a trade route, why a border was drawn as it was, the logic of a political bloc, or how geography shaped a nation. Clear and analytical, no jargon. Suitable for an intermediate-level English reader reading aloud.",
  literature:
    "Write an original 180–250 word passage about a work, author, or theme from English-language literature in the public domain (pre-1927). Analyse a character, explore a theme, or examine a writer's style. You may quote a short phrase (under 20 words) to illustrate a point, but write the passage yourself. Examples: Dickens's social satire, Austen's narrative voice, the Romantic poets' view of nature, Orwell's early essays, Hardy's Wessex. Accessible and engaging. Suitable for an intermediate-level English reader reading aloud.",
  public_domain:
    "Write an original 180–250 word passage in the style of a public domain essay or nature-writing tradition — reflective, observational prose in the manner of Gilbert White, Charles Lamb, or early George Orwell. Original writing only. Describe something specific: a season, a creature, a city habit, a domestic object, or a landscape. Give it a distinct voice and a sense of place. Suitable for an intermediate-level English reader reading aloud.",
};

export async function generateReadingPassage(
  topic: ReadingTopic
): Promise<{ title: string; passage: string }> {
  const client = getClient();
  const prompt = `${READING_TOPIC_PROMPTS[topic]}

The passage should be genuinely interesting to read aloud: varied rhythm, clear structure, precise vocabulary. It is for an English learner practising their pronunciation and fluency, so it should reward careful reading without being dense.

Return JSON only:
{
  "title": "...",
  "passage": "..."
}

The title must be specific — not generic. Examples of good titles: "On the Stoic Practice of Negative Visualisation", "The Monsoon and the Making of South Asian Trade", "Pip and the Problem of Gratitude in Great Expectations". No quotation marks around the title.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const raw = response.choices[0].message.content ?? '{"title":"Reading","passage":""}';
  return JSON.parse(raw) as { title: string; passage: string };
}
