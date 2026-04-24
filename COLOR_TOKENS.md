# HOA Auditor — Color Tokens

Source of truth for all hardcoded hex values across `report.html` and `src/components/shared.js`.  
All colors are inline styles — no CSS variables, no Tailwind config.

---

## Primary

| Token | Hex | Usage |
|---|---|---|
| Brand accent | `#9333EA` | Accordion left dot, "View all →" link text |
| Dark chrome | `#1F1224` | Body text, sidebar bg, active tab bg, role toggle active bg, financial exposure card bg |
| Page background | `#F8F9FB` | `body` background, buyer profile sub-cards |

---

## Secondary / Surface

| Token | Hex | Usage |
|---|---|---|
| Muted surface | `#94A3B8` | Sidebar text, role toggle text, banner meta, AI chip hover bg |
| Card background | `#FFFFFF` | All content cards, inactive tab bg, tab bar bg, AI panel bg |
| Banner dark strip | `#2D1B33` | Property banner — slightly lighter than `#1F1224`, creates separation without breaking dark chrome |
| Muted foreground | `#64748B` | Eyebrow labels (11px uppercase 700), secondary body text, source citations, date/meta columns, inactive tab text |

> **`#64748B` is the single muted/secondary token.** It covers eyebrow labels, secondary body prose, source citations (`#A67388` was merged here), neutral LOW badge color (`#9CA3AF` was merged here), and inactive tab text. Role differentiation is typographic, not chromatic.

---

## Semantic — Danger (HIGH)

| Hex | Rule |
|---|---|
| `#EF4444` | **Strokes and borders only** — badge `border`, card `border-left`, overdue tag. Never use as body text on white. |
| `#B91C1C` | **Body text on white or tinted surfaces** — alert card title/detail (`#FEF2F2` bg), risk accordion pill text (`#FEE2E2` bg). |
| `#FEF2F2` | Alert card background |
| `#FEE2E2` | Risk accordion pill (`ACCORDION_PILL.risk`) background |

**Badges:** LAPSED, ONGOING, ACTIVE, NOT_FOUND → all use `#EF4444` border + text (outlined, no fill).

---

## Semantic — Warning (MEDIUM)

| Hex | Rule |
|---|---|
| `#F59E0B` | **Strokes and borders only** — badge `border`, card `border-left`, PROPOSED/UNCLEAR badges. ⚠ Fails WCAG AA as text on white — never use as prose text. |
| `#B45309` | **Body text on white** — upcoming fee, deferred maintenance cost, timeline monetary amounts. |
| `#92400E` | **Filled pill text only** — text on a filled amber background (`#FEF3C7`). Used in `ACCORDION_PILL.warn` and WUCIOA not-ok pill. |
| `#FEF3C7` | Warn accordion pill (`ACCORDION_PILL.warn`) background |

**Badges:** PROPOSED, UNCLEAR → use `#F59E0B` border + text (outlined, no fill).

---

## Semantic — Success (VERIFIED / GREEN)

| Hex | Rule |
|---|---|
| `#10B981` | **All green uses** — badge text (VERIFIED/SETTLED/CURRENT/FOUND), card `border-left`, WUCIOA verified count, reserve bar (≥ 70%), ok accordion pill text. |
| `#D1FAE5` | VERIFIED badge fill (`badgeBg`), ok accordion pill (`ACCORDION_PILL.ok`) background |
| `#F0FDF4` | VERIFIED finding card background (`SEVERITY.VERIFIED.bg`) |

**Badges:** VERIFIED, SETTLED, CURRENT, FOUND → `#10B981` border + text. VERIFIED badge is filled (`#D1FAE5` bg).

---

## Semantic — Neutral (LOW)

| Hex | Usage |
|---|---|
| `#64748B` | LOW badge border + text (merged into single muted token — see Secondary) |
| `#E2E8F0` | State card border, reserve progress track bg, AI input border |
| `#475569` | Muted accordion pill (`ACCORDION_PILL.muted`) text |

---

## Blue Palette — 2026 Compliance (reserved)

> **Do not reuse these for UI affordances (chips, hover states, buttons).**  
> This palette belongs exclusively to the 2026 WUCIOA compliance badge system.  
> Brand hover token for UI affordances: `#94A3B8`.

| Hex | Usage |
|---|---|
| `#DBEAFE` | 2026 badge background |
| `#2563EB` | 2026 badge text, AI bubble/panel gradient start, AI send button bg |
| `#7C3AED` | AI bubble/panel gradient end |
| `#93C5FD` | AI input focus border |

---

## Border Tokens

| Hex | Usage |
|---|---|
| `rgba(31,18,36,0.1)` | Standard border — tab bar bottom, inactive tab border, AI chip border |
| `rgba(31,18,36,0.08)` | Card border — all content cards |
| `rgba(31,18,36,0.06)` | Row dividers within cards |
| `rgba(31,18,36,0.25)` | Accordion chevron |

---

## Typography Colors (quick ref)

| Hex | Role |
|---|---|
| `#1F1224` | Primary body text |
| `#64748B` | Muted — labels, secondary text, source citations, dates, inactive tabs |
| `#FFFFFF` | Text on dark chrome (active tab, sidebar, property banner) |
| `#94A3B8` | Text on sidebar / role toggle chrome |
