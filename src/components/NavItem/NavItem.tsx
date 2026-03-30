import React, { useState } from "react";
import { colorText, colorIcon, colorBg } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type NavItemState = "default" | "hovered" | "pressed" | "selected";

export interface NavItemProps {
  /** Nav item label */
  label: string;
  /** Leading icon */
  icon?: React.ReactNode;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Whether this item has a submenu */
  hasSubmenu?: boolean;
  /** Whether submenu is expanded */
  expanded?: boolean;
  /** Active/selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Called when item is clicked */
  onClick?: () => void;
  /** Children: sub-nav items rendered when expanded */
  children?: React.ReactNode;
  /** Indent level for nested items */
  level?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// NavItem
// ──────────────────────────────────────────────────────────────────────────────
export const NavItem: React.FC<NavItemProps> = ({
  label,
  icon,
  showIcon = true,
  hasSubmenu = false,
  expanded: controlledExpanded,
  selected = false,
  disabled = false,
  onClick,
  children,
  level = 0,
  className,
  style,
}) => {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (hasSubmenu && !isControlled) setInternalExpanded((prev) => !prev);
    onClick?.();
  };

  const bg = selected
    ? `var(--ds-bg-interactive-runway-selected, ${colorBg.interactive.runwaySelected})`
    : pressed
    ? `var(--ds-bg-secondary, ${colorBg.secondary})`
    : hovered
    ? `var(--ds-bg-secondary, ${colorBg.secondary})`
    : "transparent";

  const textColor = selected
    ? `var(--ds-text-interactive-runway-primary, ${colorText.interactive.runwayPrimary})`
    : disabled
    ? `var(--ds-text-disabled, ${colorText.disabled})`
    : hasSubmenu && expanded
    ? `var(--ds-text-primary, ${colorText.primary})`
    : `var(--ds-text-secondary, ${colorText.secondary})`;
  const iconColor = selected
    ? `var(--ds-icon-interactive-runway-primary, ${colorIcon.interactive.runwayPrimary})`
    : disabled
    ? `var(--ds-icon-disabled, ${colorIcon.disabled})`
    : `var(--ds-icon-secondary, ${colorIcon.secondary})`;

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: 12,
    paddingLeft: 12 + level * 12,
    borderRadius: borderRadius.lg,
    backgroundColor: bg,
    color: textColor,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.medium,
    lineHeight: "16px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    userSelect: "none",
    transition: "background-color 0.1s ease",
    boxSizing: "border-box",
    ...style,
  };

  return (
    <div className={className}>
      <div
        style={itemStyle}
        onClick={handleClick}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => !disabled && setPressed(true)}
        onMouseUp={() => setPressed(false)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={hasSubmenu ? expanded : undefined}
        aria-current={selected ? "page" : undefined}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      >
        {showIcon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon ?? (
              // Default placeholder icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </span>
        )}
        <span style={{ flex: "1 0 0", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        {hasSubmenu && (
          <span style={{ color: iconColor }}>
            <Icon
              name={expanded ? "arrow2_up" : "arrow2_down"}
              size={16}
              color={iconColor}
            />
          </span>
        )}
      </div>

      {/* Sub-items */}
      {hasSubmenu && expanded && children && (
        <div style={{ paddingLeft: 0, overflow: "hidden", borderRadius: borderRadius.lg, width: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// SubNavItem — smaller sub-menu item (height 36px)
// ──────────────────────────────────────────────────────────────────────────────
export interface SubNavItemProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SubNavItem: React.FC<SubNavItemProps> = ({
  label,
  selected = false,
  disabled = false,
  onClick,
  className,
  style,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = selected
    ? `var(--ds-bg-interactive-runway-selected, ${colorBg.interactive.runwaySelected})`
    : pressed
    ? `var(--ds-bg-secondary, ${colorBg.secondary})`
    : hovered
    ? `var(--ds-bg-secondary, ${colorBg.secondary})`
    : `var(--ds-bg-tertiary, ${colorBg.tertiary})`;

  const textColor = selected
    ? `var(--ds-text-interactive-runway-primary, ${colorText.interactive.runwayPrimary})`
    : disabled
    ? `var(--ds-text-disabled, ${colorText.disabled})`
    : `var(--ds-text-interactive-secondary, ${colorText.interactive.secondary})`;
  const fontWt = fontWeight.medium;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: 36,
        padding: "6px 12px 6px 48px",
        backgroundColor: bg,
        color: textColor,
        fontFamily: fontFamily.body,
        fontSize: 12,
        fontWeight: fontWt,
        lineHeight: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        userSelect: "none",
        boxSizing: "border-box",
        transition: "background-color 0.1s ease",
        ...style,
      }}
      onClick={() => !disabled && onClick?.()}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-current={selected ? "page" : undefined}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </div>
  );
};

NavItem.displayName = "NavItem";
SubNavItem.displayName = "SubNavItem";
export default NavItem;
