import React, { useState } from "react";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Design tokens
// ──────────────────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    bg: { primary: "var(--ds-bg-primary, #ffffff)" },
    border: { primary: "var(--ds-border-secondary, #e5e7eb)" },
    text: {
      interactive: { secondary: "var(--ds-text-interactive-secondary, #4a5565)" },
      tertiary: "var(--ds-text-tertiary, #6a7282)",
    },
    icon: {
      secondary: "var(--ds-icon-secondary, #364153)",
      tertiary: "var(--ds-text-tertiary, #6a7282)",
    },
  },
  font: {
    family: fontFamily.body,
    size: { md: 14 },
    weight: { regular: fontWeight.regular, medium: fontWeight.medium },
    lineHeight: { md: "16px" },
  },
  spacing,
  border: { radius: borderRadius },
};

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

/** A single breadcrumb item */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional leading icon (16–20px React node) */
  icon?: React.ReactNode;
  /** Click handler for non-current items */
  onClick?: () => void;
}

export interface GlobalNavAction {
  key: string;
  /** Icon element (20–24px) */
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export interface GlobalNavUser {
  initial?: string;
  avatarSrc?: string;
  /** Background color for the avatar circle */
  avatarColor?: string;
  onClick?: () => void;
}

export interface GlobalNavProps {
  /** Breadcrumb items — last item is treated as the current page */
  breadcrumbs?: BreadcrumbItem[];
  /** Icon-button actions on the right */
  actions?: GlobalNavAction[];
  /** User avatar on the far right */
  user?: GlobalNavUser;
  /** Override right side entirely */
  rightContent?: React.ReactNode;
  /** Override left side entirely */
  leftContent?: React.ReactNode;
  /** Bar height (default 48) */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Breadcrumb slash divider  (" / " — rotated 30° line inside 24×24 box)
// ──────────────────────────────────────────────────────────────────────────────
function BreadcrumbDivider() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 1,
          height: 16,
          backgroundColor: tokens.color.icon.tertiary,
          borderRadius: 16,
          transform: "rotate(30deg)",
          flexShrink: 0,
        }}
      />
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Single breadcrumb item
// ──────────────────────────────────────────────────────────────────────────────
function BreadcrumbLink({
  item,
  isCurrent,
}: {
  item: BreadcrumbItem;
  isCurrent: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [usingMouse, setUsingMouse] = useState(false);
  const showFocusRing = focused && !usingMouse;

  const isClickable = !isCurrent && !!item.onClick;

  const getBackground = () => {
    if (!isClickable) return "transparent";
    if (pressed) return "var(--ds-bg-interactive-secondary-pressed, rgba(0,0,0,0.08))";
    if (hovered) return "var(--ds-bg-interactive-secondary-hovered, rgba(0,0,0,0.04))";
    return "transparent";
  };

  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacing[4],
    padding: `${tokens.spacing[4]} ${tokens.spacing[8]}`,
    cursor: isClickable ? "pointer" : "default",
    borderRadius: 4,
    background: getBackground(),
    outline: showFocusRing && isClickable ? "2px solid var(--ds-border-interactive-primary, #2563eb)" : "none",
    outlineOffset: 1,
    transition: "background 0.15s ease, outline 0.1s ease, color 0.15s ease",
    flexShrink: 0,
  };

  const textStyle: React.CSSProperties = {
    fontFamily: tokens.font.family,
    fontSize: tokens.font.size.md,
    fontWeight: isCurrent
      ? tokens.font.weight.medium
      : tokens.font.weight.regular,
    lineHeight: tokens.font.lineHeight.md,
    color: isCurrent
      ? tokens.color.text.interactive.secondary
      : tokens.color.text.tertiary,
    whiteSpace: "nowrap",
  };

  return (
    <span
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={containerStyle}
      onClick={isClickable ? item.onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { setPressed(true); setUsingMouse(true); }}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); setUsingMouse(false); }}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          item.onClick?.();
        }
      }}
      aria-current={isCurrent ? "page" : undefined}
    >
      {item.icon && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0,
          }}
        >
          {item.icon}
        </span>
      )}
      <span style={textStyle}>{item.label}</span>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Action icon button
// ──────────────────────────────────────────────────────────────────────────────
function ActionButton({ action }: { action: GlobalNavAction }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      key={action.key}
      type="button"
      aria-label={action.label}
      onClick={action.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: tokens.border.radius["3xl"],
        border: "none",
        backgroundColor: hovered ? "var(--ds-bg-tertiary, #f3f4f6)" : "transparent",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.12s",
      }}
    >
      {action.icon}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// User avatar button
// ──────────────────────────────────────────────────────────────────────────────
function UserButton({ user }: { user: GlobalNavUser }) {
  return (
    <button
      type="button"
      aria-label="User profile"
      onClick={user.onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        border: "none",
        background: "none",
        cursor: user.onClick ? "pointer" : "default",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {user.avatarSrc ? (
        <img
          src={user.avatarSrc}
          alt={user.initial ?? "User"}
          style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: user.avatarColor ?? "#dc2626",
            fontFamily: tokens.font.family,
            fontSize: 10,
            fontWeight: 600,
            lineHeight: 1,
            color: "#ffffff",
            flexShrink: 0,
            letterSpacing: "0.02em",
          }}
        >
          {user.initial ?? "?"}
        </span>
      )}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// GlobalNav
// ──────────────────────────────────────────────────────────────────────────────
export const GlobalNav: React.FC<GlobalNavProps> = ({
  breadcrumbs,
  actions,
  user,
  rightContent,
  leftContent,
  height = 60,
  className,
  style,
}) => {
  return (
    <header
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height,
        padding: `0 ${tokens.spacing[24]}`,
        backgroundColor: tokens.color.bg.primary,
        borderBottom: "none",
        boxSizing: "border-box",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* ── Left: breadcrumbs ── */}
      <div
        style={{
          flex: "1 0 0",
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {leftContent ??
          (breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="breadcrumb"
              style={{ display: "flex", alignItems: "center" }}
            >
              {breadcrumbs.map((item, i) => (
                <React.Fragment key={i}>
                  <BreadcrumbLink
                    item={item}
                    isCurrent={i === breadcrumbs.length - 1}
                  />
                  {i < breadcrumbs.length - 1 && <BreadcrumbDivider />}
                </React.Fragment>
              ))}
            </nav>
          ))}
      </div>

      {/* ── Right: actions + user ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.spacing[16],
          flexShrink: 0,
        }}
      >
        {actions?.map((action) => (
          <ActionButton key={action.key} action={action} />
        ))}
        {rightContent ?? (user && <UserButton user={user} />)}
      </div>
    </header>
  );
};

GlobalNav.displayName = "GlobalNav";
export default GlobalNav;
