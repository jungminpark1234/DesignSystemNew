import React, { useState } from "react";
import { useTheme } from "../theme";
import { DOCS_CATEGORIES } from "../registry";

const ff = "'Pretendard', sans-serif";

interface DocsSidebarProps {
  activeSlug: string;
  onNavigate: (slug: string) => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transition: "transform 0.2s ease",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryGroup({
  label,
  items,
  activeSlug,
  onNavigate,
  defaultOpen = false,
}: {
  label: string;
  items: { slug: string; label: string }[];
  activeSlug: string;
  onNavigate: (slug: string) => void;
  defaultOpen?: boolean;
}) {
  const { colors } = useTheme();
  const hasActive = items.some((item) => item.slug === activeSlug);
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Category header — clickable to toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: "100%",
          padding: "8px 8px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          backgroundColor: "transparent",
          color: colors.text.primary,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: ff,
          textAlign: "left",
          transition: "background-color 0.1s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <ChevronIcon open={open} />
        <span>{label}</span>
      </button>

      {/* Items — collapsible */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? items.length * 36 + 8 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 0.25s ease, opacity 0.2s ease",
          paddingLeft: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 1, paddingTop: 4 }}>
          {items.map((item) => {
            const isActive = item.slug === activeSlug;
            return (
              <button
                key={item.slug}
                onClick={() => onNavigate(item.slug)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isActive ? "#EEFECD" : "transparent",
                  color: isActive ? "#000000" : colors.text.secondary,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  fontFamily: ff,
                  transition: "background-color 0.1s, color 0.1s",
                  lineHeight: "20px",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DocsSidebar({ activeSlug, onNavigate }: DocsSidebarProps) {
  const { colors } = useTheme();

  return (
    <nav
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: `1px solid ${colors.border.secondary}`,
        backgroundColor: colors.bg.primary,
        overflowY: "auto",
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {DOCS_CATEGORIES.map((cat) => (
        <CategoryGroup
          key={cat.key}
          label={cat.label}
          items={cat.items}
          activeSlug={activeSlug}
          onNavigate={onNavigate}
          defaultOpen={cat.key === "getting-started"}
        />
      ))}
    </nav>
  );
}
