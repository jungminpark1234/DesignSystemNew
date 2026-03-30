import React, { useState, useId, useRef, useEffect } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface SelectOption {
  /** Unique value used for selection */
  value: string;
  /** Display label shown in the list */
  label: string;
  /** Disable this specific option */
  disabled?: boolean;
}

export type SelectState = "default" | "error" | "disabled";

export interface SelectProps {
  /** Options list */
  options: SelectOption[];
  /** Currently selected value (controlled) */
  value?: string;
  /** Placeholder shown when nothing is selected */
  placeholder?: string;
  /** Field label displayed above the trigger */
  label?: string;
  /** Help / hint text below the trigger */
  helpMessage?: string;
  /** Validation state */
  state?: SelectState;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible name when no label is provided */
  "aria-label"?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      placeholder = "Placeholder",
      label,
      helpMessage,
      state = "default",
      onChange,
      className,
      style,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const autoId = useId();
    const id = autoId;
    const isDisabled = state === "disabled";
    const isError = state === "error";

    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [hoveredOption, setHoveredOption] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!open) return;
      const handleOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
          setFocused(false);
        }
      };
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, [open]);

    const getBorderColor = () => {
      if (isDisabled) return colorBorder.disabled;
      if (isError) return colorBorder.danger;
      if (open || focused) return colorBorder.interactive.runwayPrimary;
      if (hovered) return colorBorder.primary;
      return colorBorder.secondary;
    };

    const getChevronColor = () => {
      if (isDisabled) return colorText.disabled;
      return colorText.tertiary;
    };

    // Wrapper
    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: spacing[8],
      alignItems: "flex-start",
      width: "100%",
      position: "relative",
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

    const triggerStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: spacing[4],
      width: "100%",
      height: 32,
      padding: `${spacing[4]} ${spacing[12]}`,
      boxSizing: "border-box",
      borderRadius: borderRadius.lg,
      border: `1px solid ${getBorderColor()}`,
      backgroundColor: isDisabled ? colorBg.disabled : colorBg.primary,
      cursor: isDisabled ? "not-allowed" : "pointer",
      transition: "border-color 0.15s ease",
      outline: "none",
      userSelect: "none",
    };

    const triggerTextStyle: React.CSSProperties = {
      flex: "1 0 0",
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: fontWeight.regular,
      lineHeight: "16px",
      color: selectedOption
        ? isDisabled
          ? colorText.disabled
          : colorText.primary
        : colorText.tertiary,
      opacity: selectedOption ? 1 : 0.7,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      minWidth: 0,
      textAlign: "left",
    };

    const dropdownStyle: React.CSSProperties = {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      backgroundColor: colorBg.primary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colorBorder.secondary}`,
      boxShadow: `0 4px 16px rgba(0,0,0,0.08)`,
      zIndex: 1000,
      overflow: "hidden",
      padding: `${spacing[4]} 0`,
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

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setOpen(false);
      setFocused(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isDisabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setFocused(false);
      }
      if (e.key === "ArrowDown" && open) {
        e.preventDefault();
        const currentIdx = options.findIndex((o) => o.value === hoveredOption);
        const nextIdx = Math.min(currentIdx + 1, options.length - 1);
        setHoveredOption(options[nextIdx]?.value ?? null);
      }
      if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        const currentIdx = options.findIndex((o) => o.value === hoveredOption);
        const prevIdx = Math.max(currentIdx - 1, 0);
        setHoveredOption(options[prevIdx]?.value ?? null);
      }
      if (e.key === "Enter" && open && hoveredOption) {
        handleSelect(hoveredOption);
      }
    };

    return (
      <div ref={ref} className={className} style={wrapperStyle}>
        {/* Label */}
        {label && (
          <label htmlFor={id} style={labelStyle} onClick={() => !isDisabled && setOpen(true)}>
            {label}
          </label>
        )}

        {/* Trigger + Dropdown wrapper (for positioning) */}
        <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
          {/* Trigger button */}
          <div
            role="combobox"
            id={id}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={ariaLabel ?? label}
            aria-invalid={isError}
            aria-describedby={helpMessage ? `${id}-help` : undefined}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
            style={triggerStyle}
            onClick={() => {
              if (!isDisabled) {
                setOpen((prev) => !prev);
                setFocused(true);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!open) setFocused(false);
            }}
            onMouseEnter={() => !isDisabled && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onKeyDown={handleKeyDown}
          >
            <span style={triggerTextStyle}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <Icon
              name="arrow2_down"
              size={16}
              color={getChevronColor()}
            />
          </div>

          {/* Dropdown */}
          {open && (
            <div style={dropdownStyle} role="listbox" aria-label={label}>
              {options.map((option) => {
                const isSelected = option.value === value;
                const isOptionHovered = hoveredOption === option.value;
                const isOptionDisabled = option.disabled;

                const optionStyle: React.CSSProperties = {
                  display: "flex",
                  alignItems: "center",
                  padding: `${spacing[4]} ${spacing[8]}`,
                  cursor: isOptionDisabled ? "not-allowed" : "pointer",
                  backgroundColor: isSelected
                    ? colorBg.interactive.runwaySelected
                    : isOptionHovered
                    ? colorBg.tertiary
                    : colorBg.primary,
                  transition: "background-color 0.1s ease",
                };

                const optionTextStyle: React.CSSProperties = {
                  fontFamily: fontFamily.body,
                  fontSize: 14,
                  fontWeight: fontWeight.medium,
                  lineHeight: "16px",
                  color: isOptionDisabled
                    ? colorText.disabled
                    : isSelected
                    ? colorText.primary
                    : colorText.secondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                };

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isOptionDisabled}
                    style={optionStyle}
                    onMouseEnter={() => !isOptionDisabled && setHoveredOption(option.value)}
                    onMouseLeave={() => setHoveredOption(null)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent blur on trigger
                      if (!isOptionDisabled) handleSelect(option.value);
                    }}
                  >
                    <span style={optionTextStyle}>{option.label}</span>
                  </div>
                );
              })}
            </div>
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

Select.displayName = "Select";

export default Select;
