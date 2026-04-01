import React, { useState } from "react";
import { Drawer } from "@ds/components/Drawer";
import { useTheme } from "../theme";

const ff = "'Pretendard', sans-serif";

// ── Shared Buttons with hover/pressed states ────────────────────────────────

export function SecondaryButton({ label, onClick, icon, style: styleProp }: { label: string; onClick?: () => void; icon?: React.ReactNode; style?: React.CSSProperties }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = pressed
    ? colors.bg.interactive.secondaryPressed
    : hovered
      ? colors.bg.interactive.secondaryHovered
      : colors.bg.interactive.secondary;
  const borderColor = pressed
    ? colors.border.interactive.secondaryPressed
    : hovered
      ? colors.border.interactive.secondaryHovered
      : colors.border.interactive.secondary;
  const textColor = pressed
    ? colors.text.interactive.secondaryPressed
    : hovered
      ? colors.text.interactive.secondaryHovered
      : colors.text.interactive.secondary;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
        height: 36, padding: "8px 14px", borderRadius: 6, cursor: "pointer",
        border: `1px solid ${borderColor}`, background: bg,
        fontSize: 14, fontWeight: 500, color: textColor, fontFamily: ff,
        transition: "background-color 0.15s, border-color 0.15s, color 0.15s",
        ...styleProp,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export function PrimaryButton({ label, onClick, icon, style: styleProp }: { label: string; onClick?: () => void; icon?: React.ReactNode; style?: React.CSSProperties }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = pressed
    ? colors.bg.interactive.runwayPrimaryPressed
    : hovered
      ? colors.bg.interactive.runwayPrimaryHovered
      : colors.bg.interactive.runwayPrimary;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
        height: 36, padding: "8px 14px", borderRadius: 6, cursor: "pointer",
        border: "none", background: bg,
        fontSize: 14, fontWeight: 500, color: "#ffffff", fontFamily: ff,
        transition: "background-color 0.15s",
        ...styleProp,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── DrawerShell — thin wrapper around DS Drawer ─────────────────────────────

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number | string;
  footer?: React.ReactNode;
  noBackdrop?: boolean;
  borderLeft?: string;
  panelStyle?: React.CSSProperties;
  children: React.ReactNode;
}

export function DrawerShell({ open, onClose, title, width, footer, children, noBackdrop, borderLeft, panelStyle }: DrawerShellProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width={width}
      footer={footer}
      noBackdrop={noBackdrop}
      borderLeft={borderLeft}
      panelStyle={panelStyle}
    >
      {children}
    </Drawer>
  );
}
