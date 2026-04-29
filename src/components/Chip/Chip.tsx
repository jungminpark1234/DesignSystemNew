import React, { useState } from "react";
import { colorText, colorIcon, colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type ChipSize = "sm" | "md";
export type ChipTone = "default" | "success" | "info";

export interface ChipProps {
  /** Chip label text */
  label?: string;
  /** Chip size */
  size?: ChipSize;
  /** Color tone — default (gray/runway), success (green), info (blue). Applied to bg/border/text. */
  tone?: ChipTone;
  /** Whether the chip is selected */
  selected?: boolean;
  /** Whether to show a leading icon slot */
  leadingIcon?: React.ReactNode;
  /** Show close/remove button */
  closable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Called when the chip is clicked */
  onClick?: (selected: boolean) => void;
  /** Called when the close button is clicked */
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Chip: React.FC<ChipProps> = ({
  label = "Label",
  size = "md",
  tone = "default",
  selected: controlledSelected,
  leadingIcon,
  closable = false,
  disabled = false,
  onClick,
  onClose,
  className,
  style,
}) => {
  const isControlled = controlledSelected !== undefined;
  const [internalSelected, setInternalSelected] = useState(false);
  const selected = isControlled ? controlledSelected : internalSelected;

  const height = size === "md" ? 32 : 24;
  const fontSize = size === "md" ? 14 : 12;
  const paddingX = size === "md" ? 12 : 8;
  const gap = 4;

  const handleClick = () => {
    if (disabled) return;
    const next = !selected;
    if (!isControlled) setInternalSelected(next);
    onClick?.(next);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onClose?.();
  };

  // Tone-aware colors. Selected state always uses runway by default; other tones override.
  const toneColors = (() => {
    if (tone === "success") {
      return {
        bg: colorBg.successSubtle,
        border: colorBg.success,
        text: colorText.success,
        icon: colorIcon.success,
      };
    }
    if (tone === "info") {
      return {
        bg: colorBg.infoSubtle,
        border: colorBg.info,
        text: colorText.info,
        icon: colorIcon.info,
      };
    }
    // default tone — gray/runway
    return {
      bg: selected ? colorBg.interactive.runwaySelected : colorBg.secondary,
      border: selected ? colorBorder.interactive.runwayPrimary : colorBorder.secondary,
      text: selected ? colorText.interactive.runwayPrimary : colorText.interactive.secondary,
      icon: selected ? colorIcon.interactive.runwayPrimary : colorIcon.secondary,
    };
  })();

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap,
    height,
    padding: `4px ${paddingX}px`,
    borderRadius: borderRadius.rounded,
    border: `1px solid ${toneColors.border}`,
    backgroundColor: toneColors.bg,
    color: toneColors.text,
    fontFamily: fontFamily.body,
    fontSize,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    userSelect: "none",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    whiteSpace: "nowrap",
    ...style,
  };

  return (
    <button
      type="button"
      className={className}
      style={chipStyle}
      disabled={disabled}
      onClick={handleClick}
      aria-pressed={selected}
    >
      {leadingIcon && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: size === "md" ? 20 : 16,
            height: size === "md" ? 20 : 16,
            color: toneColors.icon,
            flexShrink: 0,
          }}
        >
          {leadingIcon}
        </span>
      )}
      <span>{label}</span>
      {closable && (
        <span
          onClick={handleClose}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: size === "md" ? 20 : 16,
            height: size === "md" ? 20 : 16,
            color: toneColors.icon,
            flexShrink: 0,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          aria-label="Remove"
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClose(e as any); }}
        >
          <Icon name="xonly" size={size === "md" ? 16 : 14} color={toneColors.icon} />
        </span>
      )}
    </button>
  );
};

Chip.displayName = "Chip";
export default Chip;
