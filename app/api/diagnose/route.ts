import { NextRequest, NextResponse } from "next/server";
import intakeConfig from "@/app/data/intake-config.json";

// ── Label resolution ──────────────────────────────────────────────────────────
// Builds a flat map of step_id -> { title, options: { value -> label } }
// covering every possible step across all branches, sub_fields, and dropdowns.

type OptionMap = Record<string, string>;
type StepMeta = { title: string; options: OptionMap };
type LabelMap = Record<string, StepMeta>;

function buildLabelMap(): LabelMap {
  const map: LabelMap = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addStep(step: any) {
    const opts: OptionMap = {};
    if (step.options) {
      for (const o of step.options) opts[o.value] = o.label;
    }
    map[step.step_id] = { title: step.title ?? step.label ?? step.step_id, options: opts };

    if (step.sub_field) {
      const subOpts: OptionMap = {};
      for (const o of step.sub_field.options) subOpts[o.value] = o.label;
      map[step.sub_field.step_id] = { title: step.sub_field.label, options: subOpts };
    }

    if (step.timeline_dropdown) {
      const tdOpts: OptionMap = {};
      for (const o of step.timeline_dropdown.options) tdOpts[o.value] = o.label;
      map[step.timeline_dropdown.step_id] = { title: step.timeline_dropdown.label, options: tdOpts };
    }
  }

  for (const step of intakeConfig.universal_steps_before_branch) addStep(step);
  for (const branch of Object.values(intakeConfig.branched_steps)) {
    for (const step of branch) addStep(step);
  }
  for (const step of intakeConfig.universal_steps_after_branch) addStep(step);

  return map;
}

// ── Answer formatter ──────────────────────────────────────────────────────────
// Produces a human-readable block of "Field: Value" lines for the AI.

function formatAnswers(
  answers: Record<string, string | string[]>,
  labelMap: LabelMap
): string {
  const lines: string[] = [];

  for (const [stepId, value] of Object.entries(answers)) {
    const meta = labelMap[stepId];
    if (!meta) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      const labels = value.map((v) => meta.options[v] ?? v);
      lines.push(`${meta.title}: ${labels.join(", ")}`);
    } else if (typeof value === "string" && value.trim()) {
      // freeflow — no option map, use raw text
      const label = meta.options[value] ?? value;
      lines.push(`${meta.title}: ${label}`);
    }
  }

  return lines.join("\n");
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let answers: Record<string, string | string[]>;
  try {
    answers = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const labelMap = buildLabelMap();
  const formattedAnswers = formatAnswers(answers, labelMap);

  const systemPrompt = intakeConfig.prompt_assembly.system_prompt;

  const userMessage =
    `Diagnose this HVAC issue based on the following technician inputs:\n\n` +
    formattedAnswers +
    `\n\nReturn ONLY valid JSON matching this exact structure (no markdown, no commentary):\n` +
    `{"headline":"...","severity":"low|medium|high|critical","system_area":"...","what_was_detected":"...","likely_causes":["...","..."],"based_on_your_answers":"...","safety_flags":[],"confidence":"low|medium|high"}\n\n` +
    `Return exactly 2 likely_causes, ranked by probability. No more than 2.`;

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    console.error("Anthropic fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to reach Anthropic API. Check network connectivity." },
      { status: 502 }
    );
  }

  if (!anthropicResponse.ok) {
    const errorBody = await anthropicResponse.text();
    console.error("Anthropic API error:", anthropicResponse.status, errorBody);
    return NextResponse.json(
      { error: `Anthropic API returned ${anthropicResponse.status}.` },
      { status: 502 }
    );
  }

  const anthropicData = await anthropicResponse.json();
  const rawText: string = anthropicData?.content?.[0]?.text ?? "";

  // Strip markdown fences in case Claude wraps the JSON despite instructions
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let result: unknown;
  try {
    result = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Claude response as JSON:", rawText);
    return NextResponse.json(
      { error: "AI returned an unparseable response. Try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
