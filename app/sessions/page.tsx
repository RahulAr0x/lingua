"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Session, SessionAnalysis } from "@/lib/types";
import { SessionAnalysisView } from "@/app/writing/page";
import { ChevronDown, ChevronUp, Clock, FileText } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sessions?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Session History</h1>
        <p className="text-muted text-sm mt-1">
          All your writing sessions. Click any session to view the full AI analysis.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-16 text-muted">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No sessions yet. Complete a writing session to see it here.</p>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            expanded={expanded === session.id}
            onToggle={() => setExpanded(expanded === session.id ? null : session.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: Session;
  expanded: boolean;
  onToggle: () => void;
}) {
  const date = new Date(session.created_at);
  const score = session.score;
  const scoreColor = score === null ? "text-faint" :
    score >= 80 ? "text-success" : score >= 60 ? "text-warn" : "text-danger";

  return (
    <div className={cn(
      "bg-surface border rounded-xl overflow-hidden transition-colors",
      expanded ? "border-accent" : "border-border"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-elevated transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div>
            <p className="text-sm font-semibold text-ink">
              {date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {session.duration} min
              </span>
              <span>{session.word_count} words</span>
              <span>
                {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {score !== null ? (
            <span className={cn("text-lg font-bold", scoreColor)}>
              {score}<span className="text-xs text-muted font-normal">/100</span>
            </span>
          ) : (
            <span className="text-xs text-faint">No analysis</span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {session.analysis ? (
            <div className="p-4 space-y-4">
              <SessionAnalysisView analysis={session.analysis as SessionAnalysis} />

              {session.content && (
                <div className="bg-elevated rounded-xl p-4 mt-2">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Your writing
                  </p>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap font-mono">
                    {session.content}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted">
              No analysis available for this session.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
