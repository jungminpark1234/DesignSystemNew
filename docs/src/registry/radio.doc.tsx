import React from "react";
import { Radio } from "@ds/components/Radio";
import { registerDoc } from "./index";

registerDoc({
  slug: "radio",
  name: "Radio",
  description: "A radio button input for single selection within a group. Supports labels and disabled state.",
  category: "components",
  importCode: `import { Radio } from "@ds/components/Radio";`,
  whenToUse: [
    "여러 옵션 중 하나만 선택해야 할 때",
    "복수 선택은 Checkbox 사용",
  ],
  examples: [
    {
      title: "Default",
      description: "Unchecked and checked radio buttons.",
      code: `<Radio />
<Radio checked />`,
      render: () => (
        <div style={{ display: "flex", gap: 16 }}>
          <Radio />
          <Radio checked />
        </div>
      ),
    },
    {
      title: "With Labels",
      description: "Radio buttons with text labels.",
      code: `<Radio label="Option A" name="group" />
<Radio label="Option B" name="group" checked />
<Radio label="Option C" name="group" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Radio label="Option A" name="group1" />
          <Radio label="Option B" name="group1" checked />
          <Radio label="Option C" name="group1" />
        </div>
      ),
    },
    {
      title: "Disabled",
      description: "Disabled radio buttons.",
      code: `<Radio disabled label="Disabled" />
<Radio disabled checked label="Disabled checked" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Radio disabled label="Disabled" />
          <Radio disabled checked label="Disabled checked" />
        </div>
      ),
    },
  ],
  props: [
    { name: "checked", type: "boolean", default: "false", description: "Whether the radio is selected." },
    { name: "label", type: "string", description: "Text label beside the radio." },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    { name: "name", type: "string", description: "Name attribute for native radio group behaviour." },
    { name: "value", type: "string", description: "Value attribute." },
    { name: "onChange", type: "(checked: boolean) => void", description: "Called when the radio value changes." },
  ],
});
