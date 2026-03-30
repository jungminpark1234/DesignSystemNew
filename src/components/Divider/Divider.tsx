import React from "react";
import { colorBorder } from "../../tokens/colors";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type DividerSize = "sm" | "md" | "lg";
export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  /** Line weight: sm = 1 px, md = 2 px, lg = 4 px */
  size?: DividerSize;
  /** Horizontal (default) or vertical divider */
  orientation?: DividerOrientation;
  /** Color override — defaults to colorBorder.secondary */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<DividerSize, number> = {
  sm: 1,
  md: 2,
  lg: 4,
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Divider: React.FC<DividerProps> = ({
  size = "sm",
  orientation = "horizontal",
  color = colorBorder.secondary,
  className,
  style,
}) => {
  const thickness = SIZE_MAP[size];

  const dividerStyle: React.CSSProperties =
    orientation === "horizontal"
      ? {
          display: "block",
          width: "100%",
          height: thickness,
          backgroundColor: color,
          border: "none",
          flexShrink: 0,
          ...style,
        }
      : {
          display: "inline-block",
          width: thickness,
          height: "100%",
          backgroundColor: color,
          border: "none",
          flexShrink: 0,
          alignSelf: "stretch",
          ...style,
        };

  return (
    <hr
      className={className}
      style={dividerStyle}
      aria-orientation={orientation}
      role="separator"
    />
  );
};

Divider.displayName = "Divider";
export default Divider;
