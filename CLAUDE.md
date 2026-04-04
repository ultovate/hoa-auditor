# HOA Auditor

HOA Auditor is an AI-powered tool that analyzes HOA documents for condo buyers and real estate agents, delivering plain-English risk assessments. B2B target — real estate agents and title companies.

---

## Stack

```
Vanilla JavaScript — NO React, NO TypeScript, NO JSX
Vite v5 (bundler only — no framework)
Tailwind CSS v4
DaisyUI v5
Supabase JS client (@supabase/supabase-js)
JSZip
```

- NO `<Component />` syntax — everything is plain HTML elements
- NO `import React from 'react'`
- NO shadcn, NO Radix, NO CVA, NO Lucide, NO Sonner
- NO TypeScript types or interfaces
- HTML files with `<script type="module">` tags
- CSS classes are Tailwind utilities + DaisyUI component classes

**Git workflow:** Always `git pull origin dev --rebase` before pushing.
A GitHub Action auto-commits to `dev` — the branch may already be ahead.

---

## Architecture

Async two-stage pipeline:
1. Per-file OCR → PyMuPDF + Tesseract, file hash cached in `analysis_cache`
2. Combined text → PII redaction → Gemini structured analysis

**Supabase tables:** `audits`, `jobs`, `analysis_cache`

**Gemini output schema fields:** `overall_verdict`, `buyer_summary`, `agent_summary`,
`restrictions`, `risk_findings`, `buyer_profile_verdicts`, `missing_documents`, `document_inventory`

**WA compliance:** `wa_checklist.json` injected into Gemini prompt when state = WA
(26-item WUCIOA checklist, RCW 64.90.640, effective Jan 1 2026 via SB 5129)

**OCR service:** Flask + Gunicorn + PyMuPDF + Tesseract on Railway
**Repo:** `ultovate/hoa-auditor` (frontend) · `ultovate/hoa-pdf-converter` (OCR service)

---

## Key Decisions (don't re-litigate)

- **B2B only** — consumer subscription ruled out (homebuying frequency too low)
- **Primary target:** Title companies (transaction-mandatory HOA doc review)
- **Secondary target:** Individual agents at $49/mo
- **WA launch first** — SB 5129 compliance = liability tool, not convenience tool
- **Document completeness = information completeness** — 26 WUCIOA items, not filenames
- **Async worker** (30s polling on `jobs` table) — sync OCR timed out on large PDFs
- **File hash caching** — consistent Gemini results across identical documents
- **Railway:** hardcode port 8000, not `$PORT`

---

## Working Style

- Make one change at a time and confirm it works before the next
- Show only the changed lines with clear context when suggesting edits
- Never rename or remove existing HTML element IDs
- Prefer methodical over fast

---

## Agents — invoke these for UI work

- `@ux-persona` — before building any screen, defines how each persona experiences it
- `@ui-builder` — to build or rebuild a UI section
- `@ux-reviewer` — to diagnose visual problems or audit a screenshot
