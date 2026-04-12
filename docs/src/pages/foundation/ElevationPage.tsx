import React from "react";
import { useTheme } from "../../theme";
import { shadow } from "@ds/tokens/spacing";

const ff = "'Pretendard', sans-serif";

export function ElevationPage() {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Elevation</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          그림자(Shadow)를 사용하여 요소 간 시각적 깊이와 계층을 표현합니다. 4단계로 구성됩니다.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 id="shadow-levels" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Shadow Levels</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {Object.entries(shadow).map(([key, val]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                height: 120, borderRadius: 12, backgroundColor: colors.bg.primary,
                border: `1px solid ${colors.border.secondary}`, boxShadow: val,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: colors.text.tertiary, fontFamily: ff }}>shadow.{key}</span>
              </div>
              <code style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary, wordBreak: "break-all" }}>{val}</code>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="usage" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Usage Guidelines</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { level: "shadow.2", usage: "Subtle. 버튼 hover, 입력 필드 포커스 등 미세한 깊이감" },
            { level: "shadow.4", usage: "Cards. 카드, 드롭다운 메뉴 등 부유하는 요소" },
            { level: "shadow.8", usage: "Overlays. Tooltip, Popover, Select 드롭다운" },
            { level: "shadow.16", usage: "Modals. Modal, Drawer 등 최상위 오버레이" },
          ].map((item) => (
            <div key={item.level} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 16px", borderRadius: 8, border: `1px solid ${colors.border.secondary}` }}>
              <code style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Roboto Mono', monospace", color: colors.text.interactive.runwayPrimary, width: 100, flexShrink: 0 }}>{item.level}</code>
              <span style={{ fontSize: 14, color: colors.text.secondary, fontFamily: ff }}>{item.usage}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
