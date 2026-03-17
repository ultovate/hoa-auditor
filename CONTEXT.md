# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**






















---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-17 20:02 UTC
- **Commit:** `944d923` — fix: delete job records and analysis cache when removing files or audits

deleteAudit and deleteFile now clean up jobs table and analysis_cache
entries so no orphaned records remain in Supabase after deletion.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
