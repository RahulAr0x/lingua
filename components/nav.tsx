"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, PenLine, Mic, Globe2, List, BookMarked, History, BookText } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: BookOpen },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/reading", label: "Reading", icon: BookText },
  { href: "/sessions", label: "History", icon: History },
  { href: "/grammar", label: "Grammar", icon: List },
  { href: "/words", label: "Words", icon: BookMarked },
  { href: "/pronunciation", label: "Pronunciation", icon: Mic },
  { href: "/varieties", label: "Varieties", icon: Globe2 },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-semibold text-accent mr-4 text-lg tracking-tight">
          Lingua
        </span>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink hover:bg-elevated"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
