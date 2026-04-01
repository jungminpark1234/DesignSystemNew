// ============================================================
// Drawer — makinarocks_new_design_system
// Source: Figma > side-modal
//
// Structure:
//   drawer/title        — fixed header with title + close button
//   drawer/body         — scrollable content area (flex:1, children)
//   drawer/button_wrapper — fixed footer with action buttons
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { spacing, borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight as fw } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the user clicks the close button or the backdrop */
  onClose: () => void;
  /** Title text displayed in the header */
  title: string;
  /** Width of the drawer panel. Default: "max(800px, 40vw)" */
  width?: number | string;
  /** Footer content — typically Cancel/Submit buttons */
  footer?: React.ReactNode;
  /** Hide backdrop and render as a standalone panel */
  noBackdrop?: boolean;
  /** Left border override (e.g. for side-by-side drawers) */
  borderLeft?: string;
  /** Extra styles on the panel container */
  panelStyle?: React.CSSProperties;
  /** Body content */
  children: React.ReactNode;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

/** drawer/title — fixed header */
function DrawerTitle({
  title,
  onClose,
  scrolled,
}: {
  title: string;
  onClose: () => void;
  scrolled: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${spacing[16]} ${spacing[24]}`,
        flexShrink: 0,
        borderBottom: scrolled
          ? `1px solid ${colorBorder.secondary}`
          : "1px solid transparent",
        transition: "border-color 0.2s ease",
      }}
    >
      <span
        style={{
          fontFamily: fontFamily.body,
          fontSize: 20,
          fontWeight: fw.semibold,
          lineHeight: "24px",
          color: colorText.primary,
        }}
      >
        {title}
      </span>
      <button
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "none",
          cursor: "pointer",
          padding: 4,
          borderRadius: borderRadius.sm,
        }}
      >
        <Icon name="close" size={20} color={colorText.tertiary} />
      </button>
    </div>
  );
}

/** drawer/body — scrollable content area */
function DrawerBody({
  children,
  bodyRef,
  onScroll,
}: {
  children: React.ReactNode;
  bodyRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}) {
  return (
    <div
      ref={bodyRef}
      onScroll={onScroll}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: spacing[24],
      }}
    >
      {children}
    </div>
  );
}

/** drawer/button_wrapper — fixed footer */
function DrawerFooter({
  children,
  showBorder,
}: {
  children: React.ReactNode;
  showBorder: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: spacing[8],
        padding: spacing[24],
        flexShrink: 0,
        background: colorBg.primary,
        borderTop: showBorder
          ? `1px solid ${colorBorder.secondary}`
          : "1px solid transparent",
        transition: "border-color 0.2s ease",
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Drawer component
// ──────────────────────────────────────────────────────────────────────────────
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      title,
      width,
      footer,
      noBackdrop,
      borderLeft,
      panelStyle,
      children,
    },
    ref
  ) => {
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);

    const checkState = useCallback(() => {
      if (bodyRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = bodyRef.current;
        setHasOverflow(scrollHeight > clientHeight);
        setHeaderScrolled(scrollTop > 0);
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

    const panelWidth = width ?? "max(800px, 40vw)";

    const panelContent = (
      <>
        <DrawerTitle title={title} onClose={onClose} scrolled={headerScrolled} />
        <DrawerBody bodyRef={bodyRef} onScroll={checkState}>
          {children}
        </DrawerBody>
        {footer && (
          <DrawerFooter showBorder={hasOverflow}>
            {footer}
          </DrawerFooter>
        )}
      </>
    );

    // noBackdrop mode: standalone panel
    if (noBackdrop) {
      return (
        <div
          ref={ref}
          style={{
            width: panelWidth,
            height: "100vh",
            background: colorBg.primary,
            display: "flex",
            flexDirection: "column",
            ...panelStyle,
          }}
        >
          {panelContent}
        </div>
      );
    }

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 400,
          display: "flex",
          justifyContent: "flex-end",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.32)",
            opacity: open ? 1 : 0,
            transition: "opacity 0.35s cubic-bezier(0.32,0.72,0,1)",
            pointerEvents: "none",
          }}
        />

        {/* Panel */}
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            zIndex: 1,
            width: panelWidth,
            height: "100vh",
            background: colorBg.primary,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
            borderLeft: borderLeft ?? `1px solid ${colorBorder.primary}`,
            transform: open ? "translateX(0)" : "translateX(100%)",
            transition:
              "transform 0.42s cubic-bezier(0.32,0.72,0,1), border-left 0.2s ease",
            willChange: "transform",
            overflow: "hidden",
            ...panelStyle,
          }}
        >
          {panelContent}
        </div>
      </div>
    );
  }
);

Drawer.displayName = "Drawer";

export default Drawer;
