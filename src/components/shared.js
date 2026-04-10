// shared.js
// Personas: Agent, Buyer (authenticated + shared-link), any future role
//
// Patterns used — source: ui-builder.md
//   Section wrapper  → class .bs / .bs-title (buyer.css)
//   Finding card     → border-left severity card, 4 zones: eyebrow + title + detail + source
//   Alert card       → border-left:#DC2626 bg:#FFF5F5, title + detail in #B91C1C
//   Badge            → inline severity pill, exact colors per severity
//   Stat card        → info block pattern adapted for label + value + sub
//   Accordion row    → wireframe .wacc pattern; uses ui-builder.md token values throughout
//   Role toggle      → wireframe role indicator strip; sidebar (#2B192E) chrome

// ── DESIGN_TOKENS ─────────────────────────────────────────────────────────────
// Values from ui-builder.md are the primary source. Three additional values are
// established here as canonical for the component layer — derived from the
// wireframe rather than ui-builder.md, documented so agentShell.js and
// buyerShell.js can import or reference without re-deriving them.
//
// From ui-builder.md (primary):
//   Page bg:       #F2F3F6   Card bg:      #FFFFFF   Body text:  #2B192E
//   Muted/labels:  #6B5A6D   Primary:      #CE8CA5   Secondary:  #F5E8DA
//   Sidebar:       #2B192E   Sidebar text: #F5E8DA   Border:     rgba(43,25,46,0.1)
//   Source text:   #A67388
//
// Finding card backgrounds — all severities use #FFFFFF.
// Outlined badges, no fill — left border signals severity, badge confirms it.
//   HIGH card:    border-left:4px solid #DC2626; background:#FFFFFF
//   MEDIUM card:  border-left:4px solid #D97706; background:#FFFFFF
//   LOW card:     border-left:4px solid #9CA3AF; background:#FFFFFF
//
// Badge styles (outlined, no fill):
//   HIGH badge:     color:#DC2626; border:1px solid #DC2626; background:transparent
//   MEDIUM badge:   color:#D97706; border:1px solid #D97706; background:transparent
//   LOW badge:      color:#9CA3AF; border:1px solid #9CA3AF; background:transparent
//
// Status badge styles (badge-only — not used for finding card borders):
//   LAPSED badge:    color:#DC2626; border:1px solid #DC2626; background:transparent
//   ONGOING badge:   color:#DC2626; border:1px solid #DC2626; background:transparent
//   ACTIVE badge:    color:#DC2626; border:1px solid #DC2626; background:transparent
//   PROPOSED badge:  color:#D97706; border:1px solid #D97706; background:transparent
//   SETTLED badge:   color:#15803D; border:1px solid #15803D; background:transparent
//   CURRENT badge:   color:#15803D; border:1px solid #15803D; background:transparent
//
// Compliance checklist status badge styles (Compliance tab only):
//   FOUND badge:     color:#15803D; border:1px solid #15803D  — item confirmed present
//   UNCLEAR badge:   color:#D97706; border:1px solid #D97706  — item ambiguous
//   NOT_FOUND badge: color:#DC2626; border:1px solid #DC2626  — item missing
//
//   ⚠ DO NOT substitute HIGH/MEDIUM/VERIFIED for these — they exist as distinct keys
//   precisely to avoid that. The Compliance tab maps analysis `status` field values
//   directly: FOUND → 'FOUND', UNCLEAR → 'UNCLEAR', NOT_FOUND → 'NOT_FOUND'.
//   N/A items are treated the same as FOUND (item is satisfied/not applicable).
//
// Wireframe-derived (canonical here, not in ui-builder.md):
//   #9CA3AF  — LOW card border-left   source: wireframe .wrisk.lo { border-color }
//   #92400E  — warn accordion pill    source: wireframe .wacc-pill.warn { color }

// ── SEVERITY MAP ──────────────────────────────────────────────────────────────
// Keys: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED'
//   + status badge keys: 'LAPSED' | 'ONGOING' | 'ACTIVE' | 'PROPOSED' | 'SETTLED' | 'CURRENT'
//   + compliance keys:   'FOUND' | 'UNCLEAR' | 'NOT_FOUND'
// Severity keys drive both finding card borders (border field) and badges.
// Status keys are badge-only — border/bg fields are unused for card rendering.
// LOW card border (#9CA3AF) is derived from the wireframe .wrisk.lo rule —
// ui-builder.md defines the badge colors but not a card border for LOW.
const SEVERITY = {
  HIGH:     { label: 'HIGH',     border: '#DC2626', bg: '#FFFFFF', badgeColor: '#DC2626', badgeBg: 'transparent', badgeBorder: '#DC2626' },
  // CRITICAL is not a display tier — maps silently to HIGH styling and label.
  // Data urgency:'CRITICAL' renders badge text "HIGH", same border/bg as HIGH.
  CRITICAL: { label: 'HIGH',     border: '#DC2626', bg: '#FFFFFF', badgeColor: '#DC2626', badgeBg: 'transparent', badgeBorder: '#DC2626' },
  MEDIUM:   { label: 'MEDIUM',   border: '#D97706', bg: '#FFFFFF', badgeColor: '#D97706', badgeBg: 'transparent', badgeBorder: '#D97706' },
  LOW:      { label: 'LOW',      border: '#9CA3AF', bg: '#FFFFFF', badgeColor: '#9CA3AF', badgeBg: 'transparent', badgeBorder: '#9CA3AF' },
  VERIFIED: { label: 'VERIFIED', border: '#16A34A', bg: '#F0FDF4', badgeColor: '#15803D', badgeBg: '#DCFCE7',     badgeBorder: null },
  // ── Status badge keys (badge-only — border/bg not used for card rendering) ──
  LAPSED:   { label: 'LAPSED',   border: null, bg: null, badgeColor: '#DC2626', badgeBg: 'transparent', badgeBorder: '#DC2626' },
  ONGOING:  { label: 'ONGOING',  border: null, bg: null, badgeColor: '#DC2626', badgeBg: 'transparent', badgeBorder: '#DC2626' },
  ACTIVE:   { label: 'ACTIVE',   border: null, bg: null, badgeColor: '#DC2626', badgeBg: 'transparent', badgeBorder: '#DC2626' },
  PROPOSED: { label: 'PROPOSED', border: null, bg: null, badgeColor: '#D97706', badgeBg: 'transparent', badgeBorder: '#D97706' },
  SETTLED:   { label: 'SETTLED',    border: null, bg: null, badgeColor: '#15803D', badgeBg: 'transparent', badgeBorder: '#15803D' },
  CURRENT:   { label: 'CURRENT',    border: null, bg: null, badgeColor: '#15803D', badgeBg: 'transparent', badgeBorder: '#15803D' },
  // ── Compliance checklist status keys ─────────────────────────────────────────
  FOUND:     { label: 'FOUND',      border: null, bg: null, badgeColor: '#15803D', badgeBg: 'transparent', badgeBorder: '#15803D' },
  UNCLEAR:   { label: 'UNCLEAR',    border: null, bg: null, badgeColor: '#D97706', badgeBg: 'transparent', badgeBorder: '#D97706' },
  NOT_FOUND: { label: 'NOT FOUND',  border: null, bg: null, badgeColor: '#DC2626', badgeBg: 'transparent', badgeBorder: '#DC2626' },
};

// ── ACCORDION PILL MAP ────────────────────────────────────────────────────────
// Keys: 'risk' | 'warn' | 'ok' | 'muted'
// Colors align with SEVERITY table where applicable.
const ACCORDION_PILL = {
  risk:  { bg: '#FEE2E2', color: '#B91C1C' }, // HIGH
  warn:  { bg: '#FEF3C7', color: '#92400E' }, // amber — from wireframe .wacc-pill.warn
  ok:    { bg: '#DCFCE7', color: '#15803D' }, // VERIFIED green
  muted: { bg: '#E5E7EB', color: '#374151' }, // LOW grey
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
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B5A6D;margin:0;">${eyebrow}</p>
    ${renderBadge(severity)}
  </div>
  <p style="font-size:14px;font-weight:500;color:#2B192E;margin:0 0 4px;">${title}</p>
  <p style="font-size:13px;color:#6B5A6D;margin:0 0 6px;line-height:1.6;">${detail}</p>
  <p style="font-size:11px;font-family:monospace;color:#A67388;margin:0;">Source: ${source}</p>
</div>`;
}

// ── renderAlertCard ───────────────────────────────────────────────────────────
// Pattern: ui-builder.md "Alert card (critical warning)"
// { title, detail }
export function renderAlertCard({ title = '', detail = '' }) {
  return `<div style="background:#FFF5F5;border-left:4px solid #DC2626;border-radius:0;padding:14px 18px;margin-bottom:20px;">
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
    ? `<p style="font-size:11px;color:#6B5A6D;margin:4px 0 0;">${sub}</p>`
    : '';
  return `<div style="background:#FFFFFF;border-radius:8px;border:1px solid rgba(43,25,46,0.08);padding:20px 24px;">
  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B5A6D;margin:0 0 8px;">${label}</p>
  <p style="font-size:14px;font-weight:500;color:#2B192E;line-height:1.6;margin:0;">${value}</p>
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
    ? 'border-left:5px solid rgba(43,25,46,0.25);transform:rotate(90deg);'
    : 'border-left:5px solid rgba(43,25,46,0.25);';
  const bodyStyle = open ? 'display:block;' : 'display:none;';

  return `<div style="border:1px solid rgba(43,25,46,0.08);border-radius:8px;overflow:hidden;margin-bottom:8px;background:#FFFFFF;">
  <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;">
    <div style="width:3px;height:13px;border-radius:999px;background:#CE8CA5;flex-shrink:0;"></div>
    <p style="flex:1;font-size:13px;font-weight:600;color:#2B192E;margin:0;">${title}</p>
    <span style="background:${pill.bg};color:${pill.color};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;">${pillText}</span>
    <div style="width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;${chevronStyle}flex-shrink:0;"></div>
  </div>
  <div style="${bodyStyle}padding:10px 14px 14px;border-top:1px solid rgba(43,25,46,0.08);">
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
// Background: #2D1F35 — slightly lighter than header #2B192E, creates visual
// separation without breaking the dark chrome feel. No border-radius. No card shadow.
export function renderPropertyBanner({ hoaName = '', address = '', submittedDate = '', docCount = '', wucioa = { verified: 0, total: 26 } } = {}, role = 'agent') {
  const wucioapill = role === 'agent'
    ? `<div style="background:rgba(255,255,255,0.1);border-radius:6px;padding:6px 12px;flex-shrink:0;text-align:center;">
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(245,232,218,0.6);margin:0 0 3px;">WUCIOA</p>
        <p style="font-size:13px;font-weight:600;margin:0;white-space:nowrap;">
          <span style="color:#15803D;">${wucioa.verified}</span><span style="color:rgba(245,232,218,0.6);font-weight:400;"> / ${wucioa.total}</span>
        </p>
      </div>`
    : '';

  return `<div style="background:#2D1F35;padding:16px 20px;border-radius:0;">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
    <div style="flex:1;min-width:0;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#F5E8DA;opacity:0.7;margin:0 0 6px;">${hoaName}</p>
      <p style="font-size:24px;font-weight:500;color:#FFFFFF;margin:0 0 8px;line-height:1.2;">${address}</p>
      <p style="font-size:13px;color:#F5E8DA;opacity:0.7;margin:0;">${submittedDate} · ${docCount}</p>
    </div>
    ${wucioapill}
  </div>
</div>`;
}

// ── renderCategoryTabs ────────────────────────────────────────────────────────
// Tab bar — all roles. Sticky below property banner, above content area.
// activeTab: one of CATEGORY_TABS id values (default 'risks')
//
// Active tab:   background:#2B192E  color:#FFFFFF  no border
// Inactive tab: background:#FFFFFF  color:#6B5A6D  border:1px solid rgba(43,25,46,0.1)
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
  { id: 'risks',        label: 'Risks'        },
  { id: 'financial',    label: 'Financial'    },
  { id: 'restrictions', label: 'Restrictions' },
  { id: 'timeline',     label: 'Timeline'     },
  { id: 'documents',    label: 'Documents'    },
  { id: 'compliance',   label: 'Compliance'   },
  { id: 'summary',      label: 'Summary'      },
];

export function renderCategoryTabs(activeTab = 'risks') {
  const tabs = CATEGORY_TABS.map(({ id, label }) => {
    const isActive = id === activeTab;
    const style = isActive
      ? 'background:#2B192E;color:#FFFFFF;border:1px solid transparent;'
      : 'background:#FFFFFF;color:#6B5A6D;border:1px solid rgba(43,25,46,0.1);';
    return `<button data-tab="${id}" style="${style}padding:5px 14px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;font-family:inherit;">${label}</button>`;
  }).join('');

  return `<div style="position:sticky;top:0;z-index:10;background:#FFFFFF;border-bottom:1px solid rgba(43,25,46,0.1);padding:8px 24px;">
  <div style="display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;">
    ${tabs}
  </div>
</div>`;
}

// ── renderRoleToggle ──────────────────────────────────────────────────────────
// Pattern: wireframe role indicator strip — sidebar chrome (#2B192E / #F5E8DA).
// activeRole: 'agent' | 'buyer'
// Used in shared Full Report screen (report.html, role= param).
export function renderRoleToggle(activeRole) {
  const active   = 'background:#2B192E;color:#F5E8DA;font-weight:700;border:1px solid transparent;';
  const inactive = 'background:transparent;color:#F5E8DA;font-weight:600;border:1px solid rgba(245,232,218,0.3);opacity:0.65;';
  const agentStyle = activeRole === 'agent' ? active : inactive;
  const buyerStyle = activeRole === 'buyer'  ? active : inactive;

  return `<div style="background:#2B192E;padding:8px 16px;display:flex;align-items:center;gap:12px;">
  <p style="font-size:12px;color:#F5E8DA;font-weight:700;margin:0;white-space:nowrap;opacity:0.65;">Viewing as:</p>
  <span style="padding:3px 12px;border-radius:20px;font-size:12px;cursor:pointer;${agentStyle}">Agent</span>
  <span style="padding:3px 12px;border-radius:20px;font-size:12px;cursor:pointer;${buyerStyle}">Buyer</span>
</div>`;
}
