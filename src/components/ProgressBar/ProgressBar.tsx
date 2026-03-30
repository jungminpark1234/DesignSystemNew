import React from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface ProgressBarProps {
  /** Progress value 0–100 */
  value?: number;
  /** Show label + percentage text above the bar */
  showLabel?: boolean;
  /** Label text */
  label?: string;
  /** Show help message below the bar */
  helpMessage?: string;
  /** Error state — changes bar color to red */
  isError?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  showLabel = false,
  label,
  helpMessage,
  isError = false,
  className,
  style,
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor = isError ? colorBg.danger : clamped === 100 ? colorBg.success : colorBg.interactive.runwayPrimary;

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    ...style,
  };

  const trackStyle: React.CSSProperties = {
    width: "100%",
    height: 8,
    borderRadius: 9999,
    backgroundColor: colorBg.neutral,
    overflow: "hidden",
    position: "relative",
  };

  const fillStyle: React.CSSProperties = {
    height: "100%",
    width: `${clamped}%`,
    borderRadius: 9999,
    backgroundColor: barColor,
    transition: "width 0.3s ease",
  };

  const labelRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.medium,
    lineHeight: "16px",
    color: colorText.primary,
  };

  const percentStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    color: colorText.tertiary,
  };

  const helpStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: fontWeight.medium,
    lineHeight: "16px",
    color: isError ? colorText.danger : colorText.tertiary,
    height: 16,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  return (
    <div className={className} style={wrapperStyle}>
      {showLabel && (
        <div style={labelRowStyle}>
          <span style={labelStyle}>{label ?? "Label"}</span>
          <span style={percentStyle}>{clamped}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={trackStyle}
      >
        <div style={fillStyle} />
      </div>

      {helpMessage && (
        <span style={helpStyle}>{helpMessage}</span>
      )}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
export default ProgressBar;
