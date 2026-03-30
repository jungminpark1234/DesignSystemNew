import React from "react";
import { colorBg, colorText, primitiveColors } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type BadgeType = "dot" | "number" | "text";
export type BadgeStatus = "neutral" | "info" | "warning" | "success" | "error";

export interface BadgeProps {
  /** Visual type */
  type?: BadgeType;
  /** Status variant — controls color */
  status?: BadgeStatus;
  /** Text or number to display (for type "number" or "text") */
  label?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Token map
// ──────────────────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<BadgeStatus, { bg: string; color: string }> = {
  neutral:  { bg: colorBg.inverseBolder, color: colorText.inverse },
  info:     { bg: colorBg.info, color: colorText.inverse },
  warning:  { bg: colorBg.warning, color: colorText.inverse },
  success:  { bg: colorBg.success, color: colorText.inverse },
  error:    { bg: colorBg.danger, color: colorText.inverse },
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Badge: React.FC<BadgeProps> = ({
  type = "number",
  status = "neutral",
  label = "1",
  className,
  style,
}) => {
  const { bg, color } = STATUS_COLORS[status];

  // Dot badge
  if (type === "dot") {
    return (
      <span
        className={className}
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: bg,
          flexShrink: 0,
          ...style,
        }}
        aria-label={status}
      />
    );
  }

  // Number / Text badge
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 20,
        padding: type === "text" ? "0 6px" : "0 4px",
        borderRadius: borderRadius.rounded,
        backgroundColor: bg,
        color,
        fontFamily: fontFamily.body,
        fontSize: 10,
        fontWeight: fontWeight.medium,
        lineHeight: "16px",
        whiteSpace: "nowrap",
        flexShrink: 0,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {label}
    </span>
  );
};

Badge.displayName = "Badge";
export default Badge;
