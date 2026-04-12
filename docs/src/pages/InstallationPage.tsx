import React from "react";
import { useTheme } from "../theme";
import { CodeBlock } from "../components/CodeBlock";

const ff = "'Pretendard', sans-serif";

export function InstallationPage() {
  const { colors } = useTheme();
  const h2: React.CSSProperties = { fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "28px" };
  const p: React.CSSProperties = { fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Installation</h1>
        <p style={p}>프로젝트에 디자인 시스템을 설정하는 방법을 안내합니다.</p>
      </div>

      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="alias" style={h2}>Path Alias 설정</h2>
        <p style={p}>Vite 프로젝트에서 <code>@ds</code> alias를 설정합니다:</p>
        <CodeBlock code={`// vite.config.ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@ds": path.resolve(__dirname, "../src"),
    },
  },
});`} language="tsx" />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="import" style={h2}>컴포넌트 Import</h2>
        <p style={p}>개별 컴포넌트를 직접 import하여 사용합니다:</p>
        <CodeBlock code={`import { Button } from "@ds/components/Button";
import { TextField } from "@ds/components/TextField";
import { Table } from "@ds/components/Table";
import { Icon } from "@ds/components/Icon";`} language="tsx" />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="tokens" style={h2}>디자인 토큰 Import</h2>
        <p style={p}>색상, 타이포그래피, 간격 등 토큰을 직접 사용할 수 있습니다:</p>
        <CodeBlock code={`import { colorText, colorBg, colorBorder } from "@ds/tokens/colors";
import { fontFamily, fontWeight, body, heading } from "@ds/tokens/typography";
import { spacing, borderRadius, shadow } from "@ds/tokens/spacing";`} language="tsx" />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="dark-mode" style={h2}>다크 모드</h2>
        <p style={p}>CSS Custom Properties 기반으로 다크 모드를 지원합니다. ThemeProvider로 앱을 감싸세요:</p>
        <CodeBlock code={`import { ThemeProvider } from "./theme";

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}`} language="tsx" />
      </section>
    </div>
  );
}
