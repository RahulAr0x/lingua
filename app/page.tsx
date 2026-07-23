"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine, List, Mic, Globe2, TrendingUp, BookMarked, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total_sessions: number;
  avg_score: number;
  total_words_typed: number;
  word_list_size: number;
  mastered_words: number;
  pending_lessons: number;
  recent_sessions: Array<{ created_at: string; score: number | null; word_count: number }>;
}

const modules = [
  {
    href: "/writing",
    icon: PenLine,
    label: "Writing & Spelling",
    description: "Timed sessions with AI analysis of errors and word choice.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    href: "/grammar",
    icon: List,
    label: "Grammar & Lessons",
    description: "Structured feedback and micro-lessons for your recurring mistakes.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    href: "/pronunciation",
    icon: Mic,
    label: "Pronunciation",
    description: "UK English phonemes from foundational to advanced.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    href: "/varieties",
    icon: Globe2,
    label: "Regional Varieties",
    description: "UK, US, Australian English — formal, everyday, and slang.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Good day</h1>
        <p className="text-muted mt-1">Your English learning dashboard.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={TrendingUp} label="Sessions" value={stats.total_sessions} />
          <StatCard icon={Star} label="Avg Score" value={`${stats.avg_score}/100`} />
          <StatCard icon={BookMarked} label="Error Words" value={stats.word_list_size} />
          <StatCard icon={List} label="Lessons Pending" value={stats.pending_lessons} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map(({ href, icon: Icon, label, description, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="group p-5 rounded-xl border border-border bg-surface hover:border-accent hover:shadow-sm transition-all"
          >
            <div className={cn("inline-flex p-2 rounded-lg mb-3", bg)}>
              <Icon size={20} className={color} />
            </div>
            <h2 className="font-semibold text-ink group-hover:text-accent transition-colors">{label}</h2>
            <p className="text-sm text-muted mt-1">{description}</p>
          </Link>
        ))}
      </div>

      {stats && stats.recent_sessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Recent Sessions</h2>
            <Link
              href="/sessions"
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-medium"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recent_sessions.map((s, i) => (
              <Link
                key={i}
                href="/sessions"
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface border border-border text-sm hover:border-accent/50 hover:bg-elevated transition-colors"
              >
                <span className="text-muted">
                  {new Date(s.created_at).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-muted">{s.word_count} words</span>
                <ScoreBadge score={s.score} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {!stats && (
        <div className="text-center py-12 text-muted text-sm">Loading your progress...</div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted mb-1">
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-faint">—</span>;
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warn" : "text-danger";
  return <span className={cn("font-semibold", color)}>{score}/100</span>;
}
