import React, { useState } from "react";
import { colorText } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";
import { spacing, borderRadius } from "../../tokens/spacing";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type LinkType  = "primary" | "secondary";
export type LinkStyle = "standalone" | "underline";
export type LinkState = "default" | "hovered" | "visited" | "focused" | "pressed" | "disabled";

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
  /** Link label text */
  label?: string;
  /** Color type */
  type?: LinkType;
  /** Underline always-on vs standalone */
  linkStyle?: LinkStyle;
  /** Leading icon slot */
  leadingIcon?: React.ReactNode;
  /** Trailing icon slot */
  trailingIcon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Token map
// ──────────────────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<LinkType, { default: string; hover: string; visited: string; pressed: string }> = {
  primary:   { default: colorText.interactive.runwayPrimary, hover: colorText.interactive.runwayPrimaryHovered, visited: "#7c3aed", pressed: colorText.interactive.runwayPrimaryPressed },
  secondary:  { default: colorText.interactive.secondary, hover: colorText.secondary, visited: colorText.secondary, pressed: colorText.secondary },
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Link: React.FC<LinkProps> = ({
  label = "Label",
  type = "secondary",
  linkStyle = "standalone",
  leadingIcon,
  trailingIcon,
  disabled = false,
  href,
  onClick,
  className,
  style,
  ...rest
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const colors = TYPE_COLORS[type];

  const color = disabled
    ? colorText.disabled
    : pressed
    ? colors.pressed
    : hovered
    ? colors.hover
    : colors.default;

  const linkStyle_: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing[4],
    padding: `${spacing[4]} ${spacing[8]}`,
    color,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: "16px",
    textDecoration: linkStyle === "underline" ? "underline" : hovered ? "underline" : "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    userSelect: "none",
    outline: "none",
    borderRadius: borderRadius.md,
    transition: "color 0.15s ease",
    ...style,
  };

  return (
    <a
      className={className}
      style={linkStyle_}
      href={disabled ? undefined : href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...rest}
    >
      {leadingIcon && (
        <span style={{ display: "inline-flex", alignItems: "center", width: 20, height: 20, flexShrink: 0 }}>
          {leadingIcon}
        </span>
      )}
      <span>{label}</span>
      {trailingIcon && (
        <span style={{ display: "inline-flex", alignItems: "center", width: 20, height: 20, flexShrink: 0 }}>
          {trailingIcon}
        </span>
      )}
    </a>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Breadcrumb item
// ──────────────────────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  /** List of breadcrumb items — last item is the current page */
  items: BreadcrumbItem[];
  className?: string;
  style?: React.CSSProperties;
}

function SlashDivider() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        flexShrink: 0,
        color: colorText.tertiary,
        fontSize: 16,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      /
    </span>
  );
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  style,
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        ...style,
      }}
    >
      <ol
        style={{
          display: "inline-flex",
          alignItems: "center",
          listStyle: "none",
          margin: 0,
          padding: 0,
          gap: 0,
        }}
      >
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li
              key={i}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              {isCurrent ? (
                // Current page — medium weight, full opacity
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: spacing[4],
                    padding: `${spacing[4]} ${spacing[8]}`,
                    fontFamily: fontFamily.body,
                    fontSize: 14,
                    fontWeight: fontWeight.medium,
                    lineHeight: "16px",
                    color: colorText.interactive.secondary,
                    whiteSpace: "nowrap",
                  }}
                  aria-current="page"
                >
                  {item.icon && (
                    <span style={{ display: "inline-flex", width: 20, height: 20 }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              ) : (
                // Ancestor — link, tertiary text color
                <span
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing[4],
                      padding: `${spacing[4]} ${spacing[8]}`,
                      fontFamily: fontFamily.body,
                      fontSize: 14,
                      fontWeight: fontWeight.regular,
                      lineHeight: "16px",
                      color: colorText.tertiary,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.textDecoration = "underline";
                      el.style.color = colorText.interactive.secondary;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.textDecoration = "none";
                      el.style.color = colorText.tertiary;
                    }}
                  >
                    {item.icon && (
                      <span style={{ display: "inline-flex", width: 20, height: 20 }}>
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </a>
                </span>
              )}
              {!isCurrent && <SlashDivider />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Link.displayName = "Link";
Breadcrumbs.displayName = "Breadcrumbs";
export default Link;
