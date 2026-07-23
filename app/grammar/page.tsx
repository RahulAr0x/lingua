"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { MicroLesson } from "@/lib/types";
import { Lightbulb, X, CheckCircle, BookOpen } from "lucide-react";

export default function GrammarPage() {
  const [lessons, setLessons] = useState<MicroLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/lessons");
    const data = await res.json();
    setLessons(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const dismiss = async (id: string) => {
    await fetch("/api/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLessons((ls) => ls.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Grammar & Micro-Lessons</h1>
        <p className="text-muted text-sm mt-1">
          Lessons generated from your recurring mistakes. A new lesson appears after you make the
          same mistake 3 or more times.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && lessons.length === 0 && (
        <div className="text-center py-16 text-muted">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No lessons yet.</p>
          <p className="text-xs mt-1">Complete writing sessions and lessons will appear here when you have recurring mistakes.</p>
        </div>
      )}

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            expanded={expanded === lesson.id}
            onToggle={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
            onDismiss={() => dismiss(lesson.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  expanded,
  onToggle,
  onDismiss,
}: {
  lesson: MicroLesson;
  expanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
}) {
  const { lesson_content: c } = lesson;
  const typeLabel = lesson.error_type === "spelling" ? "Spelling" :
    lesson.error_type === "grammar" ? "Grammar" : "Usage";

  return (
    <div className={cn(
      "bg-surface border rounded-xl overflow-hidden transition-colors",
      expanded ? "border-accent" : "border-border"
    )}>
      <div className="flex items-start justify-between gap-4 p-4">
        <button onClick={onToggle} className="flex items-start gap-3 flex-1 text-left">
          <Lightbulb size={18} className="text-warn mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-ink text-sm">{c.title}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-elevated text-muted">{typeLabel}</span>
              <span className="text-xs text-muted">{lesson.trigger_count}× flagged</span>
            </div>
            <p className="text-xs text-muted mt-0.5 font-mono">&ldquo;{lesson.pattern}&rdquo;</p>
          </div>
        </button>
        <button
          onClick={onDismiss}
          className="text-faint hover:text-muted transition-colors shrink-0"
          title="Dismiss lesson"
        >
          <X size={16} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 space-y-4 pt-4">
          <p className="text-sm text-ink leading-relaxed">{c.explanation}</p>

          {c.examples.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Examples</p>
              {c.examples.map((ex, i) => (
                <div key={i} className="bg-elevated rounded-lg p-3 text-sm space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="line-through text-danger font-mono">{ex.wrong}</span>
                    <span className="text-success font-mono font-medium">{ex.correct}</span>
                  </div>
                  {ex.note && <p className="text-xs text-muted">{ex.note}</p>}
                </div>
              ))}
            </div>
          )}

          {c.tip && (
            <div className="bg-warn-light border border-warn/20 rounded-lg p-3 text-sm">
              <span className="font-semibold text-warn">Tip: </span>
              <span className="text-ink">{c.tip}</span>
            </div>
          )}

          {c.practice && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Practice</p>
              <p className="text-sm text-ink bg-accent-light border border-accent/20 rounded-lg p-3">
                {c.practice}
              </p>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="flex items-center gap-1.5 text-xs text-success hover:text-success/80 transition-colors"
          >
            <CheckCircle size={13} />
            Mark as understood and dismiss
          </button>
        </div>
      )}
    </div>
  );
}
