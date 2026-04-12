import React, { useState } from "react";
import { useTheme } from "../theme";
import { CodeBlock } from "./CodeBlock";

interface ComponentPreviewProps {
  code: string;
  children: React.ReactNode;
}

export function ComponentPreview({ code, children }: ComponentPreviewProps) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: active ? colors.bg.primary : "transparent",
    color: active ? colors.text.primary : colors.text.tertiary,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Pretendard', sans-serif",
    boxShadow: active ? `0 1px 2px rgba(0,0,0,0.06)` : "none",
    transition: "all 0.15s",
  });

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${colors.border.secondary}`, overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 4, padding: "8px 12px",
        backgroundColor: colors.bg.secondary, borderBottom: `1px solid ${colors.border.secondary}`,
      }}>
        <button style={tabStyle(tab === "preview")} onClick={() => setTab("preview")}>Preview</button>
        <button style={tabStyle(tab === "code")} onClick={() => setTab("code")}>Code</button>
      </div>

      {/* Content */}
      {tab === "preview" ? (
        <div style={{
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
          backgroundColor: colors.bg.primary,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {children}
          </div>
        </div>
      ) : (
        <CodeBlock code={code} />
      )}
    </div>
  );
}
