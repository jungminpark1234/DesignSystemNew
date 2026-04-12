import React from "react";
import { StatusChip } from "@ds/components/StatusChip";
import { registerDoc } from "./index";

registerDoc({
  slug: "status-chip",
  name: "StatusChip",
  description: "A compact status indicator chip with colored dot, label, and multiple visual styles.",
  category: "components",
  importCode: `import { StatusChip } from "@ds/components/StatusChip";`,
  whenToUse: [
    "리소스의 상태를 표시할 때 (Connected, Error, Pending 등)",
    "테이블 셀에서 상태 표시",
  ],
  examples: [
    {
      title: "States",
      description: "All available status states.",
      code: `<StatusChip state="success" />
<StatusChip state="info" />
<StatusChip state="warning" />
<StatusChip state="error" />
<StatusChip state="neutral" />
<StatusChip state="loading" />
<StatusChip state="pending" />
<StatusChip state="stopped" />`,
      render: () => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusChip state="success" />
          <StatusChip state="info" />
          <StatusChip state="warning" />
          <StatusChip state="error" />
          <StatusChip state="neutral" />
          <StatusChip state="loading" />
          <StatusChip state="pending" />
          <StatusChip state="stopped" />
        </div>
      ),
    },
    {
      title: "Styles",
      description: "Filled, transparent, and outline styles.",
      code: `<StatusChip state="success" chipStyle="filled" />
<StatusChip state="success" chipStyle="transparent" />
<StatusChip state="success" chipStyle="outline" />`,
      render: () => (
        <div style={{ display: "flex", gap: 8 }}>
          <StatusChip state="success" chipStyle="filled" />
          <StatusChip state="success" chipStyle="transparent" />
          <StatusChip state="success" chipStyle="outline" />
        </div>
      ),
    },
    {
      title: "Sizes",
      description: "Small and medium sizes.",
      code: `<StatusChip state="info" size="sm" />
<StatusChip state="info" size="md" />`,
      render: () => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusChip state="info" size="sm" />
          <StatusChip state="info" size="md" />
        </div>
      ),
    },
  ],
  props: [
    { name: "state", type: '"success" | "info" | "warning" | "error" | "neutral" | "loading" | "pending" | "stopped"', default: '"success"', description: "Status state." },
    { name: "chipStyle", type: '"filled" | "transparent" | "outline"', default: '"filled"', description: "Visual style." },
    { name: "size", type: '"sm" | "md"', default: '"md"', description: "Chip size." },
    { name: "label", type: "string", description: "Label text. Defaults to the state name." },
  ],
});
