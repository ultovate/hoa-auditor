# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**


































---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-19 21:10 UTC
- **Commit:** `a9ed9b5` — feat: add Executive Summary view with role-based content

- New view-summary sits between audit list and full report
- Verdict hero banner with awareness language (Restrictions Apply / Review Recommended / No Major Restrictions)
- KPI row: documents, risk areas, monthly dues (lender gets exposure + reserve + litigation)
- Financial exposure strip: special assessments, deferred maintenance, litigation, reserve fund bar
- Two-column body: role-gated alerts (buyer concerns / agent tx risks + buyer / lender impact items) + document status
- WA compliance strip at bottom
- goToFullReport() routes to existing results view for now
- All content gated by currentRole (buyer / agent / lender)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
