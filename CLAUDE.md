# HOA Auditor

HOA Auditor is an AI-powered tool that analyzes HOA documents for condo buyers and real estate agents, delivering plain-English risk assessments. B2B target — real estate agents and title companies.

---

## Stack

```
React 18 + TypeScript (migrated from vanilla JS — decided 2026-07-02)
Vite v5
Tailwind CSS v4
DaisyUI v5
Supabase JS client (@supabase/supabase-js)
JSZip
lucide-react (icons)
```

- Component tree lives under `src/` (`App.tsx`, `src/components/`, `src/hooks/`, `src/domain.ts`)
- Functional components + hooks — no class components
- TypeScript types/interfaces required for props and domain models (see `src/domain.ts`)
- Legacy `.html` entry points (`dashboard.html`, `summary.html`, `report.html`, etc.) are being migrated incrementally — do not assume the whole app is ported yet; check whether a page has a `src/` equivalent before editing the old HTML/JS version
- CSS classes are Tailwind utilities + DaisyUI component classes

**Git workflow:** Always `git pull origin dev --rebase` before pushing.
A GitHub Action auto-commits to `dev` — the branch may already be ahead.

---

## Architecture

Async two-stage pipeline:
1. Per-file OCR → PyMuPDF + Tesseract, file hash cached in `analysis_cache`
2. Combined text → PII redaction → Gemini structured analysis

### Backend data ingestion contract (4 steps)

1. **Client validation & extraction** — frontend accepts `.pdf`/`.zip` only; ZIPs are unpacked client-side via JSZip, filtering macOS junk files (`._*`)
2. **Audit ID & dedupe** — `auditId` pattern is `audit_{timestamp}_{random}`; existing files are deduped per-audit via `checkFileExists()` (filename match, not content hash)
3. **Storage upload** — each file is uploaded to Supabase Storage bucket `hoa_documents` at path `${userId}/${auditId}/original/${file.name}`; no hash is computed client-side
4. **Row creation** — an `audits` row is created/updated with `status: 'uploaded'`, then one `jobs` row per file with `status: 'pending'`, `retry_count: 0`, which the Railway worker polls to begin OCR

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
- **React + TypeScript over vanilla JS MPA** (2026-07-02) — supersedes the prior "Vite MPA over React" decision; migration is incremental, legacy `.html` pages coexist with `src/` React components until fully ported
- **Dynamic condo imagery** — `PropertyHero.tsx` accepts an optional `coverImage` prop (default `/public/condos/placeholder.jpg`) so MLS-sourced property photos can be wired in later without a rewrite; contrast is preserved via `mix-blend-overlay` + dark gradient overlay

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
