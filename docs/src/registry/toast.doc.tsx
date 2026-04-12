import React from "react";
import { Toast } from "@ds/components/Toast";
import { registerDoc } from "./index";

registerDoc({
  slug: "toast",
  name: "Toast",
  description: "A notification banner with status styling, title, description, and optional actions.",
  category: "components",
  importCode: `import { Toast } from "@ds/components/Toast";`,
  whenToUse: [
    "일시적인 알림 메시지를 표시할 때",
    "저장 완료 삭제 성공 등 피드백",
    "지속적인 메시지는 Alert 사용",
  ],
  examples: [
    {
      title: "Status Variants",
      description: "Toasts for each status: brand, success, warning, error, info.",
      code: `<Toast status="brand" title="Brand" description="Brand notification." />
<Toast status="success" title="Success" description="Operation completed." />
<Toast status="warning" title="Warning" description="Please review." />
<Toast status="error" title="Error" description="Something went wrong." />
<Toast status="info" title="Info" description="For your information." />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Toast status="brand" title="Brand" description="Brand notification." />
          <Toast status="success" title="Success" description="Operation completed." />
          <Toast status="warning" title="Warning" description="Please review." />
          <Toast status="error" title="Error" description="Something went wrong." />
          <Toast status="info" title="Info" description="For your information." />
        </div>
      ),
    },
  ],
  props: [
    { name: "title", type: "string", default: '"Title"', description: "Toast title text." },
    { name: "description", type: "string", default: '"Description"', description: "Toast description text." },
    { name: "status", type: '"brand" | "neutral" | "info" | "warning" | "success" | "error"', default: '"brand"', description: "Status style." },
    { name: "type", type: '"text-only" | "text-action" | "text-long-action"', default: '"text-only"', description: "Layout type." },
    { name: "action", type: "ToastAction", description: "Primary action button." },
    { name: "dismissible", type: "boolean", default: "true", description: "Show dismiss button." },
    { name: "onDismiss", type: "() => void", description: "Called when the dismiss button is clicked." },
  ],
});
