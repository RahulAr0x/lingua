export type SessionDuration = 3 | 5;

export interface Session {
  id: string;
  created_at: string;
  duration: number;
  content: string;
  word_count: number;
  analysis: SessionAnalysis | null;
  score: number | null;
}

export interface SessionAnalysis {
  spelling_errors: SpellingError[];
  grammar_issues: GrammarIssue[];
  word_choice: WordChoiceNote[];
  structure_feedback: string;
  strengths: string[];
  overall_score: number;
  suggested_vocab: VocabSuggestion[];
}

export interface SpellingError {
  word: string;
  correction: string;
  context: string;
}

export interface GrammarIssue {
  text: string;
  correction: string;
  explanation: string;
  type: string;
}

export interface WordChoiceNote {
  original: string;
  suggestion: string;
  reason: string;
}

export interface VocabSuggestion {
  word: string;
  definition: string;
  example: string;
}

export interface WordEntry {
  id: string;
  word: string;
  error_count: number;
  last_seen: string;
  mastered: boolean;
  notes: string | null;
}

export interface MicroLesson {
  id: string;
  error_type: string;
  pattern: string;
  lesson_content: LessonContent;
  trigger_count: number;
  created_at: string;
  dismissed: boolean;
}

export interface LessonContent {
  title: string;
  explanation: string;
  examples: Array<{ wrong: string; correct: string; note: string }>;
  tip: string;
  practice: string;
}

export interface VarietyProgress {
  variety: "uk" | "us" | "au" | "general";
  category: "formal" | "everyday" | "slang";
  words_reviewed: number;
  last_reviewed: string | null;
}

export interface VarietyEntry {
  variety: "uk" | "us" | "au" | "general";
  category: "formal" | "everyday" | "slang";
  word: string;
  definition: string;
  example: string;
  equivalent?: Record<string, string>;
  register_note: string;
}

export interface PronunciationItem {
  phoneme: string;
  ipa: string;
  level: "foundational" | "intermediate" | "advanced";
  description: string;
  examples: Array<{ word: string; ipa: string }>;
  tips: string;
  minimal_pairs: Array<{ a: string; b: string }>;
}

export interface DailyStats {
  date: string;
  sessions_count: number;
  total_words: number;
  avg_score: number;
  new_errors: number;
}
