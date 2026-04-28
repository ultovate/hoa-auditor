// agentShell.js
// Personas: Agent, Title Company (persistent header also renders for Buyer)
// Patterns from ui-builder.md: none directly — these are chrome/layout patterns
// All token values sourced from shared.js DESIGN_TOKENS block.
//
// ── SHELL ARCHITECTURE ────────────────────────────────────────────────────────
// Zone 1 — Persistent Header (ALL roles)
//   renderPersistentHeader()
//   Renders once on page load into a full-width #header-mount div above #page-shell.
//   Never re-renders on role switch. Logo left · search bar centre · user pill right.
//   Background: #2B192E (matches side nav — unified chrome).
//
// Zone 2 — Side Nav (Agent / Title Company only)
//   renderSideNav()
//   Renders into #nav-mount (width:56px, flex-shrink:0 inside #page-shell flex row).
//   For buyer sessions #nav-mount renders empty — main content fills full width.
//   Collapsed (56px) by default; expands to 68px on toggle.
//
// ── WIREFRAME SOURCES ─────────────────────────────────────────────────────────
//   Persistent header → wireframe "Full Report · Global Page Template" ① header zone
//   Side nav          → wireframe .wframe-agent / .wsnav.exp / .wsnav.col
//                       expanded (68px, icon + label) on A2 Dashboard
//                       collapsed (56px, icon only)   on detail screens
//   Export button     → wireframe A5 content header ghost action button
//   Compliance pill   → wireframe .wacc-pill.warn / .wacc-pill.ok in A5 WUCIOA accordion row
//
// Side nav source note: sidebar.js was an empty stub — this is the first implementation.
// Icon divs are placeholder squares matching the wireframe's .wsnav-icon pattern.
// Replace with SVG icons when an icon system is chosen.

// ── TOKEN REFERENCES (from shared.js DESIGN_TOKENS) ──────────────────────────
// Sidebar bg:       #2B192E   (ui-builder.md: Sidebar)
// Sidebar text:     #F5E8DA   (ui-builder.md: Sidebar text / Secondary)
// Primary:          #CE8CA5   (ui-builder.md: Primary — active icon bg)
// Border:           rgba(43,25,46,0.1)  (ui-builder.md: Border)
// Card bg:          #FFFFFF
// warn pill bg/fg:  #FEF3C7 / #92400E  (wireframe .wacc-pill.warn / shared.js DESIGN_TOKENS)
// ok   pill bg/fg:  #DCFCE7 / #15803D  (ui-builder.md VERIFIED green)

// ── NAV ITEM DEFINITIONS ──────────────────────────────────────────────────────
// Matches wireframe A2 side nav: Audits → New Audit → (divider) → Settings
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Audits'    },
  { id: 'upload',    label: 'New Audit' },
];
const SETTINGS_ITEM = { id: 'settings', label: 'Settings' };

// ── INTERNAL HELPERS ──────────────────────────────────────────────────────────

function iconDiv(isActive) {
  // Wireframe .wsnav-icon: 10×10px box, active = Primary mauve, default = white/25%
  const bg = isActive ? '#7C3AED' : 'rgba(255,255,255,0.25)';
  return `<div style="width:10px;height:10px;border-radius:2px;background:${bg};flex-shrink:0;"></div>`;
}

function avatarDiv() {
  // Wireframe account row: circular icon (border-radius:50%)
  return `<div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.25);flex-shrink:0;"></div>`;
}

function navItem(item, activeItem, expanded) {
  const isActive = item.id === activeItem;
  const activeBg = isActive ? 'background:rgba(255,255,255,0.12);' : '';
  const labelHtml = expanded
    ? `<span style="font-size:11px;font-weight:${isActive ? 600 : 400};color:rgba(255,255,255,${isActive ? 0.9 : 0.55});white-space:nowrap;overflow:hidden;">${item.label}</span>`
    : '';
  const padding   = expanded ? '6px 10px' : '6px 5px';
  const justify   = expanded ? 'flex-start' : 'center';

  return `<div style="display:flex;align-items:center;gap:6px;padding:${padding};margin:2px 5px;border-radius:4px;cursor:pointer;justify-content:${justify};${activeBg}">${iconDiv(isActive)}${labelHtml}</div>`;
}

function divider() {
  return `<div style="height:1px;background:rgba(255,255,255,0.08);margin:6px 8px;"></div>`;
}

// ── renderPersistentHeader ────────────────────────────────────────────────────
// All roles — renders once on page load, never re-renders on role switch.
// Caller mounts into a full-width #header-mount div above #page-shell.
//
// Layout: logo left · search bar centre · user account pill right
// Background: #2B192E — matches side nav, unifies top chrome
//
// Logo: placeholder rect (replace with SVG/wordmark when asset is ready)
// Search: text input, placeholder "Search findings…", #3D2740 bg, #F5E8DA/40% text
// User pill: "My Account" label + chevron, opens profile/password/sign-out dropdown
//            Caller is responsible for wiring the dropdown — this returns HTML only.
export function renderPersistentHeader() {
  return `<div style="background:#2B192E;padding:8px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.08);">
  <!-- Logo -->
  <div style="height:8px;width:80px;background:rgba(255,255,255,0.22);border-radius:3px;flex-shrink:0;"></div>
  <!-- Search bar — centre, grows to fill available space -->
  <div style="flex:1;max-width:420px;margin:0 auto;">
    <input
      type="search"
      placeholder="Search findings…"
      style="width:100%;height:28px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:0 10px;font-size:12px;color:#F5E8DA;outline:none;font-family:inherit;"
    />
  </div>
  <!-- User account pill -->
  <div style="display:flex;align-items:center;gap:6px;border:1px solid rgba(245,232,218,0.25);border-radius:5px;padding:4px 10px;cursor:pointer;flex-shrink:0;">
    <span style="font-size:12px;color:#F5E8DA;font-weight:400;white-space:nowrap;">My Account</span>
    <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid rgba(245,232,218,0.45);"></div>
  </div>
</div>`;
}

// ── renderSideNav ─────────────────────────────────────────────────────────────
// Returns the side nav <div> only — caller wraps it alongside content in a flex
// container: <div style="display:flex"> + renderSideNav() + contentHtml + </div>
//
// expanded:   bool   — true = 68px with icon+label; false = 24px icon only
// activeItem: string — 'dashboard' | 'upload' | 'settings'
export function renderSideNav({ expanded = false, activeItem = 'dashboard' } = {}) {
  const width = expanded ? '68px' : '56px';

  // Logo bar — wider in expanded state
  const logo = `<div style="height:9px;background:rgba(255,255,255,0.2);border-radius:2px;margin:0 ${expanded ? '10px' : '6px'} 14px;"></div>`;

  // Primary nav items
  const primaryItems = NAV_ITEMS.map(item => navItem(item, activeItem, expanded)).join('');

  // Settings item (below divider)
  const settingsHtml = navItem(SETTINGS_ITEM, activeItem, expanded);

  // Account section — avatar row + inline dropdown (expanded only) + toggle
  const accountRow = `<div style="display:flex;align-items:center;gap:6px;padding:6px ${expanded ? '10px' : '5px'};margin:2px 5px;border-radius:4px;cursor:pointer;justify-content:${expanded ? 'flex-start' : 'center'};">${avatarDiv()}${expanded ? `<span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.55);overflow:hidden;white-space:nowrap;flex:1;">Account</span>` : ''}</div>`;

  // Inline account dropdown — expanded state only (Profile / Change Password / Sign Out)
  // Wireframe: small items in a translucent inset panel at bottom of nav
  const accountDropdown = expanded ? `<div style="background:rgba(255,255,255,0.06);border-radius:4px;margin:2px 5px;padding:3px 0;">
    <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;cursor:pointer;">
      <div style="width:7px;height:7px;background:rgba(255,255,255,0.2);border-radius:2px;flex-shrink:0;"></div>
      <span style="font-size:10px;color:rgba(255,255,255,0.55);">Profile</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;cursor:pointer;">
      <div style="width:7px;height:7px;background:rgba(255,255,255,0.2);border-radius:2px;flex-shrink:0;"></div>
      <span style="font-size:10px;color:rgba(255,255,255,0.55);">Change Password</span>
    </div>
    <div style="height:1px;background:rgba(255,255,255,0.08);margin:2px 10px;"></div>
    <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;cursor:pointer;">
      <div style="width:7px;height:7px;background:rgba(239,68,68,0.3);border-radius:2px;flex-shrink:0;"></div>
      <span style="font-size:10px;color:rgba(239,68,68,0.7);">Sign Out</span>
    </div>
  </div>` : '';

  // Collapse/expand toggle at very bottom
  const toggle = `<div style="padding:6px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
    <div style="width:10px;height:10px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto;cursor:pointer;"></div>
  </div>`;

  return `<div style="background:#2B192E;display:flex;flex-direction:column;flex-shrink:0;width:${width};padding:10px 0;border-right:1px solid rgba(255,255,255,0.08);min-height:100vh;">
  ${logo}
  ${primaryItems}
  ${divider()}
  ${settingsHtml}
  <div style="margin-top:auto;">
    ${divider()}
    ${accountRow}
    ${accountDropdown}
    ${toggle}
  </div>
</div>`;
}

// ── renderExportButton ────────────────────────────────────────────────────────
// Ghost button — wireframe A5 content header, sits alongside "Report →" primary.
// Returns a <button> element string (not a div — semantic HTML).
export function renderExportButton() {
  return `<button style="height:28px;padding:0 12px;border-radius:5px;border:1.5px solid rgba(43,25,46,0.2);background:transparent;color:#2B192E;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Export</button>`;
}

// ── renderComplianceCounter ───────────────────────────────────────────────────
// NOTE: returns { type, text } object — not an HTML string.
// Caller destructures before passing to renderAccordionRow:
// const pill = renderComplianceCounter('WUCIOA', 16, 26);
// renderAccordionRow({ ..., pillType: pill.type, pillText: pill.text })
// This is intentional — do not refactor to return HTML string.
//
// type resolves to 'warn' (met < total) or 'ok' (met === total) —
// matches pillType keys in shared.js ACCORDION_PILL map.
//
// label: string — section label e.g. 'WUCIOA' (unused in output, documents call site)
// verified: number — items confirmed met
// total: number — total items in checklist
export function renderComplianceCounter(_label, verified, total) {
  const allMet = verified === total;
  return {
    type: allMet ? 'ok' : 'warn',
    text: allMet ? `✓ All ${total}` : `${verified} / ${total}`,
  };
}
