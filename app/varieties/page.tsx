"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Globe2, RefreshCw } from "lucide-react";

type Variety = "uk" | "us" | "au" | "general";
type Category = "formal" | "everyday" | "slang";

interface VarietyItem {
  word: string;
  definition: string;
  example: string;
  register_note: string;
  equivalents?: Record<string, string>;
}

const VARIETIES: Array<{ value: Variety; label: string; flag: string }> = [
  { value: "uk", label: "British English", flag: "🇬🇧" },
  { value: "us", label: "American English", flag: "🇺🇸" },
  { value: "au", label: "Australian English", flag: "🇦🇺" },
  { value: "general", label: "General English", flag: "🌐" },
];

const CATEGORIES: Array<{ value: Category; label: string; note: string }> = [
  { value: "formal", label: "Formal", note: "Professional & academic" },
  { value: "everyday", label: "Everyday", note: "Common daily use" },
  { value: "slang", label: "Slang", note: "Informal & colloquial" },
];

export default function VarietiesPage() {
  const [variety, setVariety] = useState<Variety>("uk");
  const [category, setCategory] = useState<Category>("everyday");
  const [items, setItems] = useState<VarietyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems([]);
    const res = await fetch(`/api/varieties?variety=${variety}&category=${category}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [variety, category]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Regional English Varieties</h1>
        <p className="text-muted text-sm mt-1">
          Explore vocabulary across UK, US, and Australian English. Compare the same concept across registers.
        </p>
      </div>

      {/* Variety selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VARIETIES.map(({ value, label, flag }) => (
          <button
            key={value}
            onClick={() => setVariety(value)}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-xl border text-sm transition-colors",
              variety === value
                ? "border-accent bg-accent-light text-accent font-semibold"
                : "border-border bg-surface text-muted hover:border-accent/50 hover:text-ink"
            )}
          >
            <span className="text-xl mb-1">{flag}</span>
            <span className="text-xs text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* Category selector */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(({ value, label, note }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm transition-colors",
              category === value
                ? "border-accent bg-accent text-white"
                : "border-border text-muted hover:border-accent/50 hover:text-ink"
            )}
          >
            <span className="font-medium">{label}</span>
            <span className="hidden sm:inline text-xs opacity-70 ml-1">— {note}</span>
          </button>
        ))}
      </div>

      {/* Refresh */}
      <button
        onClick={load}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
      >
        <RefreshCw size={12} className={cn(loading && "animate-spin")} />
        Load new examples
      </button>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-muted text-sm">
          <Globe2 size={32} className="mx-auto mb-3 opacity-30" />
          No items loaded yet.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <VarietyCard key={i} item={item} currentVariety={variety} />
        ))}
      </div>
    </div>
  );
}

function VarietyCard({
  item,
  currentVariety,
}: {
  item: VarietyItem;
  currentVariety: Variety;
}) {
  const otherVarieties = Object.entries(item.equivalents ?? {}).filter(
    ([k]) => k !== currentVariety
  );

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-ink font-mono">{item.word}</span>
          <span className="text-muted text-sm">{item.definition}</span>
        </div>
        <p className="text-sm text-muted italic mt-1">&ldquo;{item.example}&rdquo;</p>
      </div>

      {item.register_note && (
        <p className="text-xs text-muted bg-elevated rounded-md px-2.5 py-1.5 inline-block">
          {item.register_note}
        </p>
      )}

      {otherVarieties.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted mb-2 font-medium">Equivalents in other varieties</p>
          <div className="flex flex-wrap gap-2">
            {otherVarieties.map(([variety, equiv]) => {
              const flag = { uk: "🇬🇧", us: "🇺🇸", au: "🇦🇺", general: "🌐" }[variety] ?? "";
              return (
                <div
                  key={variety}
                  className="flex items-center gap-1.5 bg-elevated rounded-md px-2.5 py-1 text-xs"
                >
                  <span>{flag}</span>
                  <span className="font-mono font-medium text-ink">{equiv}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
