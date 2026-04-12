import React from "react";
import { useTheme } from "../theme";
import { ComponentPreview } from "./ComponentPreview";

interface ExampleSectionProps {
  title: string;
  description?: string;
  code: string;
  children: React.ReactNode;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ExampleSection({ title, description, code, children }: ExampleSectionProps) {
  const { colors } = useTheme();
  const id = slugify(title);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2
        id={id}
        style={{
          fontSize: 18, fontWeight: 600, lineHeight: "28px",
          color: colors.text.primary, fontFamily: "'Pretendard', sans-serif",
          margin: 0, paddingTop: 8,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 14, lineHeight: "20px", color: colors.text.secondary, fontFamily: "'Pretendard', sans-serif", margin: 0 }}>
          {description}
        </p>
      )}
      <ComponentPreview code={code}>{children}</ComponentPreview>
    </section>
  );
}
