import React, { useState } from "react";
import { useTheme } from "../../theme";
import { Icon } from "@ds/components/Icon";
import { Tabs } from "@ds/components/Tabs";
import { iconSvgMap } from "@ds/icons";
import type { IconName } from "@ds/icons";
import { CodeBlock } from "../../components/CodeBlock";

const ff = "'Pretendard', sans-serif";
const mono = "'Roboto Mono', monospace";
// Group related icons together
const ICON_GROUPS: IconName[][] = [
  ["chevron-down", "chevron-left", "chevron-right", "chevron-up"],
  ["prev-arrow", "up-arrow", "down-arrow", "next-arrow"],
  ["cpu", "memory", "disk", "gpu"],
  ["star-stroke", "star-filled"],
  ["folder", "folder-fill", "folder-minus", "folder-plus", "folder_open"],
  ["more-horizontal", "more-vertical"],
  ["check-circle-stroke", "error-circle-stroke", "info-circle-stroke", "help-circle-stroke", "warning-stroke"],
  ["success-fill", "error-fill", "error-gray-fill", "info-fill", "waring-fill", "help-circle-fill"],
];

const GROUPED_SET = new Set(ICON_GROUPS.flat());
const RAW_ICONS = Object.keys(iconSvgMap) as IconName[];

// Build sorted list: ungrouped icons in original order, groups inserted at first member's position
const ALL_ICONS: IconName[] = [];
const insertedGroups = new Set<number>();
for (const name of RAW_ICONS) {
  const groupIdx = ICON_GROUPS.findIndex((g) => g.includes(name));
  if (groupIdx >= 0) {
    if (!insertedGroups.has(groupIdx)) {
      insertedGroups.add(groupIdx);
      ALL_ICONS.push(...ICON_GROUPS[groupIdx].filter((n) => n in iconSvgMap));
    }
  } else {
    ALL_ICONS.push(name);
  }
}

const COLOR_ICONS = ALL_ICONS.filter((n) => /fill|filled/i.test(n));
const SOLID_ICONS = ALL_ICONS.filter((n) => !/fill|filled/i.test(n));

export function IconPage() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState("solid");

  const baseIcons = tab === "color" ? COLOR_ICONS : tab === "solid" ? SOLID_ICONS : ALL_ICONS;
  const filtered = search
    ? baseIcons.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : baseIcons;

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Icon</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          MakinaRocks 디자인 시스템의 아이콘 세트입니다. 아이콘을 클릭하면 이름이 클립보드에 복사됩니다.
        </p>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      {/* Search + Tabs row */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="all-icons" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>All Icons</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", height: 40, padding: "0 12px 0 40px", boxSizing: "border-box",
                border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
                backgroundColor: colors.bg.primary, color: colors.text.primary,
                fontSize: 14, fontFamily: ff, outline: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.border.interactive?.runwayPrimary || "#155dfc"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border.secondary; }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon name="search" size={18} color={colors.text.tertiary} />
            </span>
          </div>
          <Tabs
            items={[
              { key: "solid", label: "Solid", badge: SOLID_ICONS.length },
              { key: "color", label: "Color", badge: COLOR_ICONS.length },
              { key: "all", label: "All", badge: ALL_ICONS.length },
            ]}
            selectedKey={tab}
            onChange={setTab}
          />
        </div>
        <span style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff }}>{filtered.length} icons</span>
      </section>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))",
        gap: 8,
      }}>
        {filtered.map((name) => (
          <button
            key={name}
            onClick={() => handleCopy(name)}
            title={`Click to copy "${name}"`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "14px 4px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${copied === name ? colors.text.interactive.runwayPrimary : colors.border.secondary}`,
              backgroundColor: copied === name ? colors.bg.interactive.runwaySelected : colors.bg.primary,
              transition: "background-color 0.15s, border-color 0.15s",
              aspectRatio: "1",
            }}
            onMouseEnter={(e) => { if (copied !== name) e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
            onMouseLeave={(e) => { if (copied !== name) e.currentTarget.style.backgroundColor = colors.bg.primary; }}
          >
            <Icon name={name} size={24} color={COLOR_ICONS.includes(name) ? undefined : colors.text.primary} />
            <span style={{
              fontSize: 9, lineHeight: "12px", color: copied === name ? colors.text.interactive.runwayPrimary : colors.text.tertiary,
              fontFamily: mono, textAlign: "center", wordBreak: "break-all", maxWidth: "100%",
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {copied === name ? "Copied!" : name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: colors.text.disabled, fontSize: 14, fontFamily: ff }}>
          "{search}" 에 대한 검색 결과가 없습니다.
        </div>
      )}

      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      {/* Usage */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="usage" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Usage</h2>
        <CodeBlock code={`import { Icon } from "@ds/components/Icon";

// Basic usage
<Icon name="search" size={24} />

// With color
<Icon name="create" size={24} color="#155dfc" />

// Accessible label
<Icon name="close" size={16} label="Close dialog" />`} />
      </section>

      {/* Sizes */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="sizes" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>Sizes</h2>
        <p style={{ fontSize: 14, lineHeight: "22px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          16px, 24px, 32px, 40px 크기를 지원합니다.
        </p>
        <div style={{ display: "flex", alignItems: "end", gap: 24, padding: 16, borderRadius: 8, border: `1px solid ${colors.border.secondary}` }}>
          {[16, 24, 32, 40].map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Icon name="setting" size={s} color={colors.text.primary} />
              <span style={{ fontSize: 11, fontFamily: mono, color: colors.text.tertiary }}>{s}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* API */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="api" style={{ fontSize: 20, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>API Reference</h2>
        <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${colors.border.secondary}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Prop", "Type", "Default", "Description"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, backgroundColor: colors.bg.tertiary, borderBottom: `1px solid ${colors.border.tertiary}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "name", type: "IconName", def: "—", desc: "Icon name (required)" },
                { name: "size", type: "number", def: "24", desc: "Size in px" },
                { name: "color", type: "string", def: '"currentColor"', desc: "CSS color" },
                { name: "label", type: "string", def: "—", desc: "Accessible label" },
              ].map((row) => (
                <tr key={row.name}>
                  <td style={{ padding: "10px 16px", fontFamily: mono, fontWeight: 600, fontSize: 13, color: colors.text.primary, borderBottom: `1px solid ${colors.border.tertiary}` }}>{row.name}</td>
                  <td style={{ padding: "10px 16px", fontFamily: mono, fontSize: 13, color: colors.text.interactive.runwayPrimary, borderBottom: `1px solid ${colors.border.tertiary}` }}>{row.type}</td>
                  <td style={{ padding: "10px 16px", fontFamily: mono, fontSize: 13, color: colors.text.tertiary, borderBottom: `1px solid ${colors.border.tertiary}` }}>{row.def}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: colors.text.secondary, fontFamily: ff, borderBottom: `1px solid ${colors.border.tertiary}` }}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
