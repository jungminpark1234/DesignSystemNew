import React, { useState } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface GridCardProps {
  /** Card title */
  title: string;
  /** Card description */
  desc?: string;
  /** Optional chip/badge shown next to the title (e.g., category label) */
  chip?: React.ReactNode;
  /** Whether the card is in selected/checked state */
  checked?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Content rendered inside the image slot (thumbnail, preview image, etc.) */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const GridCard = React.forwardRef<HTMLDivElement, GridCardProps>(
  ({ title, desc, chip, checked = false, onClick, children, className, style }, ref) => {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [focused, setFocused] = useState(false);
    const [usingMouse, setUsingMouse] = useState(false);
    const showFocusRing = focused && !usingMouse;

    const getBg = () => {
      if (checked && pressed) return `var(--ds-bg-interactive-runway-selected, ${colorBg.interactive.runwaySelectedPressed})`;
      if (checked && hovered) return `var(--ds-bg-interactive-runway-selected, ${colorBg.interactive.runwaySelectedHovered})`;
      if (checked)            return `var(--ds-bg-interactive-runway-selected, ${colorBg.interactive.drawxSelected})`;
      if (pressed)            return `var(--ds-bg-tertiary, ${colorBg.interactive.secondaryPressed})`;
      if (hovered)            return `var(--ds-bg-tertiary, ${colorBg.tertiary})`;
      return "transparent";
    };

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: spacing[24],
      alignItems: "flex-start",
      padding: `${spacing[8]} ${spacing[8]} ${spacing[24]}`,
      borderRadius: borderRadius["2xl"],
      backgroundColor: getBg(),
      outline: showFocusRing ? `2px solid ${colorBorder.interactive.runwayPrimary}` : "none",
      outlineOffset: 2,
      cursor: onClick ? "pointer" : "default",
      transition: "background-color 0.15s ease, outline-color 0.1s ease",
      overflow: "hidden",
      userSelect: "none",
      ...style,
    };

    // Image slot — 293:195 aspect ratio
    const imageSlotStyle: React.CSSProperties = {
      width: "100%",
      aspectRatio: "293 / 195",
      backgroundColor: `var(--ds-bg-secondary, ${colorBg.secondary})`,
      borderRadius: borderRadius["2xl"],
      flexShrink: 0,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    const titleStyle: React.CSSProperties = {
      fontFamily: fontFamily.heading,
      fontSize: 16,
      fontWeight: fontWeight.semibold,
      lineHeight: "24px",
      letterSpacing: "0px",
      color: `var(--ds-text-primary, ${colorText.primary})`,
      width: "100%",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      margin: 0,
    };

    const descStyle: React.CSSProperties = {
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: fontWeight.regular,
      lineHeight: "16px",
      letterSpacing: "0px",
      color: `var(--ds-text-secondary, ${colorText.secondary})`,
      width: "100%",
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      margin: 0,
    };

    return (
      <div
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? checked : undefined}
        className={className}
        style={containerStyle}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
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
        {/* Image / thumbnail slot */}
        <div style={imageSlotStyle}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            transition: "transform 0.3s ease",
            transform: hovered ? "scale(1.2)" : "scale(1)",
          }}>
            {children}
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[8], width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
            <p style={titleStyle}>{title}</p>
            {chip}
          </div>
          {desc && <p style={descStyle}>{desc}</p>}
        </div>
      </div>
    );
  }
);

GridCard.displayName = "GridCard";

export default GridCard;
