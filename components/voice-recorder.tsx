"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, RefreshCw } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import type { ReadingComparison } from "@/lib/ai";

type State = "idle" | "requesting" | "recording" | "processing" | "done" | "error";

interface Result {
  transcript: string;
  comparison: ReadingComparison;
}

export default function VoiceRecorder({ passage }: { passage: string }) {
  const [state, setState] = useState<State>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processAudio = useCallback(async () => {
    const mimeType = recorderRef.current?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("passage", passage);

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Transcription failed");
      }
      const data: Result = await res.json();
      setResult(data);
      setState("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Transcription failed. Try again.");
      setState("error");
    }
  }, [passage]);

  const startRecording = async () => {
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        processAudio();
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      setElapsed(0);
      setState("recording");
      timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } catch {
      setErrorMsg("Microphone access denied. Allow microphone in your browser settings.");
      setState("error");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setState("processing");
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setElapsed(0);
    setErrorMsg("");
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-elevated flex items-center gap-2">
        <Mic size={14} className="text-muted" />
        <span className="text-sm font-semibold text-ink">Practise reading aloud</span>
        <span className="text-xs text-muted">— Record yourself, then get accuracy feedback</span>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Controls */}
        {(state === "idle" || state === "requesting") && (
          <button
            onClick={startRecording}
            disabled={state === "requesting"}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Mic size={14} />
            {state === "requesting" ? "Waiting for microphone..." : "Start Recording"}
          </button>
        )}

        {state === "recording" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
              <span className="font-mono text-sm text-ink tabular-nums">
                {formatDuration(elapsed)}
              </span>
              <span className="text-xs text-muted">recording</span>
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors"
            >
              <Square size={12} fill="currentColor" />
              Stop
            </button>
          </div>
        )}

        {state === "processing" && (
          <div className="flex items-center gap-2.5 text-muted text-sm py-1">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
            Transcribing and comparing...
          </div>
        )}

        {state === "error" && (
          <div className="flex items-start gap-2 text-sm text-danger bg-danger-light px-3 py-2.5 rounded-lg">
            <span className="flex-1">{errorMsg}</span>
            <button onClick={reset} className="shrink-0 underline hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {state === "done" && result && (
          <div className="space-y-4">
            {/* Score row */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted mb-0.5">Accuracy</p>
                <span className={cn(
                  "text-3xl font-bold",
                  result.comparison.accuracy_pct >= 85 ? "text-success" :
                  result.comparison.accuracy_pct >= 70 ? "text-warn" : "text-danger"
                )}>
                  {result.comparison.accuracy_pct}%
                </span>
              </div>
              <button
                onClick={reset}
                className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
              >
                <RefreshCw size={12} />
                Record again
              </button>
            </div>

            {/* Feedback */}
            <p className="text-sm text-muted leading-relaxed">
              {result.comparison.fluency_feedback}
            </p>

            {/* Missed words */}
            {result.comparison.missed_words.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                  Words skipped
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.comparison.missed_words.map((w, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-danger-light text-danger text-xs font-mono rounded"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Substitutions */}
            {result.comparison.substituted.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                  Substitutions
                </p>
                <div className="space-y-1.5">
                  {result.comparison.substituted.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-danger line-through">{s.meant}</span>
                      <span className="text-faint">→</span>
                      <span className="font-mono text-warn">{s.said}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full transcript (collapsed) */}
            <details>
              <summary className="text-xs text-muted cursor-pointer hover:text-ink select-none list-none flex items-center gap-1">
                <span>▸</span> Show full transcript
              </summary>
              <p className="mt-2 text-sm text-muted font-mono leading-relaxed bg-elevated rounded-lg p-3 whitespace-pre-wrap">
                {result.transcript}
              </p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
