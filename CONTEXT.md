# HOA Auditor — Project Context
> Paste this into any AI session (Claude or Gemini) to resume without losing context.
> **Keep this file updated as the project evolves.**

---

## What This Project Is
**HOA Auditor** by **Ultovate** (ultovate.com) — an AI-powered tool that analyzes HOA document packages and surfaces restrictions, financial risks, and critical disclosures for real estate agents and condo buyers.

**Business model:** Agent/brokerage subscriptions. Title company integrations are the primary growth target (they touch HOA docs on every condo transaction).

---

## Current Infrastructure Status ✅

| Service | Status | Notes |
|---|---|---|
| Railway (web service) | ✅ Live | `https://web-production-486ad7.up.railway.app` |
| Gunicorn/Flask | ✅ Running | Port 8000, 1 worker, timeout 300 |
| Tesseract OCR | ✅ Installed | `/usr/bin/tesseract` |
| Supabase | ✅ Configured | Auth + Storage + DB with RLS |
| All env vars | ✅ Set | See variables section below |

**Health check:** `https://web-production-486ad7.up.railway.app` returns:
```json
{"service":"hoa-pdf-converter","status":"ok","tesseract":"/usr/bin/tesseract"}
```

---

## Railway Environment Variables (all set ✅)
```
PORT                       = 8000
CONVERTER_API_KEY          = hoa_conv_secret_2026
SUPABASE_URL               = [set]
SUPABASE_SERVICE_ROLE_KEY  = [set]
GEMINI_API_KEY             = [set]
```

---

## Tech Stack

### Frontend
- **Framework:** Vite (chosen over Next.js for MVP simplicity)
- **Styling:** Tailwind CSS + DaisyUI
- **Language:** JavaScript

### Backend / Infra
- **Database + Auth + Storage:** Supabase
- **PDF/OCR Service:** Flask + Gunicorn on Railway (Python)
- **AI Analysis:** Gemini (via API)
- **Dev environment:** Windows, PowerShell, VS Code

### Local project path
```
C:\Users\laycl\OneDrive\Documents\VS_Projects\hoa-auditor\
```

---

## Supabase Database — What's Built
- RLS policies in place (including DELETE policy)
- Audit record CRUD functions in `uploadService.js`
- File storage wired for PDF uploads
- Duplicate file detection implemented

---

## App Structure (Current)
Two-view dashboard:
1. **Properties Review** — list of all properties/audits
2. **Per-property view** — upload files, manage documents for that property

**Key UX decisions:**
- Persistent audits (agents receive docs in batches, not all at once)
- User-friendly language: "Properties Review" not "My Audits", "New Property" not "New Audit"

---

## The Pipeline We're Building (NEXT)
```
User uploads PDF/ZIP
        ↓
Supabase Storage (file saved)
        ↓
Railway Flask API (PDF → text via Tesseract OCR)
        ↓
Gemini API (text → structured analysis)
        ↓
Supabase DB (analysis results saved)
        ↓
Frontend dashboard (results displayed)
```

### Pipeline endpoints needed on Railway:
- `POST /convert` — accepts PDF, returns extracted text
- Authentication via `CONVERTER_API_KEY` header

### Gemini analysis should extract:
- Document classification (CC&Rs, Bylaws, Resale Certificate, etc.)
- Restrictions with severity (HIGH/MEDIUM/LOW)
- Financial health signals (reserve fund %, special assessments)
- Critical risks and items for professional review
- Board meeting themes

---

## UI Prototype
Full 5-screen interactive prototype built — available as `hoa-auditor-prototype.html`.

Screens:
1. Login
2. Document Upload
3. Processing State
4. Email Notification
5. Analysis Dashboard (5 tabs: Overview, Restrictions, Financials, Risks, Documents)

---

## Key People
- **Eric P** — title industry sales agent; provided governance doc feedback; potential integration partner
- **Dave M** — friend who introduced Lay to Eric

---

## Lessons Learned (Hard Way)
- ❌ `$PORT` shell variable doesn't expand if start command set on Windows — hardcode `8000` instead
- ❌ Add ALL Railway variables before first deploy — each variable save triggers a redeploy
- ✅ Use Raw Editor in Railway to add multiple variables at once → single redeploy

---

## What's NOT Built Yet
- [ ] PDF conversion endpoint (`/convert`) on Railway — needs testing
- [ ] Supabase → Railway → Gemini pipeline wiring
- [ ] Gemini prompt for HOA document analysis
- [ ] Results written back to Supabase DB
- [ ] Frontend wired to real data (currently uses mock/static data)
- [ ] ZIP file extraction — implemented but never tested
- [ ] Email notification on analysis complete

---

## Prompt to Resume in Any AI Session
> "I'm building HOA Auditor by Ultovate — an AI-powered HOA document analysis tool for real estate agents. The Flask/OCR backend is live on Railway. I need to build the pipeline: Supabase → Railway (OCR) → Gemini (analysis) → Supabase (results). My stack is Vite + Tailwind + Supabase + Python/Flask on Railway + Gemini API. Let's start by [YOUR NEXT STEP]."
