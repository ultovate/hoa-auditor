# HOA Auditor — Project Context
> Paste this into any AI session to resume without losing context.
> Keep this file updated as the project evolves.



---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-24 17:18 UTC
- **Commit:** `848b517` — docs: update ARCHITECTURE, AI_LOG, and CONTEXT to reflect current state

All three docs were significantly outdated (last updated March 12-13).
Updated to reflect: report schema v2.0, worker fixes, new pages
(sample.html, report.html, summary.html), database schema changes,
UI features (draft message, AI bubble), and deployment rules.

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
- Sample report link on dashboard for beta users
- Production domain (ultovate.com / master branch launch)
