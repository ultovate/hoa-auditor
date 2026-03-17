# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**




























---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-17 22:47 UTC
- **Commit:** `ef8e4b4` — fix: compute compliance counts from items array, not Gemini summary

Gemini's self-reported summary counts were inconsistent with the actual
items returned (N/A items were uncounted, found_count mismatched).
All four counts now derive directly from the items array.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
