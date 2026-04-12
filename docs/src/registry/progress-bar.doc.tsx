import React from "react";
import { ProgressBar } from "@ds/components/ProgressBar";
import { registerDoc } from "./index";

registerDoc({
  slug: "progress-bar",
  name: "ProgressBar",
  description: "A horizontal bar indicating progress from 0 to 100%. Supports labels, help messages, and error state.",
  category: "components",
  importCode: `import { ProgressBar } from "@ds/components/ProgressBar";`,
  whenToUse: [
    "작업의 진행 상태를 시각적으로 표시할 때",
    "파일 업로드나 학습 진행률 표시",
  ],
  examples: [
    {
      title: "Default",
      description: "Progress bar at 50%.",
      code: `<ProgressBar value={50} />`,
      render: () => <ProgressBar value={50} />,
    },
    {
      title: "With Label",
      description: "Progress bar with label and percentage text.",
      code: `<ProgressBar value={75} showLabel label="Uploading" />`,
      render: () => <ProgressBar value={75} showLabel label="Uploading" />,
    },
    {
      title: "Error State",
      description: "Progress bar in error state with help message.",
      code: `<ProgressBar value={30} isError showLabel label="Upload failed" helpMessage="Please try again." />`,
      render: () => <ProgressBar value={30} isError showLabel label="Upload failed" helpMessage="Please try again." />,
    },
  ],
  props: [
    { name: "value", type: "number", default: "0", description: "Progress value from 0 to 100." },
    { name: "showLabel", type: "boolean", default: "false", description: "Show label and percentage text above the bar." },
    { name: "label", type: "string", description: "Label text displayed above the bar." },
    { name: "helpMessage", type: "string", description: "Help message below the bar." },
    { name: "isError", type: "boolean", default: "false", description: "Error state changes bar color to red." },
  ],
});
