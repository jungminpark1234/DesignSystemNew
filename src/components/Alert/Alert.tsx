import React from "react";
import { colorText, colorIcon, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Status × Style token map
// ──────────────────────────────────────────────────────────────────────────────
type StatusToken = {
  subtle:      { bg: string; text: string; iconColor: string };
  filled:      { bg: string; text: string; iconColor: string };
  outlined:    { bg: string; border: string; text: string; iconColor: string };
  transparent: { bg: string; text: string; iconColor: string };
};

const STATUS_TOKENS: Record<AlertStatus, StatusToken> = {
  brand: {
    subtle:      { bg: colorBg.interactive.runwaySelected, text: colorText.primary, iconColor: colorIcon.interactive.runwayPrimary },
    filled:      { bg: colorBg.interactive.runwayPrimary, text: colorText.inverse, iconColor: colorIcon.inverse },
    outlined:    { bg: colorBg.primary, border: colorBorder.interactive.runwayPrimary, text: colorText.primary, iconColor: colorIcon.interactive.runwayPrimary },
    transparent: { bg: "transparent", text: colorText.primary, iconColor: colorIcon.interactive.runwayPrimary },
  },
  neutral: {
    subtle:      { bg: colorBg.tertiary, text: colorText.primary, iconColor: colorIcon.secondary },
    filled:      { bg: colorBg.inverseBold, text: colorText.inverse, iconColor: colorIcon.inverse },
    outlined:    { bg: colorBg.primary, border: colorBorder.interactive.secondaryButton, text: colorText.primary, iconColor: colorIcon.secondary },
    transparent: { bg: "transparent", text: colorText.primary, iconColor: colorIcon.secondary },
  },
  info: {
    subtle:      { bg: colorBg.infoSubtle, text: colorText.primary, iconColor: colorIcon.info },
    filled:      { bg: colorBg.info, text: colorText.inverse, iconColor: colorIcon.inverse },
    outlined:    { bg: colorBg.primary, border: colorBorder.info, text: colorText.primary, iconColor: colorIcon.info },
    transparent: { bg: "transparent", text: colorText.primary, iconColor: colorIcon.info },
  },
  success: {
    subtle:      { bg: colorBg.successSubtle, text: colorText.primary, iconColor: colorIcon.success },
    filled:      { bg: colorBg.success, text: colorText.inverse, iconColor: colorIcon.inverse },
    outlined:    { bg: colorBg.primary, border: colorBorder.success, text: colorText.primary, iconColor: colorIcon.success },
    transparent: { bg: "transparent", text: colorText.primary, iconColor: colorIcon.success },
  },
  warning: {
    subtle:      { bg: colorBg.warningSubtle, text: colorText.primary, iconColor: colorIcon.warning },
    filled:      { bg: colorBg.warning, text: colorText.inverse, iconColor: colorIcon.inverse },
    outlined:    { bg: colorBg.primary, border: colorBorder.warning, text: colorText.primary, iconColor: colorIcon.warning },
    transparent: { bg: "transparent", text: colorText.primary, iconColor: colorIcon.warning },
  },
  error: {
    subtle:      { bg: colorBg.dangerSubtle, text: colorText.primary, iconColor: colorIcon.danger },
    filled:      { bg: colorBg.danger, text: colorText.inverse, iconColor: colorIcon.inverse },
    outlined:    { bg: colorBg.dangerSubtle, border: colorBorder.danger, text: colorText.primary, iconColor: colorIcon.danger },
    transparent: { bg: "transparent", text: colorText.primary, iconColor: colorIcon.danger },
  },
};

// Default status icons using Icon component
const STATUS_ICON_NAMES: Record<AlertStatus, string> = {
  brand:   "star-filled",
  neutral: "info-circle-stroke",
  info:    "info-fill",
  success: "success-fill",
  warning: "waring-fill",
  error:   "error-fill",
};

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type AlertStatus  = "brand" | "neutral" | "info" | "success" | "warning" | "error";
export type AlertStyle   = "subtle" | "filled" | "outlined" | "transparent";
export type AlertVariant = "title-desc" | "desc";   // Title+Desc vs Desc only

export interface AlertProps {
  /** Semantic status — drives colors and default icon */
  status?: AlertStatus;
  /** Visual style */
  alertStyle?: AlertStyle;
  /** Whether to show title + description or description only */
  variant?: AlertVariant;
  /** Title text (shown only for title-desc variant) */
  title?: string;
  /** Description / body text */
  description?: string;
  /** Override the leading icon (pass `null` to hide) */
  icon?: React.ReactNode | null;
  /** Show the dismiss (×) button */
  dismissible?: boolean;
  /** Called when dismiss button is clicked */
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Alert: React.FC<AlertProps> = ({
  status = "brand",
  alertStyle = "subtle",
  variant = "title-desc",
  title = "Label",
  description = "Label",
  icon,
  dismissible = true,
  onDismiss,
  className,
  style,
}) => {
  const tok = STATUS_TOKENS[status][alertStyle];
  const showIcon = icon !== null;
  const resolvedIcon = icon !== undefined
    ? icon
    : <Icon name={STATUS_ICON_NAMES[status]} size={24} color={tok.iconColor} />;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: 8,
    alignItems: variant === "desc" ? "center" : "flex-start",
    minWidth: 320,
    padding: 16,
    borderRadius: borderRadius["2xl"],
    backgroundColor: tok.bg,
    border: alertStyle === "outlined" ? `1px solid ${"border" in tok ? tok.border : "transparent"}` : "none",
    boxSizing: "border-box",
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    lineHeight: "24px",
    color: tok.text,
    whiteSpace: "nowrap",
  };

  const descStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    color: alertStyle === "filled" ? "rgba(255,255,255,0.85)" : colorText.secondary,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: 24,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    color: tok.text,
    opacity: 0.7,
  };

  return (
    <div className={className} style={containerStyle} role="alert">
      {/* Leading icon */}
      {showIcon && (
        <span style={{ color: tok.iconColor, flexShrink: 0, display: "inline-flex", width: 24, height: 24 }}>
          {resolvedIcon}
        </span>
      )}

      {/* Content */}
      <div style={{ flex: "1 0 0", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        {variant === "title-desc" && (
          <p style={titleStyle}>{title}</p>
        )}
        <p style={descStyle}>{description}</p>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          style={closeButtonStyle}
          onClick={onDismiss}
        >
          <Icon name="xonly" size={24} color={tok.text} />
        </button>
      )}
    </div>
  );
};

Alert.displayName = "Alert";
export default Alert;
