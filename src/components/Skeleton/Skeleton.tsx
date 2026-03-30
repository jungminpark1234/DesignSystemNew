import React, { useRef } from "react";
import { colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";

// ──────────────────────────────────────────────────────────────────────────────
// Shimmer keyframes (injected once)
// ──────────────────────────────────────────────────────────────────────────────
const KEYFRAMES_ID = "mds-skeleton-keyframes";
function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes mds-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
  `;
  document.head.appendChild(style);
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type SkeletonVariant = "rect" | "circle" | "text";

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (px or CSS string). Default: "100%" */
  width?: number | string;
  /** Height (px or CSS string). Default depends on variant */
  height?: number | string;
  /** Enable shimmer animation */
  animated?: boolean;
  /** Border-radius override */
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rect",
  width,
  height,
  animated = true,
  borderRadius: borderRadiusOverride,
  className,
  style,
}) => {
  const ref = useRef(false);
  if (!ref.current) {
    ensureKeyframes();
    ref.current = true;
  }

  // Default dimensions per variant
  const defaultWidth  = variant === "circle" ? 32  : "100%";
  const defaultHeight = variant === "circle" ? 32  : variant === "text" ? 16 : 64;

  const resolvedWidth  = width  ?? defaultWidth;
  const resolvedHeight = height ?? defaultHeight;

  const defaultRadius =
    variant === "circle" ? "50%"
    : variant === "text"   ? borderRadius.md
    : borderRadius.lg;
  const resolvedRadius = borderRadiusOverride ?? defaultRadius;

  const shimmerStyle: React.CSSProperties = animated
    ? {
        backgroundImage:
          `linear-gradient(90deg, ${colorBorder.secondary} 25%, ${colorBg.tertiary} 50%, ${colorBorder.secondary} 75%)`,
        backgroundSize: "800px 100%",
        animation: "mds-shimmer 1.4s infinite linear",
      }
    : {
        backgroundColor: colorBorder.secondary,
      };

  const skeletonStyle: React.CSSProperties = {
    display: "block",
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: resolvedRadius,
    flexShrink: 0,
    ...shimmerStyle,
    ...style,
  };

  return (
    <span
      className={className}
      style={skeletonStyle}
      aria-hidden="true"
      role="presentation"
    />
  );
};

Skeleton.displayName = "Skeleton";
export default Skeleton;
