import React, { useId } from "react";
import { Checkbox, type CheckedState } from "../Checkbox/Checkbox";
import { Radio } from "../Radio/Radio";
import { colorText } from "../../tokens/colors";
import { spacing } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface ControlGroupOption {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Disable this specific item */
  disabled?: boolean;
}

export type ControlGroupType = "checkbox" | "radio";
export type ControlGroupDirection = "vertical" | "horizontal";

export interface ControlGroupProps {
  /** "checkbox" or "radio" */
  type?: ControlGroupType;
  /** Group label shown above the options */
  groupLabel?: string;
  /** Options list */
  options: ControlGroupOption[];
  /** Selected value(s): string for radio, string[] for checkbox */
  value?: string | string[];
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Disable all controls */
  disabled?: boolean;
  /** Layout direction */
  direction?: ControlGroupDirection;
  /** name attribute forwarded to radio inputs */
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const ControlGroup: React.FC<ControlGroupProps> = ({
  type = "checkbox",
  groupLabel,
  options,
  value,
  onChange,
  disabled = false,
  direction = "vertical",
  name: externalName,
  className,
  style,
}) => {
  const autoName = useId();
  const radioName = externalName ?? autoName;

  const selectedValues: string[] =
    type === "radio"
      ? value != null ? [value as string] : []
      : Array.isArray(value) ? value : [];

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const next = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue);
    onChange?.(next);
  };

  const handleRadioChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[8],
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.medium,
    lineHeight: "16px",
    color: disabled ? colorText.disabled : colorText.interactive.secondary,
    userSelect: "none",
  };

  const optionsWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: direction === "horizontal" ? "row" : "column",
    gap: direction === "horizontal" ? spacing[16] : spacing[8],
    flexWrap: direction === "horizontal" ? "wrap" : "nowrap",
  };

  return (
    <fieldset
      className={className}
      style={{
        border: "none",
        padding: 0,
        margin: 0,
        ...wrapperStyle,
      }}
      disabled={disabled}
    >
      {groupLabel && (
        <legend style={labelStyle}>{groupLabel}</legend>
      )}

      <div style={optionsWrapperStyle} role={type === "radio" ? "radiogroup" : undefined}>
        {options.map((option) => {
          const isOptionDisabled = disabled || option.disabled;

          if (type === "checkbox") {
            const isChecked = selectedValues.includes(option.value);
            return (
              <Checkbox
                key={option.value}
                checked={isChecked as CheckedState}
                label={option.label}
                disabled={isOptionDisabled}
                onChange={(checked) => handleCheckboxChange(option.value, checked)}
              />
            );
          }

          // radio
          return (
            <Radio
              key={option.value}
              name={radioName}
              value={option.value}
              checked={selectedValues.includes(option.value)}
              label={option.label}
              disabled={isOptionDisabled}
              onChange={() => handleRadioChange(option.value)}
            />
          );
        })}
      </div>
    </fieldset>
  );
};

ControlGroup.displayName = "ControlGroup";
export default ControlGroup;
