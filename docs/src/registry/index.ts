import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export interface PropDef {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  render: () => React.ReactNode;
}

export interface ComponentDoc {
  slug: string;
  name: string;
  description: string;
  category: "getting-started" | "foundation" | "components";
  /** Import path for the component */
  importCode?: string;
  /** When to use this component */
  whenToUse?: string[];
  props?: PropDef[];
  examples?: CodeExample[];
  /** For content-only pages (no preview/props) */
  content?: () => React.ReactNode;
}

export interface DocsCategory {
  key: string;
  label: string;
  items: { slug: string; label: string }[];
}

// ── Categories (Adobe Spectrum style) ──────────────────────────────────────
export const DOCS_CATEGORIES: DocsCategory[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    items: [
      { slug: "introduction", label: "Introduction" },
      { slug: "ux-principles", label: "UX Principles" },
      { slug: "installation", label: "Installation" },
    ],
  },
  {
    key: "foundation",
    label: "Foundation",
    items: [
      { slug: "color", label: "Color" },
      { slug: "typography", label: "Typography" },
      { slug: "spacing", label: "Scale" },
      { slug: "elevation", label: "Elevation" },
      { slug: "grid", label: "Grid" },
      { slug: "icon", label: "Icon" },
    ],
  },
  {
    key: "components",
    label: "Components",
    items: [
      { slug: "alert", label: "Alert" },
      { slug: "avatar", label: "Avatar" },
      { slug: "badge", label: "Badge" },
      { slug: "button", label: "Button" },
      { slug: "checkbox", label: "Checkbox" },
      { slug: "chip", label: "Chip" },
      { slug: "divider", label: "Divider" },
      { slug: "drawer", label: "Drawer" },
      { slug: "modal", label: "Modal" },
      { slug: "pagination", label: "Pagination" },
      { slug: "progress-bar", label: "ProgressBar" },
      { slug: "project-card", label: "ProjectCard" },
      { slug: "radio", label: "Radio" },
      { slug: "select", label: "Select" },
      { slug: "sidebar", label: "Sidebar" },
      { slug: "skeleton", label: "Skeleton" },
      { slug: "spinner", label: "Spinner" },
      { slug: "status-chip", label: "StatusChip" },
      { slug: "switch", label: "Switch" },
      { slug: "table", label: "Table" },
      { slug: "tabs", label: "Tabs" },
      { slug: "text-field", label: "TextField" },
      { slug: "text-area", label: "TextArea" },
      { slug: "toast", label: "Toast" },
      { slug: "tooltip", label: "Tooltip" },
    ],
  },
];

// ── Registry ───────────────────────────────────────────────────────────────
export const DOCS_REGISTRY: Record<string, ComponentDoc> = {};

export function registerDoc(doc: ComponentDoc) {
  DOCS_REGISTRY[doc.slug] = doc;
}
