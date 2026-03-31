import React from "react";
import { Icon } from "@ds/components/Icon";
import type { SidebarNavItem } from "@ds/components/Sidebar";

export const WORKSPACE_NAV: SidebarNavItem[] = [
  { key: "projects", label: "Projects", icon: <Icon name="folder_open" size={20} /> },
  { key: "platform", label: "Platform Apps", icon: <Icon name="Platform" size={20} /> },
  { key: "members", label: "Members", icon: <Icon name="user" size={20} /> },
  { key: "monitoring", label: "Monitoring", icon: <Icon name="monitoring" size={20} /> },
  {
    key: "settings",
    label: "Settings",
    icon: <Icon name="setting" size={20} />,
    children: [
      { key: "general", label: "General" },
      { key: "role", label: "Role" },
      { key: "ws-data-connection", label: "Data connection" },
    ],
  },
];

export const PROJECT_NAV: SidebarNavItem[] = [
  { key: "catalog", label: "Catalog", icon: <Icon name="catalog" size={20} /> },
  { key: "application", label: "Application", icon: <Icon name="application" size={20} /> },
  { key: "storage", label: "Storage", icon: <Icon name="storage" size={20} /> },
  { key: "inference", label: "Inference Endpoint", icon: <Icon name="inference_endpoint" size={20} /> },
  { key: "monitoring", label: "Monitoring", icon: <Icon name="monitoring" size={20} /> },
  { key: "member", label: "Member", icon: <Icon name="user" size={20} /> },
  {
    key: "setting",
    label: "Setting",
    icon: <Icon name="setting" size={20} />,
    children: [
      { key: "general", label: "General" },
      { key: "role", label: "Role" },
      { key: "data-connection", label: "Data connection" },
    ],
  },
];
