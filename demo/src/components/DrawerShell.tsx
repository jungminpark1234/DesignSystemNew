import React, { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";

const ff = "'Pretendard', sans-serif";

// ── Shared Buttons with hover/pressed states ────────────────────────────────

export function SecondaryButton({ label, onClick, icon, style: styleProp }: { label: string; onClick?: () => void; icon?: React.ReactNode; style?: React.CSSProperties }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = pressed
    ? colors.bg.interactive.secondaryPressed   // #f3f4f6
    : hovered
      ? colors.bg.interactive.secondaryHovered  // #f9fafb
      : colors.bg.interactive.secondary;         // #ffffff
  const borderColor = pressed
    ? colors.border.interactive.secondaryPressed   // #99a1af
    : hovered
      ? colors.border.interactive.secondaryHovered  // #d1d5dc
      : colors.border.interactive.secondary;         // #e5e7eb
  const textColor = pressed
    ? colors.text.interactive.secondaryPressed   // #1e2939
    : hovered
      ? colors.text.interactive.secondaryHovered  // #364153
      : colors.text.interactive.secondary;         // #4a5565

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
    ? colors.bg.interactive.runwayPrimaryPressed   // #193cb8
    : hovered
      ? colors.bg.interactive.runwayPrimaryHovered  // #1447e6
      : colors.bg.interactive.runwayPrimary;         // #155dfc

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

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Width of the drawer panel (default max(800px, 40vw)) */
  width?: number | string;
  /** Footer content (Cancel/Create buttons etc.) */
  footer?: React.ReactNode;
  /** Hide backdrop (for side-by-side drawers) */
  noBackdrop?: boolean;
  /** Left border on the panel */
  borderLeft?: string;
  /** Extra inline styles for the panel */
  panelStyle?: React.CSSProperties;
  children: React.ReactNode;
}

export function DrawerShell({ open, onClose, title, width, footer, children, noBackdrop, borderLeft, panelStyle }: DrawerShellProps) {
  const { colors } = useTheme();

  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const checkState = useCallback(() => {
    if (bodyRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = bodyRef.current;
      setHasOverflow(scrollHeight > clientHeight);
      setHeaderScrolled(scrollTop > 20);
    }
  }, []);

  useEffect(() => {
    checkState();
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, checkState]);

  const headerEl = (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 24px", flexShrink: 0,
      borderBottom: headerScrolled ? `1px solid ${colors.border.secondary}` : "1px solid transparent",
      transition: "border-color 0.2s ease",
    }}>
      <span style={{ fontSize: 20, fontWeight: 600, lineHeight: "28px", color: colors.text.primary, fontFamily: ff }}>
        {title}
      </span>
      <button
        onClick={onClose}
        style={{ display: "flex", border: "none", background: "none", cursor: "pointer", padding: 4, borderRadius: 4, color: colors.icon.secondary }}
      >
        <Icon name="close" size={20} color="currentColor" />
      </button>
    </div>
  );

  const bodyEl = (
    <div ref={bodyRef} onScroll={checkState} style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      {children}
    </div>
  );

  const footerEl = footer ? (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
      padding: "16px 24px", flexShrink: 0, background: colors.bg.primary,
      borderTop: hasOverflow ? `1px solid ${colors.border.secondary}` : "1px solid transparent",
      transition: "border-color 0.2s ease",
    }}>
      {footer}
    </div>
  ) : null;

  // noBackdrop mode: standalone panel (e.g. side-by-side drawer)
  if (noBackdrop) {
    return (
      <div style={{
        width: width ?? "max(800px, 40vw)", height: "100vh",
        background: colors.bg.primary,
        display: "flex", flexDirection: "column",
        ...panelStyle,
      }}>
        {headerEl}
        {bodyEl}
        {footerEl}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        display: "flex", justifyContent: "flex-end",
        pointerEvents: open ? "auto" : "none",
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.32)",
          opacity: open ? 1 : 0,
          transition: "opacity 0.35s cubic-bezier(0.32,0.72,0,1)",
          pointerEvents: "none",
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", zIndex: 1, width: width ?? "max(800px, 40vw)", height: "100vh",
          background: colors.bg.primary,
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          borderLeft: borderLeft ?? "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.42s cubic-bezier(0.32,0.72,0,1), border-left 0.2s ease",
          willChange: "transform",
          ...panelStyle,
        }}
      >
        {headerEl}
        {bodyEl}
        {footerEl}
      </div>
    </div>
  );
}
