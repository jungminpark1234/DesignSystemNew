import React, { useState, useCallback } from "react";
import { useTheme } from "./theme";
import { LnbWorkspacePage } from "./pages/LnbWorkspacePage";
import { PlatformAppsPage } from "./pages/PlatformAppsPage";
import { DataConnectionsPage } from "./pages/DataConnectionsPage";
import { CatalogPage } from "./pages/CatalogPage";
import { FormControlsPage } from "./pages/FormControlsPage";
import { WorkspaceGeneralPage } from "./pages/WorkspaceGeneralPage";
import { ApplicationPage } from "./pages/ApplicationPage";
import { ProjectsPage } from "./pages/ProjectsPage";

const TABS = [
  { key: "ws-general", label: "Workspace General" },
  { key: "application", label: "Application" },
  { key: "projects", label: "Projects" },
  { key: "lnb", label: "LNB Workspace" },
  { key: "platform", label: "Platform Apps" },
  { key: "catalog", label: "Catalog" },
  { key: "data", label: "Data Connections" },
  { key: "form", label: "Form Controls" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Map LNB nav keys to top-level tab keys */
const NAV_TO_TAB: Record<string, TabKey> = {
  "projects": "projects",
  "platform": "platform",
  "catalog": "catalog",
  "application": "application",
  "data-connection": "data",
  "settings": "lnb",
  "general": "ws-general",
  "role": "lnb",
};

export default function App() {
  const { isDark, toggle, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("lnb");
  const [selectedProject, setSelectedProject] = useState<string>("NLP Models");

  const handleLnbNavigate = useCallback((navKey: string) => {
    const tabKey = NAV_TO_TAB[navKey];
    if (tabKey) setActiveTab(tabKey);
  }, []);

  const handleSelectProject = useCallback((projectName: string) => {
    setSelectedProject(projectName);
    setActiveTab("catalog");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: colors.bg.primary }}>
      {/* Top nav bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 48,
          padding: "0 24px",
          backgroundColor: colors.bg.primary,
          borderBottom: `1px solid ${colors.border.secondary}`,
          flexShrink: 0,
        }}
      >
        {/* Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4, height: "100%" }}>
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: "100%",
                  padding: "0 12px",
                  border: "none",
                  borderBottom: isActive ? `2px solid ${colors.text.interactive.runwayPrimary}` : "2px solid transparent",
                  backgroundColor: "transparent",
                  fontFamily: "'Pretendard', sans-serif",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? colors.text.interactive.runwayPrimary : colors.text.secondary,
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            border: `1px solid ${colors.border.secondary}`,
            backgroundColor: colors.bg.primary,
            fontFamily: "'Pretendard', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: colors.text.secondary,
            cursor: "pointer",
          }}
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </header>

      {/* Page content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "ws-general" && <WorkspaceGeneralPage onNavigate={handleLnbNavigate} />}
        {activeTab === "application" && <ApplicationPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "projects" && <ProjectsPage onNavigate={handleLnbNavigate} onSelectProject={handleSelectProject} />}
        {activeTab === "lnb" && <LnbWorkspacePage projectName={selectedProject} />}
        {activeTab === "platform" && <PlatformAppsPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "catalog" && <CatalogPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "data" && <DataConnectionsPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "form" && <FormControlsPage />}
      </div>
    </div>
  );
}
