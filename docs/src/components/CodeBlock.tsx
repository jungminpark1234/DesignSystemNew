import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import { useTheme } from "../theme";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const { colors } = useTheme();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [code, language]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        style={{
          position: "absolute", top: 8, right: 8, zIndex: 1,
          padding: "4px 8px", borderRadius: 4, border: `1px solid ${colors.border.secondary}`,
          background: colors.bg.primary, color: colors.text.secondary,
          fontSize: 12, cursor: "pointer", fontFamily: "'Pretendard', sans-serif",
        }}
      >
        Copy
      </button>
      <pre
        style={{
          background: colors.bg.secondary,
          borderRadius: 8,
          padding: "16px 20px",
          overflow: "auto",
          margin: 0,
          border: `1px solid ${colors.border.secondary}`,
        }}
      >
        <code ref={ref} className={`language-${language}`} style={{ fontFamily: "'Roboto Mono', 'Fira Code', monospace", fontSize: 13, lineHeight: 1.6 }}>
          {code.trim()}
        </code>
      </pre>
    </div>
  );
}
