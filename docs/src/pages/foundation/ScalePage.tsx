import React from "react";
import { useTheme } from "../../theme";
import { spacing, borderRadius } from "@ds/tokens/spacing";

const ff = "'Pretendard', sans-serif";

export function ScalePage() {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Scale</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          컴포넌트 간 일관된 여백과 크기를 위한 간격 시스템입니다. 4px 그리드 기반으로 설계되었습니다.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="spacing" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Spacing</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(spacing).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 80, fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.primary }}>{key}</span>
              <div style={{ width: parseInt(val) * 3 || 4, height: 20, backgroundColor: colors.text.interactive.runwayPrimary, borderRadius: 3, transition: "width 0.2s" }} />
              <span style={{ fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary }}>{val}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="border-radius" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Border Radius</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {Object.entries(borderRadius).map(([key, val]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: val, border: `2px solid ${colors.text.interactive.runwayPrimary}`, backgroundColor: colors.bg.secondary }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.primary }}>{key}</div>
                <div style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
