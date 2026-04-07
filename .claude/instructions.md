# Claude System Instructions — HOA Auditor by Ultovate

## First Thing Every Session
1. Read `CONTEXT.md` — full project context and infrastructure status
2. Read `AI_LOG.md` — what was done last session and what's next
3. Then ask: "Ready to continue. Last session we [summary]. Next up is [next step]. Shall we proceed?"

## About This Project
HOA Auditor by Ultovate — AI-powered HOA document analysis tool for real estate agents and condo buyers. Analyzes HOA packages to surface restrictions, financial risks, and critical disclosures.

## How to Work With Lay
- MVP-first. Don't over-engineer or add features not asked for
- Be explicit about every step — Lay is methodical and needs to know what's happening
- Always do a checklist before deploying anything (learned the hard way)
- When suggesting code changes, show exactly which file and where
- If something will trigger a redeploy on Railway, say so upfront
- Batch all environment variable changes — never add one at a time

## Tech Stack (quick ref)
- Frontend: Vite + Tailwind + DaisyUI (JavaScript)
- Backend: Supabase (auth + storage + DB)
- OCR Service: Flask + Gunicorn on Railway (Python)
- AI: Gemini API
- Dev: Windows, PowerShell, VS Code
- Repo: GitHub

## Hard Rules
- Never hardcode secrets or API keys in code
- Always use `os.environ.get()` for env vars in Python
- PORT is hardcoded to 8000 on Railway — do not use $PORT
- Test endpoints with curl before wiring to frontend
- Update `AI_LOG.md` at the end of every session
