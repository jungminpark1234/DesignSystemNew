import React, { useEffect, useRef, useState } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type TooltipDirection =
  | "above-left"
  | "above-center"
  | "above-right"
  | "below-left"
  | "below-center"
  | "below-right"
  | "start-top"
  | "start-middle"
  | "start-bottom"
  | "end-top"
  | "end-middle"
  | "end-bottom"
  | "none";

export type TooltipStyle = "default" | "inverse";

export interface TooltipProps {
  /** Tooltip content text */
  content: string;
  /** Arrow direction */
  direction?: TooltipDirection;
  /** Visual style: default = dark, inverse = light */
  tooltipStyle?: TooltipStyle;
  /** Trigger element */
  children: React.ReactNode;
  /** Delay before showing (ms). Default: 200 */
  delay?: number;
  className?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Arrow SVG (8 × 8 rotated square)
// ──────────────────────────────────────────────────────────────────────────────
function Arrow({
  direction,
  bg,
}: {
  direction: TooltipDirection;
  bg: string;
}) {
  if (direction === "none") return null;

  const isAbove = direction.startsWith("above");
  const isBelow = direction.startsWith("below");
  const isStart = direction.startsWith("start");
  const isEnd   = direction.startsWith("end");

  const arrowSize = 10;
  const half = arrowSize / 2;

  // For above/below: horizontal arrow; for start/end: vertical arrow
  const isHorizontal = isAbove || isBelow;

  const wrapperStyle: React.CSSProperties = isHorizontal
    ? {
        display: "flex",
        justifyContent:
          direction.endsWith("left")   ? "flex-start" :
          direction.endsWith("right")  ? "flex-end"   : "center",
        width: "100%",
        order: isAbove ? 1 : -1,
      }
    : {
        display: "flex",
        flexDirection: "column",
        justifyContent:
          direction.endsWith("top")    ? "flex-start" :
          direction.endsWith("bottom") ? "flex-end"   : "center",
        height: "100%",
        order: isStart ? 1 : -1,
      };

  const squareStyle: React.CSSProperties = {
    width: arrowSize,
    height: arrowSize,
    backgroundColor: bg,
    transform: "rotate(45deg)",
    borderRadius: 2,
    flexShrink: 0,
    margin: isAbove ? `-${half}px 8px 0` :
            isBelow ? `0 8px -${half}px` :
            isStart ? `0 -${half}px 0 0` :
                      `0 0 0 -${half}px`,
  };

  return (
    <span style={wrapperStyle}>
      <span style={squareStyle} />
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  direction = "above-center",
  tooltipStyle = "default",
  children,
  delay = 200,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = tooltipStyle === "default";
  const bg     = isDark ? colorBg.inverseBolder : colorBg.primary;
  const textColor = isDark ? colorText.inverse : colorText.primary;
  const shadow = isDark
    ? "0 4px 8px rgba(0,0,0,0.16), 0 0 4px rgba(0,0,0,0.12)"
    : "0 4px 8px rgba(0,0,0,0.10), 0 0 4px rgba(0,0,0,0.08)";
  const border = isDark ? "none" : `1px solid ${colorBorder.secondary}`;

  const isAbove = direction.startsWith("above");
  const isBelow = direction.startsWith("below");
  const isStart = direction.startsWith("start");
  const isEnd   = direction.startsWith("end");

  const tooltipPositionStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 1100,
    // Vertical placement
    ...(isAbove && { bottom: "calc(100% + 4px)" }),
    ...(isBelow && { top:    "calc(100% + 4px)" }),
    // Horizontal placement
    ...(direction.endsWith("left")   && { left: 0 }),
    ...(direction.endsWith("right")  && { right: 0 }),
    ...(direction.endsWith("center") && { left: "50%", transform: "translateX(-50%)" }),
    // Side placements
    ...(isStart && { right: "calc(100% + 4px)" }),
    ...(isEnd   && { left:  "calc(100% + 4px)" }),
    ...(direction.endsWith("top")    && { top: 0 }),
    ...(direction.endsWith("bottom") && { bottom: 0 }),
    ...(direction.endsWith("middle") && { top: "50%", transform: "translateY(-50%)" }),
    // None — centered above
    ...(direction === "none" && {
      bottom: "calc(100% + 4px)",
      left: "50%",
      transform: "translateX(-50%)",
    }),
  };

  const isHorizontal = isAbove || isBelow || direction === "none";

  const popupStyle: React.CSSProperties = {
    display: isHorizontal ? "flex" : "inline-flex",
    flexDirection: isHorizontal ? "column" : "row",
    alignItems: "center",
    backgroundColor: bg,
    color: textColor,
    border,
    borderRadius: borderRadius.lg,
    boxShadow: shadow,
    padding: "8px 12px",
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    maxWidth: 280,
    boxSizing: "border-box",
  };

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span style={tooltipPositionStyle} role="tooltip" className={className}>
          <span style={popupStyle}>
            {isAbove && <Arrow direction={direction} bg={bg} />}
            {isStart && <Arrow direction={direction} bg={bg} />}
            <span style={{ padding: "0 2px" }}>{content}</span>
            {isBelow && <Arrow direction={direction} bg={bg} />}
            {isEnd   && <Arrow direction={direction} bg={bg} />}
            {direction === "none" && null}
          </span>
        </span>
      )}
    </span>
  );
};

Tooltip.displayName = "Tooltip";
export default Tooltip;
