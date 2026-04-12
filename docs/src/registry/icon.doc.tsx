import React, { useState } from "react";
import { Icon } from "@ds/components/Icon";
import { iconSvgMap } from "@ds/icons";
import type { IconName } from "@ds/icons";
import { registerDoc } from "./index";

// ── All icon names from the DS ─────────────────────────────────────────────
const ALL_ICONS = Object.keys(iconSvgMap) as IconName[];

// ── Interactive Icon Grid (Wanted Montage style) ───────────────────────────
function IconGrid() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = search
    ? ALL_ICONS.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : ALL_ICONS;

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", height: 40, padding: "0 12px 0 40px", boxSizing: "border-box",
            border: "1px solid var(--ds-border-secondary, #e5e7eb)", borderRadius: 8,
            backgroundColor: "var(--ds-bg-primary, #fff)",
            color: "var(--ds-text-primary, #101828)",
            fontSize: 14, fontFamily: "'Pretendard', sans-serif", outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ds-border-interactive-runway-primary, #155dfc)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ds-border-secondary, #e5e7eb)"; }}
        />
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="search" size={18} color="var(--ds-text-tertiary, #6a7282)" />
        </span>
      </div>

      {/* Count */}
      <span style={{ fontSize: 13, color: "var(--ds-text-tertiary, #6a7282)", fontFamily: "'Pretendard', sans-serif" }}>
        {filtered.length} icons
      </span>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: 8,
      }}>
        {filtered.map((name) => (
          <button
            key={name}
            onClick={() => handleCopy(name)}
            title={`Click to copy "${name}"`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "12px 4px", borderRadius: 8, cursor: "pointer",
              border: "1px solid var(--ds-border-secondary, #e5e7eb)",
              backgroundColor: copied === name ? "var(--ds-bg-interactive-runway-selected, #eff6ff)" : "var(--ds-bg-primary, #fff)",
              transition: "background-color 0.15s, border-color 0.15s",
              aspectRatio: "1",
            }}
            onMouseEnter={(e) => { if (copied !== name) e.currentTarget.style.backgroundColor = "var(--ds-bg-secondary, #f9fafb)"; }}
            onMouseLeave={(e) => { if (copied !== name) e.currentTarget.style.backgroundColor = "var(--ds-bg-primary, #fff)"; }}
          >
            <Icon name={name} size={24} color="var(--ds-text-primary, #101828)" />
            <span style={{
              fontSize: 9, lineHeight: "12px", color: "var(--ds-text-tertiary, #6a7282)",
              fontFamily: "'Roboto Mono', monospace",
              textAlign: "center", wordBreak: "break-all", maxWidth: "100%",
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {copied === name ? "Copied!" : name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--ds-text-disabled, #99a1af)", fontSize: 14, fontFamily: "'Pretendard', sans-serif" }}>
          No icons found for "{search}"
        </div>
      )}
    </div>
  );
}

// ── Register ───────────────────────────────────────────────────────────────
registerDoc({
  slug: "icon",
  name: "Icon",
  description: "MakinaRocks 디자인 시스템의 아이콘 세트입니다. 아이콘을 클릭하면 이름이 클립보드에 복사됩니다.",
  category: "foundation",
  examples: [
    {
      title: "All Icons",
      description: "Click an icon to copy its name.",
      code: `import { Icon } from "@ds/components/Icon";

<Icon name="search" size={24} />
<Icon name="create" size={24} color="#155dfc" />
<Icon name="setting" size={16} color="#6a7282" />`,
      render: () => <IconGrid />,
    },
    {
      title: "Sizes",
      description: "16px, 20px, 24px 크기를 지원합니다.",
      code: `<Icon name="setting" size={16} />
<Icon name="setting" size={20} />
<Icon name="setting" size={24} />`,
      render: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[16, 20, 24].map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name="setting" size={s} />
              <span style={{ fontSize: 11, color: "#6a7282", fontFamily: "'Roboto Mono', monospace" }}>{s}px</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Colors",
      description: "color prop으로 아이콘 색상을 변경합니다.",
      code: `<Icon name="star-filled" size={24} color="#f59e0b" />
<Icon name="error-fill" size={24} color="#dc2626" />
<Icon name="success-fill" size={24} color="#16a34a" />
<Icon name="info-fill" size={24} color="#155dfc" />`,
      render: () => (
        <div style={{ display: "flex", gap: 16 }}>
          <Icon name="star-filled" size={24} color="#f59e0b" />
          <Icon name="error-fill" size={24} color="#dc2626" />
          <Icon name="success-fill" size={24} color="#16a34a" />
          <Icon name="info-fill" size={24} color="#155dfc" />
        </div>
      ),
    },
  ],
  props: [
    { name: "name", type: "IconName", required: true, description: "Icon name matching the SVG map key." },
    { name: "size", type: "number", default: "24", description: "Size in pixels (width and height)." },
    { name: "color", type: "string", default: '"currentColor"', description: "CSS color applied to the icon." },
    { name: "label", type: "string", description: "Accessible label. When omitted the icon is decorative (aria-hidden)." },
  ],
});
