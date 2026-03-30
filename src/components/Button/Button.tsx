// ============================================================
// Button — makinarocks_new_design_system
// Source: Figma > input components > Button
//
// Variants
//   type  : "Primary" | "Destructive"
//   size  : "lg" | "md"
//   style : "filled" | "outlined" | "transparent"
//   state : "default" | "hovered" | "pressed" | "focused" | "disabled" | "loading"
// ============================================================

import React from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ---- Types --------------------------------------------------

export type ButtonType = "Primary" | "Destructive";
export type ButtonSize = "lg" | "md";
export type ButtonStyle = "filled" | "outlined" | "transparent";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual intent */
  buttonType?: ButtonType;
  /** Size variant */
  size?: ButtonSize;
  /** Visual style */
  buttonStyle?: ButtonStyle;
  /** Button label text */
  label?: string;
  /** Icon rendered before the label */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label */
  trailingIcon?: React.ReactNode;
  /** Loading state — disables interaction and shows a spinner */
  loading?: boolean;
}

// ---- Spinner ------------------------------------------------

function Spinner({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Style map ----------------------------------------------

interface VariantStyle {
  background: string;
  color: string;
  border?: string;
  hoverBackground?: string;
  hoverColor?: string;
  hoverBorder?: string;
  activeBackground?: string;
  activeBorder?: string;
  focusRingColor: string;
  disabledBackground: string;
  disabledColor: string;
  disabledBorder?: string;
  spinnerColor: string;
}

const variantStyles: Record<ButtonType, Record<ButtonStyle, VariantStyle>> = {
  Primary: {
    filled: {
      background: colorBg.interactive.runwayPrimary,
      color: colorText.inverse,
      hoverBackground: colorBg.interactive.runwayPrimaryHovered,
      activeBackground: colorBg.interactive.runwayPrimaryPressed,
      focusRingColor: colorBorder.runwayFocusRing,
      disabledBackground: colorBg.disabled,
      disabledColor: colorText.disabled,
      spinnerColor: colorText.inverse,
    },
    outlined: {
      background: "transparent",
      color: colorText.interactive.runwayPrimary,
      border: `1px solid ${colorBorder.interactive.runwayPrimary}`,
      hoverBackground: colorBg.interactive.runwaySelected,
      hoverBorder: `1px solid ${colorBorder.interactive.runwayPrimaryHovered}`,
      hoverColor: colorText.interactive.runwayPrimaryHovered,
      activeBackground: colorBg.interactive.runwaySelectedHovered,
      activeBorder: `1px solid ${colorBorder.interactive.runwayPrimaryPressed}`,
      focusRingColor: colorBorder.runwayFocusRing,
      disabledBackground: "transparent",
      disabledColor: colorText.disabled,
      disabledBorder: `1px solid ${colorBorder.disabled}`,
      spinnerColor: colorText.interactive.runwayPrimary,
    },
    transparent: {
      background: "transparent",
      color: colorText.interactive.runwayPrimary,
      hoverBackground: colorBg.interactive.runwaySelected,
      hoverColor: colorText.interactive.runwayPrimaryHovered,
      activeBackground: colorBg.interactive.runwaySelectedHovered,
      focusRingColor: colorBorder.runwayFocusRing,
      disabledBackground: "transparent",
      disabledColor: colorText.disabled,
      spinnerColor: colorText.interactive.runwayPrimary,
    },
  },
  Destructive: {
    filled: {
      background: colorBg.interactive.danger,
      color: colorText.inverse,
      hoverBackground: colorBg.interactive.dangerHovered,
      activeBackground: colorBg.interactive.dangerPressed,
      focusRingColor: colorBorder.danger,
      disabledBackground: colorBg.disabled,
      disabledColor: colorText.disabled,
      spinnerColor: colorText.inverse,
    },
    outlined: {
      background: "transparent",
      color: colorText.interactive.dangerDefault,
      border: `1px solid ${colorBorder.interactive.danger}`,
      hoverBackground: colorBg.dangerSubtle,
      hoverBorder: `1px solid ${colorBorder.interactive.dangerHovered}`,
      hoverColor: colorText.interactive.dangerHovered,
      activeBackground: colorBg.dangerSubtle,
      activeBorder: `1px solid ${colorBorder.interactive.dangerPressed}`,
      focusRingColor: colorBorder.danger,
      disabledBackground: "transparent",
      disabledColor: colorText.disabled,
      disabledBorder: `1px solid ${colorBorder.disabled}`,
      spinnerColor: colorText.interactive.dangerDefault,
    },
    transparent: {
      background: "transparent",
      color: colorText.interactive.dangerDefault,
      hoverBackground: colorBg.dangerSubtle,
      hoverColor: colorText.interactive.dangerHovered,
      activeBackground: colorBg.dangerSubtle,
      focusRingColor: colorBorder.danger,
      disabledBackground: "transparent",
      disabledColor: colorText.disabled,
      spinnerColor: colorText.interactive.dangerDefault,
    },
  },
};

// ---- Size map -----------------------------------------------

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  lg: {
    height: "40px",
    padding: "8px 16px",
    gap: "4px",
    fontSize: "14px",
    lineHeight: "16px",
  },
  md: {
    height: "32px",
    padding: "6px 12px",
    gap: "4px",
    fontSize: "12px",
    lineHeight: "16px",
  },
};

// ---- Keyframe injection (once) ------------------------------

const KEYFRAME_ID = "mkr-btn-spin";
if (typeof document !== "undefined" && !document.getElementById(KEYFRAME_ID)) {
  const style = document.createElement("style");
  style.id = KEYFRAME_ID;
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

// ---- Component ----------------------------------------------

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      buttonType = "Primary",
      size = "lg",
      buttonStyle = "filled",
      label = "Button",
      leadingIcon,
      trailingIcon,
      loading = false,
      disabled,
      style: inlineStyle,
      children,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      ...rest
    },
    ref
  ) => {
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);

    const isDisabled = disabled || loading;
    const v = variantStyles[buttonType][buttonStyle];
    const s = sizeStyles[size];

    // Resolve current colours based on interaction state
    let background = v.background;
    let color = v.color;
    let border = v.border;

    if (isDisabled) {
      background = v.disabledBackground;
      color = v.disabledColor;
      border = v.disabledBorder;
    } else if (pressed && v.activeBackground) {
      background = v.activeBackground;
      border = v.activeBorder ?? border;
    } else if (hovered && v.hoverBackground) {
      background = v.hoverBackground;
      color = v.hoverColor ?? color;
      border = v.hoverBorder ?? border;
    }

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius.md,
      fontFamily: fontFamily.body,
      fontWeight: fontWeight.semibold,
      letterSpacing: "0px",
      whiteSpace: "nowrap",
      cursor: isDisabled ? "not-allowed" : "pointer",
      outline: "none",
      transition: "background 120ms ease, border-color 120ms ease, color 120ms ease",
      boxSizing: "border-box",
      // Focus ring (accessible — visible on :focus-visible via JS)
      ...(border ? { border } : { border: "1px solid transparent" }),
      background,
      color,
      ...s,
      ...inlineStyle,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setHovered(true);
      onMouseEnter?.(e);
    };
    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setHovered(false);
      setPressed(false);
      onMouseLeave?.(e);
    };
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setPressed(true);
      onMouseDown?.(e);
    };
    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      setPressed(false);
      onMouseUp?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={baseStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...rest}
      >
        {/* Leading icon or spinner (when loading and no trailing icon slot) */}
        {loading ? (
          <Spinner color={v.spinnerColor} />
        ) : (
          leadingIcon && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                width: size === "lg" ? 20 : 16,
                height: size === "lg" ? 20 : 16,
              }}
            >
              {leadingIcon}
            </span>
          )
        )}

        {/* Label */}
        <span>{children ?? label}</span>

        {/* Trailing icon */}
        {!loading && trailingIcon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
              width: size === "lg" ? 20 : 16,
              height: size === "lg" ? 20 : 16,
            }}
          >
            {trailingIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
