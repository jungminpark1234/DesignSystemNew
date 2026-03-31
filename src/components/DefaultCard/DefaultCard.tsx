import React, { useState } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface DefaultCardProps {
  /** Card title */
  title: string;
  /** Card description */
  desc?: string;
  /** Whether to show the description */
  showDesc?: boolean;
  /** Status chip — pass a <StatusChip /> or any React node */
  chip?: React.ReactNode;
  /** Footer content (e.g., avatar + date) */
  footer?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const DefaultCard = React.forwardRef<HTMLDivElement, DefaultCardProps>(
  (
    {
      title,
      desc,
      showDesc = true,
      chip,
      footer,
      onClick,
      className,
      style,
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [focused, setFocused] = useState(false);
    const [usingMouse, setUsingMouse] = useState(false);
    const showFocusRing = focused && !usingMouse;

    const getBg = () => {
      if (pressed)
        return `var(--ds-bg-secondary, ${colorBg.secondary})`;
      if (hovered)
        return `var(--ds-bg-interactive-secondary-hovered, ${colorBg.secondary})`;
      return `var(--ds-bg-interactive-secondary, ${colorBg.primary})`;
    };

    const getBorderColor = () => {
      if (pressed)
        return `var(--ds-border-interactive-secondary-pressed, ${colorBorder.primary})`;
      if (hovered)
        return `var(--ds-border-interactive-secondary-hovered, #d1d5dc)`;
      return `var(--ds-border-interactive-secondary, ${colorBorder.secondary})`;
    };

    const shadow8 = "0px 0px 4px 0px rgba(0,0,0,0.12), 0px 4px 8px 0px rgba(0,0,0,0.16)";
    const isElevated = hovered || pressed || focused;

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      width: 320,
      height: 256,
      padding: spacing[24],
      borderRadius: borderRadius.xl,
      backgroundColor: getBg(),
      border: `1px solid ${getBorderColor()}`,
      boxShadow: isElevated ? shadow8 : "none",
      outline: showFocusRing
        ? `2px solid var(--ds-border-interactive-runway-focusring, #155dfc)`
        : "none",
      outlineOffset: -2,
      overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      transition: "background-color 0.15s ease, box-shadow 0.2s ease, border-color 0.15s ease, outline 0.1s ease",
      userSelect: "none",
      boxSizing: "border-box",
      ...style,
    };

    return (
      <div
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={className}
        style={containerStyle}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onMouseDown={() => { setPressed(true); setUsingMouse(true); }}
        onMouseUp={() => setPressed(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setUsingMouse(false); }}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {/* Chip */}
        {chip && <div style={{ alignSelf: "flex-start", flexShrink: 0 }}>{chip}</div>}

        {/* Title */}
        <p
          style={{
            fontFamily: fontFamily.heading,
            fontSize: 16,
            fontWeight: fontWeight.semibold,
            lineHeight: "24px",
            color: `var(--ds-text-primary, ${colorText.primary})`,
            margin: 0,
            flexShrink: 0,
          }}
        >
          {title}
        </p>

        {/* Description */}
        {showDesc && desc && (
          <div style={{ flex: 1, minHeight: 0 }}>
            <p
              style={{
                fontFamily: fontFamily.body,
                fontSize: 14,
                fontWeight: fontWeight.regular,
                lineHeight: "16px",
                color: `var(--ds-text-secondary, ${colorText.secondary})`,
                margin: 0,
              }}
            >
              {desc}
            </p>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: "flex",
              gap: spacing[8],
              alignItems: "center",
              flexShrink: 0,
              width: "100%",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

DefaultCard.displayName = "DefaultCard";
export default DefaultCard;
