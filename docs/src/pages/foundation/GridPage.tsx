import React from "react";
import { useTheme } from "../../theme";
import { CodeBlock } from "../../components/CodeBlock";
import { grid, breakpoints, maxContainerWidth } from "@ds/tokens/grid";

const ff = "'Pretendard', sans-serif";
const mono = "'Roboto Mono', monospace";

function GridVisual({ name, config }: { name: string; config: typeof grid.mobile }) {
  const { colors } = useTheme();
  const cols = config.columns;
  const totalWidth = 320;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 15, fontWeight: 600, fontFamily: ff, color: colors.text.primary }}>{name}</span>
        <span style={{ fontSize: 12, fontFamily: mono, color: colors.text.tertiary }}>
          {config.minWidth}{config.maxWidth ? `–${config.maxWidth}` : "+"}px
        </span>
      </div>
      <div style={{
        border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
        padding: `12px ${(config.margin ?? 0) * (totalWidth / (config.minWidth || 320)) || 8}px`,
        backgroundColor: colors.bg.secondary,
      }}>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 32, borderRadius: 3,
              backgroundColor: colors.text.interactive.runwayPrimary, opacity: 0.15,
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontFamily: mono, color: colors.text.tertiary }}>
          Columns: <strong style={{ color: colors.text.primary }}>{cols}</strong>
        </span>
        <span style={{ fontSize: 12, fontFamily: mono, color: colors.text.tertiary }}>
          Gutter: <strong style={{ color: colors.text.primary }}>{config.gutter}px</strong>
        </span>
        {config.margin !== undefined && (
          <span style={{ fontSize: 12, fontFamily: mono, color: colors.text.tertiary }}>
            Margin: <strong style={{ color: colors.text.primary }}>{config.margin}px</strong>
          </span>
        )}
        {config.columnWidth && (
          <span style={{ fontSize: 12, fontFamily: mono, color: colors.text.tertiary }}>
            Col Width: <strong style={{ color: colors.text.primary }}>{config.columnWidth}px</strong>
          </span>
        )}
        <span style={{ fontSize: 12, fontFamily: mono, color: colors.text.tertiary }}>
          {config.alignment === "center" ? "Fixed / Center" : "Fluid / Stretch"}
        </span>
      </div>
    </div>
  );
}

function BreakpointTable() {
  const { colors } = useTheme();
  const rows = [
    { name: "Mobile", range: "320–767px", cols: 4, gutter: 16, margin: 16, layout: "Fluid" },
    { name: "Tablet", range: "768–1023px", cols: 8, gutter: 24, margin: 24, layout: "Fluid" },
    { name: "Laptop", range: "1024–1415px", cols: 12, gutter: 24, margin: 24, layout: "Fluid" },
    { name: "Desktop Fluid", range: "1416px+", cols: 12, gutter: 24, margin: 24, layout: "Fluid" },
    { name: "Desktop Fixed", range: "1416px+", cols: 12, gutter: 24, margin: "—", layout: "Fixed (96px cols)" },
  ];
  const th: React.CSSProperties = { padding: "8px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.text.primary, fontFamily: ff, backgroundColor: colors.bg.tertiary, borderBottom: `1px solid ${colors.border.tertiary}` };
  const td: React.CSSProperties = { padding: "8px 12px", fontSize: 13, fontFamily: mono, color: colors.text.secondary, borderBottom: `1px solid ${colors.border.tertiary}` };

  return (
    <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${colors.border.secondary}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Breakpoint</th>
            <th style={th}>Range</th>
            <th style={th}>Columns</th>
            <th style={th}>Gutter</th>
            <th style={th}>Margin</th>
            <th style={th}>Layout</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td style={{ ...td, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{r.name}</td>
              <td style={td}>{r.range}</td>
              <td style={td}>{r.cols}</td>
              <td style={td}>{r.gutter}px</td>
              <td style={td}>{typeof r.margin === "number" ? `${r.margin}px` : r.margin}</td>
              <td style={td}>{r.layout}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GridPage() {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Grid</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          반응형 레이아웃을 위한 그리드 시스템입니다. 5개 브레이크포인트에 걸쳐 4/8/12 컬럼 구조를 제공합니다.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      {/* Breakpoint Table */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="breakpoints" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Breakpoints</h2>
        <BreakpointTable />
        <div style={{ padding: 12, borderRadius: 8, backgroundColor: colors.bg.secondary, border: `1px solid ${colors.border.secondary}` }}>
          <span style={{ fontSize: 13, fontFamily: mono, color: colors.text.tertiary }}>
            Max container width (Fixed): <strong style={{ color: colors.text.primary }}>{maxContainerWidth}px</strong> = 12 × 96px + 11 × 24px
          </span>
        </div>
      </section>

      {/* Visual Grid */}
      <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 id="grid-visual" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Grid Visualization</h2>
        <GridVisual name="Mobile" config={grid.mobile} />
        <GridVisual name="Tablet" config={grid.tablet} />
        <GridVisual name="Laptop" config={grid.laptop} />
        <GridVisual name="Desktop Fluid" config={grid.desktopFluid} />
        <GridVisual name="Desktop Fixed" config={grid.desktopFixed} />
      </section>

      {/* Media Queries */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="media-queries" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Media Queries</h2>
        <CodeBlock code={`import { mediaQuery } from "@ds/tokens/grid";

// mediaQuery.mobile  → @media (min-width: 320px)
// mediaQuery.tablet  → @media (min-width: 768px)
// mediaQuery.laptop  → @media (min-width: 1024px)
// mediaQuery.desktop → @media (min-width: 1416px)`} language="tsx" />
      </section>

      {/* Container Helper */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="container" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Container Helper</h2>
        <p style={{ fontSize: 14, lineHeight: "22px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          <code>getContainerStyle()</code> 함수로 브레이크포인트에 맞는 컨테이너 스타일을 생성할 수 있습니다.
        </p>
        <CodeBlock code={`import { getContainerStyle } from "@ds/tokens/grid";

// Fluid 레이아웃 (padding 자동 적용)
<div style={getContainerStyle("laptop")}>
  {/* width: 100%, paddingLeft/Right: 24px */}
</div>

// Fixed 레이아웃 (중앙 정렬, maxWidth 1416px)
<div style={getContainerStyle("desktopFixed")}>
  {/* maxWidth: 1416px, margin: 0 auto */}
</div>`} language="tsx" />
      </section>

      {/* Card Grid Pattern */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 id="card-grid" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Card Grid Pattern</h2>
        <p style={{ fontSize: 14, lineHeight: "22px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          카드 레이아웃에는 CSS Grid의 <code>auto-fill</code>을 활용합니다. 화면 크기에 따라 자동으로 열 수가 조정됩니다.
        </p>
        <CodeBlock code={`<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "32px 8px",
}}>
  {items.map(item => <Card key={item.id} ... />)}
</div>`} language="tsx" />
      </section>
    </div>
  );
}
