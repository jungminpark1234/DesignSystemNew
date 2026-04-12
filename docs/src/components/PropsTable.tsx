import React from "react";
import { useTheme } from "../theme";
import type { PropDef } from "../registry";

const ff = "'Pretendard', sans-serif";
const mono = "'Roboto Mono', 'Fira Code', monospace";

export function PropsTable({ props }: { props: PropDef[] }) {
  const { colors } = useTheme();

  const thStyle: React.CSSProperties = {
    padding: "10px 16px", textAlign: "left", fontFamily: ff,
    fontSize: 13, fontWeight: 600, color: colors.text.primary,
    backgroundColor: colors.bg.tertiary, borderBottom: `1px solid ${colors.border.tertiary}`,
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    padding: "10px 16px", fontFamily: ff, fontSize: 13,
    color: colors.text.secondary, borderBottom: `1px solid ${colors.border.tertiary}`,
    verticalAlign: "top",
  };

  return (
    <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${colors.border.secondary}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Prop</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Default</th>
            <th style={thStyle}>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <td style={{ ...tdStyle, fontFamily: mono, fontWeight: 600, color: colors.text.primary }}>
                {p.name}{p.required && <span style={{ color: colors.text.danger }}> *</span>}
              </td>
              <td style={{ ...tdStyle, fontFamily: mono, color: colors.text.interactive.runwayPrimary }}>{p.type}</td>
              <td style={{ ...tdStyle, fontFamily: mono }}>{p.default ?? "—"}</td>
              <td style={tdStyle}>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
