"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Mic, ChevronRight, Volume2 } from "lucide-react";

type Level = "foundational" | "intermediate" | "advanced";

interface PhonemeProgress {
  phoneme: string;
  level: Level;
  attempts: number;
  correct_attempts: number;
  last_practiced: string | null;
}

interface PhonemeLesson {
  phoneme: string;
  ipa: string;
  level: string;
  description: string;
  examples: Array<{ word: string; ipa: string }>;
  tips: string;
  minimal_pairs: Array<{ a: string; b: string }>;
  uk_us_note?: string;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const gbVoice =
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
  if (gbVoice) utterance.voice = gbVoice;
  window.speechSynthesis.speak(utterance);
}

function SpeakerButton({ text }: { text: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      className="p-1 rounded text-muted hover:text-accent transition-colors shrink-0"
      title={`Hear "${text}"`}
    >
      <Volume2 size={13} />
    </button>
  );
}

export default function PronunciationPage() {
  const [level, setLevel] = useState<Level>("foundational");
  const [items, setItems] = useState<PhonemeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [lesson, setLesson] = useState<PhonemeLesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  const loadLevel = async (l: Level) => {
    setLoading(true);
    setSelected(null);
    setLesson(null);
    const res = await fetch(`/api/pronunciation?level=${l}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLevel(level);
  }, [level]);

  const openLesson = async (phoneme: string) => {
    if (selected === phoneme) {
      setSelected(null);
      setLesson(null);
      return;
    }
    setSelected(phoneme);
    setLesson(null);
    setLessonLoading(true);
    const res = await fetch("/api/pronunciation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneme, level }),
    });
    const data = await res.json();
    setLesson(data);
    setLessonLoading(false);
  };

  const markPracticed = async (phoneme: string, correct: boolean) => {
    await fetch("/api/pronunciation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneme, level, correct }),
    });
    setItems((prev) =>
      prev.map((p) =>
        p.phoneme === phoneme
          ? {
              ...p,
              attempts: p.attempts + 1,
              correct_attempts: p.correct_attempts + (correct ? 1 : 0),
              last_practiced: new Date().toISOString(),
            }
          : p
      )
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Pronunciation</h1>
        <p className="text-muted text-sm mt-1">
          UK English phonemes — from foundational sounds to advanced native-level patterns.
          Audio practice will be added in a future update.
        </p>
      </div>

      <div className="flex gap-2">
        {(["foundational", "intermediate", "advanced"] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
              level === l
                ? "bg-accent text-white"
                : "bg-elevated text-muted hover:text-ink"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const pct = item.attempts > 0 ? Math.round((item.correct_attempts / item.attempts) * 100) : null;
          const isOpen = selected === item.phoneme;
          return (
            <div key={item.phoneme} className={cn(
              "bg-surface border rounded-xl overflow-hidden transition-colors",
              isOpen ? "border-accent" : "border-border"
            )}>
              <button
                onClick={() => openLesson(item.phoneme)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mic size={15} className="text-muted shrink-0" />
                  <span className="font-mono text-sm text-ink font-medium">{item.phoneme}</span>
                </div>
                <div className="flex items-center gap-3">
                  {pct !== null && (
                    <span className={cn(
                      "text-xs font-medium",
                      pct >= 70 ? "text-success" : pct >= 50 ? "text-warn" : "text-danger"
                    )}>
                      {pct}% correct
                    </span>
                  )}
                  {item.last_practiced && (
                    <span className="text-xs text-faint">
                      {new Date(item.last_practiced).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <ChevronRight size={14} className={cn("text-muted transition-transform", isOpen && "rotate-90")} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 pb-4 pt-4 space-y-4">
                  {lessonLoading && (
                    <div className="flex justify-center py-6">
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {lesson && lesson.phoneme === item.phoneme && (
                    <LessonDetail
                      lesson={lesson}
                      onMark={(correct) => markPracticed(item.phoneme, correct)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonDetail({
  lesson,
  onMark,
}: {
  lesson: PhonemeLesson;
  onMark: (correct: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <span className="text-2xl font-mono font-bold text-accent">{lesson.ipa}</span>
        <p className="text-sm text-muted mt-1 leading-relaxed">{lesson.description}</p>
      </div>

      {lesson.examples.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Examples</p>
          <div className="flex flex-wrap gap-2">
            {lesson.examples.map((ex, i) => (
              <div key={i} className="bg-elevated rounded-lg px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-semibold text-sm text-ink">{ex.word}</span>
                  <SpeakerButton text={ex.word} />
                </div>
                <div className="text-xs font-mono text-muted">{ex.ipa}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.minimal_pairs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Minimal Pairs</p>
          <div className="flex flex-wrap gap-2">
            {lesson.minimal_pairs.map((pair, i) => (
              <div key={i} className="bg-elevated rounded-lg px-3 py-1.5 text-sm font-mono text-ink flex items-center gap-1">
                <SpeakerButton text={pair.a} />
                <span>{pair.a}</span>
                <span className="text-muted mx-0.5">/</span>
                <span>{pair.b}</span>
                <SpeakerButton text={pair.b} />
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.tips && (
        <div className="bg-accent-light border border-accent/20 rounded-lg p-3 text-sm">
          <span className="font-semibold text-accent">Tip: </span>
          <span className="text-ink">{lesson.tips}</span>
        </div>
      )}

      {lesson.uk_us_note && (
        <div className="bg-warn-light border border-warn/20 rounded-lg p-3 text-sm">
          <span className="font-semibold text-warn">UK vs US: </span>
          <span className="text-ink">{lesson.uk_us_note}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <p className="text-xs text-muted mr-2">Did you practise this sound?</p>
        <button
          onClick={() => onMark(true)}
          className="px-3 py-1.5 text-xs bg-success text-white rounded-md hover:bg-success/90 transition-colors"
        >
          Yes, got it
        </button>
        <button
          onClick={() => onMark(false)}
          className="px-3 py-1.5 text-xs bg-elevated text-muted rounded-md hover:text-ink transition-colors"
        >
          Still practising
        </button>
      </div>
    </div>
  );
}
