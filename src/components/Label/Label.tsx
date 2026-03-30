import React from "react";
import { colorText } from "../../tokens/colors";
import { spacing } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type LabelType = "default" | "optional" | "required";

export interface LabelProps {
  /** Label text */
  children: React.ReactNode;
  /** Label variant */
  type?: LabelType;
  /** HTML `for` attribute linking to an input */
  htmlFor?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Label: React.FC<LabelProps> = ({
  children,
  type = "default",
  htmlFor,
  className,
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing[4],
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.medium,
    lineHeight: "16px",
    ...style,
  };

  const textStyle: React.CSSProperties = {
    color: colorText.primary,
    whiteSpace: "nowrap",
  };

  return (
    <label htmlFor={htmlFor} className={className} style={baseStyle}>
      <span style={textStyle}>{children}</span>

      {type === "optional" && (
        <span style={{ color: colorText.tertiary }}>(Optional)</span>
      )}

      {type === "required" && (
        <span
          style={{ color: colorText.danger }}
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  );
};

Label.displayName = "Label";
export default Label;
