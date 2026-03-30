import React, { useState, useId } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type TextAreaState = "default" | "error" | "disabled";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label displayed above the textarea */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help / hint text below the textarea */
  helpMessage?: string;
  /** Validation state */
  state?: TextAreaState;
  /** Height of the textarea in pixels. Default: 180 */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      placeholder = "Placeholder",
      helpMessage,
      state = "default",
      height = 180,
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

    const getBorderColor = () => {
      if (isDisabled) return colorBorder.disabled;
      if (isError) return colorBorder.danger;
      if (focused) return colorBorder.interactive.runwayPrimary;
      if (hovered) return colorBorder.primary;
      return colorBorder.secondary;
    };

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: spacing[8],
      alignItems: "flex-start",
      width: "100%",
      ...style,
    };

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

    const textareaStyle: React.CSSProperties = {
      width: "100%",
      height,
      padding: spacing[12],
      boxSizing: "border-box",
      borderRadius: borderRadius.lg,
      border: `1px solid ${getBorderColor()}`,
      backgroundColor: isDisabled
        ? colorBg.disabled
        : colorBg.primary,
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: fontWeight.regular,
      lineHeight: "16px",
      color: isDisabled ? colorText.disabled : colorText.primary,
      outline: "none",
      resize: isDisabled ? "none" : "vertical",
      transition: "border-color 0.15s ease",
      cursor: isDisabled ? "not-allowed" : "text",
    };

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
        {/* Label */}
        {label && (
          <label htmlFor={id} style={labelStyle}>
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={id}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={isError}
          aria-describedby={helpMessage ? `${id}-help` : undefined}
          style={textareaStyle}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) setHovered(true);
            rest.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            setHovered(false);
            rest.onMouseLeave?.(e);
          }}
          {...rest}
        />

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

TextArea.displayName = "TextArea";

export default TextArea;
