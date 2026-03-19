# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**



































---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-19 21:40 UTC
- **Commit:** `100cfce` — refactor: extract + redesign Executive Summary into own files

- src/styles/summary.css — all summary styles, max-width 1100px with breakpoints at 768/600/400px
- src/views/summaryView.js — renderExecutiveSummary(a, role) extracted from dashboard.html
- dashboard.html — now imports summaryView.js, toggles .main-wide class on enter/leave, no inline summary CSS or render logic
- Redesign: serif verdict label, 6px left accent bar, 4px KPI card top borders, alert cards with left-border severity, grouped document status (Current / Needs Verification / Missing), dark navy compliance strip

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
