import React, { useState, useId } from "react";
import { colorText, colorBg } from "../../tokens/colors";
import { spacing } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface SwitchProps {
  /** Whether the switch is on */
  checked?: boolean;
  /** Default checked for uncontrolled usage */
  defaultChecked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Text label beside the switch */
  label?: string;
  /** Label position */
  labelPosition?: "left" | "right";
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
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      label,
      labelPosition = "right",
      disabled = false,
      id: externalId,
      className,
      style,
    },
    ref
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const handleChange = () => {
      if (disabled) return;
      const next = !checked;
      if (!isControlled) setInternalChecked(next);
      onChange?.(next);
    };

    // Track bg color
    const getTrackBg = () => {
      if (disabled) return colorBg.neutral;
      if (checked) {
        if (pressed) return colorBg.interactive.runwayPrimaryPressed;
        if (hovered) return colorBg.interactive.runwayPrimaryHovered;
        return colorBg.interactive.runwayPrimary;
      } else {
        if (pressed) return colorBg.interactive.neutralPressed;
        if (hovered) return colorBg.interactive.neutralHovered;
        return colorBg.interactive.neutral;
      }
    };

    const trackStyle: React.CSSProperties = {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      width: 48,
      height: 24,
      borderRadius: 9999,
      backgroundColor: getTrackBg(),
      padding: 4,
      boxSizing: "border-box",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.2s ease",
      flexShrink: 0,
    };

    const indicatorStyle: React.CSSProperties = {
      position: "absolute",
      width: 16,
      height: 16,
      borderRadius: "50%",
      backgroundColor: colorBg.primary,
      top: 4,
      left: checked ? "calc(100% - 20px)" : 4,
      transition: "left 0.2s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    };

    const wrapperStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: spacing[8],
      cursor: disabled ? "not-allowed" : "pointer",
      flexDirection: labelPosition === "left" ? "row-reverse" : "row",
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
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => !disabled && setPressed(true)}
        onMouseUp={() => setPressed(false)}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={checked}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0 }}
        />
        <span style={trackStyle} aria-hidden="true">
          <span style={indicatorStyle} />
        </span>
        {label && <span style={labelStyle}>{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
export default Switch;
