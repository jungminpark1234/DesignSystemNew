import React from "react";
import { Chip } from "@ds/components/Chip";
import { registerDoc } from "./index";

registerDoc({
  slug: "chip",
  name: "Chip",
  description: "A compact element for selections, filters, or tags. Supports selected state, close button, and two sizes.",
  category: "components",
  importCode: `import { Chip } from "@ds/components/Chip";`,
  whenToUse: [
    "태그나 카테고리를 표시할 때",
    "필터 선택 상태를 표시할 때",
    "삭제 가능한 태그가 필요할 때",
  ],
  examples: [
    {
      title: "Default",
      description: "Basic chip.",
      code: `<Chip label="Label" />`,
      render: () => <Chip label="Label" />,
    },
    {
      title: "Sizes",
      description: "Small and medium chip sizes.",
      code: `<Chip label="Small" size="sm" />
<Chip label="Medium" size="md" />`,
      render: () => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Chip label="Small" size="sm" />
          <Chip label="Medium" size="md" />
        </div>
      ),
    },
    {
      title: "Selected",
      description: "Chip in selected state.",
      code: `<Chip label="Selected" selected />`,
      render: () => <Chip label="Selected" selected />,
    },
    {
      title: "Closable",
      description: "Chip with a close button.",
      code: `<Chip label="Closable" closable onClose={() => {}} />`,
      render: () => <Chip label="Closable" closable onClose={() => {}} />,
    },
    {
      title: "Disabled",
      description: "Disabled chip.",
      code: `<Chip label="Disabled" disabled />`,
      render: () => <Chip label="Disabled" disabled />,
    },
  ],
  props: [
    { name: "label", type: "string", default: '"Label"', description: "Chip label text." },
    { name: "size", type: '"sm" | "md"', default: '"md"', description: "Chip size." },
    { name: "selected", type: "boolean", description: "Whether the chip is selected." },
    { name: "closable", type: "boolean", default: "false", description: "Show a close/remove button." },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    { name: "onClick", type: "(selected: boolean) => void", description: "Called when the chip is clicked." },
    { name: "onClose", type: "() => void", description: "Called when the close button is clicked." },
  ],
});
