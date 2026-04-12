import React from "react";
import { Select } from "@ds/components/Select";
import { registerDoc } from "./index";

const sampleOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

registerDoc({
  slug: "select",
  name: "Select",
  description: "A dropdown select component with custom styling. Supports label, placeholder, help text, and validation states.",
  category: "components",
  importCode: `import { Select } from "@ds/components/Select";`,
  whenToUse: [
    "드롭다운에서 하나의 옵션을 선택할 때",
    "옵션이 5개 이상일 때 Radio 대신 사용",
  ],
  examples: [
    {
      title: "Default",
      description: "Basic select with options.",
      code: `<Select
  options={[
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ]}
  placeholder="Choose a fruit"
/>`,
      render: () => <Select options={sampleOptions} placeholder="Choose a fruit" />,
    },
    {
      title: "With Label",
      description: "Select with a field label.",
      code: `<Select options={options} label="Fruit" placeholder="Select..." />`,
      render: () => <Select options={sampleOptions} label="Fruit" placeholder="Select..." />,
    },
    {
      title: "Error State",
      description: "Select in error state with help message.",
      code: `<Select options={options} label="Fruit" state="error" helpMessage="Selection is required." />`,
      render: () => <Select options={sampleOptions} label="Fruit" state="error" helpMessage="Selection is required." />,
    },
    {
      title: "Disabled",
      description: "Disabled select.",
      code: `<Select options={options} label="Fruit" state="disabled" />`,
      render: () => <Select options={sampleOptions} label="Fruit" state="disabled" />,
    },
  ],
  props: [
    { name: "options", type: "SelectOption[]", required: true, description: "Array of { value, label, disabled? } options." },
    { name: "value", type: "string", description: "Currently selected value (controlled)." },
    { name: "placeholder", type: "string", default: '"Placeholder"', description: "Placeholder text when nothing is selected." },
    { name: "label", type: "string", description: "Field label displayed above the trigger." },
    { name: "helpMessage", type: "string", description: "Help or hint text below the trigger." },
    { name: "state", type: '"default" | "error" | "disabled"', default: '"default"', description: "Validation state." },
    { name: "onChange", type: "(value: string) => void", description: "Called when the selection changes." },
  ],
});
