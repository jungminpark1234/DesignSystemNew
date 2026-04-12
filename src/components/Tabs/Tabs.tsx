import React, { useState } from "react";
import { colorText, colorBg } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface TabItem {
  /** Unique key */
  key: string;
  /** Tab label */
  label: string;
  /** Optional badge count */
  badge?: number;
  /** Disabled state */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab definitions */
  items: TabItem[];
  /** Controlled selected key */
  selectedKey?: string;
  /** Default selected key (uncontrolled) */
  defaultKey?: string;
  /** Called when a tab is selected */
  onChange?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const Tabs: React.FC<TabsProps> = ({
  items,
  selectedKey: controlledKey,
  defaultKey,
  onChange,
  className,
  style,
}) => {
  const isControlled = controlledKey !== undefined;
  const [internalKey, setInternalKey] = useState<string>(
    defaultKey ?? items[0]?.key ?? ""
  );
  const selectedKey = isControlled ? controlledKey : internalKey;

  const handleSelect = (key: string) => {
    if (!isControlled) setInternalKey(key);
    onChange?.(key);
  };

  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 40,
        padding: 4,
        borderRadius: 9999,
        backgroundColor: colorBg.tertiary,
        ...style,
      }}
    >
      {items.map((item) => {
        const isSelected = item.key === selectedKey;

        const tabStyle: React.CSSProperties = {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 32,
          padding: "6px 16px",
          borderRadius: 9999,
          border: "none",
          backgroundColor: isSelected ? colorBg.primary : "transparent",
          color: isSelected ? colorText.primary : colorText.interactive.secondary,
          fontFamily: fontFamily.body,
          fontSize: 14,
          fontWeight: fontWeight.medium,
          lineHeight: "16px",
          cursor: item.disabled ? "not-allowed" : "pointer",
          opacity: item.disabled ? 0.5 : 1,
          whiteSpace: "nowrap",
          transition: "background-color 0.15s ease, color 0.15s ease",
          boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
          boxSizing: "border-box",
        };

        const badgeStyle: React.CSSProperties = {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 35,
          padding: "2px 8px",
          borderRadius: 9999,
          backgroundColor: isSelected ? "#C3FA4B" : colorBg.neutral,
          color: isSelected ? "#000000" : colorText.secondary,
          fontFamily: fontFamily.body,
          fontSize: 10,
          fontWeight: fontWeight.medium,
          lineHeight: "16px",
        };

        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={isSelected}
            aria-disabled={item.disabled}
            disabled={item.disabled}
            type="button"
            style={tabStyle}
            onClick={() => !item.disabled && handleSelect(item.key)}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span style={badgeStyle}>
                {item.badge > 999 ? "999+" : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

Tabs.displayName = "Tabs";
export default Tabs;
