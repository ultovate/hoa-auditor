// buyerShell.js
// Personas: Buyer (authenticated upload — B2–B4) and Buyer (shared-link — no login)
// All token values sourced from shared.js DESIGN_TOKENS block.
// No side nav. No export button. No compliance counter. Buyer only.
//
// Wireframe sources:
//   Top bar           → wireframe .wt — #2B192E bar, logo left, Full Report → right
//                       authenticated: logo + primary CTA + user dropdown
//                       shared-link:   logo + primary CTA only (no dropdown)
//   Sticky CTA bar    → wireframe .wsticky-cta — full-width, pinned bottom, #CE8CA5 bg
//                       copy varies by entry path — caller passes label param
//   Save-to-account   → wireframe amber nudge strip between disclaimer and glance strip
//                       unauthenticated buyers only — does not block content

// ── TOKEN REFERENCES (from shared.js DESIGN_TOKENS) ──────────────────────────
// Top bar bg:         #2B192E   (ui-builder.md: Sidebar)
// Top bar text:       #F5E8DA   (ui-builder.md: Sidebar text / Secondary)
// Primary btn bg:     #CE8CA5   (ui-builder.md: Primary)
// Primary btn text:   #FFFFFF
// Border:             rgba(43,25,46,0.1)  (ui-builder.md: Border)
// Nudge strip bg:     #FEF3C7   (shared.js DESIGN_TOKENS: warn pill bg)
// Nudge strip border: #D97706   (tokens.css: --caution)
// Nudge strip text:   #B45309   (ui-builder.md: MEDIUM badge color)

// ── renderTopBar ──────────────────────────────────────────────────────────────
// Buyer top bar — no side nav, logo left-aligned, Full Report → right.
// authenticated: bool — true adds user dropdown chevron, false omits it entirely.
// Returns a plain HTML string.
export function renderTopBar({ authenticated = false } = {}) {
  const userDropdown = authenticated
    ? `<div style="display:flex;align-items:center;gap:6px;border:1px solid rgba(245,232,218,0.25);border-radius:5px;padding:4px 10px;cursor:pointer;"><span style="font-size:12px;color:#F5E8DA;font-weight:400;white-space:nowrap;">My Account</span><div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid rgba(245,232,218,0.45);"></div></div>`
    : '';

  return `<div style="background:#2B192E;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;"><div style="height:8px;width:80px;background:rgba(255,255,255,0.22);border-radius:3px;"></div><div style="display:flex;align-items:center;gap:8px;"><button style="height:28px;padding:0 14px;background:#CE8CA5;border:none;border-radius:5px;font-size:12px;font-weight:700;color:#FFFFFF;cursor:pointer;white-space:nowrap;">Full Report →</button>${userDropdown}</div></div>`;
}

// ── renderStickyCTA ───────────────────────────────────────────────────────────
// Full-width sticky bar pinned to the bottom of the buyer view.
// #CE8CA5 background, white text, caller sets copy via label param.
//
// Authenticated copy:   "Talk to a real estate professional →"
// Shared-link copy:     "Ask your agent about these →"
// Caller passes the correct string — this function does not branch on auth state.
//
// Returns a plain HTML string.
export function renderStickyCTA(label) {
  return `<div style="position:sticky;bottom:0;background:#CE8CA5;padding:10px 16px;border-top:1px solid rgba(255,255,255,0.15);"><button style="width:100%;height:36px;background:transparent;border:none;color:#FFFFFF;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:0.01em;">${label}</button></div>`;
}

// ── renderSaveToAccountStrip ──────────────────────────────────────────────────
// Amber nudge bar shown to unauthenticated (shared-link) buyers only.
// Sits between the disclaimer strip and the at-a-glance strip — does not block content.
// Caller is responsible for only rendering this when authenticated === false.
//
// Returns a plain HTML string.
export function renderSaveToAccountStrip() {
  return `<div style="background:#FEF3C7;border-top:1px solid #D97706;border-bottom:1px solid #D97706;padding:7px 16px;display:flex;align-items:center;justify-content:space-between;"><span style="font-size:12px;color:#B45309;font-weight:400;line-height:1.4;">Keep a copy of this review for yourself.</span><button style="height:26px;padding:0 12px;background:#D97706;border:none;border-radius:4px;font-size:11px;font-weight:700;color:#FFFFFF;cursor:pointer;white-space:nowrap;">Save to account →</button></div>`;
}
