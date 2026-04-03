# HOA Auditor — Project Context for Claude Code

## What This Project Is

HOA Auditor is an AI-powered tool that analyzes HOA documents for condo buyers and real estate agents,
delivering plain-English risk assessments. B2B target — real estate agents and title companies.

---

## ⚠️ TECH STACK — READ THIS FIRST

```
Vanilla JavaScript — NO React, NO TypeScript, NO JSX
Vite v5 (bundler only — no framework)
Tailwind CSS v4
DaisyUI v5
Supabase JS client (@supabase/supabase-js)
JSZip
```

**This means:**
- NO `<Component />` syntax — everything is plain HTML elements
- NO `import React from 'react'`
- NO shadcn, NO Radix, NO CVA, NO Lucide, NO Sonner
- NO TypeScript types or interfaces
- HTML files with `<script type="module">` tags
- CSS classes are Tailwind utilities + DaisyUI component classes

If you find yourself writing JSX or importing React, stop — wrong stack.

---

## File Structure

```
hoa-auditor/
├── CLAUDE.md              ← this file
├── package.json
├── vite.config.js
├── index.html             ← entry point
├── src/
│   ├── styles/
│   │   └── globals.css    ← CSS variables / design tokens (source of truth)
│   ├── main.js            ← app entry
│   └── ...
```

**Git workflow:** Always `git pull origin dev --rebase` before pushing.
A GitHub Action auto-commits to `dev` — the branch may already be ahead.

---

## ⚠️ COLOR RULES — EXACT VALUES, NEVER GUESS

### Page & Surface (from globals.css)
```css
--background:       #F2F3F6   /* page bg — NEVER white, NEVER pink */
--card:             #FFFFFF   /* card bg — must contrast against page */
--foreground:       #2B192E   /* body text */
--primary:          #CE8CA5   /* buttons, active states, rings ONLY */
--secondary:        #F5E8DA   /* hover states, secondary surfaces */
--muted-foreground: #6B5A6D   /* secondary text, source citations */
--sidebar:          #2B192E   /* sidebar bg — ALWAYS dark */
--sidebar-foreground: #F5E8DA /* sidebar text */
--border:           rgba(43,25,46,0.1)
--radius:           0.625rem
```

**--primary (#CE8CA5) is for buttons and active tabs ONLY.**
NEVER apply it to a page background, section background, or card background.
If the page looks pink, find where bg-primary or #CE8CA5 is on a container and remove it.

### Status Colors — NOT in globals.css, apply as inline style or Tailwind arbitrary values

**HIGH / Critical — RED**
```
Badge:     color: #B91C1C;  background: #FEE2E2
Card bg:   #FFF5F5  (barely-there tint — almost white, not hot pink)
Card border-left: 4px solid #DC2626
```

**MEDIUM / Warning — AMBER (not yellow, not orange, not pink)**
```
Badge:     color: #B45309;  background: #FEF3C7
Card bg:   #FFFBEB  (barely-there tint — almost white)
Card border-left: 4px solid #D97706
```

**LOW — GRAY**
```
Badge:     color: #374151;  background: #E5E7EB
```

**VERIFIED / Clear — GREEN**
```
Badge:     color: #15803D;  background: #DCFCE7
Card bg:   #F0FDF4
Card border-left: 4px solid #16A34A
```

**Traffic Light Cards**
```
RED card:   background: #FFF5F5;  border: 1px solid #FCA5A5
AMBER card: background: #FFFBEB;  border: 1px solid #FCD34D
GREEN card: background: #F0FDF4;  border: 1px solid #86EFAC
```

---

## ⚠️ HTML PATTERNS — USE THESE, NOT REACT COMPONENTS

### Badge
```html
<!-- HIGH -->
<span class="badge" style="color:#B91C1C;background:#FEE2E2;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500;">HIGH</span>

<!-- MEDIUM -->
<span class="badge" style="color:#B45309;background:#FEF3C7;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500;">MEDIUM</span>

<!-- LOW -->
<span class="badge" style="color:#374151;background:#E5E7EB;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500;">LOW</span>

<!-- VERIFIED -->
<span class="badge" style="color:#15803D;background:#DCFCE7;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500;">VERIFIED</span>
```

### Finding Card (4 zones — all 4 always, never skip one)
```html
<div class="card" style="border-left:4px solid #DC2626;background:#FFF5F5;">
  <div class="card-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#6B5A6D;margin-bottom:4px;">Restriction</p>
      <!-- Zone 1: eyebrow label -->
      <p style="font-size:14px;font-weight:500;color:#2B192E;">Pet weight limit: 40 lbs</p>
      <!-- Zone 2: title -->
    </div>
    <span style="color:#B91C1C;background:#FEE2E2;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500;flex-shrink:0;">HIGH</span>
    <!-- Zone 2: badge — always top-right -->
  </div>
  <div class="card-body">
    <p style="font-size:13px;color:#6B5A6D;">Buyer's dog exceeds limit — direct conflict.</p>
    <!-- Zone 3: detail text -->
    <p style="font-size:11px;font-family:monospace;color:#A67388;margin-top:8px;">CC&Rs §12.4</p>
    <!-- Zone 4: source citation — NEVER omit -->
  </div>
</div>
```

### Traffic Light (always the first element in report view)
```html
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;">
  <div style="background:#FFF5F5;border:1px solid #FCA5A5;border-radius:12px;padding:20px;">
    <p style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#B91C1C;">Critical</p>
    <p style="font-size:24px;font-weight:500;color:#B91C1C;">3 Issues</p>
    <p style="font-size:11px;color:#B91C1C;margin-top:4px;">Pet limit, STR ban, assessment</p>
  </div>
  <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:20px;">
    <p style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#B45309;">Review needed</p>
    <p style="font-size:24px;font-weight:500;color:#B45309;">5 Items</p>
    <p style="font-size:11px;color:#B45309;margin-top:4px;">Reserve 42%, parking, rental cap</p>
  </div>
  <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;padding:20px;">
    <p style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#15803D;">Verified clear</p>
    <p style="font-size:24px;font-weight:500;color:#15803D;">12 Items</p>
    <p style="font-size:11px;color:#15803D;margin-top:4px;">Insurance, litigation, governance</p>
  </div>
</div>
```

### Property Header — image as overlay behind address, never above it
```html
<!-- The property photo is a CSS background-image or an <img> with overlay — NOT a standalone block above content -->
<div class="property-header" style="position:relative;height:120px;background:#2B192E;overflow:hidden;border-radius:12px 12px 0 0;">

  <!-- Property photo sits behind everything as a low-opacity layer -->
  <img
    src="[property-image-url]"
    alt=""
    style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.25;"
  />

  <!-- Dark gradient so text is always readable over any photo -->
  <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(43,25,46,0.95) 45%, rgba(43,25,46,0.4) 100%);"></div>

  <!-- Address content sits on top -->
  <div style="position:relative;padding:20px 24px;height:100%;display:flex;flex-direction:column;justify-content:center;">
    <p style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#CE8CA5;margin-bottom:6px;">HOA Audit Report</p>
    <p style="font-size:18px;font-weight:500;color:white;line-height:1.2;margin-bottom:4px;">10398 NE 17th St, #302</p>
    <p style="font-size:13px;color:rgba(245,232,218,0.7);">Bellevue WA 98004 · Chateau Owners Association</p>
    <p style="font-size:11px;color:rgba(245,232,218,0.5);margin-top:6px;font-family:monospace;">Audited April 2, 2026</p>
  </div>
</div>

<!-- Traffic light verdict sits IMMEDIATELY below the header — no gap, no other content between them -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:16px;background:white;">
  <!-- RED / AMBER / GREEN cards here -->
</div>
```

**Rules for the property header:**
- Image is always `opacity: 0.2–0.3` — decorative, never dominant
- Dark gradient always covers left 45%+ so text is readable over any photo
- Header height is fixed at `120px` — never taller
- Traffic light verdict is the very next element — nothing between them
- If no property image is available, `background:#2B192E` alone is the fallback — never leave it empty or white

### Financial Stat Cards (4-up grid, always equal)
```html
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
  <div class="card" style="padding:16px;">
    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#6B5A6D;">Monthly dues</p>
    <p style="font-size:22px;font-weight:500;color:#2B192E;">$531</p>
    <span style="color:#15803D;background:#DCFCE7;padding:2px 8px;border-radius:20px;font-size:11px;">Stable</span>
  </div>
  <!-- repeat pattern for: Due at closing · Reserve % · Data freshness -->
</div>
```

### Sidebar (always dark)
```html
<aside style="width:256px;background:#2B192E;color:#F5E8DA;height:100vh;padding:16px;">
  <!-- active item -->
  <div style="background:#3D2A40;color:white;border-radius:8px;padding:8px 12px;margin-bottom:4px;">Dashboard</div>
  <!-- inactive item -->
  <div style="color:#CE8CA5;opacity:0.7;padding:8px 12px;margin-bottom:4px;">Restrictions</div>
</aside>
```

---

## ⚠️ LAYOUT RULES — ENFORCED ON EVERY SCREEN

### Content order in report view (top to bottom, never reorder)
1. Property header — `background:#2B192E` — address, HOA name, audit date
2. Traffic light (RED/AMBER/GREEN) — FIRST data element, 3-column grid, full width
3. HIGH severity alerts — must be visible without scrolling
4. Section tabs — Overview · Restrictions · Financial · Compliance
5. Two-column content area

### Two-column rule
- Any view with 5+ findings = two columns always
- Left: findings feed sorted by severity
- Right: quick actions + checklist progress or missing docs
- Both columns must always have content — never leave one empty
- Bottom row always paired: left = recent audits, right = pending actions

### Financial section
- Top: 4 equal stat cards (monthly dues · closing costs · reserve % · data freshness)
- Bottom: 2-column grid of risk cards
- NEVER 3 unequal columns — dead space in left/middle is a layout failure
- Data freshness = its own stat card with OUTDATED badge (it's a finding, not a footnote)

---

## ⚠️ ANTI-PATTERNS — NEVER DO THESE

```
NEVER: Write React, JSX, TypeScript, or import any framework
NEVER: Pink page background — #CE8CA5 is for buttons only
NEVER: HIGH badge in yellow — HIGH is RED (#B91C1C on #FEE2E2)
NEVER: MEDIUM badge in pink or red — MEDIUM is AMBER (#B45309 on #FEF3C7)
NEVER: Single-column layout for 5+ findings
NEVER: Marketing headline or photo above the traffic light verdict — in report/dashboard view only. Landing page, login, and marketing pages are exempt.
NEVER: Finding card without a source citation
NEVER: All checklist items at identical visual weight
NEVER: Buyer profile filter placed mid-report
NEVER: All finding explanations expanded by default — collapse behind toggle
NEVER: Text color alone as severity signal — always pair with a badge
NEVER: 3 unequal columns (use 4-stat-card row instead)
NEVER: Rename or remove existing HTML element IDs
```

**The one rule that prevents all layout failures:**
A user must triage the full report in under 10 seconds.
If they have to read to understand what's critical, the layout has failed.

---

## Architecture

Async two-stage pipeline:
1. Per-file OCR → PyMuPDF + Tesseract, file hash cached in `analysis_cache`
2. Combined text → PII redaction → Gemini structured analysis

**Supabase tables:** `audits`, `jobs`, `analysis_cache`

**Gemini output schema fields:** `overall_verdict`, `buyer_summary`, `agent_summary`,
`restrictions`, `risk_findings`, `buyer_profile_verdicts`, `missing_documents`, `document_inventory`

**WA compliance:** `wa_checklist.json` injected into Gemini prompt when state = WA
(26-item WUCIOA checklist, RCW 64.90.640, effective Jan 1 2026 via SB 5129)

**OCR service:** Flask + Gunicorn + PyMuPDF + Tesseract on Railway
**Repo:** `ultovate/hoa-auditor` (frontend) · `ultovate/hoa-pdf-converter` (OCR service)

---

## Known Issues

- `dashboard.html` has a syntax error — missing closing brace in `renderAuditAnalysis`
- `VITE_GEMINI_API_KEY` was incorrectly set in Vercel — should be deleted
- `hoa-pdf-converter` repo may be missing `app.py` from version control

---

## Key Decisions (don't re-litigate)

- **B2B only** — consumer subscription ruled out (homebuying frequency too low)
- **Primary target:** Title companies (transaction-mandatory HOA doc review)
- **Secondary target:** Individual agents at $49/mo
- **WA launch first** — SB 5129 compliance = liability tool, not convenience tool
- **Document completeness = information completeness** — 26 WUCIOA items, not filenames
- **Async worker** (30s polling on `jobs` table) — sync OCR timed out on large PDFs
- **File hash caching** — consistent Gemini results across identical documents
- **Railway:** hardcode port 8000, not `$PORT`

---

## Working Style

- Make one change at a time and confirm it works before the next
- Show only the changed lines with clear context when suggesting edits
- Never rename or remove existing HTML element IDs
- Prefer methodical over fast