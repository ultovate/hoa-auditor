# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**














































---
## 🔄 Last GitHub Sync (Auto-updated)
- **Timestamp:** 2026-03-23 19:21 UTC
- **Commit:** `0b805b3` — feat: rewire reportView.js for schema v2.0

- renderOverview: reads risks.findings[] with buyer_note/agent_note/lender_flag instead of removed buyer_summary/agent_summary
- renderRisks: reads risks.findings[] for all roles; lender view filters by lender_flag
- renderHiddenCosts: reads financial_outlook sub-sections (monthly_fees, reserve_fund, special_assessments, deferred_maintenance, insurance, litigation_costs) instead of removed financial_projections
- renderFullReport: tab visibility checks updated for v2.0 schema paths
- URGENCY_LABEL: fix label collision — CRITICAL/HIGH now 'Action Required'/'Needs Attention' instead of confusing 'Restrictions Apply'

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
- **Files changed:**
  - 
<!-- END AUTOSYNC -->
