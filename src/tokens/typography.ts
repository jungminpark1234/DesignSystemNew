// ============================================================
// Typography Tokens — makinarocks_new_design_system
// Source: Figma > typography variables
// ============================================================

export const fontFamily = {
  heading: "'Pretendard', sans-serif",
  body: "'Pretendard', sans-serif",
  mono: "'Source Code Pro', monospace",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

export const letterSpacing = {
  default: "0px",
} as const;

// ------------------------------------------------------------------
// Heading
// ------------------------------------------------------------------
export const heading = {
  "4xl": {
    fontSize: "64px",
    lineHeight: "72px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  "3xl": {
    fontSize: "56px",
    lineHeight: "64px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  "2xl": {
    fontSize: "48px",
    lineHeight: "56px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  xl: {
    fontSize: "36px",
    lineHeight: "48px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  lg: {
    fontSize: "28px",
    lineHeight: "32px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  md: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  sm: {
    fontSize: "20px",
    lineHeight: "24px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
  xs: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.heading,
    letterSpacing: letterSpacing.default,
  },
} as const;

// ------------------------------------------------------------------
// Body  (lg = 14px | md = 12px | sm = 10px)
// ------------------------------------------------------------------
export const body = {
  lg: {
    semibold: {
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    medium: {
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    regular: {
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: fontWeight.regular,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
  },
  md: {
    semibold: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    medium: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    regular: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: fontWeight.regular,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    mono: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: fontWeight.regular,
      fontFamily: fontFamily.mono,
      letterSpacing: letterSpacing.default,
    },
  },
  sm: {
    semibold: {
      fontSize: "10px",
      lineHeight: "16px",
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    medium: {
      fontSize: "10px",
      lineHeight: "16px",
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
    regular: {
      fontSize: "10px",
      lineHeight: "16px",
      fontWeight: fontWeight.regular,
      fontFamily: fontFamily.body,
      letterSpacing: letterSpacing.default,
    },
  },
} as const;

export const typography = { fontFamily, fontWeight, letterSpacing, heading, body } as const;
export default typography;
