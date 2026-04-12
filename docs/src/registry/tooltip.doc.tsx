import React from "react";
import { Tooltip } from "@ds/components/Tooltip";
import { Button } from "@ds/components/Button";
import { registerDoc } from "./index";

registerDoc({
  slug: "tooltip",
  name: "Tooltip",
  description: "A popup label that appears on hover to provide additional context. Supports multiple directions and inverse styling.",
  category: "components",
  importCode: `import { Tooltip } from "@ds/components/Tooltip";`,
  whenToUse: [
    "아이콘이나 요소에 추가 설명이 필요할 때",
    "마우스 호버 시 짧은 도움말 표시",
  ],
  examples: [
    {
      title: "Default",
      description: "Hover over the button to see the tooltip.",
      code: `<Tooltip content="This is a tooltip">
  <Button label="Hover me" buttonStyle="outlined" />
</Tooltip>`,
      render: () => (
        <Tooltip content="This is a tooltip">
          <Button label="Hover me" buttonStyle="outlined" />
        </Tooltip>
      ),
    },
    {
      title: "Directions",
      description: "Tooltips positioned in different directions.",
      code: `<Tooltip content="Above" direction="above-center">
  <Button label="Above" buttonStyle="outlined" size="md" />
</Tooltip>
<Tooltip content="Below" direction="below-center">
  <Button label="Below" buttonStyle="outlined" size="md" />
</Tooltip>`,
      render: () => (
        <div style={{ display: "flex", gap: 12, paddingTop: 40 }}>
          <Tooltip content="Above" direction="above-center">
            <Button label="Above" buttonStyle="outlined" size="md" />
          </Tooltip>
          <Tooltip content="Below" direction="below-center">
            <Button label="Below" buttonStyle="outlined" size="md" />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Inverse Style",
      description: "Light-background tooltip style.",
      code: `<Tooltip content="Inverse tooltip" tooltipStyle="inverse">
  <Button label="Inverse" buttonStyle="outlined" size="md" />
</Tooltip>`,
      render: () => (
        <Tooltip content="Inverse tooltip" tooltipStyle="inverse">
          <Button label="Inverse" buttonStyle="outlined" size="md" />
        </Tooltip>
      ),
    },
  ],
  props: [
    { name: "content", type: "string", required: true, description: "Tooltip content text." },
    { name: "direction", type: "TooltipDirection", default: '"above-center"', description: "Placement relative to the trigger." },
    { name: "tooltipStyle", type: '"default" | "inverse"', default: '"default"', description: "Visual style. Default = dark, inverse = light." },
    { name: "children", type: "ReactNode", required: true, description: "Trigger element." },
    { name: "delay", type: "number", default: "200", description: "Delay before showing in milliseconds." },
  ],
});
