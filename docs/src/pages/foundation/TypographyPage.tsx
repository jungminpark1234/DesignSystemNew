import React from "react";
import { useTheme } from "../../theme";
import { fontFamily, fontWeight, heading, body } from "@ds/tokens/typography";

const ff = "'Pretendard', sans-serif";

function TypeSample({ label, style: sampleStyle }: { label: string; style: React.CSSProperties }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 24, padding: "12px 0", borderBottom: `1px solid ${colors.border.tertiary}` }}>
      <span style={{ width: 140, fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary, flexShrink: 0 }}>{label}</span>
      <span style={{ ...sampleStyle, color: colors.text.primary }}>The quick brown fox</span>
      <span style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: colors.text.disabled, marginLeft: "auto", flexShrink: 0 }}>
        {sampleStyle.fontSize} / {sampleStyle.lineHeight} / {sampleStyle.fontWeight}
      </span>
    </div>
  );
}

export function TypographyPage() {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Typography</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          Pretendard 폰트 패밀리 기반의 타이포그래피 시스템입니다. Heading과 Body 두 카테고리로 나뉩니다.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 id="font-family" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Font Family</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${colors.border.secondary}`, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>heading</span>
            <p style={{ fontSize: 20, fontWeight: 600, fontFamily: fontFamily.heading, color: colors.text.primary, margin: "8px 0 0" }}>Pretendard</p>
          </div>
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${colors.border.secondary}`, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>body</span>
            <p style={{ fontSize: 20, fontWeight: 400, fontFamily: fontFamily.body, color: colors.text.primary, margin: "8px 0 0" }}>Pretendard</p>
          </div>
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${colors.border.secondary}`, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>mono</span>
            <p style={{ fontSize: 20, fontWeight: 400, fontFamily: fontFamily.mono, color: colors.text.primary, margin: "8px 0 0" }}>Roboto Mono</p>
          </div>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 id="heading" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Heading</h2>
        {Object.entries(heading).map(([key, val]) => (
          <TypeSample key={key} label={`heading.${key}`} style={{ fontFamily: fontFamily.heading, fontSize: val.fontSize, lineHeight: val.lineHeight, fontWeight: val.fontWeight }} />
        ))}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 id="body" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Body</h2>
        {Object.entries(body).map(([size, weights]) =>
          Object.entries(weights).map(([weight, val]) => (
            <TypeSample key={`${size}-${weight}`} label={`body.${size}.${weight}`} style={{ fontFamily: val.fontFamily, fontSize: val.fontSize, lineHeight: val.lineHeight, fontWeight: val.fontWeight }} />
          ))
        )}
      </section>
    </div>
  );
}
