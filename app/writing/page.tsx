"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn, formatDuration, countWords, generateId } from "@/lib/utils";
import { CATEGORIES, getTodayQuestion, getRandomPrompt, type Category, type Subcategory } from "@/lib/topics";
import type { SessionDuration, SessionAnalysis } from "@/lib/types";
import {
  Timer, CheckCircle, AlertTriangle, BookOpen,
  ChevronDown, ChevronUp, Shuffle, PenLine, ChevronRight,
} from "lucide-react";

type Phase = "select" | "writing" | "analyzing" | "results";

export default function WritingPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [duration, setDuration] = useState<SessionDuration>(5);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [committedText, setCommittedText] = useState("");
  const [activeText, setActiveText] = useState("");
  const [maxLen, setMaxLen] = useState(0);
  const [warnBacktrack, setWarnBacktrack] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickRandom = () => {
    const { question } = getRandomPrompt();
    setSelectedPrompt(question);
    setShowCustom(false);
    setOpenCategory(null);
  };

  const startSession = async () => {
    const prompt = showCustom ? customTopic.trim() : selectedPrompt;
    if (!prompt) return;
    const id = generateId();
    setSessionId(id);
    setCommittedText("");
    setActiveText("");
    setMaxLen(0);
    setWarnBacktrack(false);
    setAnalysis(null);
    setSecondsLeft(duration * 60);
    setPhase("writing");

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, duration, content: "", word_count: 0 }),
    }).catch(() => {});

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);

    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (phase === "writing" && secondsLeft === 0) submitSession();
  }, [secondsLeft, phase]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const fullLen = committedText.length + val.length;
    if (fullLen < maxLen - 10) {
      setWarnBacktrack(true);
      setTimeout(() => setWarnBacktrack(false), 2000);
    }
    setMaxLen(Math.max(maxLen, fullLen));
    setActiveText(val);
    if (val.endsWith("\n\n")) {
      setCommittedText((prev) => prev + val);
      setActiveText("");
    }
  };

  const submitSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const fullContent = (committedText + activeText).trim();
    if (!fullContent) { setPhase("select"); return; }
    setPhase("analyzing");

    const wc = countWords(fullContent);
    await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionId, content: fullContent, word_count: wc }),
    }).catch(() => {});

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content: fullContent, duration }),
      });
      const data: SessionAnalysis = await res.json();
      setAnalysis(data);
      fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {});
    } catch {
      setAnalysis(null);
    }
    setPhase("results");
  }, [committedText, activeText, sessionId, duration]);

  const activePrompt = showCustom ? customTopic.trim() : selectedPrompt;
  const timerColor = secondsLeft <= 30 ? "text-danger" : secondsLeft <= 60 ? "text-warn" : "text-accent";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Writing & Spelling</h1>
        <p className="text-muted text-sm mt-1">Timed writing session with AI feedback.</p>
      </div>

      {phase === "select" && (
        <div className="space-y-4">
          {/* Header actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Choose a topic</p>
            <button
              onClick={pickRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated text-muted hover:text-ink hover:bg-border transition-colors text-sm font-medium"
            >
              <Shuffle size={13} />
              Random
            </button>
          </div>

          {/* Selected prompt preview */}
          {activePrompt && (
            <div className="flex items-start gap-3 px-4 py-3 bg-accent-light border border-accent/25 rounded-xl">
              <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-ink leading-relaxed">{activePrompt}</p>
            </div>
          )}

          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setOpenCategory(openCategory === cat.id ? null : cat.id);
                  setShowCustom(false);
                }}
                className={cn(
                  "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                  openCategory === cat.id
                    ? "border-accent bg-accent-light"
                    : cn("border-border bg-surface hover:border-accent/40", cat.color)
                )}
              >
                <span className="text-xl mb-1">{cat.icon}</span>
                <span className="text-xs font-semibold text-ink leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Expanded category */}
          {openCategory && (() => {
            const cat = CATEGORIES.find((c) => c.id === openCategory)!;
            return (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-elevated flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="font-semibold text-sm text-ink">{cat.label}</span>
                  <span className="text-xs text-muted ml-1">— {cat.description}</span>
                </div>
                <div className="divide-y divide-border">
                  {cat.subcategories.map((sub) => (
                    <SubcategoryPanel
                      key={sub.label}
                      sub={sub}
                      selected={selectedPrompt}
                      onSelect={(q) => { setSelectedPrompt(q); setShowCustom(false); }}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Write your own */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => { setShowCustom((v) => !v); setOpenCategory(null); }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors text-sm"
            >
              <span className="flex items-center gap-2 font-medium text-ink">
                <PenLine size={14} className="text-muted" />
                Write your own topic
              </span>
              {showCustom ? <ChevronUp size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
            </button>
            {showCustom && (
              <div className="px-4 pb-4 pt-1">
                <textarea
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Type your own topic or question here..."
                  className="writing-area border border-border rounded-lg px-3 py-2 text-sm min-h-16 bg-bg"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Duration + start */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink mb-2">Session length</p>
              <div className="flex gap-3">
                {([3, 5] as SessionDuration[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "px-5 py-2 rounded-lg border text-sm font-medium transition-colors",
                      duration === d
                        ? "border-accent bg-accent text-white"
                        : "border-border text-muted hover:border-accent hover:text-accent"
                    )}
                  >
                    {d} minutes
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startSession}
              disabled={!activePrompt}
              className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {activePrompt ? "Start Session" : "Select a topic to begin"}
            </button>
          </div>
        </div>
      )}

      {phase === "writing" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted leading-relaxed flex-1">{activePrompt}</p>
            <div className={cn("flex items-center gap-1.5 font-mono text-lg font-semibold shrink-0", timerColor)}>
              <Timer size={16} />
              {formatDuration(secondsLeft)}
            </div>
          </div>

          {warnBacktrack && (
            <div className="flex items-center gap-2 text-warn text-sm bg-warn-light px-3 py-2 rounded-lg">
              <AlertTriangle size={14} />
              Keep moving forward — resist the urge to edit.
            </div>
          )}

          <div className="bg-surface border border-border rounded-xl p-5 min-h-80">
            {committedText && <div className="committed-text mb-1">{committedText}</div>}
            <textarea
              ref={textareaRef}
              value={activeText}
              onChange={handleTextChange}
              className="writing-area min-h-48"
              placeholder="Start writing here. Press Enter twice to commit a paragraph."
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>{countWords(committedText + activeText)} words</span>
            <button
              onClick={submitSession}
              className="px-4 py-1.5 bg-success text-white rounded-md font-medium hover:bg-success/90 transition-colors text-sm"
            >
              Finish Early
            </button>
          </div>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Analysing your writing...</p>
        </div>
      )}

      {phase === "results" && analysis && (
        <div className="space-y-5">
          <SessionAnalysisView analysis={analysis} />
          <button
            onClick={() => setPhase("select")}
            className="w-full py-3 border border-border rounded-lg text-muted hover:text-ink hover:border-accent transition-colors text-sm font-medium"
          >
            Start Another Session
          </button>
        </div>
      )}
    </div>
  );
}

function SubcategoryPanel({
  sub,
  selected,
  onSelect,
}: {
  sub: Subcategory;
  selected: string;
  onSelect: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const today = getTodayQuestion(sub.questions);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors text-sm"
      >
        <span className="font-medium text-ink">{sub.label}</span>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline">{sub.questions.length} questions</span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {open && (
        <div className="pb-2 space-y-1 px-3">
          {sub.questions.map((q) => {
            const isToday = q === today;
            const isSelected = q === selected;
            return (
              <button
                key={q}
                onClick={() => onSelect(q)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm leading-relaxed transition-colors",
                  isSelected
                    ? "bg-accent text-white"
                    : isToday
                    ? "bg-accent-light text-ink border border-accent/20 hover:border-accent/50"
                    : "text-muted hover:bg-elevated hover:text-ink"
                )}
              >
                {isToday && !isSelected && (
                  <span className="text-xs font-semibold text-accent mr-1.5">Today</span>
                )}
                {q}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Exported so it can be reused on the sessions history page
export function SessionAnalysisView({ analysis }: { analysis: SessionAnalysis }) {
  return (
    <>
      <ScoreHeader score={analysis.overall_score} />
      <StrengthsCard strengths={analysis.strengths} />
      {analysis.spelling_errors.length > 0 && (
        <ErrorCard
          title="Spelling Errors"
          count={analysis.spelling_errors.length}
          items={analysis.spelling_errors.map((e) => ({ original: e.word, correction: e.correction, note: e.context }))}
        />
      )}
      {analysis.grammar_issues.length > 0 && (
        <ErrorCard
          title="Grammar Issues"
          count={analysis.grammar_issues.length}
          items={analysis.grammar_issues.map((g) => ({ original: g.text, correction: g.correction, note: g.explanation }))}
        />
      )}
      {analysis.word_choice.length > 0 && (
        <ErrorCard
          title="Word Choice"
          count={analysis.word_choice.length}
          items={analysis.word_choice.map((w) => ({ original: w.original, correction: w.suggestion, note: w.reason }))}
        />
      )}
      <StructureCard feedback={analysis.structure_feedback} />
      {analysis.suggested_vocab.length > 0 && <VocabCard words={analysis.suggested_vocab} />}
    </>
  );
}

function ScoreHeader({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warn" : "text-danger";
  const label = score >= 80 ? "Strong" : score >= 70 ? "Solid" : score >= 60 ? "Developing" : "Needs work";
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">Session Score</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
      <div className={cn("text-4xl font-bold", color)}>
        {score}<span className="text-lg text-muted font-normal">/100</span>
      </div>
    </div>
  );
}

function StrengthsCard({ strengths }: { strengths: string[] }) {
  if (!strengths.length) return null;
  return (
    <div className="bg-success-light border border-success/20 rounded-xl p-4">
      <p className="text-sm font-semibold text-success flex items-center gap-1.5 mb-2">
        <CheckCircle size={14} /> What you did well
      </p>
      <ul className="space-y-1">
        {strengths.map((s, i) => <li key={i} className="text-sm text-ink">• {s}</li>)}
      </ul>
    </div>
  );
}

function ErrorCard({ title, count, items }: {
  title: string;
  count: number;
  items: Array<{ original: string; correction: string; note: string }>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors"
      >
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className="flex items-center gap-2 text-sm text-muted">
          {count} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="divide-y divide-border">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3 text-sm">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="line-through text-danger font-mono">{item.original}</span>
                <span className="text-success font-mono font-medium">{item.correction}</span>
              </div>
              {item.note && <p className="text-muted mt-0.5 text-xs">{item.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StructureCard({ feedback }: { feedback: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-sm font-semibold text-ink mb-2">Structure & Flow</p>
      <p className="text-sm text-muted leading-relaxed">{feedback}</p>
    </div>
  );
}

function VocabCard({ words }: { words: Array<{ word: string; definition: string; example: string }> }) {
  return (
    <div className="bg-accent-light border border-accent/20 rounded-xl p-4">
      <p className="text-sm font-semibold text-accent flex items-center gap-1.5 mb-3">
        <BookOpen size={14} /> Suggested vocabulary
      </p>
      <div className="space-y-3">
        {words.map((w, i) => (
          <div key={i}>
            <span className="font-mono font-semibold text-ink">{w.word}</span>
            <span className="text-muted text-sm ml-2">{w.definition}</span>
            <p className="text-xs text-muted italic mt-0.5">&ldquo;{w.example}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
