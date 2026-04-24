// shared.js
// Personas: Agent, Buyer (authenticated + shared-link), any future role
//
// Patterns used — source: ui-builder.md
//   Section wrapper  → class .bs / .bs-title (buyer.css)
//   Finding card     → border-left severity card, 4 zones: eyebrow + title + detail + source
//   Alert card       → border-left:#EF4444 bg:#FEF2F2, title + detail in #B91C1C
//   Badge            → inline severity pill, exact colors per severity
//   Stat card        → info block pattern adapted for label + value + sub
//   Accordion row    → wireframe .wacc pattern; uses ui-builder.md token values throughout
//   Role toggle      → wireframe role indicator strip; sidebar (#1F1224) chrome

// ── DESIGN_TOKENS ─────────────────────────────────────────────────────────────
// Values from ui-builder.md are the primary source. Three additional values are
// established here as canonical for the component layer — derived from the
// wireframe rather than ui-builder.md, documented so agentShell.js and
// buyerShell.js can import or reference without re-deriving them.
//
// From ui-builder.md (primary):
//   Page bg:       #F8F9FB   Card bg:      #FFFFFF   Body text:  #1F1224
//   Muted/labels:  #64748B   Primary:      #9333EA   Secondary:  #94A3B8
//   Sidebar:       #1F1224   Sidebar text: #94A3B8   Border:     rgba(31,18,36,0.1)
//   Source text:   #64748B
//
// Finding card backgrounds — all severities use #FFFFFF.
// Outlined badges, no fill — left border signals severity, badge confirms it.
//   HIGH card:    border-left:4px solid #EF4444; background:#FFFFFF
//   MEDIUM card:  border-left:4px solid #F59E0B; background:#FFFFFF
//   LOW card:     border-left:4px solid #64748B; background:#FFFFFF
//
// Badge styles (outlined, no fill):
//   HIGH badge:     color:#EF4444; border:1px solid #EF4444; background:transparent
//   MEDIUM badge:   color:#F59E0B; border:1px solid #F59E0B; background:transparent
//   LOW badge:      color:#64748B; border:1px solid #64748B; background:transparent
//
// Status badge styles (badge-only — not used for finding card borders):
//   LAPSED badge:    color:#EF4444; border:1px solid #EF4444; background:transparent
//   ONGOING badge:   color:#EF4444; border:1px solid #EF4444; background:transparent
//   ACTIVE badge:    color:#EF4444; border:1px solid #EF4444; background:transparent
//   PROPOSED badge:  color:#F59E0B; border:1px solid #F59E0B; background:transparent
//   SETTLED badge:   color:#10B981; border:1px solid #10B981; background:transparent
//   CURRENT badge:   color:#10B981; border:1px solid #10B981; background:transparent
//
// Compliance checklist status badge styles (Compliance tab only):
//   FOUND badge:     color:#10B981; border:1px solid #10B981  — item confirmed present
//   UNCLEAR badge:   color:#F59E0B; border:1px solid #F59E0B  — item ambiguous
//   NOT_FOUND badge: color:#EF4444; border:1px solid #EF4444  — item missing
//
//   ⚠ DO NOT substitute HIGH/MEDIUM/VERIFIED for these — they exist as distinct keys
//   precisely to avoid that. The Compliance tab maps analysis `status` field values
//   directly: FOUND → 'FOUND', UNCLEAR → 'UNCLEAR', NOT_FOUND → 'NOT_FOUND'.
//   N/A items are treated the same as FOUND (item is satisfied/not applicable).
//
// Wireframe-derived (canonical here, not in ui-builder.md):
//   #64748B  — LOW card border-left   source: wireframe .wrisk.lo { border-color }
//   #92400E  — warn accordion pill    source: wireframe .wacc-pill.warn { color }

// ── SEVERITY MAP ──────────────────────────────────────────────────────────────
// Keys: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED'
//   + status badge keys: 'LAPSED' | 'ONGOING' | 'ACTIVE' | 'PROPOSED' | 'SETTLED' | 'CURRENT'
//   + compliance keys:   'FOUND' | 'UNCLEAR' | 'NOT_FOUND'
// Severity keys drive both finding card borders (border field) and badges.
// Status keys are badge-only — border/bg fields are unused for card rendering.
// LOW card border (#64748B) is derived from the wireframe .wrisk.lo rule —
// ui-builder.md defines the badge colors but not a card border for LOW.
const SEVERITY = {
  HIGH:     { label: 'HIGH',     border: '#EF4444', bg: '#FFFFFF', badgeColor: '#EF4444', badgeBg: 'transparent', badgeBorder: '#EF4444' },
  // CRITICAL is not a display tier — maps silently to HIGH styling and label.
  // Data urgency:'CRITICAL' renders badge text "HIGH", same border/bg as HIGH.
  CRITICAL: { label: 'HIGH',     border: '#EF4444', bg: '#FFFFFF', badgeColor: '#EF4444', badgeBg: 'transparent', badgeBorder: '#EF4444' },
  MEDIUM:   { label: 'MEDIUM',   border: '#F59E0B', bg: '#FFFFFF', badgeColor: '#F59E0B', badgeBg: 'transparent', badgeBorder: '#F59E0B' },
  LOW:      { label: 'LOW',      border: '#64748B', bg: '#FFFFFF', badgeColor: '#64748B', badgeBg: 'transparent', badgeBorder: '#64748B' },
  VERIFIED: { label: 'VERIFIED', border: '#10B981', bg: '#F0FDF4', badgeColor: '#10B981', badgeBg: '#D1FAE5',     badgeBorder: null },
  // ── Status badge keys (badge-only — border/bg not used for card rendering) ──
  LAPSED:   { label: 'LAPSED',   border: null, bg: null, badgeColor: '#EF4444', badgeBg: 'transparent', badgeBorder: '#EF4444' },
  ONGOING:  { label: 'ONGOING',  border: null, bg: null, badgeColor: '#EF4444', badgeBg: 'transparent', badgeBorder: '#EF4444' },
  ACTIVE:   { label: 'ACTIVE',   border: null, bg: null, badgeColor: '#EF4444', badgeBg: 'transparent', badgeBorder: '#EF4444' },
  PROPOSED: { label: 'PROPOSED', border: null, bg: null, badgeColor: '#F59E0B', badgeBg: 'transparent', badgeBorder: '#F59E0B' },
  SETTLED:   { label: 'SETTLED',    border: null, bg: null, badgeColor: '#10B981', badgeBg: 'transparent', badgeBorder: '#10B981' },
  CURRENT:   { label: 'CURRENT',    border: null, bg: null, badgeColor: '#10B981', badgeBg: 'transparent', badgeBorder: '#10B981' },
  // ── Compliance checklist status keys ─────────────────────────────────────────
  FOUND:     { label: 'FOUND',      border: null, bg: null, badgeColor: '#10B981', badgeBg: 'transparent', badgeBorder: '#10B981' },
  UNCLEAR:   { label: 'UNCLEAR',    border: null, bg: null, badgeColor: '#F59E0B', badgeBg: 'transparent', badgeBorder: '#F59E0B' },
  NOT_FOUND: { label: 'NOT FOUND',  border: null, bg: null, badgeColor: '#EF4444', badgeBg: 'transparent', badgeBorder: '#EF4444' },
};

// ── AMBER / WARNING TIER RULES ────────────────────────────────────────────────
// Three amber values serve distinct contrast contexts — do not collapse:
//   #F59E0B — outlined strokes only (badge borders, card left-borders, border properties)
//             ⚠ fails WCAG AA as text on white — use only on border/stroke properties
//   #B45309 — body text on white/page-bg (#FFFFFF / #F8F9FB): inline dollar amounts,
//             cost labels, warning prose inside a white card
//   #92400E — filled pill text only: text that sits on a filled amber bg (#FEF3C7)
//
// ── DANGER / HIGH TIER RULES ─────────────────────────────────────────────────
// Two danger values serve distinct contrast contexts — do not collapse:
//   #EF4444 — outlined strokes: border properties, badgeBorder, badgeColor for
//             outlined badges, card border-left, overdue tags
//   #B91C1C — body text on white or tinted surfaces (#FFFFFF / #FEF2F2):
//             alert card title/detail, accordion risk pill text, inline HIGH prose
//
// ── MUTED TOKEN RULES ────────────────────────────────────────────────────────
// #64748B is the single muted-foreground token — intentionally shared across:
//   eyebrow labels (11px uppercase 700), section labels, secondary body prose,
//   date/meta columns, inactive tab text.
// Role differentiation is typographic (size, weight, letter-spacing), not chromatic.
// Do not split into two close slate values.
//
// ── BLUE PALETTE OWNERSHIP ───────────────────────────────────────────────────
// #EFF6FF / #DBEAFE / #BFDBFE / #2563EB belong exclusively to the 2026
// compliance badge system. Do not reuse for UI affordances (chips, hover states).
// Brand hover token for UI affordances: #94A3B8 (secondary cool slate).

// ── ACCORDION PILL MAP ────────────────────────────────────────────────────────
// Keys: 'risk' | 'warn' | 'ok' | 'muted'
// Colors align with SEVERITY table where applicable.
const ACCORDION_PILL = {
  risk:  { bg: '#FEE2E2', color: '#B91C1C' }, // HIGH
  warn:  { bg: '#FEF3C7', color: '#92400E' }, // amber — from wireframe .wacc-pill.warn
  ok:    { bg: '#D1FAE5', color: '#10B981' }, // VERIFIED green
  muted: { bg: '#E2E8F0', color: '#475569' }, // LOW grey
};

// ── renderBadge ───────────────────────────────────────────────────────────────
// severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED'
//         | 'LAPSED' | 'ONGOING' | 'ACTIVE' | 'PROPOSED' | 'SETTLED' | 'CURRENT'
// Pattern: ui-builder.md badge (inline span, top-right of finding card)
// Status keys (LAPSED…CURRENT) are badge-only — not wired to finding card borders.
export function renderBadge(severity) {
  const s = SEVERITY[severity] ?? SEVERITY.LOW;
  // Use s.label so CRITICAL silently displays as "HIGH"
  // badgeBorder present → outlined style (no fill); absent → filled style (VERIFIED)
  const borderStyle = s.badgeBorder
    ? `border:1px solid ${s.badgeBorder};`
    : 'border:1px solid transparent;';
  return `<span style="color:${s.badgeColor};background:${s.badgeBg};${borderStyle}padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;flex-shrink:0;">${s.label}</span>`;
}

// ── renderFindingCard ─────────────────────────────────────────────────────────
// Pattern: ui-builder.md "Finding card" — 4 zones always present.
// { severity, eyebrow, title, detail, source }
export function renderFindingCard({ severity = 'HIGH', eyebrow = '', title = '', detail = '', source = '' }) {
  const s = SEVERITY[severity] ?? SEVERITY.LOW;
  return `<div style="border-left:4px solid ${s.border};background:${s.bg};border-radius:0;padding:14px 18px;margin-bottom:8px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748B;margin:0;">${eyebrow}</p>
    ${renderBadge(severity)}
  </div>
  <p style="font-size:14px;font-weight:500;color:#1F1224;margin:0 0 4px;">${title}</p>
  <p style="font-size:13px;color:#64748B;margin:0 0 6px;line-height:1.6;">${detail}</p>
  <p style="font-size:11px;font-family:monospace;color:#64748B;margin:0;">Source: ${source}</p>
</div>`;
}

// ── renderAlertCard ───────────────────────────────────────────────────────────
// Pattern: ui-builder.md "Alert card (critical warning)"
// { title, detail }
export function renderAlertCard({ title = '', detail = '' }) {
  return `<div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:0;padding:14px 18px;margin-bottom:20px;">
  <p style="font-size:14px;font-weight:500;color:#B91C1C;margin:0 0 4px;">${title}</p>
  <p style="font-size:13px;color:#B91C1C;line-height:1.7;margin:0;">${detail}</p>
</div>`;
}

// ── renderStatCard ────────────────────────────────────────────────────────────
// Pattern: ui-builder.md "Info block" adapted for stat (label + value + sub).
// Intended for use inside the 2-column info grid pattern.
// { label, value, sub }  — sub is optional
export function renderStatCard({ label = '', value = '', sub = '' }) {
  const subHtml = sub
    ? `<p style="font-size:11px;color:#64748B;margin:4px 0 0;">${sub}</p>`
    : '';
  return `<div style="background:#FFFFFF;border-radius:8px;border:1px solid rgba(31,18,36,0.08);padding:20px 24px;">
  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748B;margin:0 0 8px;">${label}</p>
  <p style="font-size:14px;font-weight:500;color:#1F1224;line-height:1.6;margin:0;">${value}</p>
  ${subHtml}
</div>`;
}

// ── renderSectionWrapper ──────────────────────────────────────────────────────
// Pattern: ui-builder.md "Section wrapper" — .bs / .bs-title CSS classes.
// title: string  contentHtml: HTML string
export function renderSectionWrapper(title, contentHtml) {
  return `<div class="bs">
  <div class="bs-title">${title}</div>
  ${contentHtml}
</div>`;
}

// ── renderAccordionRow ────────────────────────────────────────────────────────
// Pattern: wireframe .wacc-row — token values from ui-builder.md throughout.
// pillType: 'risk' | 'warn' | 'ok' | 'muted'
// open: bool — true renders body and rotates chevron
// { title, pillType, pillText, bodyHtml, open }
export function renderAccordionRow({ title = '', pillType = 'muted', pillText = '', bodyHtml = '', open = false }) {
  const pill = ACCORDION_PILL[pillType] ?? ACCORDION_PILL.muted;
  const chevronStyle = open
    ? 'border-left:5px solid rgba(31,18,36,0.25);transform:rotate(90deg);'
    : 'border-left:5px solid rgba(31,18,36,0.25);';
  const bodyStyle = open ? 'display:block;' : 'display:none;';

  return `<div style="border:1px solid rgba(31,18,36,0.08);border-radius:8px;overflow:hidden;margin-bottom:8px;background:#FFFFFF;">
  <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;">
    <div style="width:3px;height:13px;border-radius:999px;background:#9333EA;flex-shrink:0;"></div>
    <p style="flex:1;font-size:13px;font-weight:600;color:#1F1224;margin:0;">${title}</p>
    <span style="background:${pill.bg};color:${pill.color};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;">${pillText}</span>
    <div style="width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;${chevronStyle}flex-shrink:0;"></div>
  </div>
  <div style="${bodyStyle}padding:10px 14px 14px;border-top:1px solid rgba(31,18,36,0.08);">
    ${bodyHtml}
  </div>
</div>`;
}

// ── renderPropertyBanner ─────────────────────────────────────────────────────
// All roles — factual metadata only. No verdict. No CRITICAL/CAUTION/SAFE label.
// data: { hoaName, address, submittedDate, docCount, wucioa: { verified, total } }
// role: 'agent' | 'buyer'
//
// agent: renders WUCIOA pill top-right
// buyer: no pill, no WUCIOA counter
//
// Background: #2D1B33 — slightly lighter than header #1F1224, creates visual
// separation without breaking the dark chrome feel. No border-radius. No card shadow.
export function renderPropertyBanner({ hoaName = '', address = '', submittedDate = '', docCount = '', wucioa = { verified: 0, total: 26 } } = {}, role = 'agent') {
  const wucioapill = role === 'agent'
    ? `<div style="background:rgba(255,255,255,0.1);border-radius:6px;padding:6px 12px;flex-shrink:0;text-align:center;">
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(148,163,184,0.6);margin:0 0 3px;">WUCIOA</p>
        <p style="font-size:13px;font-weight:600;margin:0;white-space:nowrap;">
          <span style="color:#10B981;">${wucioa.verified}</span><span style="color:rgba(148,163,184,0.6);font-weight:400;"> / ${wucioa.total}</span>
        </p>
      </div>`
    : '';

  return `<div style="background:#2D1B33;padding:16px 20px;border-radius:0;">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
    <div style="flex:1;min-width:0;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94A3B8;opacity:0.7;margin:0 0 6px;">${hoaName}</p>
      <p style="font-size:24px;font-weight:500;color:#FFFFFF;margin:0 0 8px;line-height:1.2;">${address}</p>
      <p style="font-size:13px;color:#94A3B8;opacity:0.7;margin:0;">${submittedDate} · ${docCount}</p>
    </div>
    ${wucioapill}
  </div>
</div>`;
}

// ── renderCategoryTabs ────────────────────────────────────────────────────────
// Tab bar — all roles. Sticky below property banner, above content area.
// activeTab: one of CATEGORY_TABS id values (default 'summary')
//
// Active tab:   background:#1F1224  color:#FFFFFF  no border
// Inactive tab: background:#FFFFFF  color:#64748B  border:1px solid rgba(31,18,36,0.1)
//
// Returns HTML string only. Caller mounts into #tabs-mount and wires click handler:
//   document.getElementById('tabs-mount').addEventListener('click', e => {
//     const tab = e.target.closest('[data-tab]')
//     if (tab) document.getElementById('tabs-mount').innerHTML =
//       renderCategoryTabs(tab.dataset.tab)
//   })
// Content rendering on tab switch is deferred to the caller — this function
// only manages active visual state.
const CATEGORY_TABS = [
  { id: 'summary',      label: 'Summary'      },
  { id: 'financial',    label: 'Financial'    },
  { id: 'risks',        label: 'Risks'        },
  { id: 'restrictions', label: 'Restrictions' },
  { id: 'timeline',     label: 'Timeline'     },
  { id: 'compliance',   label: 'Compliance'   },
  { id: 'documents',    label: 'Documents'    },
];

export function renderCategoryTabs(activeTab = 'summary') {
  const tabs = CATEGORY_TABS.map(({ id, label }) => {
    const isActive = id === activeTab;
    const style = isActive
      ? 'background:#1F1224;color:#FFFFFF;border:1px solid transparent;'
      : 'background:#FFFFFF;color:#64748B;border:1px solid rgba(31,18,36,0.1);';
    return `<button data-tab="${id}" style="${style}padding:5px 14px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;font-family:inherit;">${label}</button>`;
  }).join('');

  return `<div style="position:sticky;top:0;z-index:10;background:#FFFFFF;border-bottom:1px solid rgba(31,18,36,0.1);padding:8px 24px;">
  <div style="display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;">
    ${tabs}
  </div>
</div>`;
}

// ── renderRoleToggle ──────────────────────────────────────────────────────────
// Pattern: wireframe role indicator strip — sidebar chrome (#1F1224 / #94A3B8).
// activeRole: 'agent' | 'buyer'
// Used in shared Full Report screen (report.html, role= param).
export function renderRoleToggle(activeRole) {
  const active   = 'background:#1F1224;color:#94A3B8;font-weight:700;border:1px solid transparent;';
  const inactive = 'background:transparent;color:#94A3B8;font-weight:600;border:1px solid rgba(148,163,184,0.3);opacity:0.65;';
  const agentStyle = activeRole === 'agent' ? active : inactive;
  const buyerStyle = activeRole === 'buyer'  ? active : inactive;

  return `<div style="background:#1F1224;padding:8px 16px;display:flex;align-items:center;gap:12px;">
  <p style="font-size:12px;color:#94A3B8;font-weight:700;margin:0;white-space:nowrap;opacity:0.65;">Viewing as:</p>
  <span style="padding:3px 12px;border-radius:20px;font-size:12px;cursor:pointer;${agentStyle}">Agent</span>
  <span style="padding:3px 12px;border-radius:20px;font-size:12px;cursor:pointer;${buyerStyle}">Buyer</span>
</div>`;
}
