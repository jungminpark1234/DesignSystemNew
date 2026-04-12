import React from "react";
import { TextField } from "@ds/components/TextField";
import { Icon } from "@ds/components/Icon";
import { registerDoc } from "./index";

registerDoc({
  slug: "text-field",
  name: "TextField",
  description: "Single-line text input with label, help message, validation states, icons, and character counter.",
  category: "components",
  importCode: `import { TextField } from "@ds/components/TextField";`,
  whenToUse: [
    "사용자로부터 한 줄의 텍스트 입력을 받을 때",
    "이름, 이메일, 검색어 등 짧은 텍스트 입력",
    "여러 줄 입력이 필요하면 TextArea를 사용하세요",
    "드롭다운 선택이 필요하면 Select를 사용하세요",
  ],
  examples: [
    {
      title: "Default",
      code: `<TextField label="Name" placeholder="Enter your name" />`,
      render: () => <TextField label="Name" placeholder="Enter your name" style={{ width: 320 }} />,
    },
    {
      title: "With Help Message",
      code: `<TextField label="Email" placeholder="user@example.com" helpMessage="We'll never share your email." />`,
      render: () => <TextField label="Email" placeholder="user@example.com" helpMessage="We'll never share your email." style={{ width: 320 }} />,
    },
    {
      title: "Error State",
      code: `<TextField label="Username" state="error" helpMessage="Username is required" helpMessageStatus="error" />`,
      render: () => <TextField label="Username" state="error" helpMessage="Username is required" helpMessageStatus="error" style={{ width: 320 }} />,
    },
    {
      title: "With Icons",
      code: `<TextField label="Search" placeholder="Search..." leadingIcon={<Icon name="search" size={16} />} />`,
      render: () => <TextField label="Search" placeholder="Search..." leadingIcon={<Icon name="search" size={16} />} style={{ width: 320 }} />,
    },
    {
      title: "Character Counter",
      code: `<TextField label="Bio" placeholder="Short bio" maxLength={100} />`,
      render: () => <TextField label="Bio" placeholder="Short bio" maxLength={100} style={{ width: 320 }} />,
    },
    {
      title: "Disabled",
      code: `<TextField label="Disabled" state="disabled" placeholder="Can't edit" />`,
      render: () => <TextField label="Disabled" state="disabled" placeholder="Can't edit" style={{ width: 320 }} />,
    },
  ],
  props: [
    { name: "label", type: "string", description: "Field label above the input." },
    { name: "placeholder", type: "string", default: '"Placeholder"', description: "Placeholder text." },
    { name: "state", type: '"default" | "error" | "disabled"', default: '"default"', description: "Validation state." },
    { name: "helpMessage", type: "string", description: "Help/hint text below the input." },
    { name: "helpMessageStatus", type: '"default" | "error" | "success" | "info" | "warning"', description: "Help message status color." },
    { name: "leadingIcon", type: "ReactNode", description: "Icon on the left side (16x16)." },
    { name: "trailingIcon", type: "ReactNode", description: "Icon on the right side (16x16)." },
    { name: "helpIcon", type: "ReactNode", description: "Icon next to the label." },
    { name: "maxLength", type: "number", description: "Shows character counter." },
    { name: "value", type: "string", description: "Controlled value." },
    { name: "onChange", type: "ChangeEventHandler", description: "Change handler." },
  ],
});
