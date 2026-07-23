"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { WordEntry } from "@/lib/types";
import { BookMarked, CheckCircle, Circle, Search } from "lucide-react";

export default function WordsPage() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "mastered">("active");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/words");
    const data = await res.json();
    setWords(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleMastered = async (word: WordEntry) => {
    await fetch("/api/words", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: word.id, mastered: !word.mastered }),
    });
    setWords((ws) =>
      ws.map((w) => (w.id === word.id ? { ...w, mastered: !w.mastered } : w))
    );
  };

  const filtered = words.filter((w) => {
    const matchFilter =
      filter === "all" || (filter === "active" ? !w.mastered : w.mastered);
    const matchSearch = !search || w.word.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount = words.filter((w) => !w.mastered).length;
  const masteredCount = words.filter((w) => w.mastered).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Personal Word List</h1>
        <p className="text-muted text-sm mt-1">
          Words you&apos;ve misspelled across writing sessions, ranked by frequency.
          Mark words as mastered once you&apos;re confident.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "mastered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                filter === f
                  ? "bg-accent text-white"
                  : "bg-elevated text-muted hover:text-ink"
              )}
            >
              {f}{" "}
              {f === "active" ? `(${activeCount})` : f === "mastered" ? `(${masteredCount})` : `(${words.length})`}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted">
          <BookMarked size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {words.length === 0
              ? "No words yet. Complete a writing session to populate your list."
              : "No words match your filter."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((word) => (
          <div
            key={word.id}
            className={cn(
              "flex items-center justify-between gap-4 px-4 py-3 bg-surface border rounded-lg transition-colors",
              word.mastered ? "border-success/30 opacity-60" : "border-border"
            )}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleMastered(word)}
                className="shrink-0"
                title={word.mastered ? "Mark as not mastered" : "Mark as mastered"}
              >
                {word.mastered ? (
                  <CheckCircle size={18} className="text-success" />
                ) : (
                  <Circle size={18} className="text-faint hover:text-muted" />
                )}
              </button>
              <div>
                <span className="font-mono font-semibold text-ink">{word.word}</span>
                {word.notes && (
                  <p className="text-xs text-muted">{word.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted shrink-0">
              <span className={cn(
                "px-2 py-0.5 rounded-full font-medium",
                word.error_count >= 5
                  ? "bg-danger-light text-danger"
                  : word.error_count >= 3
                  ? "bg-warn-light text-warn"
                  : "bg-elevated"
              )}>
                {word.error_count}×
              </span>
              <span>
                {new Date(word.last_seen).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
