import React from "react";
import { useTheme } from "../../theme";
import { colorText, colorBg, colorBorder, primitiveColors } from "@ds/tokens/colors";

const ff = "'Pretendard', sans-serif";

function Swatch({ name, value }: { name: string; value: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: value, border: `1px solid ${colors.border.secondary}`, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.primary }}>{name}</span>
        <span style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: colors.text.tertiary }}>{value}</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 id={title.toLowerCase().replace(/\s/g, "-")} style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function PaletteGrid({ colors: palette }: { colors: { name: string; value: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4 }}>
      {palette.map((c) => <Swatch key={c.name} {...c} />)}
    </div>
  );
}

function flattenObj(obj: Record<string, any>, prefix = ""): { name: string; value: string }[] {
  const result: { name: string; value: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") result.push({ name, value: val });
    else if (typeof val === "object" && val !== null) result.push(...flattenObj(val, name));
  }
  return result;
}

export function ColorPage() {
  const { colors } = useTheme();

  const textColors = flattenObj(colorText);
  const bgColors = flattenObj(colorBg);
  const borderCol = flattenObj(colorBorder);

  // Primitive gray scale
  const grayScale = Object.entries(primitiveColors.gray).map(([k, v]) => ({ name: `gray.${k}`, value: v }));
  const blueScale = Object.entries(primitiveColors.blue).map(([k, v]) => ({ name: `blue.${k}`, value: v }));
  const redScale = Object.entries(primitiveColors.red).map(([k, v]) => ({ name: `red.${k}`, value: v }));
  const greenScale = Object.entries(primitiveColors.green).map(([k, v]) => ({ name: `green.${k}`, value: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Color</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          일관된 시각 언어를 위한 색상 시스템입니다. Semantic 토큰과 Primitive 팔레트로 구성됩니다.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <Section title="Text Colors">
        <PaletteGrid colors={textColors} />
      </Section>

      <Section title="Background Colors">
        <PaletteGrid colors={bgColors} />
      </Section>

      <Section title="Border Colors">
        <PaletteGrid colors={borderCol} />
      </Section>

      <Section title="Gray Scale">
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
          {grayScale.map((c) => (
            <div key={c.name} style={{ flex: 1, height: 48, backgroundColor: c.value, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 4 }}>
              <span style={{ fontSize: 9, fontFamily: "'Roboto Mono', monospace", color: parseInt(c.name.split(".")[1]) > 400 ? "#fff" : "#000" }}>{c.name.split(".")[1]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Blue Scale">
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
          {blueScale.map((c) => (
            <div key={c.name} style={{ flex: 1, height: 48, backgroundColor: c.value, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 4 }}>
              <span style={{ fontSize: 9, fontFamily: "'Roboto Mono', monospace", color: parseInt(c.name.split(".")[1]) > 400 ? "#fff" : "#000" }}>{c.name.split(".")[1]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Red Scale">
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
          {redScale.map((c) => (
            <div key={c.name} style={{ flex: 1, height: 48, backgroundColor: c.value, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 4 }}>
              <span style={{ fontSize: 9, fontFamily: "'Roboto Mono', monospace", color: parseInt(c.name.split(".")[1]) > 400 ? "#fff" : "#000" }}>{c.name.split(".")[1]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Green Scale">
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
          {greenScale.map((c) => (
            <div key={c.name} style={{ flex: 1, height: 48, backgroundColor: c.value, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 4 }}>
              <span style={{ fontSize: 9, fontFamily: "'Roboto Mono', monospace", color: parseInt(c.name.split(".")[1]) > 400 ? "#fff" : "#000" }}>{c.name.split(".")[1]}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
