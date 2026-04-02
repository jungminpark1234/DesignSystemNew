import React, { useState } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// CSS variable helpers — reads theme vars with light-mode fallback
// ──────────────────────────────────────────────────────────────────────────────
const v = (varName: string, fallback: string) => `var(${varName}, ${fallback})`;

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface ProjectCardProps {
  /** Card title */
  title: string;
  /** Optional description */
  desc?: string;
  /** Whether this project is favorited */
  favorite?: boolean;
  /** Called when favorite star is toggled */
  onFavoriteChange?: (next: boolean) => void;
  /** Called when the card is clicked */
  onClick?: () => void;
  /** Called when the more-menu (⋮) is clicked */
  onMenuClick?: (e: React.MouseEvent) => void;
  /** Footer left: avatar + text (e.g. date or creator name) */
  footerLeft?: React.ReactNode;
  /** Custom width (default: 317) */
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 20;
const TAB_OFFSET = 20;

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  desc,
  favorite = false,
  onFavoriteChange,
  onClick,
  onMenuClick,
  footerLeft,
  width = 317,
  className,
  style,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [usingMouse, setUsingMouse] = useState(false);
  const showFocusRing = focused && !usingMouse;

  const bgPrimary = v("--ds-bg-primary", colorBg.primary);
  const bgHovered = v("--ds-bg-interactive-secondary-hovered", colorBg.interactive.secondaryHovered);
  const bgPressed = v("--ds-bg-interactive-secondary-pressed", colorBg.interactive.secondaryPressed);
  const cardBg = pressed ? bgPressed : hovered ? bgHovered : bgPrimary;

  const tabColor = v("--ds-border-tertiary", "#e0e2eb");
  const borderColor = v("--ds-border-interactive-secondary", colorBorder.interactive.secondary);
  const focusRingColor = v("--ds-border-interactive-runway-primary", colorBorder.interactive.runwayPrimary);
  const txtPrimary = v("--ds-text-primary", colorText.primary);
  const txtSecondary = v("--ds-text-secondary", colorText.secondary);
  const txtDisabled = v("--ds-text-disabled", colorText.disabled);
  const txtTertiary = v("--ds-text-tertiary", colorText.tertiary);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width,
        minWidth: typeof width === "number" ? width : undefined,
        flexShrink: 0,
        paddingTop: TAB_OFFSET,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { setPressed(true); setUsingMouse(true); }}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={() => setUsingMouse(false)}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {/* ── Folder tab ── */}
      <div style={{ position: "absolute", zIndex: 0, top: 0, left: 0, width: 95, height: 32, background: tabColor, borderRadius: "16px 16px 0 0" }} />

      {/* ── Folder bar ── */}
      <div style={{ position: "absolute", zIndex: 0, top: 8, left: 0, width: "100%", height: 25, background: tabColor, borderRadius: "12px 12px 0 0" }} />

      {/* ── Focus ring ── */}
      {showFocusRing && (
        <div
          style={{
            position: "absolute",
            inset: `${TAB_OFFSET - 2}px -2px -2px -2px`,
            border: `2px solid ${focusRingColor}`,
            borderRadius: CARD_RADIUS + 2,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

      {/* ── Card body ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: CARD_RADIUS,
          boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: 194,
          transition: "background-color 0.15s",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: 16,
            minHeight: 0,
          }}
        >
          {/* Title + Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span
              style={{
                flex: 1,
                fontFamily: fontFamily.heading,
                fontSize: 16,
                fontWeight: fontWeight.semibold,
                lineHeight: "24px",
                color: txtPrimary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {title}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteChange?.(!favorite);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: borderRadius["3xl"],
                border: "none",
                background: "transparent",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
                visibility: (favorite || hovered || pressed) ? "visible" : "hidden",
              }}
            >
              <Icon
                name={favorite ? "star-filled" : "star-stroke"}
                size={24}
                color={favorite ? "#f59e0b" : txtDisabled}
              />
            </button>
          </div>

          {/* Description */}
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {desc && (
              <span
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 14,
                  fontWeight: fontWeight.regular,
                  lineHeight: "16px",
                  color: txtSecondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                }}
              >
                {desc}
              </span>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {footerLeft}
            </div>

            {onMenuClick && (hovered || pressed) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick(e);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <Icon name="more-vertical" size={24} color={txtTertiary} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProjectCard.displayName = "ProjectCard";
export default ProjectCard;
