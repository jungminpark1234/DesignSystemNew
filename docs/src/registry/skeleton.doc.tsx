import React from "react";
import { Skeleton } from "@ds/components/Skeleton";
import { registerDoc } from "./index";

registerDoc({
  slug: "skeleton",
  name: "Skeleton",
  description: "A placeholder loading element with shimmer animation. Available in rectangle, circle, and text variants.",
  category: "components",
  importCode: `import { Skeleton } from "@ds/components/Skeleton";`,
  whenToUse: [
    "데이터 로딩 중 레이아웃 안정성을 유지할 때",
    "Spinner 대신 콘텐츠 영역의 로딩 표시",
  ],
  examples: [
    {
      title: "Rectangle",
      description: "Default rectangular skeleton.",
      code: `<Skeleton variant="rect" width={200} height={64} />`,
      render: () => <Skeleton variant="rect" width={200} height={64} />,
    },
    {
      title: "Circle",
      description: "Circular skeleton for avatar placeholders.",
      code: `<Skeleton variant="circle" width={48} height={48} />`,
      render: () => <Skeleton variant="circle" width={48} height={48} />,
    },
    {
      title: "Text Lines",
      description: "Text-shaped skeletons for content placeholders.",
      code: `<Skeleton variant="text" width="100%" />
<Skeleton variant="text" width="80%" />
<Skeleton variant="text" width="60%" />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 300 }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      ),
    },
  ],
  props: [
    { name: "variant", type: '"rect" | "circle" | "text"', default: '"rect"', description: "Shape variant." },
    { name: "width", type: "number | string", default: '"100%"', description: "Width of the skeleton." },
    { name: "height", type: "number | string", description: "Height. Defaults depend on variant." },
    { name: "animated", type: "boolean", default: "true", description: "Enable shimmer animation." },
  ],
});
