import React from "react";
import { Tabs } from "@ds/components/Tabs";
import { registerDoc } from "./index";

registerDoc({
  slug: "tabs",
  name: "Tabs",
  description: "A pill-style tab bar for switching between views. Supports controlled and uncontrolled modes.",
  category: "components",
  importCode: `import { Tabs } from "@ds/components/Tabs";`,
  whenToUse: [
    "같은 영역에서 여러 뷰를 전환할 때",
    "카테고리별 콘텐츠 분류",
  ],
  examples: [
    {
      title: "Default",
      description: "Three tabs with the first selected by default.",
      code: `<Tabs
  items={[
    { key: "overview", label: "Overview" },
    { key: "settings", label: "Settings" },
    { key: "members", label: "Members" },
  ]}
  defaultKey="overview"
/>`,
      render: () => (
        <Tabs
          items={[
            { key: "overview", label: "Overview" },
            { key: "settings", label: "Settings" },
            { key: "members", label: "Members" },
          ]}
          defaultKey="overview"
        />
      ),
    },
  ],
  props: [
    { name: "items", type: "TabItem[]", required: true, description: "Tab definitions with key, label, badge?, disabled?." },
    { name: "selectedKey", type: "string", description: "Controlled selected tab key." },
    { name: "defaultKey", type: "string", description: "Default selected key for uncontrolled usage." },
    { name: "onChange", type: "(key: string) => void", description: "Called when a tab is selected." },
  ],
});
