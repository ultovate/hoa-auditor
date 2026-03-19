# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**










































---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-19 23:13 UTC
- **Commit:** `9e05159` — fix: compute restriction summary counts from actual data, not AI self-report

AI's restriction_summary counts were out of sync with the individual items.
Now derives total, high, medium, and amended counts directly from
restrictions_found[] array fetched from Supabase.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
