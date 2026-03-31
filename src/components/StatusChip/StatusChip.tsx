import React from "react";
import { colorText, colorBg, colorBorder, colorIcon, primitiveColors } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type StatusChipState =
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral"
  | "loading"
  | "pending"
  | "stopped";

export type StatusChipStyle = "filled" | "transparent" | "outline";
export type StatusChipSize = "sm" | "md";

export interface StatusChipProps {
  /** Status state */
  state?: StatusChipState;
  /** Visual style */
  chipStyle?: StatusChipStyle;
  /** Size */
  size?: StatusChipSize;
  /** Label text — defaults to the state name */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Token map per state
// ──────────────────────────────────────────────────────────────────────────────
const STATE_TOKENS: Record<
  StatusChipState,
  {
    bg: string;
    text: string;
    dot: string;
    border: string;
    label: string;
    dotShape?: "circle" | "square";
  }
> = {
  success:  { bg: `var(--ds-bg-success-subtle, ${colorBg.successSubtle})`, text: `var(--ds-text-primary, ${colorText.primary})`, dot: "#00a63e", border: "#00a63e", label: "Success" },
  info:     { bg: `var(--ds-bg-info-subtle, ${colorBg.infoSubtle})`, text: `var(--ds-text-primary, ${colorText.primary})`, dot: "#0084d1", border: "#0084d1", label: "Info" },
  warning:  { bg: `var(--ds-bg-warning-subtle, ${colorBg.warningSubtle})`, text: `var(--ds-text-primary, ${colorText.primary})`, dot: "#d08b00", border: "#f0a000", label: "Warning" },
  error:    { bg: `var(--ds-bg-danger-subtle, ${colorBg.dangerSubtle})`, text: `var(--ds-text-primary, ${colorText.primary})`, dot: "#e7000b", border: "#e7000b", label: "Error" },
  neutral:  { bg: `var(--ds-bg-neutral, #d1d5dc)`, text: `var(--ds-text-secondary, ${colorText.secondary})`, dot: `${colorIcon.secondary}`, border: `${colorBorder.primary}`, label: "Neutral" },
  loading:  { bg: `var(--ds-bg-neutral, #d1d5dc)`, text: `var(--ds-text-secondary, ${colorText.secondary})`, dot: `${colorIcon.secondary}`, border: `${colorBorder.primary}`, label: "Loading" },
  pending:  { bg: `var(--ds-bg-neutral, #d1d5dc)`, text: `var(--ds-text-secondary, ${colorText.secondary})`, dot: `${colorIcon.secondary}`, border: `${colorBorder.primary}`, label: "Pending" },
  stopped:  { bg: `var(--ds-bg-disabled, #e5e7eb)`, text: `var(--ds-text-disabled, ${colorText.disabled})`, dot: `${colorIcon.disabled}`, border: `${colorBorder.disabled}`, label: "Stopped", dotShape: "square" },
};

// ──────────────────────────────────────────────────────────────────────────────
// Keyframes injected once for loading spinner
// ──────────────────────────────────────────────────────────────────────────────
const SPIN_ID = "mds-status-chip-spin";
function ensureSpinKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPIN_ID)) return;
  const style = document.createElement("style");
  style.id = SPIN_ID;
  style.textContent = `@keyframes mds-status-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

// ──────────────────────────────────────────────────────────────────────────────
// Leading indicator
// ──────────────────────────────────────────────────────────────────────────────
function LeadingIndicator({
  state,
  dot,
  dotSize,
  iconContainerSize,
  dotShape = "circle",
}: {
  state: StatusChipState;
  dot: string;
  dotSize: number;
  iconContainerSize: number;
  dotShape?: "circle" | "square";
}) {
  if (state === "loading") {
    ensureSpinKeyframes();
    const spinnerSize = iconContainerSize === 24 ? 16 : 12;
    const r = spinnerSize / 2 - 1;
    const circ = 2 * Math.PI * r;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: iconContainerSize, height: iconContainerSize, flexShrink: 0 }}>
        <svg
          width={spinnerSize}
          height={spinnerSize}
          viewBox={`0 0 ${spinnerSize} ${spinnerSize}`}
          style={{ animation: "mds-status-spin 0.8s linear infinite" }}
          aria-hidden="true"
        >
          <circle
            cx={spinnerSize / 2}
            cy={spinnerSize / 2}
            r={r}
            fill="none"
            stroke={dot}
            strokeWidth="1.5"
            strokeDasharray={circ}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  if (state === "pending") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: iconContainerSize, height: iconContainerSize, flexShrink: 0 }}>
        <Icon name="pending" size={iconContainerSize} color={dot} />
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: iconContainerSize, height: iconContainerSize, flexShrink: 0 }}>
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotShape === "square" ? "1.5px" : "50%",
          backgroundColor: dot,
          display: "inline-block",
        }}
        aria-hidden="true"
      />
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const StatusChip: React.FC<StatusChipProps> = ({
  state = "neutral",
  chipStyle = "filled",
  size = "md",
  label,
  className,
  style,
}) => {
  const tokens = STATE_TOKENS[state];
  const displayLabel = label ?? tokens.label;

  const height = size === "md" ? 32 : 24;
  const fontSize = size === "md" ? 14 : 12;
  const dotSize = size === "md" ? 8 : 6;
  const iconContainerSize = size === "md" ? 24 : 16;
  const paddingLeft = 8;
  const paddingRight = 12;

  let bg = tokens.bg;
  let border = "transparent";

  if (chipStyle === "transparent") {
    bg = "transparent";
  } else if (chipStyle === "outline") {
    bg = "transparent";
    border = tokens.border;
  }

  const chipStyle_: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height,
    paddingLeft,
    paddingRight,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 9999,
    backgroundColor: bg,
    border: `1px solid ${chipStyle === "filled" ? "transparent" : border}`,
    color: tokens.text,
    fontFamily: fontFamily.body,
    fontSize,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    ...style,
  };

  return (
    <span className={className} style={chipStyle_}>
      <LeadingIndicator state={state} dot={tokens.dot} dotSize={dotSize} iconContainerSize={iconContainerSize} dotShape={tokens.dotShape ?? "circle"} />
      {displayLabel}
    </span>
  );
};

StatusChip.displayName = "StatusChip";
export default StatusChip;
