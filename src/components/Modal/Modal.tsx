import React, { useEffect, useRef } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface ModalAction {
  label: string;
  onClick: () => void;
  /** Visual style — mirrors Button props */
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
}

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Modal title */
  title?: string;
  /** Optional description text below the title */
  description?: string;
  /** Custom body content (overrides description) */
  children?: React.ReactNode;
  /** Primary action button */
  primaryAction?: ModalAction;
  /** Secondary action button */
  secondaryAction?: ModalAction;
  /** Show the × close button in header */
  showCloseButton?: boolean;
  /** Called when the user closes the modal (✕ or backdrop click) */
  onClose?: () => void;
  /** Width of the dialog in px. Default: 640 */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Action button sub-component
// ──────────────────────────────────────────────────────────────────────────────
function ActionButton({ action }: { action: ModalAction }) {
  const variant = action.variant ?? "primary";

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    minWidth: 120,
    padding: "8px 32px",
    borderRadius: borderRadius.md,
    border: "none",
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    lineHeight: "16px",
    cursor: action.disabled ? "not-allowed" : "pointer",
    opacity: action.disabled ? 0.5 : 1,
    transition: "background-color 0.15s ease",
    boxSizing: "border-box",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colorBg.interactive.runwayPrimary,
      color: colorText.inverse,
    },
    secondary: {
      backgroundColor: colorBg.primary,
      color: colorText.secondary,
      border: `1px solid ${colorBorder.interactive.secondaryButton}`,
    },
    destructive: {
      backgroundColor: colorBg.danger,
      color: colorText.inverse,
    },
  };

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={action.onClick}
      style={{ ...base, ...variantStyles[variant] }}
    >
      {action.label}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Modal: React.FC<ModalProps> = ({
  open,
  title = "Title",
  description,
  children,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  onClose,
  width = 640,
  className,
  style,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    // Prevent body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 24,
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: colorBg.primary,
    borderRadius: borderRadius["2xl"],
    border: `1px solid ${colorBorder.secondary}`,
    boxShadow: "0 8px 16px rgba(0,0,0,0.16), 0 0 8px rgba(0,0,0,0.12)",
    width,
    maxWidth: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "32px 24px",
    boxSizing: "border-box",
    overflowY: "auto",
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 20,
    fontWeight: fontWeight.semibold,
    lineHeight: "24px",
    color: colorText.primary,
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 24,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    color: colorText.tertiary,
    flexShrink: 0,
  };

  const bodyStyle: React.CSSProperties = {
    flex: "1 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  };

  const descStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    color: colorText.secondary,
    margin: 0,
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 16,
    flexShrink: 0,
  };

  return (
    <div
      style={overlayStyle}
      aria-modal="true"
      role="dialog"
      aria-labelledby="mds-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div ref={dialogRef} className={className} style={dialogStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 id="mds-modal-title" style={titleStyle}>{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              aria-label="Close modal"
              style={closeButtonStyle}
              onClick={onClose}
            >
              <Icon name="xonly" size={24} color={colorText.tertiary} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {description && <p style={descStyle}>{description}</p>}
          {children}
        </div>

        {/* Footer */}
        {(primaryAction || secondaryAction) && (
          <div style={footerStyle}>
            {secondaryAction && (
              <ActionButton action={{ variant: "secondary", ...secondaryAction }} />
            )}
            {primaryAction && (
              <ActionButton action={{ variant: "primary", ...primaryAction }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = "Modal";
export default Modal;
