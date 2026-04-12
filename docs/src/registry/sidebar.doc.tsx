import React from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { registerDoc } from "./index";

const sampleItems = [
  { key: "home", label: "Home", icon: <Icon name="home" size={20} /> },
  { key: "projects", label: "Projects", icon: <Icon name="folder_open" size={20} /> },
  { key: "settings", label: "Settings", icon: <Icon name="setting" size={20} /> },
];

registerDoc({
  slug: "sidebar",
  name: "Sidebar",
  description: "A vertical navigation sidebar with nav items, optional header and footer. Supports nested sub-navigation.",
  category: "components",
  importCode: `import { Sidebar } from "@ds/components/Sidebar";`,
  whenToUse: [
    "앱의 좌측 네비게이션 메뉴가 필요할 때",
    "워크스페이스나 프로젝트 수준의 네비게이션",
  ],
  examples: [
    {
      title: "Basic",
      description: "Simple sidebar with three navigation items.",
      code: `const items = [
  { key: "home", label: "Home", icon: <Icon name="home" size={20} /> },
  { key: "projects", label: "Projects", icon: <Icon name="folder_open" size={20} /> },
  { key: "settings", label: "Settings", icon: <Icon name="setting" size={20} /> },
];

<Sidebar items={items} selectedKey="home" />`,
      render: () => (
        <div style={{ height: 300, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <Sidebar items={sampleItems} selectedKey="home" />
        </div>
      ),
    },
  ],
  props: [
    { name: "items", type: "SidebarNavItem[]", required: true, description: "Navigation items with key, label, icon?, children?." },
    { name: "selectedKey", type: "string", description: "Controlled selected nav item key." },
    { name: "onSelect", type: "(key: string) => void", description: "Called when a nav item is selected." },
    { name: "header", type: "ReactNode", description: "Top header/brand area." },
    { name: "footer", type: "ReactNode", description: "Bottom footer/user area." },
    { name: "width", type: "number", default: "220", description: "Sidebar width in pixels." },
  ],
});
