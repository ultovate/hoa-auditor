---
name: project-hoa-auditor
description: HOA Auditor web app — architecture, tech stack, and key structural facts
metadata:
  type: project
---

HOA Auditor is a vanilla JavaScript + Vite app (no framework) backed by Supabase (auth + storage + DB) with a Railway worker for AI analysis.

**Why:** Understanding the architecture avoids wrong suggestions (e.g., recommending React patterns or TypeScript tooling that doesn't apply).

**How to apply:** Reviews should focus on vanilla JS patterns, Supabase RLS assumptions, HTML-embedded module scripts, and browser security (XSS via innerHTML) rather than framework lifecycle or TS type system issues.

Key structural facts:
- All page logic lives inside `<script type="module">` blocks in the HTML entry points (dashboard.html, auth.html, summary.html, report.html, buyer.html). The src/pages/*.js and src/components/*.js files are empty stubs.
- src/views/reportView.js, buyerView.js, summaryView.js contain all rendering logic using innerHTML string concatenation from AI-sourced JSON — primary XSS surface.
- src/services/uploadService.js handles Supabase Storage + DB writes; no server-side validation layer.
- The .env file contains a GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_SERVICE_ROLE_KEY. The service role key is in .env (not committed, gitignored). The anon key is intentionally exposed via VITE_ prefix.
- buyer.html is publicly accessible with no auth — any user with an auditId URL can see that audit's analysis. This is by design (agent shares link with buyer).
- Polling for audit status uses setInterval at 15s in dashboard.html.
- The `goToFullReport()` function is used as an inline onclick in summaryView.js and reportView.js but is only defined in the HTML page scope — a cross-module coupling risk.
