import React from "react";
import { useTheme } from "../theme";
import { ExampleSection } from "../components/ExampleSection";
import { PropsTable } from "../components/PropsTable";
import { CodeBlock } from "../components/CodeBlock";
import type { ComponentDoc } from "../registry";

const ff = "'Pretendard', sans-serif";

interface ComponentDocPageProps {
  doc: ComponentDoc;
}

export function ComponentDocPage({ doc }: ComponentDocPageProps) {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "36px" }}>
          {doc.name}
        </h1>
        <p style={{ fontSize: 14, lineHeight: "16px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          {doc.description}
        </p>
      </div>

      {/* Import */}
      {doc.importCode && (
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="import" style={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", color: colors.text.primary, fontFamily: ff, margin: 0 }}>
            Import
          </h2>
          <CodeBlock code={doc.importCode} />
        </section>
      )}

      {/* When to use */}
      {doc.whenToUse && doc.whenToUse.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="when-to-use" style={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", color: colors.text.primary, fontFamily: ff, margin: 0 }}>
            When to use
          </h2>
          <ul style={{
            fontSize: 14, lineHeight: "24px", color: colors.text.secondary, fontFamily: ff,
            margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4,
          }}>
            {doc.whenToUse.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      )}

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      {/* Examples */}
      {doc.examples?.map((ex, i) => (
        <ExampleSection key={i} title={ex.title} description={ex.description} code={ex.code}>
          {ex.render()}
        </ExampleSection>
      ))}

      {/* Props */}
      {doc.props && doc.props.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2
            id="props"
            style={{
              fontSize: 18, fontWeight: 600, lineHeight: "28px",
              color: colors.text.primary, fontFamily: ff,
              margin: 0, paddingTop: 8,
            }}
          >
            API Reference
          </h2>
          <PropsTable props={doc.props} />
        </section>
      )}
    </div>
  );
}
