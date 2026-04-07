# HOA Auditor — AI Session Log
> Append to this file at the end of every meaningful session.
> Both Claude and Gemini should read this before starting work.

---

## 2026-03-12 — Session 1 (Claude, Browser)
### Completed
- ✅ Full UI prototype built (5 screens, interactive HTML)
- ✅ Railway deployment unblocked — Gunicorn live on port 8000
- ✅ Tesseract OCR confirmed installed at `/usr/bin/tesseract`
- ✅ All 5 Railway environment variables set
- ✅ `CONTEXT.md` created as universal AI handoff doc
- ✅ AI context sync system designed (this file + GitHub Action)

### Decisions Made
- Hardcode PORT=8000 in Railway (don't use $PORT — shell expansion fails on Windows)
- Add ALL Railway variables before deploying (each save = redeploy)
- Use Gemini for day-to-day coding in VS Code, Claude for architecture/debugging

### Blockers Encountered
- `$PORT` shell variable not expanding — cost 4 hours, fixed by hardcoding
- `CONVERTER_API_KEY` missing from Railway variables — caught before next session

### Next Session Should Start With
- Open `CONTEXT.md` and `AI_LOG.md` for full context
- Build and test `POST /convert` endpoint on Railway Flask app
- Wire Supabase file upload → Railway OCR → Gemini analysis → Supabase results

---
<!-- ADD NEW SESSIONS ABOVE THIS LINE -->
