import React from "react";
import { Drawer } from "@ds/components/Drawer";
import { Button } from "@ds/components/Button";
import { registerDoc } from "./index";

function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button label="Open Drawer" onClick={() => setOpen(true)} />
      <Drawer open={open} onClose={() => setOpen(false)} title="Drawer Title">
        <div style={{ padding: 16 }}>Drawer body content goes here.</div>
      </Drawer>
    </>
  );
}

registerDoc({
  slug: "drawer",
  name: "Drawer",
  description: "A slide-in panel from the right side of the screen with a title header, scrollable body, and optional footer.",
  category: "components",
  importCode: `import { Drawer } from "@ds/components/Drawer";`,
  whenToUse: [
    "생성/편집 폼을 사이드 패널로 표시할 때",
    "메인 콘텐츠를 유지하면서 추가 정보를 보여줄 때",
    "간단한 확인은 Modal 사용",
  ],
  examples: [
    {
      title: "Basic",
      description: "Click the button to open a drawer.",
      code: `function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button label="Open Drawer" onClick={() => setOpen(true)} />
      <Drawer open={open} onClose={() => setOpen(false)} title="Drawer Title">
        <div style={{ padding: 16 }}>Drawer body content goes here.</div>
      </Drawer>
    </>
  );
}`,
      render: () => <DrawerDemo />,
    },
  ],
  props: [
    { name: "open", type: "boolean", required: true, description: "Whether the drawer is open." },
    { name: "onClose", type: "() => void", required: true, description: "Called when the user closes the drawer." },
    { name: "title", type: "string", required: true, description: "Title text in the header." },
    { name: "width", type: "number | string", default: '"max(800px, 40vw)"', description: "Width of the drawer panel." },
    { name: "footer", type: "ReactNode", description: "Footer content, typically action buttons." },
    { name: "noBackdrop", type: "boolean", default: "false", description: "Hide backdrop and render as standalone panel." },
    { name: "children", type: "ReactNode", required: true, description: "Body content." },
  ],
});
