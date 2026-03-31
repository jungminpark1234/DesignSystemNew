import React from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type AvatarSize = "sm" | "md";
export type AvatarColor =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | "deleted";

export interface AvatarProps {
  /** Initials to display (1–2 chars) */
  initial?: string;
  /** Image src — when provided, renders a photo avatar */
  src?: string;
  /** Color palette index (1–26) or "deleted" */
  color?: AvatarColor;
  /** Size: sm = 24 px, md = 32 px */
  size?: AvatarSize;
  /** Alt text for photo avatars */
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Color palette — 26 hues matching the Figma avatar token set
// ──────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS: Record<number | "deleted", { bg: string; text: string }> = {
  1:  { bg: "#dc2626", text: colorText.inverse },
  2:  { bg: "#ea580c", text: colorText.inverse },
  3:  { bg: "#d97706", text: colorText.inverse },
  4:  { bg: "#ca8a04", text: colorText.inverse },
  5:  { bg: "#65a30d", text: colorText.inverse },
  6:  { bg: "#16a34a", text: colorText.inverse },
  7:  { bg: "#059669", text: colorText.inverse },
  8:  { bg: "#0d9488", text: colorText.inverse },
  9:  { bg: "#0891b2", text: colorText.inverse },
  10: { bg: "#0284c7", text: colorText.inverse },
  11: { bg: "#2563eb", text: colorText.inverse },
  12: { bg: "#4f46e5", text: colorText.inverse },
  13: { bg: "#7c3aed", text: colorText.inverse },
  14: { bg: "#9333ea", text: colorText.inverse },
  15: { bg: "#c026d3", text: colorText.inverse },
  16: { bg: "#db2777", text: colorText.inverse },
  17: { bg: "#e11d48", text: colorText.inverse },
  18: { bg: "#b45309", text: colorText.inverse },
  19: { bg: "#4d7c0f", text: colorText.inverse },
  20: { bg: "#047857", text: colorText.inverse },
  21: { bg: "#0e7490", text: colorText.inverse },
  22: { bg: "#1d4ed8", text: colorText.inverse },
  23: { bg: "#6d28d9", text: colorText.inverse },
  24: { bg: "#a21caf", text: colorText.inverse },
  25: { bg: "#be123c", text: colorText.inverse },
  26: { bg: "#78716c", text: colorText.inverse },
  deleted: { bg: colorBg.disabled, text: colorText.disabled },
};

const SIZE_MAP: Record<AvatarSize, { dimension: number; fontSize: number }> = {
  sm: { dimension: 24, fontSize: 11 },
  md: { dimension: 32, fontSize: 14 },
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Avatar: React.FC<AvatarProps> = ({
  initial = "?",
  src,
  color = 1,
  size = "md",
  alt,
  className,
  style,
}) => {
  const { dimension, fontSize } = SIZE_MAP[size];
  const colorKey = color === "deleted" ? "deleted" : (color as number);
  const { bg, text } = AVATAR_COLORS[colorKey] ?? AVATAR_COLORS[1];

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: dimension,
    height: dimension,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    boxSizing: "border-box",
    ...style,
  };

  // Photo avatar
  if (src) {
    return (
      <span className={className} style={baseStyle}>
        <img
          src={src}
          alt={alt ?? initial}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }

  // Initials avatar
  const displayInitial = initial.slice(0, 2).toUpperCase();

  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        backgroundColor: bg,
        color: text,
        fontFamily: fontFamily.body,
        fontSize,
        fontWeight: fontWeight.semibold,
        lineHeight: "16px",
        letterSpacing: 0,
        userSelect: "none",
      }}
      aria-label={alt ?? `Avatar ${displayInitial}`}
      role="img"
    >
      {displayInitial}
    </span>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Avatar Group
// ──────────────────────────────────────────────────────────────────────────────
export interface AvatarGroupProps {
  /** List of avatar props to stack */
  avatars: AvatarProps[];
  /** Max avatars to show before "+N" indicator */
  max?: number;
  /** Size for all avatars in the group */
  size?: AvatarSize;
  className?: string;
  style?: React.CSSProperties;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = "md",
  className,
  style,
}) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const { dimension } = SIZE_MAP[size];
  const overlap = Math.round(dimension * 0.375); // ~37.5% overlap

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {visible.map((avatarProps, i) => (
        <span
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: visible.length - i,
            borderRadius: "50%",
            border: `2px solid ${colorBg.primary}`,
            boxSizing: "content-box",
            display: "inline-flex",
          }}
        >
          <Avatar {...avatarProps} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          style={{
            marginLeft: -overlap,
            zIndex: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: dimension,
            height: dimension,
            borderRadius: "50%",
            border: `2px solid ${colorBg.primary}`,
            backgroundColor: colorBg.disabled,
            color: colorText.secondary,
            fontFamily: fontFamily.body,
            fontSize: dimension === 32 ? 12 : 10,
            fontWeight: fontWeight.semibold,
            boxSizing: "content-box",
            userSelect: "none",
          }}
          aria-label={`+${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
};

/**
 * Derive avatar color index (1–26) from a 2-letter initial string.
 * First char selects a base offset, second char shifts within 26 hues.
 * Consistent: same initials always produce the same color.
 */
export function getAvatarColorFromInitial(initial: string): AvatarColor {
  const upper = initial.toUpperCase();
  const a = upper.charCodeAt(0) - 65; // 0-25 for A-Z
  const b = upper.length > 1 ? upper.charCodeAt(1) - 65 : 0;
  const idx = ((a + b) % 26) + 1;
  return idx as AvatarColor;
}

Avatar.displayName = "Avatar";
AvatarGroup.displayName = "AvatarGroup";
export default Avatar;
