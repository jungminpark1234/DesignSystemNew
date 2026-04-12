import React from "react";
import { useTheme } from "../theme";
import { colorText, colorBg, colorBorder } from "@ds/tokens/colors";
import { spacing, borderRadius } from "@ds/tokens/spacing";
import { fontFamily, fontWeight } from "@ds/tokens/typography";

const ff = "'Pretendard', sans-serif";

function ColorSwatch({ name, value }: { name: string; value: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: value, border: `1px solid ${colors.border.secondary}`, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.primary, minWidth: 200 }}>{name}</span>
      <span style={{ fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 id={title.toLowerCase().replace(/\s/g, "-")} style={{ fontSize: 18, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function flattenColors(obj: Record<string, any>, prefix = ""): { name: string; value: string }[] {
  const result: { name: string; value: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") result.push({ name, value: val });
    else if (typeof val === "object") result.push(...flattenColors(val, name));
  }
  return result;
}

export function TokensPage() {
  const { colors } = useTheme();
  const textColors = flattenColors(colorText, "text");
  const bgColors = flattenColors(colorBg, "bg").slice(0, 15);
  const borderColors = flattenColors(colorBorder, "border").slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Design Tokens</h1>
        <p style={{ fontSize: 15, lineHeight: "24px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          Visual properties driving every component — colors, typography, spacing.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <Section title="Text Colors">
        {textColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
      </Section>

      <Section title="Background Colors">
        {bgColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
      </Section>

      <Section title="Border Colors">
        {borderColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
      </Section>

      <Section title="Spacing">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(spacing).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.primary, minWidth: 60 }}>spacing.{key}</span>
              <div style={{ height: 16, backgroundColor: colors.text.interactive.runwayPrimary, borderRadius: 2, width: parseInt(val) * 2 || 4, transition: "width 0.2s" }} />
              <span style={{ fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary }}>{val}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border Radius">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {Object.entries(borderRadius).map(([key, val]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 48, height: 48, borderRadius: val, border: `2px solid ${colors.text.interactive.runwayPrimary}` }} />
              <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary }}>{key} ({val})</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
