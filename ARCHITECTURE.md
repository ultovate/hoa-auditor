# HOA Auditor — Architecture & Decision Log

*Last updated: July 2, 2026*

---

## Product

- **Name:** HOA Auditor (under Ultovate brand)
- **Purpose:** AI-powered HOA document analysis for condo buyers and real estate agents
- **Target users (beta):** Real estate agents, buyers, title companies (B2B)
- **Status:** Active beta — deployed on Vercel (dev) + Railway (backend)

---

## Repositories

| Repo                           | Purpose              | Branch                                    |
| ------------------------------ | -------------------- | ----------------------------------------- |
| `ultovate/hoa-auditor`       | Frontend app         | `dev` (active), `master` (production) |
| `ultovate/hoa-pdf-converter` | Backend OCR + worker | `main`                                  |

---

## Tech Stack

| Layer            | Technology                             | Notes                                                 |
| ---------------- | -------------------------------------- | ----------------------------------------------------- |
| Frontend         | Vite + React 18 + TypeScript           | Migrated from vanilla JS MPA (2026-07-02); legacy `.html` pages coexist during incremental port |
| Auth             | Supabase Auth                          | Email/password                                        |
| Database         | Supabase Postgres                      | `audits`, `jobs`, `analysis_cache` tables       |
| File Storage     | Supabase Storage                       | `hoa_documents` bucket                              |
| OCR + Worker     | Flask + Gunicorn + PyMuPDF + Tesseract | Deployed on Railway                                   |
| AI Analysis      | Gemini 2.5 Flash                       | Called from Railway worker (paid key + free fallback) |
| Frontend Hosting | Vercel                                 | `dev` branch → hoa-auditor.vercel.app              |

---

## Environments

| Environment           | Branch | URL                                  |
| --------------------- | ------ | ------------------------------------ |
| Dev (frontend)        | dev    | hoa-auditor.vercel.app               |
| Production (frontend) | master | TBD                                  |
| OCR Backend           | main   | web-production-486ad7.up.railway.app |

---

## Folder Structure

### Frontend (`hoa-auditor/`)

```
hoa-auditor/
├── index.html              ← Marketing landing page (public)
├── auth.html               ← Login / Signup
├── dashboard.html          ← Upload + audit management (protected)
├── summary.html            ← Audit summary view (protected)
├── report.html             ← Full tabbed report (protected)
├── sample.html             ← Public sample report (no login required)
├── vite.config.js          ← Legacy HTML entry points + React root registered here
├── supabase/
│   └── sample_audit_setup.sql  ← RLS policy + is_sample column setup
├── src/
│   ├── App.tsx              ← React root component (new tabbed report shell)
│   ├── main.tsx             ← React DOM entry point
│   ├── domain.ts            ← Shared TS types (Tab, FindingId, TABS, etc.)
│   ├── theme.ts             ← ThemeContext + theme tokens
│   ├── index.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── PropertyHero.tsx ← Accepts `coverImage` prop (condo imagery)
│   │   ├── SidebarChat.tsx
│   │   ├── TabNavigation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── tabs/
│   │       ├── SummaryTab.tsx
│   │       ├── FinancialTab.tsx
│   │       ├── DocumentsTab.tsx
│   │       └── PlaceholderTab.tsx
│   ├── hooks/
│   │   ├── useForensicChat.ts
│   │   ├── useAiInsight.ts
│   │   └── useGeminiClient.ts
│   ├── services/            ← Legacy vanilla-JS services (still active, not yet ported)
│   │   ├── supabase.js     ← Supabase client (single instance)
│   │   ├── authService.js
│   │   └── uploadService.js← Upload, job creation, audit CRUD
│   ├── views/               ← Legacy vanilla-JS renderers (pre-React, still active)
│   │   ├── reportView.js   ← Full tabbed report renderer (v2.0 schema)
│   │   └── summaryView.js  ← Summary card renderer (v2.0 schema)
│   ├── data/
│   │   └── auditStore.js
│   └── styles/
│       └── report.css
```

> **Migration note:** The React port (`App.tsx` + `src/components/`) currently renders the report UI. Upload/auth/dashboard flows (`dashboard.html`, `uploadService.js`, `authService.js`) are still vanilla JS and have not been ported yet. Treat these as two coexisting systems until the migration completes.

### OCR Backend (`hoa-pdf-converter/`)

```
hoa-pdf-converter/
├── app.py              ← Flask app + starts worker thread on boot
├── worker.py           ← Async job processor (polls Supabase every 30s)
├── migrate_to_v2.py    ← One-time migration: re-runs Gemini on existing audits
├── schemas/
│   ├── report_schema.json      ← v2.0 output schema injected into Gemini prompt
│   ├── risk_categories.json
│   ├── restriction_categories.json
│   ├── document_types.json
│   ├── urgency_levels.json
│   └── event_types.json
├── compliance/
│   └── wa_checklist.json       ← WA state compliance checklist
└── requirements.txt
```

---

## Pages & Navigation

| Page      | URL                       | Access                                |
| --------- | ------------------------- | ------------------------------------- |
| Landing   | /                         | Public                                |
| Auth      | /auth.html                | Public                                |
| Dashboard | /dashboard.html           | Protected (auth required)             |
| Summary   | /summary.html?auditId=xxx | Protected                             |
| Report    | /report.html?auditId=xxx  | Protected                             |
| Sample    | /sample.html              | **Public — no login required** |

---

## Data Flow (End-to-End)

```
1. User logs in (Supabase Auth)
        ↓
2. User uploads PDFs on dashboard.html
        ↓
3. Backend data ingestion contract (uploadService.js), 4 steps:
   1. Client validation & extraction — accepts `.pdf`/`.zip` only; ZIPs unpacked via JSZip, macOS junk files (`._*`) filtered
   2. Audit ID & dedupe — `audit_{timestamp}_{random}` pattern; `checkFileExists()` dedupes by filename per audit
   3. Storage upload — `hoa_documents/{user_id}/{audit_id}/original/{file_name}` (no client-side hash)
   4. Row creation — `audits` row (status: uploaded), then one `jobs` row per file (status: pending, retry_count: 0)
        ↓
4. Railway worker polls `jobs` table every 30s for status=pending
        ↓
5. Worker downloads PDF, runs OCR (PyMuPDF + Tesseract fallback)
   - Checks analysis_cache by file hash — skips OCR if already cached
   - Redacts PII before storing extracted_text
   - Marks job status: converted
        ↓
6. When ALL jobs for an audit_id are converted:
   - Worker checks audit-level cache (hash of all file hashes)
   - If not cached: calls Gemini 2.5 Flash with 11-step fill order prompt
   - Gemini returns v2.0 JSON analysis
   - Saves to audits.analysis + caches result
   - Sets audit status: complete
        ↓
7. User views results on summary.html → report.html
```

---

## Audit Status Flow

```
uploaded → analyzing → complete
                    ↘ failed
```

> **Note:** `processing` is NOT a valid status. The frontend previously set this incorrectly — fixed March 2026.

---

## Report Schema v2.0

Injected into Gemini prompt at analysis time. Key design principles:

- `risks.findings[]` is the **single source of truth** for urgency — no other section assigns severity independently
- All sections reference risks by `risk_id` pointer (format: `CATEGORY_01`)
- 11-step fill order enforced in prompt: risks first, overall_verdict last
- XR-1 through XR-6 cross-reference validation rules

### Top-level sections:

| Section                      | Purpose                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `metadata`                 | Report ID, schema version, HOA name, address, state                                                                    |
| `document_inventory`       | All uploaded files classified by type                                                                                  |
| `risks.findings[]`         | **Primary risk registry** — urgency, risk_id, buyer/agent/lender notes                                          |
| `risks.notable_absences[]` | Risk categories searched but not found                                                                                 |
| `timeline`                 | Events extracted from Resale Certificate                                                                               |
| `restrictions`             | CC&Rs/Bylaws findings linked to risks by risk_id                                                                       |
| `buyer_profile_verdicts`   | Per-buyer-type restriction verdicts                                                                                    |
| `financial_outlook`        | Organized by topic: monthly_fees, reserve_fund, special_assessments, deferred_maintenance, insurance, litigation_costs |
| `compliance_check`         | State checklist items (WA supported)                                                                                   |
| `action_items[]`           | Tagged by role (buyer/agent/lender/all) and priority                                                                   |
| `overall_verdict`          | Written last — references highest_urgency_risk_id                                                                     |
| `missing_documents`        | Critical + recommended missing docs                                                                                    |

---

## Supabase Database Tables

### `audits`

| Column        | Type      | Notes                                                      |
| ------------- | --------- | ---------------------------------------------------------- |
| id            | uuid      | Primary key                                                |
| audit_id      | text      | Unique identifier (`audit_{timestamp}_{random}`)         |
| user_id       | uuid      | FK to auth.users                                           |
| property_name | text      | User-entered property name                                 |
| state         | text      | US state code (e.g. "WA")                                  |
| status        | text      | `uploaded` → `analyzing` → `complete` / `failed` |
| file_count    | integer   | Number of files                                            |
| analysis      | jsonb     | Full v2.0 Gemini analysis output                           |
| is_sample     | boolean   | `true` = public sample report (anon RLS allowed)         |
| created_at    | timestamp | Auto                                                       |
| updated_at    | timestamp | Updated on status change                                   |

### `jobs`

| Column         | Type      | Notes                                     |
| -------------- | --------- | ----------------------------------------- |
| id             | uuid      | Primary key                               |
| audit_id       | text      | FK to audits.audit_id                     |
| user_id        | uuid      | FK to auth.users                          |
| file_name      | text      | e.g. "CC&Rs.pdf"                          |
| file_path      | text      | Full path in hoa_documents bucket         |
| file_hash      | text      | SHA-256 of file bytes (for cache lookup)  |
| status         | text      | `pending` → `converted` / `failed` |
| extracted_text | text      | PII-redacted OCR output                   |
| error_message  | text      | Last error if failed                      |
| retry_count    | integer   | Max 2 retries before permanent failure    |
| started_at     | timestamp | When worker claimed job                   |
| completed_at   | timestamp | When OCR finished                         |

### `analysis_cache`

| Column         | Type      | Notes                                            |
| -------------- | --------- | ------------------------------------------------ |
| file_hash      | text      | SHA-256 (per-file) or audit-level composite hash |
| extracted_text | text      | Cached OCR text (per-file entries only)          |
| analysis       | jsonb     | Cached Gemini output (audit-level entries only)  |
| page_count     | integer   | PDF page count                                   |
| created_at     | timestamp | Auto                                             |

---

## Worker Behavior (worker.py)

### Stage 1 — Per-file OCR

- Claims `pending` job → downloads PDF → runs PyMuPDF text extraction
- Falls back to Tesseract for image-only pages
- Checks `analysis_cache` by file hash — skips OCR if hit
- Redacts PII (names, emails, phone, SSN, addresses) before storing
- Marks job `converted`, saves `extracted_text` + `file_hash`

### Stage 2 — Full Audit Analysis

- Triggers when ALL jobs for an audit are `converted`
- Claims audit atomically (sets status `analyzing`) — prevents duplicate Gemini calls
- Checks audit-level cache (composite hash of all file hashes)
- If cache miss: calls Gemini 2.5 Flash with schema-injected prompt (11 steps)
- Falls back to free Gemini key on quota error
- Saves result to `audits.analysis`, caches to `analysis_cache`

### Environment Variables (Railway)

| Variable                      | Notes                               |
| ----------------------------- | ----------------------------------- |
| `PORT`                      | 8000 (hardcoded)                    |
| `SUPABASE_URL`              | Supabase project URL                |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (bypasses RLS)         |
| `GEMINI_API_KEY`            | Paid key (primary)                  |
| `GEMINI_API_KEY_FREE`       | Free key (quota fallback)           |
| `CONVERTER_API_KEY`         | Protects `/convert` HTTP endpoint |

---

## UI Features

### Report Page (report.html + reportView.js)

Tabbed interface: Overview · Risks · Financial Outlook · Timeline · Restrictions · Documents · Compliance

- **Overview tab:** Role-specific view (buyer/agent/lender), top concerns, monthly fees, green lights, action items
- **Risks tab:** CRITICAL/HIGH/MEDIUM/LOW grouping; "Draft Message" button on CRITICAL/HIGH items
- **Financial Outlook:** Verified dollar amounts only (no AI self-reported totals); deferred maintenance, reserve fund, assessments, insurance, litigation
- **Timeline:** Newest-first sort; "Overdue" only shown for unresolved forward-looking events (not Completed/historical)
- **Analysis Completeness legend:** FULL / PARTIAL / MINIMAL explanation inline
- **AI Assistant bubble:** Floating chat bubble (concept shell, no API integration yet)

### Draft Message Modal

- Triggered from CRITICAL/HIGH risk cards in Risks tab
- 3 recipient templates: HOA Board / My Agent / Lender
- Pre-fills from risk `label`, `finding`, `buyer_note`, `source_document`
- Fully editable textarea + copy to clipboard
- No AI API calls — pure template substitution

### Sample Report (sample.html)

- Publicly accessible — no login required
- Loads audit with `is_sample = true` from Supabase
- Property name/address replaced with "Sample HOA Community · Bellevue, WA"
- Purple "sample demo" banner with sign-up CTA
- Supabase RLS policy: `anon` role can SELECT where `is_sample = true`

---

## Key Decisions Log

| Decision                                        | Reason                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| B2B focus                                       | Competitive research: surviving players rely on agent/brokerage integrations            |
| Railway worker over Edge Functions              | Edge Functions have 30s timeout — can't handle large PDFs                              |
| PyMuPDF + Tesseract fallback                    | Text extraction first (fast), OCR only for image pages                                  |
| OCR text caching in analysis_cache              | Retries and re-analyses skip expensive OCR                                              |
| Audit-level cache invalidated on v2.0 migration | Forces fresh Gemini call with new schema                                                |
| risks.findings[] as single source of truth      | Prevents AI from assigning contradictory severity across sections                       |
| 11-step fill order in prompt                    | Ensures cross-references are valid (risks written before other sections reference them) |
| No AI total for financial exposure              | AI self-reported totals were unverifiable — replaced with computed sum of line items   |
| Supabase over Firebase                          | Better Postgres, easier file storage, generous free tier                                |
| React + TypeScript over vanilla JS MPA (supersedes "Vite MPA over React", 2026-07-02) | Migration decided; incremental — legacy HTML pages coexist with `src/` React components until fully ported |
| `is_sample` RLS over separate table           | Simpler — one boolean, one policy, same audits table                                   |
| Condo imagery infrastructure                   | Implemented default property image placeholder structure (`public/condos/placeholder.jpg`) and updated `PropertyHero.tsx` component to allow custom covers while maintaining high text contrast with stacked `mix-blend-overlay` and a dark gradient overlay. |

---
## Railway Deployment

### Active Project
| Field | Value |
|---|---|
| **Project name** | `hoa-auditor-ocr` |
| **Service name** | `hoa-pdf-converter` |
| **Environment** | `production` |
| **Branch** | `main` |
| **Public URL** | `web-production-486ad7.up.railway.app` |

> ⚠️ **There must only ever be ONE Railway project for this service.**
> In April 2026, duplicate projects (`profound-acceptance`, `friendly-spirit`) accumulated from accidental `railway init` calls and caused double billing. They have been deleted. Only `hoa-auditor-ocr` should exist.

### Deploy Rules
- **Always use `railway link`** to connect to an existing project — never `railway init` (creates a new project every time)
- **Verify link before deploying:**
  ```powershell
  railway status
  # Must show: Project: hoa-auditor-ocr | Environment: production
  ```
- **Deploy command:**
  ```powershell
  railway up
  ```
- **After adding any environment variable in Railway dashboard:** trigger a manual redeploy immediately — Railway does not auto-redeploy on variable changes alone

### VS Code Setup
To ensure Claude Code and terminal sessions always deploy to the correct project, keep a `.railway` link file in the `hoa-pdf-converter` repo root. This is created automatically by `railway link` and should never be deleted.

If you open a new VS Code window or clone the repo fresh, run:
```powershell
cd path\to\hoa-pdf-converter
railway link
# Select: hoa-auditor-ocr → production
```

### Spending Limit
Railway account spending limit is set to **$10/month** as a safety cap. Do not remove this limit. Current typical usage is ~$3/month for the OCR worker.

---
## Pending / Not Yet Built

- [ ] Email notification when audit complete
- [ ] PostHog analytics integration
- [ ] AI assistant chat (concept shell only — no API integration)
- [X] ZIP file extraction pipeline (JSZip, macOS hidden file filtering)
- [ ] Sample report link on dashboard for beta users
- [ ] Production domain (ultovate.com)
