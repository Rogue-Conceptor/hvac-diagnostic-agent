"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, type DiagnosticEntry } from "@/app/lib/history";
import { DiagnosticResultCard, type DiagnosticResult } from "@/app/components/DiagnosticResultCard";

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [entry, setEntry] = useState<DiagnosticEntry | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const numericId = Number(id);
    const found = getHistory().find((e) => e.id === numericId) ?? null;
    if (!found) {
      setMissing(true);
    } else {
      setEntry(found);
    }
  }, [id]);

  if (missing) {
    return (
      <div
        className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: "#0f1724", color: "#e8e6df" }}
      >
        <p className="text-base mb-4" style={{ color: "#8b9bb4" }}>
          Diagnostic not found.
        </p>
        <Link
          href="/history"
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#5d9cf5", color: "#fff" }}
        >
          Back to History
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#0f1724" }}
      />
    );
  }

  const result = entry.result as DiagnosticResult;

  return (
    <div
      className="min-h-screen max-w-lg mx-auto"
      style={{ backgroundColor: "#0f1724", color: "#e8e6df", padding: "24px 16px" }}
    >
      {/* ── Back link ── */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <Link
          href="/history"
          className="flex items-center"
          style={{ color: "#8b9bb4" }}
          aria-label="Back to history"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium" style={{ marginLeft: 4 }}>Back</span>
        </Link>
      </div>

      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#8b9bb4", marginBottom: 16 }}
      >
        HVAC Diagnostic Agent
      </p>

      <DiagnosticResultCard result={result} />

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/report/${entry.id}`}
          className="block w-full font-semibold text-sm text-center transition-opacity hover:opacity-90 active:opacity-80"
          style={{
            border: "1.5px solid #5d9cf5",
            color: "#5d9cf5",
            backgroundColor: "transparent",
            borderRadius: 12,
            padding: "16px 0",
          }}
        >
          Share Report
        </Link>
        <Link
          href="/history"
          className="block w-full font-semibold text-sm text-center transition-opacity hover:opacity-90 active:opacity-80"
          style={{
            border: "1.5px solid #5d9cf5",
            color: "#5d9cf5",
            backgroundColor: "transparent",
            borderRadius: 12,
            padding: "16px 0",
          }}
        >
          Back to History
        </Link>
        <Link
          href="/diagnostic"
          className="block w-full font-semibold text-sm text-center transition-opacity hover:opacity-90 active:opacity-80"
          style={{
            backgroundColor: "#5d9cf5",
            color: "#fff",
            borderRadius: 12,
            padding: "16px 0",
          }}
        >
          Start New Diagnostic
        </Link>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}
