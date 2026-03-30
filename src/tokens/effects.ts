// ============================================================
// Effect Tokens — makinarocks_new_design_system
// Source: Figma > effects variables
//
// 각 shadow는 두 레이어로 구성됩니다:
//   core  — 요소에 가까운 subtle shadow  rgba(0,0,0,0.12)
//   cast  — 멀리 퍼지는 diffuse shadow  rgba(0,0,0,0.16)
// ============================================================

// ------------------------------------------------------------------
// Shadow primitive values
// ------------------------------------------------------------------

/** Shadow 색상 토큰 */
export const shadowColor = {
  core: "rgba(0, 0, 0, 0.12)",
  cast: "rgba(0, 0, 0, 0.16)",
} as const;

/** Shadow 레이어 단위 값 */
export const shadowLayers = {
  2: {
    core: { offsetX: 0, offsetY: 0, blur: 1, spread: 0, color: shadowColor.core },
    cast: { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: shadowColor.cast },
  },
  4: {
    core: { offsetX: 0, offsetY: 0, blur: 2, spread: 0, color: shadowColor.core },
    cast: { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: shadowColor.cast },
  },
  8: {
    core: { offsetX: 0, offsetY: 0, blur: 4, spread: 0, color: shadowColor.core },
    cast: { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: shadowColor.cast },
  },
  16: {
    core: { offsetX: 0, offsetY: 0, blur: 8,  spread: 0, color: shadowColor.core },
    cast: { offsetX: 0, offsetY: 8, blur: 16, spread: 0, color: shadowColor.cast },
  },
} as const;

// ------------------------------------------------------------------
// box-shadow CSS strings  (React inline style / CSS-in-JS)
// ------------------------------------------------------------------

/**
 * CSS `box-shadow` 값
 *
 * @example
 * <div style={{ boxShadow: boxShadow[4] }} />
 */
export const boxShadow = {
  2:  "0px 0px 1px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.16)",
  4:  "0px 0px 2px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.16)",
  8:  "0px 0px 4px rgba(0,0,0,0.12), 0px 4px 8px rgba(0,0,0,0.16)",
  16: "0px 0px 8px rgba(0,0,0,0.12), 0px 8px 16px rgba(0,0,0,0.16)",
} as const;

export type BoxShadowKey = keyof typeof boxShadow;

// ------------------------------------------------------------------
// filter: drop-shadow()  (SVG·투명 배경 요소에 적합)
// ------------------------------------------------------------------

/**
 * CSS `filter: drop-shadow()` 값
 * box-shadow와 달리 투명 영역을 포함한 실제 형태에 그림자를 적용합니다.
 *
 * @example
 * <div style={{ filter: dropShadow[4] }} />
 */
export const dropShadow = {
  /** drop-shadow는 단일 레이어 — cast(주 그림자) 기준 */
  2:  "drop-shadow(0px 1px 2px rgba(0,0,0,0.16))",
  4:  "drop-shadow(0px 2px 4px rgba(0,0,0,0.16))",
  8:  "drop-shadow(0px 4px 8px rgba(0,0,0,0.16))",
  16: "drop-shadow(0px 8px 16px rgba(0,0,0,0.16))",
} as const;

export type DropShadowKey = keyof typeof dropShadow;

// ------------------------------------------------------------------
// Tailwind CSS arbitrary values (참고용)
// ------------------------------------------------------------------

/**
 * Tailwind `shadow-[...]` 형식 문자열
 *
 * @example
 * <div className={tailwindShadow[4]} />
 */
export const tailwindShadow = {
  2:  "shadow-[0px_0px_1px_rgba(0,0,0,0.12),0px_1px_2px_rgba(0,0,0,0.16)]",
  4:  "shadow-[0px_0px_2px_rgba(0,0,0,0.12),0px_2px_4px_rgba(0,0,0,0.16)]",
  8:  "shadow-[0px_0px_4px_rgba(0,0,0,0.12),0px_4px_8px_rgba(0,0,0,0.16)]",
  16: "shadow-[0px_0px_8px_rgba(0,0,0,0.12),0px_8px_16px_rgba(0,0,0,0.16)]",
} as const;

// ------------------------------------------------------------------
// CSS custom properties (CSS Variables 방식으로 쓸 때)
// ------------------------------------------------------------------

/**
 * CSS 변수 선언 블록 — 글로벌 스타일시트에 삽입하세요.
 *
 * @example
 * // global.css 또는 :root 블록에 추가
 * injectShadowCssVars();
 */
export function getShadowCssVarDeclarations(): Record<string, string> {
  return {
    "--shadow-2":  boxShadow[2],
    "--shadow-4":  boxShadow[4],
    "--shadow-8":  boxShadow[8],
    "--shadow-16": boxShadow[16],
    "--drop-shadow-2":  dropShadow[2],
    "--drop-shadow-4":  dropShadow[4],
    "--drop-shadow-8":  dropShadow[8],
    "--drop-shadow-16": dropShadow[16],
  };
}

export const effects = {
  shadowColor,
  shadowLayers,
  boxShadow,
  dropShadow,
  tailwindShadow,
} as const;

export default effects;
