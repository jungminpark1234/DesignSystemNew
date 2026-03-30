// ============================================================
// Spacing & Appearance Tokens — makinarocks_new_design_system
// Source: Figma > Semantic:appearance
// ============================================================

export const spacing = {
  0: "0px",
  1: "1px",
  2: "2px",
  4: "4px",
  8: "8px",
  12: "12px",
  16: "16px",
  24: "24px",
  32: "32px",
  40: "40px",
  48: "48px",
  64: "64px",
} as const;

export type SpacingKey = keyof typeof spacing;

// ------------------------------------------------------------------
// Border Radius
// ------------------------------------------------------------------
export const borderRadius = {
  sm: "2px",
  md: "4px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "24px",
  rounded: "9999px",
} as const;

// ------------------------------------------------------------------
// Border Width
// ------------------------------------------------------------------
export const borderWidth = {
  sm: "1px",
  md: "2px",
  lg: "4px",
} as const;

// ------------------------------------------------------------------
// Shadows
// ------------------------------------------------------------------
export const shadow = {
  2: "0px 1px 2px rgba(0,0,0,0.10), 0px 0px 1px rgba(0,0,0,0.06)",
  4: "0px 2px 4px rgba(0,0,0,0.10), 0px 0px 2px rgba(0,0,0,0.06)",
  8: "0px 4px 8px rgba(0,0,0,0.10), 0px 0px 4px rgba(0,0,0,0.06)",
  16: "0px 8px 16px rgba(0,0,0,0.10), 0px 0px 8px rgba(0,0,0,0.06)",
} as const;

export const appearance = { spacing, borderRadius, borderWidth, shadow } as const;
export default appearance;
