# HVAC Diagnostic Agent

AI-powered diagnostic tool for HVAC field technicians. Tap through structured intake questions, get a plain-English diagnosis with top failure points.

---

## Live Demo

[hvac-diagnostic-agent.vercel.app](https://hvac-diagnostic-agent.vercel.app)

> A demo access code is required to enter the app.

---

## What It Does

A technician opens the app on their phone or tablet at a job site. They select the primary complaint (no cooling, no heat, short cycling, etc.), then answer a short series of branched follow-up questions based on what they observe — sounds, pressures, airflow, recent history. The AI analyzes the full symptom combination and returns a structured diagnosis: a plain-English explanation of the likely cause, a confidence level, the top two failure points to inspect first, a severity rating, and any safety flags the tech should know before touching the equipment.

---

## Tech Stack

- **Next.js 14** — App Router, server components, API routes
- **TypeScript** — end-to-end type safety
- **Tailwind CSS** — utility-first styling
- **Claude API (Anthropic)** — symptom analysis and diagnosis generation
- **Vercel** — deployment and edge hosting

---

## Key Design Decisions

- **Web app, not native** — zero install friction; works on any device a tech already has in their pocket
- **Structured intake, not freeform chat** — guided questions surface the right details faster than asking techs to describe problems from scratch
- **HVAC techs are the user, not homeowners** — language, options, and output are calibrated for someone who already knows what a TXV is
- **Diagnosis only, no repair recommendations** — step-by-step repair guidance is Phase 2; Phase 1 proves the diagnostic value
- **No fault codes** — there is no universal fault code standard across HVAC manufacturers, so the intake is symptom-based
- **Max 6 options per screen** — keeps the interface scannable on a phone in a mechanical room

---

## Features

- 6-branch diagnostic intake covering the most common HVAC complaint categories
- AI-powered diagnosis with confidence level, failure points, severity rating, and safety flags
- Diagnostic history stored locally — review past jobs without re-entering data
- Shareable diagnostic reports with one-tap PDF download
- Email report summary directly from the results screen
- Demo access gate to control who can evaluate the tool

---

## Built By

**Jerry King III** — [jerrster.com](https://jerrster.com)
