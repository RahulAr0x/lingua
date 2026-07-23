"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReadingTopic } from "@/lib/ai";
import { BookOpen, SkipForward, RefreshCw } from "lucide-react";
import VoiceRecorder from "@/components/voice-recorder";

const TOPICS: Array<{ id: ReadingTopic; label: string; icon: string }> = [
  { id: "philosophy", label: "Philosophy", icon: "🧠" },
  { id: "history", label: "History", icon: "🏛️" },
  { id: "geopolitics", label: "Geopolitics", icon: "🌍" },
  { id: "literature", label: "Literature", icon: "📖" },
  { id: "public_domain", label: "Essays & Nature", icon: "🌿" },
];

function dailyTopicIndex(): number {
  const d = new Date();
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % TOPICS.length;
}

interface Passage {
  title: string;
  passage: string;
  topic: ReadingTopic;
}

export default function ReadingPage() {
  const [topicOffset, setTopicOffset] = useState(0);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  const currentIndex = (dailyTopicIndex() + topicOffset) % TOPICS.length;
  const currentTopic = TOPICS[currentIndex];
  const isDaily = topicOffset === 0;

  const load = async (topicId: ReadingTopic) => {
    setLoading(true);
    setPassage(null);
    try {
      const res = await fetch(`/api/reading?topic=${topicId}`);
      const data = await res.json();
      setPassage(data);
      setWordCount(data.passage.trim().split(/\s+/).filter(Boolean).length);
    } catch {
      setPassage(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(currentTopic.id);
  }, [topicOffset]);

  const skip = () => setTopicOffset((o) => (o + 1) % TOPICS.length);

  const jumpTo = (index: number) => {
    const base = dailyTopicIndex();
    const offset = (index - base + TOPICS.length) % TOPICS.length;
    setTopicOffset(offset);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Daily Reading</h1>
        <p className="text-muted text-sm mt-1">
          Read the passage aloud at a natural pace. Focus on clarity and rhythm, not speed.
          A new set of passages is generated each day.
        </p>
      </div>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t, i) => {
          const isToday = i === dailyTopicIndex();
          const isActive = i === currentIndex;
          return (
            <button
              key={t.id}
              onClick={() => jumpTo(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                isActive
                  ? "bg-accent text-white border-accent"
                  : isToday
                  ? "bg-accent-light text-accent border-accent/30 hover:border-accent"
                  : "bg-surface text-muted border-border hover:text-ink hover:border-accent/40"
              )}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {isToday && !isActive && (
                <span className="text-accent font-bold">·</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Passage card */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-elevated">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentTopic.icon}</span>
            <span className="text-sm font-semibold text-ink">{currentTopic.label}</span>
            {isDaily && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-light text-accent font-medium">
                Today
              </span>
            )}
          </div>
          <button
            onClick={skip}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
            title="Skip to next topic"
          >
            <SkipForward size={13} />
            Next topic
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Generating passage...</p>
            </div>
          )}

          {!loading && !passage && (
            <div className="text-center py-12 text-muted">
              <BookOpen size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Could not load passage. Try refreshing.</p>
              <button
                onClick={() => load(currentTopic.id)}
                className="mt-3 flex items-center gap-1.5 mx-auto text-xs text-accent hover:text-accent/80 transition-colors"
              >
                <RefreshCw size={12} />
                Try again
              </button>
            </div>
          )}

          {!loading && passage && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-ink leading-snug">
                  {passage.title}
                </h2>
                <span className="text-xs text-muted mt-1 inline-block">
                  {wordCount} words
                </span>
              </div>
              <p className="text-ink leading-[1.9] text-[0.95rem] whitespace-pre-wrap font-serif tracking-[0.01em]">
                {passage.passage}
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {!loading && passage && (
          <div className="px-5 py-3 border-t border-border bg-elevated text-xs text-muted flex items-center justify-between">
            <span>Read aloud at a steady pace. Pause at punctuation.</span>
            <button
              onClick={() => load(currentTopic.id)}
              className="flex items-center gap-1 hover:text-ink transition-colors"
              title="Generate a new passage for this topic"
            >
              <RefreshCw size={11} />
              New passage
            </button>
          </div>
        )}
      </div>

      {/* Voice recorder */}
      {!loading && passage && (
        <VoiceRecorder key={passage.title} passage={passage.passage} />
      )}
    </div>
  );
}
