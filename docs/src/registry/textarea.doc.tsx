import React from "react";
import { TextArea } from "@ds/components/TextArea";
import { registerDoc } from "./index";

registerDoc({
  slug: "text-area",
  name: "TextArea",
  description: "A multi-line text input with label, help message, and validation states.",
  category: "components",
  importCode: `import { TextArea } from "@ds/components/TextArea";`,
  whenToUse: [
    "여러 줄의 텍스트 입력이 필요할 때",
    "설명 코멘트 등 긴 텍스트 입력",
  ],
  examples: [
    {
      title: "Default",
      description: "Basic textarea with placeholder.",
      code: `<TextArea placeholder="Enter text..." />`,
      render: () => <TextArea placeholder="Enter text..." />,
    },
    {
      title: "With Label",
      description: "Textarea with a field label and help message.",
      code: `<TextArea label="Description" placeholder="Enter description..." helpMessage="Max 500 characters." />`,
      render: () => <TextArea label="Description" placeholder="Enter description..." helpMessage="Max 500 characters." />,
    },
    {
      title: "Error",
      description: "Textarea in error state.",
      code: `<TextArea label="Description" state="error" helpMessage="This field is required." />`,
      render: () => <TextArea label="Description" state="error" helpMessage="This field is required." />,
    },
    {
      title: "Disabled",
      description: "Disabled textarea.",
      code: `<TextArea label="Description" state="disabled" />`,
      render: () => <TextArea label="Description" state="disabled" />,
    },
  ],
  props: [
    { name: "label", type: "string", description: "Field label displayed above the textarea." },
    { name: "placeholder", type: "string", default: '"Placeholder"', description: "Placeholder text." },
    { name: "helpMessage", type: "string", description: "Help or hint text below the textarea." },
    { name: "state", type: '"default" | "error" | "disabled"', default: '"default"', description: "Validation state." },
    { name: "height", type: "number", default: "180", description: "Height of the textarea in pixels." },
  ],
});
