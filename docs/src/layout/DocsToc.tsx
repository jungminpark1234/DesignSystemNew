import React from "react";
import { useTheme } from "../theme";

const ff = "'Pretendard', sans-serif";

interface DocsTocProps {
  sections: { id: string; label: string }[];
}

export function DocsToc({ sections }: DocsTocProps) {
  const { colors } = useTheme();

  if (sections.length === 0) return null;

  return (
    <aside
      style={{
        width: 200, flexShrink: 0,
        padding: "24px 16px",
        position: "sticky", top: 56, alignSelf: "flex-start",
      }}
    >
      <span
        style={{
          fontSize: 12, fontWeight: 600, color: colors.text.primary,
          fontFamily: ff, display: "block", marginBottom: 12,
        }}
      >
        On This Page
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, borderLeft: `1px solid ${colors.border.secondary}`, paddingLeft: 12 }}>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              fontSize: 13, color: colors.text.tertiary,
              textDecoration: "none", fontFamily: ff,
              lineHeight: "20px",
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {s.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
