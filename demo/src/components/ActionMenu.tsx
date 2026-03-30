import React, { useState } from "react";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";

interface DropMenuItemProps {
  label: string;
  danger?: boolean;
}

function DropMenuItem({ label, danger }: DropMenuItemProps) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: "20px",
        color: danger ? colors.text.interactive.dangerDefault : colors.text.primary,
        background: hov ? colors.bg.secondary : "transparent",
        fontFamily: "'Pretendard', sans-serif",
        transition: "background 0.1s",
      }}
    >
      {label}
    </div>
  );
}

interface ActionMenuProps {
  open: boolean;
  rowId: string;
  onMenuToggle: (id: string) => void;
  rowHovered: boolean;
}

export function ActionMenu({ open, rowId, onMenuToggle, rowHovered }: ActionMenuProps) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  const visible = rowHovered || open || hov;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuToggle(rowId);
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: open || hov ? colors.bg.tertiary : "transparent",
          cursor: "pointer",
          transition: "background 0.1s, opacity 0.1s",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <Icon name="more-horizontal" size={16} color={colors.icon.secondary} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            zIndex: 200,
            background: colors.bg.primary,
            border: `1px solid ${colors.border.secondary}`,
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: "4px 0",
            minWidth: 148,
          }}
        >
          <DropMenuItem label="Edit" />
          <DropMenuItem label="Test connection" />
          <DropMenuItem label="Delete" danger />
        </div>
      )}
    </div>
  );
}
