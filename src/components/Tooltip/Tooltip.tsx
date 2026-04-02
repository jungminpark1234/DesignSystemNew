import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
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
  /** Placement relative to trigger */
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
  const [style, setStyle] = useState<React.CSSProperties>({ position: "fixed", opacity: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const isDark = tooltipStyle === "default";
  const bg = isDark ? colorBg.inverseBolder : colorBg.secondary;
  const textColor = isDark ? colorText.inverse : colorText.primary;
  const shadow = "0 4px 8px rgba(0,0,0,0.16), 0 0 4px rgba(0,0,0,0.12)";
  const border = isDark ? "none" : `1px solid ${colorBorder.secondary}`;

  const computePos = useCallback(() => {
    if (!triggerRef.current || !tipRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const t = tipRef.current.getBoundingClientRect();
    const gap = 8;
    const pad = 24;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    const isAbove = direction.startsWith("above") || direction === "none";
    const isBelow = direction.startsWith("below");
    const isStart = direction.startsWith("start");
    const isEnd = direction.startsWith("end");

    let top = 0;
    let left = 0;

    // Vertical
    if (isAbove) top = r.top - gap - t.height;
    else if (isBelow) top = r.bottom + gap;
    else if (direction.endsWith("top")) top = r.top;
    else if (direction.endsWith("bottom")) top = r.bottom - t.height;
    else top = r.top + r.height / 2 - t.height / 2;

    // Horizontal
    if (direction.endsWith("left")) left = r.left;
    else if (direction.endsWith("right")) left = r.right - t.width;
    else if (direction.endsWith("center") || direction === "none") left = r.left + r.width / 2 - t.width / 2;
    else if (isStart) left = r.left - gap - t.width;
    else if (isEnd) left = r.right + gap;

    // Clamp to viewport
    if (left + t.width > vw - pad) left = vw - pad - t.width;
    if (left < pad) left = pad;
    if (top + t.height > vh - pad) top = vh - pad - t.height;
    if (top < pad) top = pad;

    setStyle({ position: "fixed", zIndex: 1100, pointerEvents: "none", top, left, opacity: 1 });
  }, [direction]);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setStyle(s => ({ ...s, opacity: 0 }));
  };

  useEffect(() => {
    if (visible) requestAnimationFrame(() => computePos());
  }, [visible, computePos]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const popupStyle: React.CSSProperties = {
    backgroundColor: bg,
    color: textColor,
    border,
    borderRadius: borderRadius.lg,
    boxShadow: shadow,
    padding: 12,
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    whiteSpace: "pre-wrap",
    maxWidth: 280,
    boxSizing: "border-box",
  };

  return (
    <span
      ref={triggerRef}
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible &&
        ReactDOM.createPortal(
          <div ref={tipRef} style={style} role="tooltip" className={className}>
            <div style={popupStyle}>{content}</div>
          </div>,
          document.body
        )}
    </span>
  );
};

Tooltip.displayName = "Tooltip";
export default Tooltip;
