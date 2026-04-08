"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import intakeConfig from "@/app/data/intake-config.json";

// ── Types ────────────────────────────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SubField {
  step_id: string;
  label: string;
  required: boolean;
  options: Option[];
}

interface TimelineDropdown {
  step_id: string;
  label: string;
  required: boolean;
  options: Option[];
}

interface Step {
  step_id: string;
  title: string;
  type: "single_select" | "multi_select" | "freeflow";
  required: boolean;
  note?: string;
  placeholder?: string;
  max_characters?: number;
  min_selections?: number;
  branches_to?: boolean;
  options?: Option[];
  sub_field?: SubField;
  timeline_dropdown?: TimelineDropdown;
}

type Answers = Record<string, string | string[]>;

// ── Step sequence builder ─────────────────────────────────────────────────────

function buildSteps(complaint: string | undefined): Step[] {
  const before = intakeConfig.universal_steps_before_branch as Step[];
  const after = intakeConfig.universal_steps_after_branch as Step[];
  const branched = complaint
    ? ((intakeConfig.branched_steps as Record<string, Step[]>)[complaint] ?? [])
    : [];
  return [...before, ...branched, ...after];
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DiagnosticPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complaint = answers["complaint"] as string | undefined;
  const steps = buildSteps(complaint);
  const step = steps[stepIndex];
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;

  const currentAnswer = answers[step.step_id];

  function isStepComplete(): boolean {
    // Check main field
    if (step.type === "multi_select") {
      if (step.required) {
        const sel = (currentAnswer as string[] | undefined) ?? [];
        if (sel.length < (step.min_selections ?? 1)) return false;
      }
    } else if (step.type === "single_select") {
      if (step.required && !currentAnswer) return false;
    }
    // freeflow main textarea is never blocking (required: false)

    // Check sub_field (pills under system_type)
    if (step.sub_field?.required && !answers[step.sub_field.step_id]) return false;

    // Check timeline_dropdown inside freeflow step
    if (step.timeline_dropdown?.required && !answers[step.timeline_dropdown.step_id]) return false;

    return true;
  }

  function navigate(dir: "forward" | "back") {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStepIndex((i) => (dir === "forward" ? i + 1 : i - 1));
      setAnimating(false);
    }, 180);
  }

  async function handleNext() {
    if (isLast) {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(answers),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Unexpected error from server.");
        }
        sessionStorage.setItem("hvac_diagnostic_result", JSON.stringify(data));
        sessionStorage.setItem("hvac_diagnostic_answers", JSON.stringify(answers));
        router.push("/diagnostic/results");
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      }
      return;
    }
    navigate("forward");
  }

  function handleBack() {
    if (stepIndex === 0) return;
    navigate("back");
  }

  function handleSingleSelect(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleMultiSelect(value: string) {
    setAnswers((prev) => {
      const existing = (prev[step.step_id] as string[] | undefined) ?? [];
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      return { ...prev, [step.step_id]: updated };
    });
  }

  function handleFreeflow(value: string) {
    setAnswers((prev) => ({ ...prev, [step.step_id]: value }));
  }

  function handleDropdown(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  // Slide animation
  const slideClass = animating
    ? direction === "forward"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#0f1724", color: "#e8e6df" }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        {stepIndex === 0 ? (
          <div className="w-16" />
        ) : (
          <button
            onClick={handleBack}
            className="text-sm font-medium px-3 py-2 rounded-lg transition-opacity"
            style={{ color: "#8b9bb4" }}
          >
            ← Back
          </button>
        )}

        <span className="text-xs font-medium" style={{ color: "#8b9bb4" }}>
          {stepIndex + 1} / {totalSteps}
        </span>

        <button
          onClick={() => {
            sessionStorage.removeItem("hvac_diagnostic_result");
            sessionStorage.removeItem("hvac_diagnostic_answers");
            router.push("/");
          }}
          className="text-sm font-medium px-3 py-2 rounded-lg transition-opacity"
          style={{ color: "#5d9cf5", background: "none" }}
        >
          Exit
        </button>
      </header>

      {/* ── Progress dots ── */}
      <div className="flex justify-center gap-1.5 px-4 py-2 flex-wrap">
        {steps.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === stepIndex ? 20 : 6,
              height: 6,
              backgroundColor:
                i === stepIndex ? "#5d9cf5" : i < stepIndex ? "#3a5a8a" : "#1e2d42",
            }}
          />
        ))}
      </div>

      {/* ── Step content ── */}
      <main
        className={`flex-1 flex flex-col px-4 pt-6 pb-4 max-w-lg mx-auto w-full transition-all ${slideClass}`}
        style={{ transitionDuration: "180ms" }}
      >
        {/* Title */}
        <h2 className="text-xl font-semibold mb-1 leading-snug" style={{ color: "#e8e6df" }}>
          {step.title}
        </h2>

        {/* Note */}
        {step.note ? (
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "#8b9bb4" }}>
            {step.note}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        {/* ── single_select ── */}
        {step.type === "single_select" && step.options && (
          <>
            <div className="flex flex-col gap-2">
              {step.options.map((opt) => {
                const selected = currentAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingleSelect(step.step_id, opt.value)}
                    className="w-full text-left rounded-xl px-4 py-3.5 transition-all duration-150 border"
                    style={{
                      backgroundColor: selected ? "#1e3a5f" : "#1a2332",
                      borderColor: selected ? "#5d9cf5" : "#243044",
                      color: selected ? "#e8e6df" : "#c8c4bb",
                    }}
                  >
                    <span className="block text-sm font-medium">{opt.label}</span>
                    {opt.subtitle && (
                      <span
                        className="block text-xs mt-0.5"
                        style={{ color: selected ? "#a8c4f0" : "#8b9bb4" }}
                      >
                        {opt.subtitle}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Sub-field pill row (e.g. unit_age under system_type) ── */}
            {step.sub_field && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3" style={{ color: "#e8e6df" }}>
                  {step.sub_field.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.sub_field.options.map((opt) => {
                    const selected = answers[step.sub_field!.step_id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSingleSelect(step.sub_field!.step_id, opt.value)}
                        className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border"
                        style={{
                          backgroundColor: selected ? "#1e3a5f" : "#1a2332",
                          borderColor: selected ? "#5d9cf5" : "#243044",
                          color: selected ? "#5d9cf5" : "#8b9bb4",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── multi_select ── */}
        {step.type === "multi_select" && step.options && (
          <>
            <p className="text-xs mb-3" style={{ color: "#8b9bb4" }}>
              Select all that apply
            </p>
            <div className="flex flex-col gap-2">
              {step.options.map((opt) => {
                const selected = ((currentAnswer as string[] | undefined) ?? []).includes(
                  opt.value
                );
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultiSelect(opt.value)}
                    className="w-full text-left rounded-xl px-4 py-3.5 transition-all duration-150 border"
                    style={{
                      backgroundColor: selected ? "#1e3a5f" : "#1a2332",
                      borderColor: selected ? "#5d9cf5" : "#243044",
                      color: selected ? "#e8e6df" : "#c8c4bb",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center border"
                        style={{
                          backgroundColor: selected ? "#5d9cf5" : "transparent",
                          borderColor: selected ? "#5d9cf5" : "#4a5a6e",
                        }}
                      >
                        {selected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4l2.5 2.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="block text-sm font-medium">{opt.label}</span>
                        {opt.subtitle && (
                          <span
                            className="block text-xs mt-0.5"
                            style={{ color: selected ? "#a8c4f0" : "#8b9bb4" }}
                          >
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── freeflow (with optional timeline_dropdown above) ── */}
        {step.type === "freeflow" && (
          <>
            {step.timeline_dropdown && (
              <div className="mb-5">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#e8e6df" }}
                >
                  {step.timeline_dropdown.label}
                  <span className="ml-1 text-xs" style={{ color: "#8b9bb4" }}>
                    (required)
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-xl px-4 py-3 text-sm appearance-none outline-none border focus:border-[#5d9cf5] transition-colors pr-10"
                    style={{
                      backgroundColor: "#1a2332",
                      borderColor: answers[step.timeline_dropdown.step_id]
                        ? "#5d9cf5"
                        : "#243044",
                      color: answers[step.timeline_dropdown.step_id] ? "#e8e6df" : "#8b9bb4",
                    }}
                    value={(answers[step.timeline_dropdown.step_id] as string) ?? ""}
                    onChange={(e) =>
                      handleDropdown(step.timeline_dropdown!.step_id, e.target.value)
                    }
                  >
                    <option value="" disabled style={{ color: "#8b9bb4" }}>
                      Select one…
                    </option>
                    {step.timeline_dropdown.options.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        style={{ backgroundColor: "#1a2332", color: "#e8e6df" }}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {/* chevron icon */}
                  <div
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#8b9bb4" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 5l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <textarea
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none border focus:border-[#5d9cf5] transition-colors"
              style={{
                backgroundColor: "#1a2332",
                borderColor: "#243044",
                color: "#e8e6df",
                minHeight: 140,
              }}
              placeholder={step.placeholder ?? ""}
              maxLength={step.max_characters}
              value={(currentAnswer as string | undefined) ?? ""}
              onChange={(e) => handleFreeflow(e.target.value)}
            />
            {step.max_characters && (
              <p className="text-right text-xs mt-1" style={{ color: "#8b9bb4" }}>
                {((currentAnswer as string | undefined) ?? "").length} / {step.max_characters}
              </p>
            )}
          </>
        )}
      </main>

      {/* ── Footer nav ── */}
      <footer
        className="px-4 pb-8 pt-4 max-w-lg mx-auto w-full"
        style={{ borderTop: "1px solid #1e2d42" }}
      >
        {error && (
          <p className="text-xs text-center mb-3 px-2" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        <button
          onClick={handleNext}
          disabled={!isStepComplete() || loading}
          className="w-full py-4 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-30"
          style={{
            backgroundColor: isLast ? "#2a7a2a" : "#5d9cf5",
            color: "#fff",
          }}
        >
          {isLast ? "Run Diagnostic" : "Next →"}
        </button>
      </footer>

      {/* ── Loading overlay ── */}
      {loading && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{ backgroundColor: "#0f1724" }}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Pulsing rings */}
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: "#5d9cf520" }}
              />
              <div
                className="absolute inset-2 rounded-full animate-ping"
                style={{ backgroundColor: "#5d9cf530", animationDelay: "0.3s" }}
              />
              <div
                className="absolute inset-4 rounded-full"
                style={{ backgroundColor: "#5d9cf5" }}
              />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "#e8e6df" }}>
                Analyzing your inputs…
              </p>
              <p className="text-sm mt-1" style={{ color: "#8b9bb4" }}>
                Running diagnostic against service data
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
