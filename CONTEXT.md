# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**




































---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-19 22:01 UTC
- **Commit:** `d56b67c` — feat: move Executive Summary to standalone summary.html

- summary.html: new page, reads auditId from URL param, auth check on load, renders via summaryView.js
- dashboard.html: openAudit() now navigates to summary.html?auditId=xxx for complete audits; all summary view state, HTML, and JS removed
- summary.css: container updated to .summary-page (no longer depends on .main.main-wide in dashboard)
- Back navigation uses history.back(); View Full Report links to report.html?auditId=xxx (to be built)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
