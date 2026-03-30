import React, { useState, useId } from "react";
import { colorText, colorIcon, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type CheckedState = boolean | "indeterminate";

export interface CheckboxProps {
  /** Checked state; also accepts "indeterminate" */
  checked?: CheckedState;
  /** Default checked for uncontrolled usage */
  defaultChecked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Text label beside the checkbox */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible id */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Checkmark SVG (kept as unique checkbox-specific icon)
// ──────────────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path
        d="M1 3.5L3.8 6.5L9 1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IndeterminateIcon() {
  return (
    <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden="true">
      <path d="M1 1H9" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      label,
      disabled = false,
      id: externalId,
      className,
      style,
    },
    ref
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    const [internalChecked, setInternalChecked] = useState<CheckedState>(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;
    const isChecked = checked === true;
    const isIndeterminate = checked === "indeterminate";

    const [hovered, setHovered] = useState(false);

    const handleChange = () => {
      if (disabled) return;
      const next = isChecked || isIndeterminate ? false : true;
      if (!isControlled) setInternalChecked(next);
      onChange?.(next);
    };

    // Box styles — use CSS vars for dark mode support
    const getBoxBg = () => {
      if (disabled) return `var(--ds-bg-tertiary, ${colorBg.disabled})`;
      if (isChecked || isIndeterminate) return colorBg.interactive.runwayPrimary;
      return `var(--ds-bg-primary, ${colorBg.primary})`;
    };
    const getBoxBorder = () => {
      if (disabled) return `var(--ds-border-secondary, ${colorBorder.disabled})`;
      if (isChecked || isIndeterminate) return colorBg.interactive.runwayPrimary;
      if (hovered) return `var(--ds-border-primary, ${colorBorder.primary})`;
      return `var(--ds-border-secondary, ${colorBorder.secondary})`;
    };

    const boxStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      flexShrink: 0,
      borderRadius: borderRadius.md,
      border: `1px solid ${getBoxBorder()}`,
      backgroundColor: getBoxBg(),
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.15s ease, border-color 0.15s ease",
      boxSizing: "border-box",
    };

    const wrapperStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: spacing[8],
      cursor: disabled ? "not-allowed" : "pointer",
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: fontWeight.medium,
      lineHeight: "16px",
      color: disabled ? colorText.disabled : colorText.primary,
      userSelect: "none",
    };

    return (
      <label
        htmlFor={id}
        className={className}
        style={wrapperStyle}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Hidden native input for form/accessibility */}
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={isIndeterminate ? "mixed" : isChecked}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0, padding: 0, border: "none", overflow: "hidden", clip: "rect(0,0,0,0)" }}
        />
        {/* Custom box */}
        <span style={boxStyle} aria-hidden="true">
          {isIndeterminate && <IndeterminateIcon />}
          {isChecked && <CheckIcon />}
        </span>
        {label && <span style={labelStyle}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
