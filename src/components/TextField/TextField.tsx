import React, { useState, useId } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type TextFieldState = "default" | "error" | "disabled";

export type HelpMessageStatus = "default" | "error" | "success" | "info" | "warning";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Field label displayed above the input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help / hint text below the input */
  helpMessage?: string;
  /** Help message status — determines icon and color */
  helpMessageStatus?: HelpMessageStatus;
  /** Validation state */
  state?: TextFieldState;
  /** Icon rendered on the left side (16 × 16) */
  leadingIcon?: React.ReactNode;
  /** Icon rendered on the right side (16 × 16) */
  trailingIcon?: React.ReactNode;
  /** Icon rendered next to the label (16 × 16) */
  helpIcon?: React.ReactNode;
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
const v = (name: string, fb: string) => `var(${name}, ${fb})`;

function getBorderColor(
  state: TextFieldState,
  focused: boolean,
  hovered: boolean,
  pressed: boolean,
): string {
  if (state === "disabled") return v("--ds-border-disabled", colorBorder.disabled);
  if (state === "error") return v("--ds-border-danger", colorBorder.danger);
  if (focused) return v("--ds-border-interactive-runway-primary", colorBorder.interactive.runwayPrimary);
  if (pressed) return v("--ds-border-interactive-runway-primary-pressed", colorBorder.interactive.runwayPrimaryPressed);
  if (hovered) return v("--ds-border-interactive-runway-primary-hovered", colorBorder.interactive.runwayPrimaryHovered);
  return v("--ds-border-interactive-secondary", colorBorder.interactive.secondary);
}

function getBgColor(state: TextFieldState, hovered: boolean): string {
  if (state === "disabled") return v("--ds-bg-disabled", colorBg.disabled);
  if (hovered) return v("--ds-bg-interactive-secondary-hovered", colorBg.interactive.secondaryHovered);
  return v("--ds-bg-primary", colorBg.primary);
}

const HELP_STATUS_COLORS: Record<HelpMessageStatus, string> = {
  default: `var(--ds-text-tertiary, ${colorText.tertiary})`,
  error: `var(--ds-text-danger, ${colorText.danger})`,
  success: `var(--ds-text-success, ${colorText.success})`,
  info: `var(--ds-text-info, ${colorText.info})`,
  warning: `var(--ds-text-warning, ${colorText.warning})`,
};

const HELP_STATUS_ICONS: Record<string, string> = {
  error: "error-circle-stroke",
  success: "check-circle-stroke",
  info: "info-circle-stroke",
  warning: "warning-circle-stroke",
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder = "Placeholder",
      helpMessage,
      helpMessageStatus,
      state = "default",
      leadingIcon,
      trailingIcon,
      helpIcon,
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
    const [pressed, setPressed] = useState(false);

    // Track length for uncontrolled mode
    const [internalLength, setInternalLength] = useState(
      typeof rest.defaultValue === "string" ? rest.defaultValue.length : 0
    );
    const currentLength = value !== undefined ? value.length : internalLength;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (value === undefined) setInternalLength(e.target.value.length);
      onChange?.(e);
    };

    // Resolve help message status: explicit prop > inferred from state
    const resolvedHelpStatus: HelpMessageStatus =
      helpMessageStatus ?? (isError ? "error" : "default");

    const borderColor = getBorderColor(state, focused, hovered, pressed);
    const bgColor = getBgColor(state, hovered && !focused);

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
        ? v("--ds-text-disabled", colorText.disabled)
        : v("--ds-text-interactive-secondary", colorText.interactive.secondary),
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
      backgroundColor: bgColor,
      transition: "border-color 0.15s ease, background-color 0.15s ease",
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
      color: isDisabled ? v("--ds-text-disabled", colorText.disabled) : v("--ds-text-primary", colorText.primary),
      cursor: isDisabled ? "not-allowed" : "text",
      minWidth: 0,
      width: "100%",
    };

    // Help message
    const helpColor = HELP_STATUS_COLORS[resolvedHelpStatus];
    const helpIconName = HELP_STATUS_ICONS[resolvedHelpStatus];

    const helpStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: helpIconName ? spacing[4] : 0,
      fontFamily: fontFamily.body,
      fontSize: 12,
      fontWeight: fontWeight.medium,
      lineHeight: "16px",
      color: helpColor,
    };

    return (
      <div className={className} style={wrapperStyle}>
        {/* Label + optional help icon + counter */}
        {label && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <label htmlFor={id} style={labelStyle}>
                {label}
              </label>
              {helpIcon && (
                <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, width: 16, height: 16 }}>
                  {helpIcon}
                </span>
              )}
            </div>
            {maxLength !== undefined && (
              <span style={{
                fontFamily: fontFamily.body,
                fontSize: 12,
                fontWeight: fontWeight.regular,
                lineHeight: "16px",
                color: v("--ds-text-tertiary", colorText.tertiary),
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
          onMouseLeave={() => { setHovered(false); setPressed(false); }}
          onMouseDown={() => !isDisabled && setPressed(true)}
          onMouseUp={() => setPressed(false)}
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
            {helpIconName && (
              <Icon name={helpIconName} size={16} color={helpColor} />
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
