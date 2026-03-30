import React, { useState } from "react";
import { NavItem, SubNavItem } from "../NavItem/NavItem";
import type { NavItemProps } from "../NavItem/NavItem";
import { colorBg, colorBorder } from "../../tokens/colors";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface SidebarNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: SidebarNavItem[];
}

export interface SidebarProps {
  /** Navigation items */
  items: SidebarNavItem[];
  /** Controlled selected key */
  selectedKey?: string;
  /** Called when a nav item is selected */
  onSelect?: (key: string) => void;
  /** Top logo/brand area */
  header?: React.ReactNode;
  /** Bottom user/settings area */
  footer?: React.ReactNode;
  /** Width in px (default: 220) */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Internal recursive renderer
// ──────────────────────────────────────────────────────────────────────────────
function RenderItem({
  item,
  selectedKey,
  onSelect,
  level,
  toggledKeys,
  onToggle,
}: {
  item: SidebarNavItem;
  selectedKey?: string;
  onSelect?: (key: string) => void;
  level: number;
  toggledKeys: Set<string>;
  onToggle: (key: string) => void;
}) {
  const isSelected = item.key === selectedKey;
  const hasChildren = !!(item.children && item.children.length > 0);
  const isChildSelected = hasChildren
    ? item.children!.some((c) => c.key === selectedKey || c.children?.some((cc) => cc.key === selectedKey))
    : false;

  if (level > 0) {
    // Sub-nav level
    return (
      <>
        <SubNavItem
          label={item.label}
          selected={isSelected}
          disabled={item.disabled}
          onClick={() => !hasChildren && onSelect?.(item.key)}
        />
        {hasChildren &&
          item.children!.map((child) => (
            <RenderItem
              key={child.key}
              item={child}
              selectedKey={selectedKey}
              onSelect={onSelect}
              level={level + 1}
              toggledKeys={toggledKeys}
              onToggle={onToggle}
            />
          ))}
      </>
    );
  }

  // Auto-expanded when a child is selected; user can toggle to collapse/expand
  const autoExpanded = isChildSelected || isSelected;
  const isToggled = toggledKeys.has(item.key);
  const expanded = isToggled ? !autoExpanded : autoExpanded;

  // Top-level nav item
  return (
    <NavItem
      key={item.key}
      label={item.label}
      icon={item.icon}
      hasSubmenu={hasChildren}
      expanded={expanded}
      selected={isSelected && !hasChildren}
      disabled={item.disabled}
      onClick={() => {
        if (hasChildren) {
          onToggle(item.key);
        } else {
          onSelect?.(item.key);
        }
      }}
      level={level}
    >
      {hasChildren &&
        item.children!.map((child) => (
          <RenderItem
            key={child.key}
            item={child}
            selectedKey={selectedKey}
            onSelect={onSelect}
            level={level + 1}
            toggledKeys={toggledKeys}
            onToggle={onToggle}
          />
        ))}
    </NavItem>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sidebar Component
// ──────────────────────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  selectedKey,
  onSelect,
  header,
  footer,
  width = 220,
  className,
  style,
}) => {
  // Tracks which parent items have been manually toggled (flips auto-expand)
  const [toggledKeys, setToggledKeys] = useState<Set<string>>(new Set());

  const handleToggle = (key: string) => {
    setToggledKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <aside
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        minWidth: width,
        height: "100%",
        backgroundColor: `var(--ds-bg-secondary, ${colorBg.secondary})`,
        borderRight: `1px solid var(--ds-border-tertiary, ${colorBorder.tertiary})`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {header && (
        <div style={{ flexShrink: 0 }}>
          {header}
        </div>
      )}

      <nav
        style={{
          flex: "1 1 auto",
          overflowX: "hidden",
          overflowY: "auto",
          padding: "0 8px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {items.map((item) => (
          <RenderItem
            key={item.key}
            item={item}
            selectedKey={selectedKey}
            onSelect={onSelect}
            level={0}
            toggledKeys={toggledKeys}
            onToggle={handleToggle}
          />
        ))}
      </nav>

      {footer && (
        <div
          style={{
            padding: "8px 12px 16px",
            flexShrink: 0,
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
