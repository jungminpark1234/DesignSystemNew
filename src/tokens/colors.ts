// ============================================================
// Color Tokens — makinarocks_new_design_system
// Source: Figma > Semantic:color (light mode)
// ============================================================

// ------------------------------------------------------------------
// Primitive palette (subset — full set in primitive:color collection)
// ------------------------------------------------------------------
export const primitiveColors = {
  transparent: "transparent",
  black: "#000000",
  white: "#ffffff",

  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5dc",
    400: "#99a1af",
    500: "#6a7282",
    600: "#4a5565",
    700: "#364153",
    750: "#2d3748",  // between 700–800 — dark mode elevated panels
    800: "#1e2939",
    900: "#101828",
    950: "#030712",
  },

  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bedbff",
    300: "#8eb8fd",
    400: "#51a2ff",
    500: "#2b7fff",
    600: "#155dfc",
    700: "#1447e6",
    800: "#193cb8",
    900: "#1b398a",
    925: "#0b2641",  // sky-tinted ~15% L — dark mode info subtle bg
    950: "#162456",
  },

  red: {
    50: "#fef2f2",
    100: "#ffe2e2",
    200: "#ffc9c9",
    300: "#ffa2a2",
    400: "#ff6467",
    500: "#fb2c36",
    600: "#e7000b",
    700: "#c10007",
    800: "#9f0712",
    900: "#82181a",
    950: "#460809",
  },

  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#b9f8cf",
    300: "#7bf1a8",
    400: "#05df72",
    500: "#00c950",
    600: "#00a63e",
    700: "#008236",
    800: "#016630",
    900: "#0d542a",
    925: "#0d3f1e",  // hsl(140°, 65%, 15%) — dark mode success subtle bg
    950: "#033015",
  },

  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7a8",
    500: "#ff6900",
    600: "#f0a000",
    700: "#d08b00",
  },

  yellow: {
    50: "#fefce8",
    100: "#fef7e8",
    500: "#f0a000",
    900: "#4a3500",  // hsl(43°, 100%, 14.5%) — dark mode warning subtle bg
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Text
// ------------------------------------------------------------------
export const colorText = {
  primary: "#101828",
  secondary: "#364153",
  tertiary: "#6a7282",
  disabled: "#99a1af",
  inverse: "#ffffff",
  info: "#0084d1",
  warning: "#d08b00",
  success: "#00a63e",
  danger: "#e7000b",
  interactive: {
    runwayPrimary: "#155dfc",
    runwayPrimaryHovered: "#1447e6",
    runwayPrimaryPressed: "#193cb8",
    runwaySelected: "#155dfc",
    runwayVisited: "#9810fa",
    secondary: "#4a5565",
    secondaryHovered: "#364153",
    secondaryPressed: "#1e2939",
    dangerDefault: "#e7000b",
    dangerHovered: "#c10007",
    dangerPressed: "#9f0712",
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Icon
// ------------------------------------------------------------------
export const colorIcon = {
  primary: "#101828",
  secondary: "#364153",
  disabled: "#99a1af",
  inverse: "#ffffff",
  info: "#0084d1",
  warning: "#d08b00",
  success: "#00a63e",
  danger: "#e7000b",
  interactive: {
    runwayPrimary: "#155dfc",
    runwayPrimaryHovered: "#1447e6",
    runwayPrimaryPressed: "#193cb8",
    runwaySelected: "#dbeafe",
    runwayVisited: "#9810fa",
    secondary: "#4a5565",
    secondaryHovered: "#364153",
    secondaryPressed: "#1e2939",
    dangerDefault: "#e7000b",
    dangerHovered: "#c10007",
    dangerPressed: "#9f0712",
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Background
// ------------------------------------------------------------------
export const colorBg = {
  primary: "#ffffff",
  secondary: "#f9fafb",
  tertiary: "#f3f4f6",
  tertiaryHovered: "#eeeff2",
  neutral: "#d1d5dc",
  runway: "#155dfc",
  drawx: "#4f39f6",
  disabled: "#e5e7eb",
  inverseBold: "#364153",
  inverseBolder: "#1e2939",
  infoSubtle: "#f0f9ff",
  info: "#0084d1",
  warningSubtle: "#fef7e8",
  warning: "#f0a000",
  successSubtle: "#f0fdf4",
  success: "#00a63e",
  dangerSubtle: "#fef2f2",
  danger: "#e7000b",
  interactive: {
    runwayPrimary: "#155dfc",
    runwayPrimaryHovered: "#1447e6",
    runwayPrimaryPressed: "#193cb8",
    drawxPrimary: "#4f39f6",
    drawxPrimaryHovered: "#432dd7",
    drawxPrimaryPressed: "#372aac",
    secondary: "#ffffff",
    secondaryHovered: "#f9fafb",
    secondaryPressed: "#f3f4f6",
    neutral: "#d1d5dc",
    neutralHovered: "#99a1af",
    neutralPressed: "#6a7282",
    danger: "#e7000b",
    dangerHovered: "#c10007",
    dangerPressed: "#9f0712",
    runwaySelected: "#eff6ff",
    runwaySelectedHovered: "#dbeafe",
    runwaySelectedPressed: "#bedbff",
    drawxSelected: "#e0e7ff",
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Border
// ------------------------------------------------------------------
export const colorBorder = {
  primary: "#99a1af",
  secondary: "#e5e7eb",
  tertiary: "#f3f4f6",
  disabled: "#d1d5dc",
  inverseBorder: "#1e2939",
  runwayFocusRing: "#155dfc",
  drawxFocusRing: "#4f39f6",
  infoSubtle: "#f0f9ff",
  info: "#0084d1",
  warningSubtle: "#fef7e8",
  warning: "#f0a000",
  successSubtle: "#f0fdf4",
  success: "#00a63e",
  dangerSubtle: "#fef2f2",
  danger: "#e7000b",
  interactive: {
    runwayPrimary: "#155dfc",
    runwayPrimaryHovered: "#1447e6",
    runwayPrimaryPressed: "#193cb8",
    drawxPrimary: "#4f39f6",
    drawxPrimaryHovered: "#432dd7",
    drawxPrimaryPressed: "#372aac",
    secondaryButton: "#6a7282",
    secondaryButtonHovered: "#4a5565",
    secondaryButtonPressed: "#364153",
    secondary: "#e5e7eb",
    secondaryHovered: "#d1d5dc",
    secondaryPressed: "#99a1af",
    danger: "#e7000b",
    dangerHovered: "#c10007",
    dangerPressed: "#9f0712",
  },
} as const;

export const colors = {
  primitive: primitiveColors,
  text: colorText,
  icon: colorIcon,
  bg: colorBg,
  border: colorBorder,
} as const;

export default colors;
