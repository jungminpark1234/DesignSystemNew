import React, { useState, useId } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface RadioProps {
  /** Whether this radio is selected */
  checked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** name attribute (for native radio group behaviour) */
  name?: string;
  /** value attribute */
  value?: string;
  /** Text label beside the radio */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible id */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked = false,
      onChange,
      name,
      value,
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
    const [hovered, setHovered] = useState(false);

    const getBg = () => {
      if (disabled) return colorBg.disabled;
      if (checked) return colorBg.interactive.runwayPrimary;
      return colorBg.primary;
    };

    const getBorder = () => {
      if (disabled) return colorBorder.disabled;
      if (checked) return colorBg.interactive.runwayPrimary;
      if (hovered) return colorBorder.primary;
      return colorBorder.secondary;
    };

    const circleStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      flexShrink: 0,
      borderRadius: "50%",
      border: `1px solid ${getBorder()}`,
      backgroundColor: getBg(),
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
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0 }}
        />
        {/* Custom radio circle */}
        <span style={circleStyle} aria-hidden="true">
          {checked && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: disabled
                  ? colorText.disabled
                  : colorBg.primary,
                flexShrink: 0,
              }}
            />
          )}
        </span>
        {label && <span style={labelStyle}>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";
export default Radio;
