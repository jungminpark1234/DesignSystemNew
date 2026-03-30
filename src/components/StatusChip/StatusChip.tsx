import React from "react";
import { colorText, colorBg, colorBorder, primitiveColors } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";

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
  success:  { bg: `var(--ds-bg-success-subtle, ${colorBg.successSubtle})`, text: `var(--ds-text-primary, ${colorText.primary})`, dot: `var(--ds-icon-success, ${colorBg.success})`, border: primitiveColors.green[300], label: "Success" },
  info:     { bg: `var(--ds-bg-info-subtle, ${colorBg.infoSubtle})`, text: `var(--ds-text-info, ${colorText.info})`, dot: `var(--ds-text-info, ${colorText.info})`, border: primitiveColors.blue[300], label: "Info" },
  warning:  { bg: `var(--ds-bg-warning-subtle, ${colorBg.warningSubtle})`, text: `var(--ds-text-warning, ${colorText.warning})`, dot: `var(--ds-text-warning, ${colorText.warning})`, border: primitiveColors.yellow[100], label: "Warning" },
  error:    { bg: `var(--ds-bg-danger-subtle, ${colorBg.dangerSubtle})`, text: `var(--ds-text-danger, ${colorText.danger})`, dot: `var(--ds-text-danger, ${colorText.danger})`, border: primitiveColors.red[300], label: "Error" },
  neutral:  { bg: `var(--ds-bg-disabled, ${colorBorder.secondary})`, text: `var(--ds-text-disabled, ${colorText.disabled})`, dot: `var(--ds-text-disabled, ${colorText.disabled})`, border: `var(--ds-border-secondary, ${colorBorder.secondary})`, label: "Neutral", dotShape: "square" },
  loading:  { bg: `var(--ds-bg-info-subtle, ${colorBg.infoSubtle})`, text: `var(--ds-text-info, ${colorText.info})`, dot: `var(--ds-text-info, ${colorText.info})`, border: primitiveColors.blue[300], label: "Loading" },
  pending:  { bg: `var(--ds-bg-secondary, ${colorBg.secondary})`, text: `var(--ds-text-tertiary, ${primitiveColors.gray[500]})`, dot: `var(--ds-text-disabled, ${primitiveColors.gray[400]})`, border: `var(--ds-border-secondary, ${primitiveColors.gray[300]})`, label: "Pending" },
  stopped:  { bg: `var(--ds-bg-tertiary, ${colorBg.tertiary})`, text: `var(--ds-text-disabled, ${primitiveColors.gray[400]})`, dot: `var(--ds-border-secondary, ${primitiveColors.gray[300]})`, border: `var(--ds-border-secondary, ${primitiveColors.gray[200]})`, label: "Stopped" },
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
  dotShape = "circle",
}: {
  state: StatusChipState;
  dot: string;
  dotSize: number;
  dotShape?: "circle" | "square";
}) {
  if (state === "loading") {
    ensureSpinKeyframes();
    const r = dotSize / 2 - 1;
    const circ = 2 * Math.PI * r;
    return (
      <svg
        width={dotSize}
        height={dotSize}
        viewBox={`0 0 ${dotSize} ${dotSize}`}
        style={{ animation: "mds-status-spin 0.8s linear infinite", flexShrink: 0 }}
        aria-hidden="true"
      >
        <circle
          cx={dotSize / 2}
          cy={dotSize / 2}
          r={r}
          fill="none"
          stroke={dot}
          strokeWidth="1.5"
          strokeDasharray={circ}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <span
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotShape === "square" ? "1.5px" : "50%",
        backgroundColor: dot,
        flexShrink: 0,
        display: "inline-block",
      }}
      aria-hidden="true"
    />
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
  const paddingX = size === "md" ? 12 : 8;

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
    padding: `4px ${paddingX}px`,
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
      <LeadingIndicator state={state} dot={tokens.dot} dotSize={dotSize} dotShape={tokens.dotShape ?? "circle"} />
      {displayLabel}
    </span>
  );
};

StatusChip.displayName = "StatusChip";
export default StatusChip;
