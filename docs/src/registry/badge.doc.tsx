import React from "react";
import { Badge } from "@ds/components/Badge";
import { registerDoc } from "./index";

registerDoc({
  slug: "badge",
  name: "Badge",
  description: "Small status indicator in dot, number, or text form.",
  category: "components",
  importCode: `import { Badge } from "@ds/components/Badge";`,
  whenToUse: [
    "읽지 않은 알림 수를 표시할 때 (number type)",
    "새로운 항목이나 상태를 표시할 때 (text type: NEW, HOT)",
    "아이콘이나 아바타 옆에 상태 점을 표시할 때 (dot type)",
  ],
  examples: [
    {
      title: "Number Badge",
      code: `<Badge label={3} />
<Badge label={99} status="error" />
<Badge label="99+" status="info" />`,
      render: () => (
        <>
          <Badge label={3} />
          <Badge label={99} status="error" />
          <Badge label="99+" status="info" />
        </>
      ),
    },
    {
      title: "Dot Badge",
      code: `<Badge type="dot" />
<Badge type="dot" status="success" />
<Badge type="dot" status="error" />`,
      render: () => (
        <>
          <Badge type="dot" />
          <Badge type="dot" status="success" />
          <Badge type="dot" status="error" />
          <Badge type="dot" status="warning" />
        </>
      ),
    },
    {
      title: "Text Badge",
      code: `<Badge type="text" label="NEW" status="info" />
<Badge type="text" label="HOT" status="error" />`,
      render: () => (
        <>
          <Badge type="text" label="NEW" status="info" />
          <Badge type="text" label="HOT" status="error" />
          <Badge type="text" label="BETA" status="warning" />
        </>
      ),
    },
  ],
  props: [
    { name: "type", type: '"dot" | "number" | "text"', default: '"number"', description: "Visual type of badge." },
    { name: "status", type: '"neutral" | "info" | "warning" | "success" | "error"', default: '"neutral"', description: "Status color." },
    { name: "label", type: "string | number", default: '"1"', description: "Label content for number/text badge." },
  ],
});
