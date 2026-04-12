import React from "react";
import { Switch } from "@ds/components/Switch";
import { registerDoc } from "./index";

registerDoc({
  slug: "switch",
  name: "Switch",
  description: "A toggle switch for boolean on/off settings. Supports labels on either side and disabled state.",
  category: "components",
  importCode: `import { Switch } from "@ds/components/Switch";`,
  whenToUse: [
    "즉시 적용되는 on/off 설정 토글",
    "확인 버튼 없이 바로 반영되는 설정",
  ],
  examples: [
    {
      title: "Default",
      description: "Off and on switch states.",
      code: `<Switch />
<Switch checked />`,
      render: () => (
        <div style={{ display: "flex", gap: 16 }}>
          <Switch />
          <Switch checked />
        </div>
      ),
    },
    {
      title: "With Label",
      description: "Switch with a text label.",
      code: `<Switch label="Enable notifications" />
<Switch label="Left label" labelPosition="left" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Switch label="Enable notifications" />
          <Switch label="Left label" labelPosition="left" />
        </div>
      ),
    },
    {
      title: "Disabled",
      description: "Disabled switch states.",
      code: `<Switch disabled label="Disabled off" />
<Switch disabled checked label="Disabled on" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Switch disabled label="Disabled off" />
          <Switch disabled checked label="Disabled on" />
        </div>
      ),
    },
  ],
  props: [
    { name: "checked", type: "boolean", description: "Controlled checked state." },
    { name: "label", type: "string", description: "Text label beside the switch." },
    { name: "labelPosition", type: '"left" | "right"', default: '"right"', description: "Label placement." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables the switch." },
    { name: "onChange", type: "(checked: boolean) => void", description: "Called when the switch is toggled." },
  ],
});
