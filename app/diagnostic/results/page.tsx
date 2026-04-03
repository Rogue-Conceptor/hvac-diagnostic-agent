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
  critical: { label: "CRITICAL", border: "#ef4444", text: "#ef4444", desc: "Safety hazard. Address immediately." },
  high:     { label: "HIGH",     border: "#f97316", text: "#f97316", desc: "System is down. Needs repair now." },
  medium:   { label: "MEDIUM",   border: "#eab308", text: "#eab308", desc: "Performance degraded. Should be addressed." },
  low:      { label: "LOW",      border: "#22c55e", text: "#22c55e", desc: "Minor issue. Schedule when convenient." },
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

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    borderRadius: 16,
    padding: 20,
    border: "1px solid",
    marginBottom: 16,
    ...extra,
  });

  return (
    <div
      className="min-h-screen max-w-lg mx-auto"
      style={{ backgroundColor: "#0f1724", color: "#e8e6df", padding: "24px 16px" }}
    >
      {/* ── Title row ── */}
      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#8b9bb4", marginBottom: 16 }}
      >
        HVAC Diagnostic Agent
      </p>

      {/* ── Diagnostic Confidence ── */}
      <div
        style={card({
          backgroundColor: "#1a2332",
          borderColor: "#243044",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
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
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: d <= conf.dots ? conf.color : "#243044",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Potential Failure Points ── */}
      <div style={card({ backgroundColor: "#1a2332", borderColor: "#243044" })}>
        <p style={{ color: "#5d9cf5", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          Potential Failure Points
        </p>
        <ol className="flex flex-col gap-2.5">
          {result.likely_causes.slice(0, 2).map((cause, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 flex items-center justify-center font-bold"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#243044",
                  color: "#5d9cf5",
                  fontSize: 12,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: "#c8c4bb", fontSize: 16, lineHeight: 1.4 }}>
                {cause}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Summary card: headline + what_was_detected + based_on_your_answers + assessment ── */}
      <div style={card({ backgroundColor: "#1a2332", borderColor: "#243044" })}>
        <p style={{ color: "#5d9cf5", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          Summary
        </p>
        <h1 className="text-lg font-bold leading-snug" style={{ color: "#e8e6df", marginBottom: 8 }}>
          {result.headline}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#c8c4bb", marginBottom: 12 }}>
          {result.what_was_detected}
        </p>
        <p className="text-xs" style={{ color: "#8b9bb4", marginBottom: 16 }}>
          {result.system_area}
        </p>

        <div style={{ height: 1, backgroundColor: "#243044", marginBottom: 16 }} />
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#5d9cf5", marginBottom: 8 }}
        >
          Based On Your Answers
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#8b9bb4" }}>
          {result.based_on_your_answers}
        </p>

        <div style={{ height: 1, backgroundColor: "#243044", marginTop: 16, marginBottom: 16 }} />
        <div className="flex items-center gap-3" style={{ marginBottom: result.safety_flags.length > 0 ? 8 : 0, flexWrap: "wrap", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              color: sev.text,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.1em",
              border: `2px solid ${sev.border}`,
              borderRadius: 6,
              padding: "4px 12px",
              flexShrink: 0,
            }}
          >
            {sev.label}
          </span>
          <span style={{ color: sev.text, fontSize: 16, lineHeight: 1.4 }}>
            {sev.desc}
          </span>
        </div>
        {result.safety_flags.length > 0 && (
          <ul className="flex flex-col gap-1">
            {result.safety_flags.map((flag, i) => (
              <li key={i} className="text-xs font-medium leading-snug" style={{ color: "#fca5a5" }}>
                ⚠ {flag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Start new diagnostic ── */}
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

      <div style={{ height: 32 }} />
    </div>
  );
}
