import React, { useState } from "react";
import { colorIcon, colorBg } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type IconButtonType = "transparent" | "neutral" | "inverse";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element (24 × 24 recommended) */
  icon: React.ReactNode;
  /** Visual style variant */
  buttonType?: IconButtonType;
  /** Accessible label — required for icon-only buttons */
  "aria-label": string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      buttonType = "transparent",
      disabled,
      onClick,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const getBg = (): string => {
      if (disabled) return "transparent";
      switch (buttonType) {
        case "neutral":
          if (pressed) return colorBg.interactive.neutralPressed;
          if (hovered) return colorBg.interactive.neutralHovered;
          return colorBg.interactive.neutral;
        case "inverse":
          if (pressed) return colorBg.inverseBolder;
          if (hovered) return colorBg.inverseBold;
          return colorBg.inverseBold;
        case "transparent":
        default:
          if (pressed) return colorBg.disabled;
          if (hovered) return colorBg.tertiary;
          return "transparent";
      }
    };

    const getIconColor = (): string => {
      if (disabled) return colorIcon.disabled;
      if (buttonType === "inverse") return colorIcon.inverse;
      return colorIcon.primary;
    };

    const buttonStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: borderRadius["3xl"],
      border: "none",
      padding: 0,
      backgroundColor: getBg(),
      color: getIconColor(),
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.15s ease, color 0.15s ease",
      outline: "none",
      flexShrink: 0,
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={className}
        style={buttonStyle}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => !disabled && setPressed(true)}
        onMouseUp={() => setPressed(false)}
        {...rest}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
export default IconButton;
