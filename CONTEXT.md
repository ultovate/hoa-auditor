# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**
















































---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-23 20:36 UTC
- **Commit:** `c5f13d4` — feat: rewire summaryView.js for schema v2.0

- All data paths updated: risks.findings[] replaces buyer_summary/agent_summary/risk_findings
- financial_outlook replaces financial_projections throughout
- Risk counts computed from actual risks.findings[] array (no more self-reported critical_count etc.)
- Lender KPI row shows lender flags count instead of unverifiable total exposure
- Verdict hero chips updated: 'Action Required' replaces 'Restrictions Apply'
- URGENCY_LABEL updated to match reportView.js (Action Required / Needs Attention)
- Financial strip removes AI total — shows verifiable sub-section counts only
- Buyer alerts read buyer_note from risks.findings[]
- Agent alerts read agent_note from risks.findings[] + action_items for next steps
- Lender alerts filter risks.findings[] by lender_flag

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
