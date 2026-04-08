"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getHistory, deleteDiagnostic, type DiagnosticEntry } from "@/app/lib/history";

// ── Severity config (matches results page) ────────────────────────────────────

const SEVERITY: Record<string, { label: string; border: string; text: string }> = {
  critical: { label: "CRITICAL", border: "#ef4444", text: "#ef4444" },
  high:     { label: "HIGH",     border: "#f97316", text: "#f97316" },
  medium:   { label: "MEDIUM",   border: "#eab308", text: "#eab308" },
  low:      { label: "LOW",      border: "#22c55e", text: "#22c55e" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).replace(",", "").replace(" at", " at"); // normalize output
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiagnosticEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(getHistory());
    setLoaded(true);
  }, []);

  function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this diagnostic session?")) return;
    deleteDiagnostic(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  if (!loaded) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#0f1724" }}
      />
    );
  }

  return (
    <div
      className="min-h-screen max-w-lg mx-auto"
      style={{ backgroundColor: "#0f1724", color: "#e8e6df", padding: "24px 16px" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
        <Link
          href="/"
          className="flex items-center justify-center"
          style={{ color: "#8b9bb4", padding: "4px 0" }}
          aria-label="Back to home"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium" style={{ marginLeft: 4 }}>Back</span>
        </Link>
      </div>

      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#8b9bb4", marginBottom: 8 }}
      >
        HVAC Diagnostic Agent
      </p>
      <h1 className="text-2xl font-bold" style={{ color: "#e8e6df", marginBottom: 24 }}>
        Diagnostic History
      </h1>

      {/* ── Empty state ── */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
          <p className="text-base mb-4" style={{ color: "#8b9bb4" }}>
            No diagnostics yet.
          </p>
          <Link
            href="/diagnostic"
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: "#5d9cf5", color: "#fff" }}
          >
            Start Diagnostic
          </Link>
        </div>
      )}

      {/* ── Entry list ── */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const result = entry.result as Record<string, unknown>;
            const severity = (result?.severity as string) ?? "medium";
            const sev = SEVERITY[severity] ?? SEVERITY.medium;
            const headline = (result?.headline as string) ?? "Unknown issue";
            const complaint = entry.complaintType ?? "unknown";

            return (
              <div
                key={entry.id}
                onClick={() => router.push(`/history/${entry.id}`)}
                className="relative cursor-pointer"
                style={{
                  backgroundColor: "#1a2332",
                  border: "1px solid #243044",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                {/* Trash button */}
                <button
                  onClick={(e) => handleDelete(entry.id, e)}
                  className="absolute top-3 right-3 flex items-center justify-center"
                  style={{ color: "#8b9bb4", padding: 4, background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Delete entry"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 4h12M5.333 4V2.667a.667.667 0 0 1 .667-.667h4a.667.667 0 0 1 .667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 8a.667.667 0 0 0 .667.667h6.667a.667.667 0 0 0 .666-.667L12.667 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Date */}
                <p className="text-xs" style={{ color: "#8b9bb4", marginBottom: 6 }}>
                  {formatDate(entry.timestamp)}
                </p>

                {/* Complaint type */}
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#5d9cf5", marginBottom: 6 }}
                >
                  {complaint.replace(/_/g, " ")}
                </p>

                {/* Headline */}
                <p className="text-sm font-semibold leading-snug" style={{ color: "#e8e6df", marginBottom: 10, paddingRight: 24 }}>
                  {headline}
                </p>

                {/* Severity badge */}
                <span
                  style={{
                    display: "inline-block",
                    color: sev.text,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    border: `1.5px solid ${sev.border}`,
                    borderRadius: 5,
                    padding: "2px 8px",
                  }}
                >
                  {sev.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 32 }} />
    </div>
  );
}
