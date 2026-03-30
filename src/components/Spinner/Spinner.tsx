import React, { useRef } from "react";
import { colorIcon, colorBg } from "../../tokens/colors";

// ──────────────────────────────────────────────────────────────────────────────
// Inject keyframes once
// ──────────────────────────────────────────────────────────────────────────────
const KEYFRAMES_ID = "mds-spinner-keyframes";
function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes mds-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ──────────────────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────────────────
const SIZE_MAP: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const STROKE_MAP: Record<SpinnerSize, number> = {
  sm: 2,
  md: 2.5,
  lg: 3,
  xl: 4,
};

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerType = "primary" | "secondary" | "inverse";

export interface SpinnerProps {
  size?: SpinnerSize;
  /** "primary" = brand blue, "secondary" = gray, "inverse" = white */
  spinnerType?: SpinnerType;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible label for screen readers */
  label?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  spinnerType = "primary",
  className,
  style,
  label = "Loading…",
}) => {
  const ref = useRef(false);
  if (!ref.current) {
    ensureKeyframes();
    ref.current = true;
  }

  const px = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];
  const r = (px - stroke) / 2;
  const cx = px / 2;
  const circumference = 2 * Math.PI * r;
  const dashArray = circumference;
  const dashOffset = circumference * 0.25;   // ~75 % visible arc

  const color =
    spinnerType === "primary"   ? colorIcon.interactive.runwayPrimary
    : spinnerType === "secondary" ? colorIcon.secondary
    : colorIcon.inverse;

  const svgStyle: React.CSSProperties = {
    animation: "mds-spin 0.8s linear infinite",
    display: "block",
    flexShrink: 0,
    ...style,
  };

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      aria-label={label}
      role="status"
      className={className}
      style={svgStyle}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        opacity={0.2}
      />
      {/* Arc */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
    </svg>
  );
};

Spinner.displayName = "Spinner";
export default Spinner;
