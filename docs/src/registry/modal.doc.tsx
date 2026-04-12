import React from "react";
import { Modal } from "@ds/components/Modal";
import { Button } from "@ds/components/Button";
import { registerDoc } from "./index";

function ModalBasicDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button label="Open Modal" onClick={() => setOpen(true)} />
      <Modal
        open={open}
        title="Modal Title"
        description="This is a basic modal with a description."
        showCloseButton
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function ModalActionsDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button label="Open Modal with Actions" onClick={() => setOpen(true)} />
      <Modal
        open={open}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
        showCloseButton
        onClose={() => setOpen(false)}
        primaryAction={{ label: "Confirm", onClick: () => setOpen(false) }}
        secondaryAction={{ label: "Cancel", onClick: () => setOpen(false), variant: "secondary" }}
      />
    </>
  );
}

registerDoc({
  slug: "modal",
  name: "Modal",
  description: "A dialog overlay for confirmations, alerts, or focused content. Supports title, description, and action buttons.",
  category: "components",
  importCode: `import { Modal } from "@ds/components/Modal";`,
  whenToUse: [
    "사용자의 확인이 필요한 중요한 액션 (삭제 확인 등)",
    "간단한 정보 표시나 확인 다이얼로그",
    "복잡한 폼은 Drawer 사용",
  ],
  examples: [
    {
      title: "Basic",
      description: "Click the button to open a simple modal.",
      code: `function ModalBasicDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button label="Open Modal" onClick={() => setOpen(true)} />
      <Modal
        open={open}
        title="Modal Title"
        description="This is a basic modal with a description."
        showCloseButton
        onClose={() => setOpen(false)}
      />
    </>
  );
}`,
      render: () => <ModalBasicDemo />,
    },
    {
      title: "With Actions",
      description: "Modal with primary and secondary action buttons.",
      code: `<Modal
  open={open}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  showCloseButton
  onClose={() => setOpen(false)}
  primaryAction={{ label: "Confirm", onClick: () => setOpen(false) }}
  secondaryAction={{ label: "Cancel", onClick: () => setOpen(false), variant: "secondary" }}
/>`,
      render: () => <ModalActionsDemo />,
    },
  ],
  props: [
    { name: "open", type: "boolean", required: true, description: "Whether the modal is open." },
    { name: "title", type: "string", description: "Modal title." },
    { name: "description", type: "string", description: "Description text below the title." },
    { name: "primaryAction", type: "ModalAction", description: "Primary action button configuration." },
    { name: "secondaryAction", type: "ModalAction", description: "Secondary action button configuration." },
    { name: "showCloseButton", type: "boolean", description: "Show the close button in header." },
    { name: "onClose", type: "() => void", description: "Called when the modal is closed." },
    { name: "width", type: "number", default: "640", description: "Width of the dialog in pixels." },
  ],
});
