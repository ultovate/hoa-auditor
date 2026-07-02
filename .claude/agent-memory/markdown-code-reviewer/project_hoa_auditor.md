---
name: project-hoa-auditor
description: HOA Auditor — active beta, Vite+JS frontend on Vercel, Flask+Gemini worker on Railway, Supabase backend
metadata:
  type: project
---

HOA Auditor is an AI-powered HOA document analysis tool for real estate agents, title companies, and condo buyers.

**Why:** B2B focus after competitive research showed surviving players rely on agent/brokerage integrations. WA launch first because SB 5129 compliance makes it a liability tool, not just a convenience tool.

**Stack:** Vite v5 + Tailwind v4 + DaisyUI v5 (vanilla JS, no React/TS), Supabase (auth + DB + storage), Flask + Gunicorn + PyMuPDF + Tesseract on Railway, Gemini 2.5 Flash for analysis.

**Repos:** `ultovate/hoa-auditor` (frontend, dev/master branches) · `ultovate/hoa-pdf-converter` (OCR worker, main branch)

**Schema:** v2.0 — `risks.findings[]` is single source of truth for urgency. 11-step Gemini fill order. XR-1 through XR-6 cross-reference rules.

**Deploy rules:** Only ever ONE Railway project (`hoa-auditor-ocr`). Always `railway link` never `railway init`. PORT hardcoded to 8000.

**How to apply:** Frame all architecture suggestions around this exact stack. Never suggest React, TypeScript, or component libraries.
