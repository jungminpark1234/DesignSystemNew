import React from "react";
import { Spinner } from "@ds/components/Spinner";
import { registerDoc } from "./index";

registerDoc({
  slug: "spinner",
  name: "Spinner",
  description: "An animated loading spinner available in four sizes and three visual types.",
  category: "components",
  importCode: `import { Spinner } from "@ds/components/Spinner";`,
  whenToUse: [
    "버튼이나 작은 영역의 로딩 표시",
    "전체 페이지 로딩은 Skeleton 사용",
  ],
  examples: [
    {
      title: "Sizes",
      description: "Small, medium, large, and extra-large spinners.",
      code: `<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />`,
      render: () => (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
      ),
    },
    {
      title: "Types",
      description: "Primary (brand blue), secondary (gray), and inverse (white on dark).",
      code: `<Spinner spinnerType="primary" />
<Spinner spinnerType="secondary" />
<div style={{ background: "#1f2937", padding: 8, borderRadius: 8 }}>
  <Spinner spinnerType="inverse" />
</div>`,
      render: () => (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Spinner spinnerType="primary" />
          <Spinner spinnerType="secondary" />
          <div style={{ background: "#1f2937", padding: 8, borderRadius: 8, display: "inline-flex" }}>
            <Spinner spinnerType="inverse" />
          </div>
        </div>
      ),
    },
  ],
  props: [
    { name: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Spinner size." },
    { name: "spinnerType", type: '"primary" | "secondary" | "inverse"', default: '"primary"', description: "Visual type. Primary = brand blue, secondary = gray, inverse = white." },
  ],
});
