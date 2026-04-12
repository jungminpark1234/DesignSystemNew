import React from "react";
import { Checkbox } from "@ds/components/Checkbox";
import { registerDoc } from "./index";

registerDoc({
  slug: "checkbox",
  name: "Checkbox",
  description: "A checkbox input supporting checked, unchecked, and indeterminate states with an optional label.",
  category: "components",
  importCode: `import { Checkbox } from "@ds/components/Checkbox";`,
  whenToUse: [
    "여러 옵션 중 복수 선택이 필요할 때",
    "약관 동의 등 on/off 토글",
    "단일 선택은 Radio 사용",
  ],
  examples: [
    {
      title: "Default",
      description: "Unchecked checkbox.",
      code: `<Checkbox />`,
      render: () => <Checkbox />,
    },
    {
      title: "Checked",
      description: "Checkbox in checked state.",
      code: `<Checkbox checked />`,
      render: () => <Checkbox checked />,
    },
    {
      title: "Indeterminate",
      description: "Indeterminate state for partial selections.",
      code: `<Checkbox checked="indeterminate" />`,
      render: () => <Checkbox checked="indeterminate" />,
    },
    {
      title: "With Label",
      description: "Checkbox with a text label.",
      code: `<Checkbox label="Accept terms" />`,
      render: () => <Checkbox label="Accept terms" />,
    },
    {
      title: "Disabled",
      description: "Disabled checkbox states.",
      code: `<Checkbox disabled label="Disabled" />
<Checkbox disabled checked label="Disabled checked" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Checkbox disabled label="Disabled" />
          <Checkbox disabled checked label="Disabled checked" />
        </div>
      ),
    },
  ],
  props: [
    { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled checked state." },
    { name: "defaultChecked", type: "boolean", default: "false", description: "Default checked for uncontrolled usage." },
    { name: "label", type: "string", description: "Text label beside the checkbox." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables the checkbox." },
    { name: "onChange", type: "(checked: boolean) => void", description: "Called when the checkbox value changes." },
  ],
});
