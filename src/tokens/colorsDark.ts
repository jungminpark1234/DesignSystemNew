// ============================================================
// Color Tokens — makinarocks_new_design_system  (DARK MODE)
// ============================================================
//
// WCAG 2.1 key contrast ratios (bg.primary = gray.900 as base):
//   text.primary  (gray.50)   ≈ 17.6:1  ✓ AAA
//   text.secondary(gray.300)  ≈ 12.0:1  ✓ AAA
//   text.tertiary  (gray.400) ≈  6.3:1  ✓ AA
//   text.disabled  (gray.600) ≈  2.7:1  — disabled elements exempt (WCAG 1.4.3)
//   interactive blue(blue.400)≈  6.1:1  ✓ AA
//   danger text  (red.400)    ≈  6.4:1  ✓ AA
//   success text (green.400)  ≈ 11.2:1  ✓ AAA
//   warning text (yellow.500) ≈  9.3:1  ✓ AAA
//   white on runway button (blue.600) ≈ 5.2:1 ✓ AA
// ============================================================

import { primitiveColors as p } from './colors';

// ------------------------------------------------------------------
// Semantic — Text  (dark)
// ------------------------------------------------------------------
export const colorTextDark = {
  primary:   p.gray[50],       // 17.6:1 on bg.primary ✓ AAA
  secondary: p.gray[300],      // 12.0:1 ✓ AAA
  tertiary:  p.gray[400],      //  6.3:1 ✓ AA
  disabled:  p.gray[600],      // intentionally low contrast (disabled = non-interactive)
  inverse:   p.white,          // always white — on brand/colored surfaces (buttons, avatar, workspace logo)
  info:      "#38bdf8",        // sky-300  —  8.5:1 ✓ AAA
  warning:   p.yellow[500],    //  9.3:1 ✓ AAA
  success:   p.green[400],     // 11.2:1 ✓ AAA
  danger:    p.red[400],       //  6.4:1 ✓ AA
  interactive: {
    runwayPrimary:        p.blue[400],    // 6.1:1 ✓ AA  (was blue.600 in light)
    runwayPrimaryHovered: p.blue[300],    // 11.0:1 ✓ AAA
    runwayPrimaryPressed: p.blue[200],    // 15.2:1 ✓ AAA
    runwaySelected:       p.blue[400],
    runwayVisited:        "#c084fc",      // purple-400 — 7.2:1 ✓ AAA
    secondary:            p.gray[300],   // 12.0:1 ✓ AAA
    secondaryHovered:     p.gray[200],   // 14.4:1 ✓ AAA
    secondaryPressed:     p.gray[100],   // 17.0:1 ✓ AAA
    dangerDefault:        p.red[400],    //  6.4:1 ✓ AA
    dangerHovered:        p.red[500],    //  4.0:1 ✓ AA (large/bold)
    dangerPressed:        p.red[600],    //  2.4:1 — pressed, brief
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Icon  (dark)
// ------------------------------------------------------------------
export const colorIconDark = {
  primary:   p.gray[50],
  secondary: p.gray[300],
  disabled:  p.gray[600],
  inverse:   p.white,          // always white — on brand/colored surfaces
  info:      "#38bdf8",        // sky-300
  warning:   p.yellow[500],
  success:   p.green[400],
  danger:    p.red[400],
  interactive: {
    runwayPrimary:        p.blue[400],
    runwayPrimaryHovered: p.blue[300],
    runwayPrimaryPressed: p.blue[200],
    runwaySelected:       p.blue[200],
    runwayVisited:        "#c084fc",
    secondary:            p.gray[300],
    secondaryHovered:     p.gray[200],
    secondaryPressed:     p.gray[100],
    dangerDefault:        p.red[400],
    dangerHovered:        p.red[500],
    dangerPressed:        p.red[600],
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Background  (dark)
// ------------------------------------------------------------------
export const colorBgDark = {
  primary:         p.gray[900],     // main app background
  secondary:       p.gray[800],     // sidebar, navigation panels
  tertiary:        p.gray[750],     // cards, section panels
  neutral:         p.gray[700],     // neutral fills (e.g. switch off)
  runway:          p.blue[600],     // brand blue — white text = 5.2:1 ✓
  drawx:           "#4f39f6",
  disabled:        p.gray[800],
  inverseBold:     p.gray[200],     // inverse surface (light bg in dark theme)
  inverseBolder:   p.gray[100],
  infoSubtle:      p.blue[925],     // sky-tinted ~15% L  ✓
  info:            "#0369a1",
  warningSubtle:   p.yellow[900],   // hsl(43°, 100%, 14.5%) ~15% L  ✓
  warning:         "#d08b00",
  successSubtle:   p.green[925],    // hsl(140°, 65%, 15%) ~15% L  ✓
  success:         p.green[800],
  dangerSubtle:    p.red[950],      // hsl(358°, ~60%, 15.3%) ~15% L  ✓
  danger:          p.red[700],
  interactive: {
    runwayPrimary:          p.blue[600],    // brand btn bg — white on it = 5.2:1 ✓
    runwayPrimaryHovered:   p.blue[700],
    runwayPrimaryPressed:   p.blue[800],
    drawxPrimary:           "#4f39f6",
    drawxPrimaryHovered:    "#432dd7",
    drawxPrimaryPressed:    "#372aac",
    secondary:              p.gray[800],
    secondaryHovered:       p.gray[750],
    secondaryPressed:       p.gray[700],
    neutral:                p.gray[700],
    neutralHovered:         p.gray[600],
    neutralPressed:         p.gray[500],
    danger:                 p.red[600],
    dangerHovered:          p.red[700],
    dangerPressed:          p.red[800],
    runwaySelected:         p.blue[950],    // dark selected bg
    runwaySelectedHovered:  p.blue[900],
    runwaySelectedPressed:  p.blue[800],
    drawxSelected:          "#1e1b4b",
  },
} as const;

// ------------------------------------------------------------------
// Semantic — Border  (dark)
// ------------------------------------------------------------------
export const colorBorderDark = {
  primary:       p.gray[600],    // 3:1+ visible border ✓
  secondary:     p.gray[750],    // subtle dividers
  tertiary:      p.gray[800],    // near-invisible hairlines
  disabled:      p.gray[750],
  inverseBorder: p.gray[300],    // border on inverse surfaces
  runwayFocusRing: p.blue[400],  // 6.1:1 on bg.primary ✓ AA (focus visible)
  drawxFocusRing:  "#7c6af5",
  infoSubtle:    p.blue[925],
  info:          "#0369a1",
  warningSubtle: p.yellow[900],
  warning:       "#d08b00",
  successSubtle: p.green[925],
  success:       p.green[800],
  dangerSubtle:  p.red[950],
  danger:        p.red[700],
  interactive: {
    runwayPrimary:          p.blue[400],
    runwayPrimaryHovered:   p.blue[300],
    runwayPrimaryPressed:   p.blue[200],
    drawxPrimary:           "#7c6af5",
    drawxPrimaryHovered:    "#a89cfa",
    drawxPrimaryPressed:    "#c4bcfc",
    secondaryButton:        p.gray[400],   // ghost/outline button border
    secondaryButtonHovered: p.gray[300],
    secondaryButtonPressed: p.gray[200],
    secondary:              p.gray[750],
    secondaryHovered:       p.gray[700],
    secondaryPressed:       p.gray[600],
    danger:                 p.red[400],
    dangerHovered:          p.red[500],
    dangerPressed:          p.red[600],
  },
} as const;

export const colorsDark = {
  text:   colorTextDark,
  icon:   colorIconDark,
  bg:     colorBgDark,
  border: colorBorderDark,
} as const;

export default colorsDark;
