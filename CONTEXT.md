# HOA Auditor — Project Context
> Paste this into any AI session to resume without losing context.
> Keep this file updated as the project evolves.


---

## What This Product Does
HOA Auditor analyzes HOA document packages (CC&Rs, Bylaws, Resale Certificates, Reserve Studies, Meeting Minutes) uploaded as PDFs. It returns a structured risk analysis — restrictions, financial outlook, timeline, compliance — presented in a tabbed report. Target users: real estate agents and buyers in the US (WA state supported).

---

## Current State (as of March 24, 2026)
- **Beta** — live at hoa-auditor.vercel.app (dev branch)
- 4 audits in database (3 migrated to v2.0 schema; 1 new upload pipeline tested)
- Chiavari Owners Association marked as `is_sample = true` → public sample report at `/sample.html`
- Worker running on Railway, polling every 30s
- report_schema v2.0 fully deployed (risks.findings[] as single source of truth)

---

## Key Files to Know
| File | Purpose |
|------|---------|
| `hoa-pdf-converter/worker.py` | Railway worker — OCR, caching, Gemini analysis |
| `hoa-pdf-converter/schemas/report_schema.json` | v2.0 schema injected into Gemini prompt |
| `src/views/reportView.js` | Full report renderer — all tabs, draft message modal, AI bubble |
| `src/views/summaryView.js` | Summary card renderer |
| `dashboard.html` | Upload UI + audit management |
| `sample.html` | Public sample report (no auth) |
| `supabase/sample_audit_setup.sql` | Run once in Supabase SQL Editor to set up sample audit |
| `ARCHITECTURE.md` | Full architecture, schema, decisions log |
| `AI_LOG.md` | Session-by-session history of what was built |

---

## Deployment Rules
- **Always push to `dev` branch** — never merge to `master` without explicit instruction
- `master` = production (not ready to launch yet)
- Railway backend deploys from `hoa-pdf-converter` repo `main` branch automatically

---

## Active Audit Status Flow
```
uploaded → analyzing → complete
                    ↘ failed
```
`processing` is NOT a valid status — it was a bug (fixed March 2026).

---

## Report Schema v2.0 — Key Concepts
- `risks.findings[]` — written first, single source of truth for urgency
- `risk_id` format: `CATEGORY_01` (e.g. `RESERVE_FUNDING_01`)
- All other sections reference risks by `risk_id` pointer
- `financial_outlook` has 6 sub-sections: monthly_fees, reserve_fund, special_assessments, deferred_maintenance, insurance, litigation_costs
- `action_items[]` tagged with `roles[]` (buyer/agent/lender/all) and `priority`
- No AI self-reported aggregate totals — UI computes from verified line items

---

## UI Features Summary
- **Risks tab:** Draft Message button (CRITICAL/HIGH only) → modal with 3 recipient templates (no AI)
- **AI bubble:** Floating chat concept shell — typing animation, placeholder response, no backend
- **Sample report:** `/sample.html` — public, masked property details, sign-up CTA banner
- **Timeline:** Newest-first, "Overdue" only for unresolved forward-looking events
- **Financial Outlook:** Verified amounts only, no AI total

---

## What's Not Built Yet
- AI chat assistant backend (bubble is concept only)
- PostHog analytics
- Email notifications on audit complete
- ZIP file extraction
- Production domain (ultovate.com / master branch launch)
