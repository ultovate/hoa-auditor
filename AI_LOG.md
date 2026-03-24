# HOA Auditor — AI Session Log
> Append to this file at the end of every meaningful session.

---

## 2026-03-24 — Sessions (Claude, VS Code)

### Completed
- ✅ Fixed audit stuck in `processing` status — dashboard was overwriting `uploaded` with `processing` after upload; worker never polled for that status
- ✅ Fixed `SyncFilterRequestBuilder` crash in worker.py — `.select()` chained after `.update().in_()` not supported by Supabase Python client; split into update + verify fetch
- ✅ Added "Draft Message" modal to CRITICAL/HIGH risk cards in Risks tab — 3 recipient templates (HOA Board / My Agent / Lender), editable textarea, copy to clipboard, no API calls
- ✅ Added AI Assistant chat bubble concept — floating gradient bubble bottom-right, panel with quick prompt chips, typing animation, placeholder response; concept shell only
- ✅ Built `sample.html` — public sample report page, no login required, masked property details, sample banner with sign-up CTA
- ✅ Created `supabase/sample_audit_setup.sql` — adds `is_sample` column, marks Chiavari audit as sample, creates anon RLS policy
- ✅ Added `sample.html` to Vite build inputs (vite.config.js)
- ✅ Updated ARCHITECTURE.md and AI_LOG.md

### Decisions Made
- Sample report uses `is_sample = true` boolean on existing `audits` table (not a separate table)
- Draft Message uses pure template substitution — no AI API calls for this feature
- AI chat bubble is a concept/demo shell — no backend integration yet
- Property masking for sample report done at display time (not stored)

### Bugs Fixed
- `dashboard.html` was setting `status: 'processing'` after upload — worker only looks for `uploaded`/`pending` so audits never triggered Gemini analysis
- `worker.py` line 430: `.select()` after `.update().in_()` threw `'SyncFilterRequestBuilder' object has no attribute 'select'` — split into two operations
- `sample.html` was importing Supabase from CDN instead of local service — env vars not available outside Vite build

---

## 2026-03-23 — Sessions (Claude, VS Code)

### Completed
- ✅ Implemented report_schema v2.0 — topic-first, unified risk registry, cross-reference rules XR-1 through XR-6
- ✅ Updated worker.py with 11-step fill order Gemini prompt
- ✅ Created migrate_to_v2.py — re-runs Gemini on existing audits using cached extracted_text
- ✅ Migrated all 3 existing audits to v2.0 (no re-OCR)
- ✅ Rewired reportView.js to read v2.0 schema (risks.findings[], financial_outlook, action_items)
- ✅ Rewired summaryView.js to read v2.0 schema
- ✅ Fixed "Overdue" label on Timeline — only shown for unresolved forward-looking events, not Completed/historical
- ✅ Fixed Timeline sort — newest first
- ✅ Fixed label collision: CRITICAL/HIGH "Restrictions Apply" → "Action Required"/"Needs Attention"
- ✅ Fixed financial exposure — replaced AI self-reported total with computed sum of verified line items
- ✅ Added Analysis Completeness legend (FULL/PARTIAL/MINIMAL explanation) inline in card
- ✅ Fixed accidental master merge — saved deployment policy to memory (always deploy to dev only)

### Decisions Made
- risks.findings[] is single source of truth for severity across all sections
- financial_outlook replaces financial_projections — organized by topic
- action_items unified section replaces per-role buyer_summary/agent_summary
- No AI self-reported totals in UI — only verified dollar amounts from structured fields

### Bugs Fixed
- migrate_to_v2.py: worker imported before _load_env() ran → GEMINI_API_KEY was None; fixed by moving env load before all imports
- migrate_to_v2.py: .env uses VITE_ prefixed keys but worker.py expects plain names; fixed with key mapping in _load_env()
- action_items: Gemini returned flat array instead of {items:[]}; fixed with Array.isArray check

---

## 2026-03-12 — Session 1 (Claude, Browser)

### Completed
- ✅ Full UI prototype built (5 screens, interactive HTML)
- ✅ Railway deployment unblocked — Gunicorn live on port 8000
- ✅ Tesseract OCR confirmed installed at `/usr/bin/tesseract`
- ✅ All 5 Railway environment variables set
- ✅ `CONTEXT.md` created as universal AI handoff doc
- ✅ AI context sync system designed

### Decisions Made
- Hardcode PORT=8000 in Railway (don't use $PORT — shell expansion fails on Windows)
- Add ALL Railway variables before deploying (each save = redeploy)

### Blockers Encountered
- `$PORT` shell variable not expanding — cost 4 hours, fixed by hardcoding
- `CONVERTER_API_KEY` missing from Railway variables — caught before next session

---
