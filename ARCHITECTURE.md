# HOA Auditor — Architecture & Decision Log
*Last updated: March 13, 2026*

---

## Product
- **Name:** HOA Auditor (under Ultovate brand)
- **Domain:** ultovate.com
- **Purpose:** AI-powered HOA document analysis for condo buyers and real estate agents
- **Target users (beta):** Real estate agents, title companies (B2B)

---

## Repositories
| Repo | Purpose | Branch |
|------|---------|--------|
| `ultovate/hoa-auditor` | Frontend app | `dev` (active), `main` |
| `ultovate/hoa-pdf-converter` | Backend OCR + worker | `main` |

---

## Tech Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Vite + vanilla JS + Tailwind + DaisyUI | Local dev at localhost:5173 |
| Auth | Supabase Auth | Email/password |
| Database | Supabase Postgres | `audits` + `jobs` tables |
| File Storage | Supabase Storage | `hoa_documents` bucket |
| OCR Service | Flask + Gunicorn + PyMuPDF + Tesseract | Deployed on Railway |
| Async Worker | Python worker thread (inside Flask app) | Polls `jobs` table every 30s |
| AI Analysis | Gemini 2.5 Flash API | Called from worker |
| Frontend Hosting | Vercel (planned) | Not yet deployed |

---

## Environments
| Environment | Branch | URL |
|-------------|--------|-----|
| Production (frontend) | main | ultovate.com (planned) |
| Development (frontend) | dev | localhost:5173 |
| OCR Backend | main | web-production-486ad7.up.railway.app |

---

## Folder Structure

### Frontend (`hoa-auditor/`)
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
│   │   ├── authService.js  ← login, signup, logout
│   │   ├── uploadService.js← file upload + job creation
│   │   └── auditService.js ← polls job status, fetches results
│   └── styles/
│       └── main.css
├── .env                    ← Local only, never committed
├── package.json
└── vite.config.js
```

### OCR Backend (`hoa-pdf-converter/`)
```
hoa-pdf-converter/
├── app.py          ← Flask app + starts worker thread on boot
├── worker.py       ← Async job processor (polls Supabase every 30s)
├── requirements.txt
├── nixpacks.toml   ← Railway build config
└── Procfile        ← (if needed)
```

---

## Page Structure & Navigation
| Page | URL | Access |
|------|-----|--------|
| Marketing | ultovate.com/ | Public |
| Auth | ultovate.com/auth.html | Public |
| Dashboard | ultovate.com/dashboard.html | Protected |

---

## Auth Flow
- Not logged in + tries dashboard → redirect to `auth.html`
- Successful login → redirect to `dashboard.html`
- Successful signup → show "check your email" confirmation
- Forgot password → Supabase sends reset link
- Already logged in + visits `auth.html` → redirect to `dashboard.html`
- Sign out → redirect to `auth.html`

---

## Data Flow (End-to-End)
```
1. User logs in via auth.html (Supabase Auth)
         ↓
2. User uploads PDFs on dashboard.html
         ↓
3. uploadService.js saves files to Supabase Storage:
   hoa_documents/{user_id}/audit_{audit_id}/original/{filename}.pdf
         ↓
4. uploadService.js inserts row into `audits` table (status: uploading)
   + inserts one row per file into `jobs` table (status: pending)
         ↓
5. Railway worker picks up pending jobs (polls every 30s)
         ↓
6. Worker downloads PDF from Supabase Storage
         ↓
7. Worker runs OCR via PyMuPDF + Tesseract directly (no HTTP)
   → Saves extracted_text to jobs table as it completes
   → On retry: skips OCR if extracted_text already exists
         ↓
8. Worker sends extracted text to Gemini 2.5 Flash API
   → Returns structured JSON (restrictions, financial, risks, summary)
   → Saves analysis JSON to jobs.analysis column
         ↓
9. Worker checks if all jobs for audit_id are complete
   → Updates audits.status = 'complete'
         ↓
10. Dashboard polls audit status → displays results when complete
    (TODO: email notification)
```

---

## Supabase Storage Structure
```
hoa_documents/
└── {user_id}/
    └── audit_{audit_id}/
        └── original/
            └── {filename}.pdf
```

---

## Supabase Database Tables

### `audits`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| created_at | timestamp | Auto |
| user_id | uuid | FK to auth.users |
| property_name | text | e.g. "Island Commons" |
| audit_id | text | Unique audit identifier |
| status | text | uploading → processing → complete / failed |
| file_count | integer | Number of files in audit |
| updated_at | timestamp | Updated on status change |

### `jobs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| created_at | timestamp | Auto |
| updated_at | timestamp | Updated on each status change |
| audit_id | text | FK to audits.audit_id |
| user_id | uuid | FK to auth.users |
| file_name | text | e.g. "Island_Commons.pdf" |
| file_path | text | Full path in hoa_documents bucket |
| status | text | pending → processing → completed / failed |
| extracted_text | text | Raw OCR output (cached to skip re-OCR) |
| analysis | json | Gemini structured output |
| error_message | text | Last error if failed |
| started_at | timestamp | When worker claimed job |
| completed_at | timestamp | When job finished |
| retry_count | integer | Max 2 retries before permanent failure |

---

## Railway OCR Backend

### Endpoints
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/health` | GET | None | Health check |
| `/convert` | POST | X-API-Key header | PDF → Markdown (legacy, not used by worker) |

### Worker Behavior
- Starts as daemon thread when Flask/Gunicorn boots
- Polls `jobs` table every 30 seconds for `status = 'pending'`
- Claims job atomically (sets status = 'processing')
- Downloads file from Supabase Storage
- Runs OCR directly via PyMuPDF (skips if `extracted_text` already cached)
- Calls Gemini 2.5 Flash for structured analysis
- Saves results, marks job complete
- Max 2 retries on failure

### Environment Variables (Railway)
| Variable | Value |
|----------|-------|
| PORT | 8000 |
| CONVERTER_API_KEY | hoa_conv_secret_2026 |
| SUPABASE_URL | https://nwfozsobydotimvrbxgd.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | [secret] |
| GEMINI_API_KEY | [secret] |

---

## Gemini Analysis Output Schema
```json
{
  "document_type": "CC&Rs | Bylaws | Resale Certificate | Reserve Study | ...",
  "confidence": "HIGH | MEDIUM | LOW",
  "restrictions": [
    { "title": "", "detail": "", "severity": "HIGH | MEDIUM | LOW", "source": "" }
  ],
  "financial": {
    "monthly_assessment": "",
    "reserve_fund_percent": null,
    "special_assessments": "",
    "delinquency_rate": "",
    "notes": ""
  },
  "critical_risks": [
    { "title": "", "detail": "", "severity": "", "source": "" }
  ],
  "meeting_themes": [""],
  "professional_review_items": [
    { "title": "", "reason": "" }
  ],
  "summary": "2-3 sentence plain English summary"
}
```

---

## Environment Variables (Frontend)
| Variable | Where |
|----------|-------|
| VITE_SUPABASE_URL | .env + Vercel |
| VITE_SUPABASE_ANON_KEY | .env + Vercel |

---

## Key Decisions Log
| Decision | Reason |
|----------|--------|
| B2B over B2C | Competitive research showed surviving players rely on agent/brokerage integrations |
| Railway worker over Edge Functions | Edge Functions have 30s timeout — can't handle 174-page PDFs |
| PyMuPDF direct over HTTP /convert | Removes timeout layer, faster, no Gunicorn killing mid-OCR |
| OCR text caching in jobs table | Retries skip 10-min OCR and go straight to Gemini |
| Gemini 2.5 Flash | Only model available to new API keys as of Feb 2026 |
| google-genai==0.6.0 | 1.7.0 had httpx dependency conflict on Railway |
| Lazy Gemini client init | Module-level init crashes on boot if GEMINI_API_KEY not yet loaded |
| Supabase over Firebase | Better Postgres support, easier file storage, generous free tier |
| Vite over React | Simpler for current scope |

---

## What's Not Built Yet
- [ ] Frontend wired to create `jobs` rows on file upload
- [ ] Frontend polling for job status + displaying results
- [ ] Email notification when audit complete
- [ ] ZIP file extraction pipeline
- [ ] Full-page OCR on Railway (currently tested with 10-page limit — ready to remove)
- [ ] Vercel deployment of frontend

---

## Analytics (Pre-Launch Requirement)

**Tool:** PostHog (posthog.com)
- Free tier: 1M events/month — sufficient for beta and early launch
- Works with Vite + vanilla JS, no backend needed
- Ties events to `user_id` for user-level insights

**Implementation:** ~2 hours when ready. Add to `dashboard.html` before launch.

### Events to Track
| Event | When | Key Properties |
|-------|------|----------------|
| `user_signed_up` | Successful signup | `user_id`, `email` |
| `user_logged_in` | Successful login | `user_id` |
| `audit_created` | New property uploaded | `audit_id`, `file_count`, `property_name` |
| `file_uploaded` | Each file added | `audit_id`, `file_name`, `file_size` |
| `analysis_completed` | Audit status → complete | `audit_id`, `file_count`, `duration_seconds` |
| `results_viewed` | User opens results view | `audit_id`, `risk_level` |
| `file_deleted` | Single file removed | `audit_id`, `file_name` |
| `audit_deleted` | Full audit removed | `audit_id` |
| `files_added_to_existing` | Add files to completed audit | `audit_id`, `new_file_count` |

### Setup Steps (when ready)
1. Create PostHog account at posthog.com
2. `npm install posthog-js`
3. Initialize in `dashboard.html` after auth check:
```javascript
import posthog from 'posthog-js'
posthog.init('YOUR_POSTHOG_KEY', { api_host: 'https://app.posthog.com' })
posthog.identify(currentUser.id, { email: currentUser.email })
```
4. Add `posthog.capture()` calls at each key action listed above

### Why This Matters for Launch
- Know which agents are actually using the product
- See where users drop off (upload vs results vs re-upload)
- Measure time-to-value (upload → results viewed)
- Evidence for Eric P and future investors that the product has traction
