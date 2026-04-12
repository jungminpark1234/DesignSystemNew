import React from "react";
import { Button } from "@ds/components/Button";
import { Icon } from "@ds/components/Icon";
import { registerDoc } from "./index";

registerDoc({
  slug: "button",
  name: "Button",
  description: "Interactive button component with multiple variants, sizes, and styles. Supports loading state, leading/trailing icons.",
  category: "components",
  importCode: `import { Button } from "@ds/components/Button";`,
  whenToUse: [
    "사용자의 액션을 트리거할 때 (저장, 생성, 삭제 등)",
    "폼 제출 버튼으로 사용할 때",
    "Primary: 페이지의 주요 액션 (Create, Save)",
    "Destructive: 위험한 액션 (Delete, Remove)",
    "Outlined/Transparent: 보조 액션 (Cancel, Back)",
  ],
  examples: [
    {
      title: "Default",
      description: "Primary filled button in large and medium sizes.",
      code: `<Button label="Primary" size="lg" />
<Button label="Primary" size="md" />`,
      render: () => (
        <>
          <Button label="Primary" size="lg" />
          <Button label="Primary" size="md" />
        </>
      ),
    },
    {
      title: "Button Styles",
      description: "Filled, outlined, and transparent variants.",
      code: `<Button label="Filled" buttonStyle="filled" />
<Button label="Outlined" buttonStyle="outlined" />
<Button label="Transparent" buttonStyle="transparent" />`,
      render: () => (
        <>
          <Button label="Filled" buttonStyle="filled" />
          <Button label="Outlined" buttonStyle="outlined" />
          <Button label="Transparent" buttonStyle="transparent" />
        </>
      ),
    },
    {
      title: "Destructive",
      description: "Destructive button for dangerous actions.",
      code: `<Button label="Delete" buttonType="Destructive" />
<Button label="Remove" buttonType="Destructive" buttonStyle="outlined" />
<Button label="Cancel" buttonType="Destructive" buttonStyle="transparent" />`,
      render: () => (
        <>
          <Button label="Delete" buttonType="Destructive" />
          <Button label="Remove" buttonType="Destructive" buttonStyle="outlined" />
          <Button label="Cancel" buttonType="Destructive" buttonStyle="transparent" />
        </>
      ),
    },
    {
      title: "With Icons",
      description: "Buttons with leading or trailing icons.",
      code: `<Button label="Create" leadingIcon={<Icon name="create" size={16} color="#fff" />} />
<Button label="Next" trailingIcon={<Icon name="arrow2_right" size={16} color="#fff" />} />`,
      render: () => (
        <>
          <Button label="Create" leadingIcon={<Icon name="create" size={16} color="#fff" />} />
          <Button label="Next" trailingIcon={<Icon name="arrow2_right" size={16} color="#fff" />} />
        </>
      ),
    },
    {
      title: "Loading",
      description: "Loading state disables interaction and shows a spinner.",
      code: `<Button label="Saving..." loading />
<Button label="Loading" loading buttonStyle="outlined" />`,
      render: () => (
        <>
          <Button label="Saving..." loading />
          <Button label="Loading" loading buttonStyle="outlined" />
        </>
      ),
    },
    {
      title: "Disabled",
      description: "Disabled buttons are non-interactive.",
      code: `<Button label="Disabled" disabled />
<Button label="Disabled" disabled buttonStyle="outlined" />`,
      render: () => (
        <>
          <Button label="Disabled" disabled />
          <Button label="Disabled" disabled buttonStyle="outlined" />
        </>
      ),
    },
  ],
  props: [
    { name: "buttonType", type: '"Primary" | "Destructive"', default: '"Primary"', description: "Visual intent of the button." },
    { name: "size", type: '"lg" | "md"', default: '"lg"', description: "Size variant. lg = 40px, md = 32px height." },
    { name: "buttonStyle", type: '"filled" | "outlined" | "transparent"', default: '"filled"', description: "Visual style variant." },
    { name: "label", type: "string", description: "Button label text." },
    { name: "leadingIcon", type: "ReactNode", description: "Icon rendered before the label." },
    { name: "trailingIcon", type: "ReactNode", description: "Icon rendered after the label." },
    { name: "loading", type: "boolean", default: "false", description: "Loading state — disables interaction, shows spinner." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables the button." },
  ],
});
