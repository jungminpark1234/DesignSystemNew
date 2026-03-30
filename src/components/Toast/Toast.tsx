import React from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Status color tokens — border/bg tints per status
// ──────────────────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<ToastStatus, { bg: string; border: string; actionColor: string }> = {
  brand:   { bg: colorBg.interactive.runwaySelected, border: colorBorder.interactive.runwayPrimary, actionColor: colorText.interactive.runwayPrimary },
  neutral: { bg: colorBg.tertiary, border: colorBorder.interactive.secondaryButton, actionColor: colorText.secondary },
  info:    { bg: colorBg.infoSubtle, border: colorBorder.info, actionColor: colorText.info },
  warning: { bg: colorBg.warningSubtle, border: colorBorder.warning, actionColor: colorText.warning },
  success: { bg: colorBg.successSubtle, border: colorBorder.success, actionColor: colorText.success },
  error:   { bg: colorBg.dangerSubtle, border: colorBorder.danger, actionColor: colorText.danger },
};

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type ToastStatus = "brand" | "neutral" | "info" | "warning" | "success" | "error";
export type ToastType   = "text-only" | "text-action" | "text-long-action";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  title?: string;
  description?: string;
  status?: ToastStatus;
  /** Layout type */
  type?: ToastType;
  /** Primary action (shown for text-action and text-long-action) */
  action?: ToastAction;
  /** Secondary action (shown for text-long-action) */
  secondaryAction?: ToastAction;
  /** Show dismiss button */
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Toast: React.FC<ToastProps> = ({
  title = "Title",
  description = "Description",
  status = "brand",
  type = "text-only",
  action,
  secondaryAction,
  dismissible = true,
  onDismiss,
  className,
  style,
}) => {
  const tok = STATUS_COLORS[status];
  const isLongAction = type === "text-long-action";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    width: 360,
    borderRadius: borderRadius.xl,
    border: `1px solid ${tok.border}`,
    backgroundColor: tok.bg,
    boxSizing: "border-box",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    lineHeight: "24px",
    color: colorText.primary,
    margin: 0,
  };

  const descStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    color: colorText.tertiary,
    margin: 0,
  };

  const actionButtonStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    lineHeight: "16px",
    color: tok.actionColor,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  const secondaryActionButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    color: colorText.tertiary,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: 24,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    color: colorText.tertiary,
  };

  return (
    <div className={className} style={containerStyle} role="status" aria-live="polite">
      {/* Header row: content + close */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: "1 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={titleStyle}>{title}</p>
          <p style={descStyle}>{description}</p>
        </div>
        {dismissible && (
          <button type="button" aria-label="Dismiss" style={closeButtonStyle} onClick={onDismiss}>
            <Icon name="xonly" size={16} color={colorText.tertiary} />
          </button>
        )}
      </div>

      {/* Actions */}
      {(type === "text-action" || type === "text-long-action") && action && (
        <div
          style={{
            display: "flex",
            flexDirection: isLongAction ? "column" : "row",
            gap: isLongAction ? 8 : 16,
            alignItems: isLongAction ? "stretch" : "center",
          }}
        >
          <button
            type="button"
            style={{
              ...actionButtonStyle,
              ...(isLongAction && {
                padding: "8px 16px",
                borderRadius: 4,
                backgroundColor: tok.actionColor,
                color: colorText.inverse,
                textAlign: "center",
              }),
            }}
            onClick={action.onClick}
          >
            {action.label}
          </button>
          {secondaryAction && (
            <button
              type="button"
              style={{
                ...secondaryActionButtonStyle,
                ...(isLongAction && {
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: `1px solid ${colorBorder.disabled}`,
                  backgroundColor: colorBg.primary,
                  textAlign: "center",
                }),
              }}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

Toast.displayName = "Toast";
export default Toast;
