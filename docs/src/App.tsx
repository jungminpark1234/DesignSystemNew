import React, { useState } from "react";
import { useTheme } from "./theme";
import { DocsHeader } from "./layout/DocsHeader";
import { DocsSidebar } from "./layout/DocsSidebar";
import { DocsToc } from "./layout/DocsToc";
import { ComponentDocPage } from "./pages/ComponentDocPage";
import { IntroPage } from "./pages/IntroPage";
import { LandingPage } from "./pages/LandingPage";
import { UxPrinciplesPage } from "./pages/UxPrinciplesPage";
import { InstallationPage } from "./pages/InstallationPage";
import { ColorPage } from "./pages/foundation/ColorPage";
import { TypographyPage } from "./pages/foundation/TypographyPage";
import { ScalePage } from "./pages/foundation/ScalePage";
import { ElevationPage } from "./pages/foundation/ElevationPage";
import { GridPage } from "./pages/foundation/GridPage";
import { IconPage } from "./pages/foundation/IconPage";
import { DOCS_REGISTRY } from "./registry";

// ── Import all doc registrations ───────────────────────────────────────────
import "./registry/alert.doc";
import "./registry/avatar.doc";
import "./registry/badge.doc";
import "./registry/button.doc";
import "./registry/checkbox.doc";
import "./registry/chip.doc";
import "./registry/divider.doc";
import "./registry/drawer.doc";
import "./registry/icon.doc";
import "./registry/modal.doc";
import "./registry/pagination.doc";
import "./registry/progress-bar.doc";
import "./registry/project-card.doc";
import "./registry/radio.doc";
import "./registry/select.doc";
import "./registry/sidebar.doc";
import "./registry/skeleton.doc";
import "./registry/spinner.doc";
import "./registry/status-chip.doc";
import "./registry/switch.doc";
import "./registry/table.doc";
import "./registry/tabs.doc";
import "./registry/textarea.doc";
import "./registry/textfield.doc";
import "./registry/toast.doc";
import "./registry/tooltip.doc";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Static page TOC sections ───────────────────────────────────────────────
const PAGE_TOC: Record<string, { id: string; label: string }[]> = {
  introduction: [
    { id: "overview", label: "Overview" },
    { id: "philosophy", label: "Design Philosophy" },
    { id: "structure", label: "Structure" },
  ],
  "ux-principles": [],
  installation: [
    { id: "alias", label: "Path Alias" },
    { id: "import", label: "Import" },
    { id: "tokens", label: "Tokens" },
    { id: "dark-mode", label: "Dark Mode" },
  ],
  color: [
    { id: "text-colors", label: "Text Colors" },
    { id: "background-colors", label: "Background" },
    { id: "border-colors", label: "Border" },
    { id: "gray-scale", label: "Gray Scale" },
    { id: "blue-scale", label: "Blue Scale" },
    { id: "red-scale", label: "Red Scale" },
    { id: "green-scale", label: "Green Scale" },
  ],
  typography: [
    { id: "font-family", label: "Font Family" },
    { id: "heading", label: "Heading" },
    { id: "body", label: "Body" },
  ],
  spacing: [
    { id: "spacing", label: "Spacing" },
    { id: "border-radius", label: "Border Radius" },
  ],
  elevation: [
    { id: "shadow-levels", label: "Shadow Levels" },
    { id: "usage", label: "Usage Guidelines" },
  ],
  icon: [
    { id: "all-icons", label: "All Icons" },
    { id: "usage", label: "Usage" },
    { id: "sizes", label: "Sizes" },
    { id: "api", label: "API Reference" },
  ],
  grid: [
    { id: "breakpoints", label: "Breakpoints" },
    { id: "grid-visual", label: "Grid Visualization" },
    { id: "media-queries", label: "Media Queries" },
    { id: "container", label: "Container Helper" },
    { id: "card-grid", label: "Card Grid Pattern" },
  ],
};

export default function App() {
  const { colors } = useTheme();
  const [activeSlug, setActiveSlug] = useState("landing");

  const doc = DOCS_REGISTRY[activeSlug];

  // Build TOC
  let tocSections: { id: string; label: string }[] = [];
  if (PAGE_TOC[activeSlug]) {
    tocSections = PAGE_TOC[activeSlug];
  } else if (doc) {
    if (doc.importCode) tocSections.push({ id: "import", label: "Import" });
    if (doc.whenToUse) tocSections.push({ id: "when-to-use", label: "When to use" });
    doc.examples?.forEach((ex) => tocSections.push({ id: slugify(ex.title), label: ex.title }));
    if (doc.props && doc.props.length > 0) tocSections.push({ id: "props", label: "API Reference" });
  }

  // Render current page
  const renderPage = () => {
    // Getting Started
    if (activeSlug === "introduction") return <IntroPage />;
    if (activeSlug === "ux-principles") return <UxPrinciplesPage />;
    if (activeSlug === "installation") return <InstallationPage />;
    // Foundation
    if (activeSlug === "color") return <ColorPage />;
    if (activeSlug === "typography") return <TypographyPage />;
    if (activeSlug === "spacing") return <ScalePage />;
    if (activeSlug === "elevation") return <ElevationPage />;
    if (activeSlug === "grid") return <GridPage />;
    if (activeSlug === "icon") return <IconPage />;
    // Components
    if (doc) return <ComponentDocPage doc={doc} />;
    return <IntroPage />;
  };

  // Landing page — full screen, no sidebar
  if (activeSlug === "landing") {
    return <LandingPage onNavigate={setActiveSlug} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: colors.bg.primary }}>
      <DocsHeader onLogoClick={() => setActiveSlug("landing")} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <DocsSidebar activeSlug={activeSlug} onNavigate={setActiveSlug} />
        <main style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: 840, width: "100%", padding: "32px 32px" }}>
            {renderPage()}
            <div style={{ height: "40vh" }} aria-hidden />
          </div>
        </main>
        <DocsToc sections={tocSections} />
      </div>
    </div>
  );
}
