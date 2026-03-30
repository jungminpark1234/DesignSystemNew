import React, { useState, useId } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type TextFieldState = "default" | "error" | "disabled";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Field label displayed above the input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help / hint text below the input */
  helpMessage?: string;
  /** Validation state */
  state?: TextFieldState;
  /** Icon rendered on the left side (16 × 16) */
  leadingIcon?: React.ReactNode;
  /** Icon rendered on the right side (16 × 16) */
  trailingIcon?: React.ReactNode;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Maximum character count — shows a counter "{current}/{max}" next to the label */
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function getBorderColor(state: TextFieldState, focused: boolean, hovered: boolean): string {
  if (state === "disabled") return colorBorder.disabled;
  if (state === "error") return colorBorder.danger;
  if (focused) return colorBorder.interactive.runwayPrimary;
  if (hovered) return colorBorder.primary;
  return colorBorder.secondary;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder = "Placeholder",
      helpMessage,
      state = "default",
      leadingIcon,
      trailingIcon,
      value,
      onChange,
      maxLength,
      className,
      style,
      id: externalId,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;
    const isDisabled = state === "disabled";
    const isError = state === "error";

    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    // Track length for uncontrolled mode
    const [internalLength, setInternalLength] = useState(
      typeof rest.defaultValue === "string" ? rest.defaultValue.length : 0
    );
    const currentLength = value !== undefined ? value.length : internalLength;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (value === undefined) setInternalLength(e.target.value.length);
      onChange?.(e);
    };

    const borderColor = getBorderColor(state, focused, hovered);

    // Wrapper
    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: spacing[8],
      alignItems: "flex-start",
      position: "relative",
      width: "100%",
      ...style,
    };

    // Label
    const labelStyle: React.CSSProperties = {
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: fontWeight.medium,
      lineHeight: "16px",
      color: isDisabled
        ? colorText.disabled
        : colorText.interactive.secondary,
      userSelect: "none",
    };

    // Input wrapper
    const inputWrapperStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: spacing[4],
      width: "100%",
      height: 32,
      padding: `${spacing[4]} ${spacing[12]}`,
      boxSizing: "border-box",
      borderRadius: borderRadius.lg,
      border: `1px solid ${borderColor}`,
      backgroundColor: isDisabled
        ? colorBg.disabled
        : colorBg.primary,
      transition: "border-color 0.15s ease",
      cursor: isDisabled ? "not-allowed" : "text",
      overflow: "hidden",
    };

    // Input element itself
    const inputStyle: React.CSSProperties = {
      flex: "1 0 0",
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: fontWeight.regular,
      lineHeight: "16px",
      color: isDisabled ? colorText.disabled : colorText.primary,
      cursor: isDisabled ? "not-allowed" : "text",
      minWidth: 0,
      width: "100%",
    };

    // Help message
    const helpStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: spacing[4],
      fontFamily: fontFamily.body,
      fontSize: 12,
      fontWeight: fontWeight.medium,
      lineHeight: "16px",
      color: isError ? colorText.danger : colorText.tertiary,
    };

    return (
      <div className={className} style={wrapperStyle}>
        {/* Label + optional character counter */}
        {label && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <label htmlFor={id} style={labelStyle}>
              {label}
            </label>
            {maxLength !== undefined && (
              <span style={{
                fontFamily: fontFamily.body,
                fontSize: 12,
                fontWeight: fontWeight.regular,
                lineHeight: "16px",
                color: colorText.tertiary,
                flexShrink: 0,
              }}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Input wrapper */}
        <div
          style={inputWrapperStyle}
          onMouseEnter={() => !isDisabled && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {leadingIcon && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                width: 16,
                height: 16,
                color: isDisabled
                  ? colorText.disabled
                  : colorText.tertiary,
              }}
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={isDisabled}
            maxLength={maxLength}
            aria-invalid={isError}
            aria-describedby={helpMessage ? `${id}-help` : undefined}
            style={inputStyle}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            {...rest}
          />

          {trailingIcon && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                width: 16,
                height: 16,
                color: isDisabled
                  ? colorText.disabled
                  : colorText.tertiary,
              }}
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {/* Help message */}
        {helpMessage && (
          <span id={`${id}-help`} style={helpStyle}>
            {isError && (
              <Icon name="error-circle-stroke" size={16} color={colorText.danger} />
            )}
            {helpMessage}
          </span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
