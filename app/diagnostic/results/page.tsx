"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DiagnosticResult {
  headline: string;
  severity: "low" | "medium" | "high" | "critical";
  system_area: string;
  what_was_detected: string;
  likely_causes: string[];
  based_on_your_answers: string;
  safety_flags: string[];
  confidence: "low" | "medium" | "high";
}

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY = {
  critical: { label: "CRITICAL", bg: "#3b0f0f", border: "#ef4444", text: "#ef4444" },
  high:     { label: "HIGH",     bg: "#2d1a0a", border: "#f97316", text: "#f97316" },
  medium:   { label: "MEDIUM",   bg: "#2d2508", border: "#eab308", text: "#eab308" },
  low:      { label: "LOW",      bg: "#0d2318", border: "#22c55e", text: "#22c55e" },
};

const CONFIDENCE = {
  high:   { label: "High",   color: "#22c55e", dots: 3 },
  medium: { label: "Medium", color: "#eab308", dots: 2 },
  low:    { label: "Low",    color: "#f97316", dots: 1 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("hvac_diagnostic_result");
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      setResult(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  // ── No result state ──
  if (missing) {
    return (
      <div
        className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: "#0f1724", color: "#e8e6df" }}
      >
        <p className="text-base mb-4" style={{ color: "#8b9bb4" }}>
          No diagnostic result found.
        </p>
        <Link
          href="/diagnostic"
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#5d9cf5", color: "#fff" }}
        >
          Start Diagnostic
        </Link>
      </div>
    );
  }

  // ── Loading state (before sessionStorage read) ──
  if (!result) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#0f1724" }}
      />
    );
  }

  const sev = SEVERITY[result.severity] ?? SEVERITY.medium;
  const conf = CONFIDENCE[result.confidence] ?? CONFIDENCE.medium;

  return (
    <div
      className="min-h-screen px-4 py-6 max-w-lg mx-auto"
      style={{ backgroundColor: "#0f1724", color: "#e8e6df" }}
    >
      {/* ── App label ── */}
      <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#8b9bb4" }}>
        HVAC Diagnostic Agent
      </p>

      {/* ── Headline card ── */}
      <div
        className="rounded-2xl p-5 mb-4 border"
        style={{ backgroundColor: sev.bg, borderColor: sev.border }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full border"
            style={{ color: sev.text, borderColor: sev.border, backgroundColor: "#00000030" }}
          >
            {sev.label}
          </span>
        </div>
        <h1 className="text-lg font-bold leading-snug mb-1" style={{ color: "#e8e6df" }}>
          {result.headline}
        </h1>
        <p className="text-xs" style={{ color: "#8b9bb4" }}>
          {result.system_area}
        </p>
      </div>

      {/* ── Safety flags ── */}
      {result.safety_flags.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-4 border"
          style={{ backgroundColor: "#2d0a0a", borderColor: "#ef4444" }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#ef4444" }}>
            ⚠ Safety Warning
          </p>
          <ul className="flex flex-col gap-1.5">
            {result.safety_flags.map((flag, i) => (
              <li key={i} className="text-sm leading-snug" style={{ color: "#fca5a5" }}>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── What was detected ── */}
      <div
        className="rounded-2xl p-5 mb-4 border"
        style={{ backgroundColor: "#1a2332", borderColor: "#243044" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#5d9cf5" }}>
          What Was Detected
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#c8c4bb" }}>
          {result.what_was_detected}
        </p>
      </div>

      {/* ── Likely causes ── */}
      <div
        className="rounded-2xl p-5 mb-4 border"
        style={{ backgroundColor: "#1a2332", borderColor: "#243044" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#5d9cf5" }}>
          Likely Causes
        </p>
        <ol className="flex flex-col gap-2.5">
          {result.likely_causes.map((cause, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{ backgroundColor: "#243044", color: "#5d9cf5" }}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-snug" style={{ color: "#c8c4bb" }}>
                {cause}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Based on your answers ── */}
      <div
        className="rounded-2xl p-5 mb-4 border"
        style={{ backgroundColor: "#1a2332", borderColor: "#243044" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#5d9cf5" }}>
          Based On Your Answers
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#8b9bb4" }}>
          {result.based_on_your_answers}
        </p>
      </div>

      {/* ── Confidence ── */}
      <div
        className="rounded-2xl px-5 py-4 mb-8 border flex items-center justify-between"
        style={{ backgroundColor: "#1a2332", borderColor: "#243044" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8b9bb4" }}>
          Diagnostic Confidence
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: conf.color }}>
            {conf.label}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((d) => (
              <div
                key={d}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: d <= conf.dots ? conf.color : "#243044",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── New diagnostic button ── */}
      <Link
        href="/diagnostic"
        className="block w-full py-4 rounded-xl font-semibold text-sm text-center transition-opacity hover:opacity-90 active:opacity-80"
        style={{ backgroundColor: "#5d9cf5", color: "#fff" }}
      >
        Start New Diagnostic
      </Link>

      <div className="h-8" />
    </div>
  );
}
