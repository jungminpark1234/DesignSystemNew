// ============================================================
// Grid System Tokens — makinarocks_new_design_system
// Source: Figma > grid system variables
//
// Breakpoints
//   mobile        320  ~ 767px   4cols  gutter=16  margin=16  fluid
//   tablet        768  ~ 1023px  8cols  gutter=24  margin=24  fluid
//   laptop        1024 ~ 1415px  12cols gutter=24  margin=24  fluid
//   desktopFluid  1416px+        12cols gutter=24  margin=24  fluid
//   desktopFixed  1416px+        12cols gutter=24  col=96px   center fixed
// ============================================================

// ------------------------------------------------------------------
// Breakpoint boundaries
// ------------------------------------------------------------------

export const breakpoints = {
  mobile: 320,
  tablet: 768,
  laptop: 1024,
  desktop: 1416,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** CSS min-width media query strings */
export const mediaQuery = {
  mobile:  `@media (min-width: ${breakpoints.mobile}px)`,
  tablet:  `@media (min-width: ${breakpoints.tablet}px)`,
  laptop:  `@media (min-width: ${breakpoints.laptop}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
} as const;

/** max-width 기준 (mobile-first 반대 방향에서 사용 시) */
export const mediaQueryMax = {
  mobile:  `@media (max-width: ${breakpoints.tablet - 1}px)`,
  tablet:  `@media (max-width: ${breakpoints.laptop - 1}px)`,
  laptop:  `@media (max-width: ${breakpoints.desktop - 1}px)`,
} as const;

// ------------------------------------------------------------------
// Grid config per breakpoint
// ------------------------------------------------------------------

export interface GridConfig {
  /** 프레임 최소 너비 (px) */
  minWidth: number;
  /** 프레임 최대 너비 (px) — undefined = fluid */
  maxWidth?: number;
  /** 컬럼 수 */
  columns: number;
  /** 컬럼 사이 간격 (px) */
  gutter: number;
  /** 좌우 여백 (px) — fixed 모드에서는 undefined */
  margin?: number;
  /** 고정 컬럼 너비 (px) — fixed 모드에서만 존재 */
  columnWidth?: number;
  /** 레이아웃 방식 */
  alignment: "stretch" | "center";
}

export const grid: Record<string, GridConfig> = {
  /** 320 ~ 767px */
  mobile: {
    minWidth: 320,
    maxWidth: 767,
    columns: 4,
    gutter: 16,
    margin: 16,
    alignment: "stretch",
  },
  /** 768 ~ 1023px */
  tablet: {
    minWidth: 768,
    maxWidth: 1023,
    columns: 8,
    gutter: 24,
    margin: 24,
    alignment: "stretch",
  },
  /** 1024 ~ 1415px */
  laptop: {
    minWidth: 1024,
    maxWidth: 1415,
    columns: 12,
    gutter: 24,
    margin: 24,
    alignment: "stretch",
  },
  /**
   * 1416px+ — Fluid
   * 컨테이너가 뷰포트를 꽉 채우며 margin으로 양쪽 여백 확보
   */
  desktopFluid: {
    minWidth: 1416,
    columns: 12,
    gutter: 24,
    margin: 24,
    alignment: "stretch",
  },
  /**
   * 1416px+ — Fixed
   * 컬럼 너비 96px 고정, 컨테이너를 중앙 정렬
   * maxContainerWidth = columns * columnWidth + (columns - 1) * gutter = 12*96 + 11*24 = 1416px
   */
  desktopFixed: {
    minWidth: 1416,
    columns: 12,
    gutter: 24,
    columnWidth: 96,
    alignment: "center",
  },
} as const;

// ------------------------------------------------------------------
// Derived helpers
// ------------------------------------------------------------------

/**
 * Fixed 레이아웃 최대 컨테이너 너비
 * 12 * 96px(column) + 11 * 24px(gutter) = 1416px
 */
export const maxContainerWidth = 1416;

/**
 * 브레이크포인트별 컨테이너 CSS inline style 반환
 *
 * @example
 * <div style={getContainerStyle('laptop')} />
 */
export function getContainerStyle(bp: keyof typeof grid): React.CSSProperties {
  const g = grid[bp];
  return {
    width: "100%",
    maxWidth: g.alignment === "center" ? `${maxContainerWidth}px` : undefined,
    marginLeft:  g.alignment === "center" ? "auto" : undefined,
    marginRight: g.alignment === "center" ? "auto" : undefined,
    paddingLeft:  g.margin !== undefined ? `${g.margin}px` : undefined,
    paddingRight: g.margin !== undefined ? `${g.margin}px` : undefined,
    boxSizing: "border-box",
  };
}

// ------------------------------------------------------------------
// CSS custom properties declarations
// ------------------------------------------------------------------

/**
 * 각 브레이크포인트의 CSS 변수 선언 반환
 *
 * @example
 * // global.css에 삽입
 * :root { --grid-columns: 4; --grid-gutter: 16px; --grid-margin: 16px; }
 */
export function getGridCssVarDeclarations(bp: keyof typeof grid): Record<string, string> {
  const g = grid[bp];
  return {
    "--grid-columns": String(g.columns),
    "--grid-gutter":  `${g.gutter}px`,
    "--grid-margin":  `${g.margin ?? 0}px`,
    ...(g.columnWidth ? { "--grid-column-width": `${g.columnWidth}px` } : {}),
  };
}

// ------------------------------------------------------------------
// Tailwind config helper (tailwind.config.ts screens 섹션)
// ------------------------------------------------------------------

/**
 * Tailwind `screens` 설정값
 *
 * @example
 * // tailwind.config.ts
 * import { tailwindScreens } from './src/tokens/grid';
 * export default { theme: { screens: tailwindScreens } }
 */
export const tailwindScreens = {
  sm:  `${breakpoints.mobile}px`,
  md:  `${breakpoints.tablet}px`,
  lg:  `${breakpoints.laptop}px`,
  xl:  `${breakpoints.desktop}px`,
} as const;

export default grid;
