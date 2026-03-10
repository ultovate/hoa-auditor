# HOA Auditor — Architecture & Decision Log

## Product
- **Name:** HOA Auditor (rebranded under Ultovate)
- **Domain:** ultovate.com
- **Purpose:** AI-powered HOA document analysis for condo buyers and real estate agents
- **Target users (beta):** Real estate agents, title companies (B2B)

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Vite + vanilla JS + Tailwind + DaisyUI |
| Auth & Database | Supabase |
| File Storage | Supabase Storage |
| AI Analysis | Gemini 2.5 Flash API |
| Hosting | Vercel |
| Domain | Namecheap → Vercel DNS |
| Repo | GitHub (private) — layclough/hoa-auditor |

---

## Environments
| Environment | Branch | URL |
|-------------|--------|-----|
| Production | master | ultovate.com |
| Development | dev | hoa-auditor.vercel.app |

**Workflow:** Build on `dev` branch → test → merge to `master` → goes live

---

## Folder Structure
```
hoa-auditor/
├── index.html              ← Marketing landing page (public)
├── auth.html               ← Login / Signup / Forgot password
├── dashboard.html          ← Main app (protected)
├── ARCHITECTURE.md         ← This file
├── src/
│   ├── pages/              ← PRESENTATION LAYER
│   │   ├── landing.js
│   │   ├── auth.js
│   │   └── dashboard.js
│   ├── components/         ← Reusable UI
│   │   ├── navbar.js
│   │   ├── sidebar.js
│   │   └── toast.js
│   ├── services/           ← LOGIC LAYER
│   │   ├── supabase.js     ← Supabase client (single instance)
│   │   ├── authService.js  ← login, signup, logout, OAuth
│   │   ├── uploadService.js← file upload logic
│   │   └── auditService.js ← triggers analysis, fetches results
│   ├── data/               ← DATA LAYER
│   │   ├── userStore.js    ← current user state
│   │   └── auditStore.js   ← audit results state
│   └── styles/
│       └── main.css
├── supabase/
│   └── functions/          ← BACKEND (Supabase Edge Functions)
│       ├── process-documents/
│       ├── classify-document/
│       ├── extract-restrictions/
│       ├── analyze-risk/
│       └── extract-events/
├── .env                    ← Local only, never committed
├── package.json
└── vite.config.js
```

---

## Page Structure & Navigation
| Page | URL | Access |
|------|-----|--------|
| Marketing | ultovate.com/ | Public |
| Auth | ultovate.com/auth.html | Public |
| Dashboard | ultovate.com/dashboard.html | Protected |

---

## Auth Flow Rules
- Failed login → stay on `auth.html` + show red error message
- Not logged in + tries to access dashboard → redirect to `auth.html`
- Successful login → redirect to `dashboard.html`
- Successful signup → show confirmation message (check email)
- Forgot password → send reset link via Supabase email
- Already logged in + visits `auth.html` → redirect to `dashboard.html`
- Sign out → redirect to `auth.html`

---

## User Data Flow
```
User signs up → Supabase creates unique user_id
↓
User uploads HOA documents (ZIP or PDFs)
↓
Files saved to Supabase Storage:
  documents/{user_id}/{audit_id}/original/   ← raw PDFs
  documents/{user_id}/{audit_id}/converted/  ← markdown files
  documents/{user_id}/{audit_id}/analysis/   ← report.json + report.md
↓
Supabase Edge Function triggered:
  1. PDF → Markdown conversion (JS PDF library)
  2. Document classification agent
  3. Restriction extraction agent
  4. Risk analysis agent
  5. Event extraction agent
  6. Assemble final report
↓
Audit status updated in database → "complete"
↓
Dashboard displays results
```

---

## Supabase Storage Structure
```
documents/
└── {user_id}/
    └── {audit_id}/
        ├── original/     ← uploaded PDFs
        ├── converted/    ← markdown after conversion
        └── analysis/     ← report.md + report.json
```

---

## Supabase Database Tables
| Table | Purpose |
|-------|---------|
| users | account info (managed by Supabase Auth) |
| audits | audit records (status, property address, date) |
| audit_flags | individual risks/restrictions found |

---

## AI Processing Pipeline
- **Model:** Gemini 2.5 Flash
- **Free tier:** 250 requests/day (enough for beta)
- **Paid tier:** ~$0.02-0.05 per audit at scale
- **Agents:** document_classifier, restriction_extractor, risk_analyst, event_extractor
- **Input:** Markdown converted from PDF (cheaper than raw PDF)
- **Output:** Structured JSON + human-readable markdown report

---

## Environment Variables
| Variable | Where |
|----------|-------|
| VITE_SUPABASE_URL | .env + Vercel |
| VITE_SUPABASE_ANON_KEY | .env + Vercel |
| VITE_GEMINI_API_KEY | .env + Vercel |

---

## Key Decisions Log
| Decision | Reason |
|----------|--------|
| B2B over B2C | Competitive research showed surviving players rely on agent/brokerage integrations |
| Gemini Flash over Pro | 2.5x more free daily requests, sufficient quality for document analysis |
| JS over Python backend | Cleaner architecture, no separate server, Edge Functions handle processing |
| Supabase over Firebase | Better Postgres support, easier file storage, generous free tier |
| Vite over React | Simpler for current scope, easier to onboard UX collaborator later |