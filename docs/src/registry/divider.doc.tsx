import React from "react";
import { Divider } from "@ds/components/Divider";
import { registerDoc } from "./index";

registerDoc({
  slug: "divider",
  name: "Divider",
  description: "A visual separator line available in horizontal or vertical orientation with three thickness options.",
  category: "components",
  importCode: `import { Divider } from "@ds/components/Divider";`,
  whenToUse: [
    "섹션 간 시각적 구분이 필요할 때",
    "리스트 항목 사이를 구분할 때",
  ],
  examples: [
    {
      title: "Horizontal Sizes",
      description: "Small (1px), medium (2px), and large (4px) horizontal dividers.",
      code: `<Divider size="sm" />
<Divider size="md" />
<Divider size="lg" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <Divider size="sm" />
          <Divider size="md" />
          <Divider size="lg" />
        </div>
      ),
    },
    {
      title: "Vertical",
      description: "Vertical divider between elements.",
      code: `<div style={{ display: "flex", alignItems: "center", gap: 12, height: 32 }}>
  <span>Left</span>
  <Divider orientation="vertical" />
  <span>Right</span>
</div>`,
      render: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: 32 }}>
          <span>Left</span>
          <Divider orientation="vertical" />
          <span>Right</span>
        </div>
      ),
    },
  ],
  props: [
    { name: "size", type: '"sm" | "md" | "lg"', default: '"sm"', description: "Line thickness. sm = 1px, md = 2px, lg = 4px." },
    { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Divider direction." },
    { name: "color", type: "string", description: "Color override. Defaults to colorBorder.secondary." },
  ],
});
