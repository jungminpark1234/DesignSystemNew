import React from "react";
import { Alert } from "@ds/components/Alert";
import { registerDoc } from "./index";

registerDoc({
  slug: "alert",
  name: "Alert",
  description: "Displays a callout message to the user with contextual status colors and optional dismiss action.",
  category: "components",
  importCode: `import { Alert } from "@ds/components/Alert";`,
  whenToUse: [
    "사용자에게 중요한 정보를 전달할 때",
    "작업 성공/실패/경고 상태를 페이지 내에 표시할 때",
    "일시적이지 않은 지속적인 메시지가 필요할 때 (일시적이면 Toast 사용)",
  ],
  examples: [
    {
      title: "Default",
      code: `<Alert title="Information" description="This is a default alert." />`,
      render: () => <Alert title="Information" description="This is a default alert." />,
    },
    {
      title: "Status Variants",
      description: "Success, warning, error, and info status colors.",
      code: `<Alert status="success" title="Success" description="Operation completed." />
<Alert status="warning" title="Warning" description="Check your input." />
<Alert status="error" title="Error" description="Something went wrong." />
<Alert status="info" title="Info" description="New update available." />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <Alert status="success" title="Success" description="Operation completed." />
          <Alert status="warning" title="Warning" description="Check your input." />
          <Alert status="error" title="Error" description="Something went wrong." />
          <Alert status="info" title="Info" description="New update available." />
        </div>
      ),
    },
  ],
  props: [
    { name: "status", type: '"default" | "success" | "warning" | "error" | "info"', default: '"default"', description: "Status variant controlling color." },
    { name: "title", type: "string", description: "Alert title text." },
    { name: "description", type: "string", description: "Alert description text." },
    { name: "onDismiss", type: "() => void", description: "Called when dismiss button is clicked." },
  ],
});
