import React, { useState } from "react";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";

interface PopoverMenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function PopoverMenuItem({ icon, label, active = false }: PopoverMenuItemProps) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 8,
        cursor: "pointer",
        background: active ? colors.bg.tertiary : hov ? colors.bg.secondary : "transparent",
        transition: "background 0.1s",
      }}
    >
      <span style={{ display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          lineHeight: "16px",
          color: active ? colors.text.primary : colors.text.secondary,
          fontFamily: "'Pretendard', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface ProfilePopoverProps {
  initial?: string;
  name?: string;
  email?: string;
}

export function ProfilePopover({
  initial = "CK",
  name = "홍길동",
  email = "gildong.hong@makinarocks.ai",
}: ProfilePopoverProps) {
  const { colors } = useTheme();
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 330,
        zIndex: 300,
        background: colors.bg.primary,
        border: `1px solid ${colors.border.secondary}`,
        borderRadius: 16,
        boxShadow: "0 4px 8px rgba(0,0,0,0.16), 0 0px 4px rgba(0,0,0,0.12)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Account header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", color: colors.text.secondary, fontFamily: "'Pretendard', sans-serif" }}>
          Account
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: "#dc2626",
              fontSize: 12,
              fontWeight: 600,
              color: "#ffffff",
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            {initial}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "16px", color: colors.text.primary, fontFamily: "'Pretendard', sans-serif" }}>
              {name}
            </span>
            <span style={{ fontSize: 12, lineHeight: "16px", color: colors.text.secondary, fontFamily: "'Pretendard', sans-serif" }}>
              {email}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: colors.border.secondary, margin: "0 4px" }} />

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PopoverMenuItem active icon={<Icon name="setting" size={20} color={colors.icon.secondary} />} label="Account settings" />
        <PopoverMenuItem icon={<Icon name="workspace" size={20} color={colors.icon.secondary} />} label="Change workspace" />
        <PopoverMenuItem icon={<Icon name="log-out" size={20} color={colors.icon.secondary} />} label="Logout" />
      </div>
    </div>
  );
}
