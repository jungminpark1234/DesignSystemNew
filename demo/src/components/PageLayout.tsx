import React, { useState, useRef, useCallback } from "react";
import { useTheme } from "../theme";

const ff = "'Pretendard', sans-serif";

// ─────────────────────────────────────────────────────────────────────────────
// Shared: Page Title Section (fixed, with scroll-aware border)
// ─────────────────────────────────────────────────────────────────────────────
interface PageTitleSectionProps {
  /** Left-side content: back button + title, or just title */
  left: React.ReactNode;
  /** Right-side action buttons (Create, More, etc.) */
  right?: React.ReactNode;
  /** Whether the scroll container has scrolled (shows bottom border) */
  scrolled?: boolean;
}

function PageTitleSection({ left, right, scrolled = false }: PageTitleSectionProps) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        padding: "24px 24px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        borderBottom: scrolled
          ? `1px solid ${colors.border.secondary}`
          : "1px solid transparent",
        transition: "border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
        {left}
      </div>
      {right && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageTitle - The h1 title (optionally with back button)
// ─────────────────────────────────────────────────────────────────────────────
export function PageTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <h1
      style={{
        fontSize: 24,
        fontWeight: 600,
        color: colors.text.primary,
        fontFamily: ff,
        margin: 0,
        lineHeight: "32px",
      }}
    >
      {children}
    </h1>
  );
}

export function PageDescription({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <p
      style={{
        fontSize: 14,
        fontWeight: 400,
        lineHeight: "20px",
        color: colors.text.secondary,
        margin: 0,
        fontFamily: ff,
      }}
    >
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ListPage
//
// Layout for list pages: fixed title section + scrollable content.
// Title section includes title, optional description, and action buttons.
// Content area is padded and scrollable (search/filter/table/grid).
// ─────────────────────────────────────────────────────────────────────────────
interface ListPageProps {
  /** Title node (wrap with <PageTitle>) */
  title: React.ReactNode;
  /** Optional description below title */
  description?: React.ReactNode;
  /** Right-side actions (buttons) */
  actions?: React.ReactNode;
  /** Scrollable page content (search, filter, table, grid, etc.) */
  children: React.ReactNode;
}

export function ListPage({ title, description, actions, children }: ListPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrolled(scrollRef.current.scrollTop > 0);
  }, []);

  return (
    <>
      <PageTitleSection
        scrolled={scrolled}
        left={
          <>
            {title}
            {description}
          </>
        }
        right={actions}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflow: "auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DetailPage
//
// Layout for detail pages: fixed title section (back + title + actions)
// + scrollable content area that contains a flex-row of main content & sidebar.
// ─────────────────────────────────────────────────────────────────────────────
interface DetailPageProps {
  /** Title node (wrap with <PageTitle>) */
  title: React.ReactNode;
  /** Back button click handler */
  onBack?: () => void;
  /** Right-side actions (buttons) */
  actions?: React.ReactNode;
  /** Scrollable page content */
  children: React.ReactNode;
}

export function DetailPage({ title, onBack, actions, children }: DetailPageProps) {
  const { colors } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrolled(scrollRef.current.scrollTop > 0);
  }, []);

  return (
    <>
      <PageTitleSection
        scrolled={scrolled}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 5px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke={colors.icon.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {title}
          </div>
        }
        right={actions}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflow: "auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 24 }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DetailContentWithSidebar
//
// Two-column layout for detail pages: main content (flex:1) + sidebar (fixed width).
// Use inside <DetailPage> children.
// ─────────────────────────────────────────────────────────────────────────────
interface DetailContentWithSidebarProps {
  /** Main content (left, flexible width) */
  children: React.ReactNode;
  /** Sidebar content (right, fixed 480px) */
  sidebar: React.ReactNode;
  /** Optional sidebar width (default: 480) */
  sidebarWidth?: number;
}

export function DetailContentWithSidebar({ children, sidebar, sidebarWidth = 480 }: DetailContentWithSidebarProps) {
  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
      <div style={{ width: sidebarWidth, flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }}>
        {sidebar}
      </div>
    </div>
  );
}
