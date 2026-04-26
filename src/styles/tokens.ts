/**
 * HOA Auditor — Design tokens
 * Source of truth: .claude/gemini-reference.tsx `theme` object
 * Every constant here maps 1-to-1 with a theme key.
 */

// ── Brand / Layout colors ─────────────────────────────────────────────────────
/** Purple brand — active tab underline, links, CTAs, logo square */
export const COLOR_BRAND = '#9333EA';

/** Near-black purple — navbar bg, header bg */
export const COLOR_DARK_HEADER = '#1F1224';

/** Deep purple — property hero/banner background */
export const COLOR_HERO_BG = '#2D1B33';

/** Off-white — page background */
export const COLOR_PAGE_BG = '#F8F9FB';

/** Surface white — card backgrounds */
export const COLOR_SURFACE = '#FFFFFF';

// ── Text colors ───────────────────────────────────────────────────────────────
/** Primary body text */
export const COLOR_TEXT_MAIN = '#1E293B';

/** Labels, secondary text, source citations */
export const COLOR_TEXT_MUTED = '#64748B';

// ── Semantic status colors ────────────────────────────────────────────────────
/** Verified, positive values, funded reserve */
export const COLOR_SUCCESS = '#10B981';

/** HIGH severity, critical alerts */
export const COLOR_DANGER = '#EF4444';

/** MEDIUM severity, warnings, pending items */
export const COLOR_WARNING = '#F59E0B';

// ── Structural colors ─────────────────────────────────────────────────────────
/** Card borders, dividers */
export const COLOR_BORDER = '#E2E8F0';

/** Subtle inner border (used in SummaryTab inline styles) */
export const COLOR_BORDER_SUBTLE = 'rgba(31, 18, 36, 0.08)';

// ── Severity badge semantic sets ──────────────────────────────────────────────
export const SEVERITY = {
  HIGH: {
    text:       '#B91C1C',
    bg:         '#FEE2E2',
    border:     '#EF4444',
    cardBg:     '#FEF2F2',
    accent:     COLOR_DANGER,
  },
  MEDIUM: {
    text:       '#92400E',
    bg:         '#FEF3C7',
    border:     '#F59E0B',
    cardBg:     '#FFFBEB',
    accent:     COLOR_WARNING,
  },
  LOW: {
    text:       '#64748B',
    bg:         '#E2E8F0',
    border:     '#CBD5E1',
    cardBg:     '#F8FAFC',
    accent:     COLOR_TEXT_MUTED,
  },
} as const;

export const STATUS = {
  FOUND:     COLOR_SUCCESS,
  'N/A':     COLOR_SUCCESS,
  UNCLEAR:   COLOR_WARNING,
  NOT_FOUND: COLOR_DANGER,
} as const;

// ── Spacing scale (px values used in SummaryTab inline styles) ────────────────
export const SPACE_XS  =  4;
export const SPACE_SM  =  8;
export const SPACE_MD  = 12;
export const SPACE_LG  = 16;
export const SPACE_XL  = 20;
export const SPACE_2XL = 24;
export const SPACE_3XL = 32;

// ── Border radius ─────────────────────────────────────────────────────────────
export const RADIUS_SM = '4px';
export const RADIUS_MD = '8px';
export const RADIUS_LG = '12px';
export const RADIUS_XL = '16px';

// ── Shadows ───────────────────────────────────────────────────────────────────
export const SHADOW_SM   = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
export const SHADOW_MD   = '0 4px 12px rgba(0,0,0,0.07)';
export const SHADOW_CARD_HOVER = '0 8px 24px rgba(0,0,0,0.08)';

// ── Typography ────────────────────────────────────────────────────────────────
export const FONT_SIZE_EYEBROW = '11px';
export const FONT_SIZE_BODY    = '13px';
export const FONT_SIZE_TITLE   = '14px';
export const FONT_SIZE_VALUE   = '22px';
export const FONT_SIZE_STAT    = '28px';

export const LETTER_SPACING_EYEBROW = '0.08em';
export const LETTER_SPACING_WIDE    = '0.12em';
