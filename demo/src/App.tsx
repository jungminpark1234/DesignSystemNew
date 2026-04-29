import React, { useState, useCallback } from "react";
import { useTheme } from "./theme";
import { PlatformAppsPage } from "./pages/PlatformAppsPage";
import { DataConnectionsPage } from "./pages/DataConnectionsPage";
import { CatalogPage } from "./pages/CatalogPage";
import { FormControlsPage } from "./pages/FormControlsPage";
import { WorkspaceGeneralPage } from "./pages/WorkspaceGeneralPage";
import { ApplicationPage } from "./pages/ApplicationPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AdminGeneralPage } from "./pages/AdminGeneralPage";
import { AdminMonitoringPage } from "./pages/AdminMonitoringPage";
import { ProjectMonitoringPage } from "./pages/ProjectMonitoringPage";
import { RunwayAdminMonitoringPage } from "./pages/RunwayAdminMonitoringPage";
import { InferenceEndpointPage } from "./pages/InferenceEndpointPage";

const TABS = [
  { key: "ws-general", label: "Workspace General" },
  { key: "admin-general", label: "Admin · General" },
  { key: "admin-monitoring", label: "Workspace Monitoring" },
  { key: "project-monitoring", label: "Project · Monitoring" },
  { key: "runway-admin-monitoring", label: "Runway Admin · Monitoring" },
  { key: "inference", label: "Inference Endpoint" },
  { key: "application", label: "Application" },
  { key: "projects", label: "Projects" },
  { key: "platform", label: "Platform Apps" },
  { key: "catalog", label: "Catalog" },
  { key: "data", label: "Data Connections" },
  { key: "form", label: "Form Controls" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Sidebar scope — different LNB shells route the same nav key to different tabs */
type Scope = "workspace" | "project" | "admin";

const TAB_SCOPE: Record<TabKey, Scope> = {
  "ws-general": "workspace",
  "admin-monitoring": "workspace",
  "projects": "workspace",
  "platform": "workspace",

  "catalog": "project",
  "application": "project",
  "inference": "project",
  "project-monitoring": "project",
  "data": "project",

  "admin-general": "admin",
  "runway-admin-monitoring": "admin",

  "form": "workspace",
};

/**
 * For each scope, map LNB nav keys → tab keys.
 * Keys come from `WORKSPACE_NAV` / `PROJECT_NAV` / `ADMIN_NAV` in `data/navigation.tsx`
 * plus locally-defined RUNWAY_ADMIN_NAV in RunwayAdminMonitoringPage.
 */
const SCOPE_NAV_TO_TAB: Record<Scope, Record<string, TabKey>> = {
  workspace: {
    "projects":            "projects",
    "platform":            "platform",
    "monitoring":          "admin-monitoring",
    "general":             "ws-general",
    "ws-data-connection":  "data",
    // No dedicated pages: members, role, settings (parent)
  },
  project: {
    "catalog":         "catalog",
    "application":     "application",
    "inference":       "inference",
    "monitoring":      "project-monitoring",
    "data-connection": "data",
    "general":         "ws-general",        // fallback to workspace general
    // No dedicated pages: storage, member, role, setting (parent)
  },
  admin: {
    "admin-general":  "admin-general",
    "monitoring":     "runway-admin-monitoring",
    "workspaces":     "projects",            // closest existing page
    "accounts":       "projects",            // ADMIN_NAV — closest existing page
    "users":          "projects",            // RUNWAY_ADMIN_NAV — closest
    "security":       "admin-general",       // RUNWAY_ADMIN_NAV — fallback
    // No dedicated pages: logs, admin-sync, admin-security
  },
};

export default function App() {
  const { isDark, toggle, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("ws-general");
  const [selectedProject, setSelectedProject] = useState<string>("NLP Models");
  // Deep-link target when "자세히 보기" is clicked from a workload drawer.
  // Cleared after the destination page consumes it (or on next tab change).
  const [pendingWorkload, setPendingWorkload] = useState<{ type: "application" | "inference"; name: string } | null>(null);

  const handleLnbNavigate = useCallback((navKey: string) => {
    const scope = TAB_SCOPE[activeTab] ?? "workspace";
    const tabKey = SCOPE_NAV_TO_TAB[scope][navKey];
    if (tabKey) setActiveTab(tabKey);
  }, [activeTab]);

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
        {activeTab === "admin-general" && <AdminGeneralPage onNavigate={handleLnbNavigate} />}
        {activeTab === "admin-monitoring" && (
          <AdminMonitoringPage
            onNavigate={handleLnbNavigate}
            onSelectProject={(projectName) => {
              setSelectedProject(projectName);
              setActiveTab("project-monitoring");
            }}
            onSelectWorkload={(w) => {
              setPendingWorkload(w);
              setActiveTab(w.type === "inference" ? "inference" : "application");
            }}
          />
        )}
        {activeTab === "project-monitoring" && (
          <ProjectMonitoringPage
            onNavigate={handleLnbNavigate}
            projectName={selectedProject}
            onSelectWorkload={(w) => {
              setPendingWorkload(w);
              setActiveTab(w.type === "inference" ? "inference" : "application");
            }}
          />
        )}
        {activeTab === "runway-admin-monitoring" && <RunwayAdminMonitoringPage onNavigate={handleLnbNavigate} />}
        {activeTab === "inference" && (
          <InferenceEndpointPage
            onNavigate={handleLnbNavigate}
            projectName={selectedProject}
            initialEndpointName={pendingWorkload?.type === "inference" ? pendingWorkload.name : undefined}
            initialDetailTab={pendingWorkload?.type === "inference" ? "monitoring" : undefined}
          />
        )}
        {activeTab === "application" && (
          <ApplicationPage
            onNavigate={handleLnbNavigate}
            projectName={selectedProject}
            initialAppName={pendingWorkload?.type === "application" ? pendingWorkload.name : undefined}
            initialDetailTab={pendingWorkload?.type === "application" ? "monitoring" : undefined}
          />
        )}
        {activeTab === "projects" && <ProjectsPage onNavigate={handleLnbNavigate} onSelectProject={handleSelectProject} />}
        {activeTab === "platform" && <PlatformAppsPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "catalog" && <CatalogPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "data" && <DataConnectionsPage onNavigate={handleLnbNavigate} projectName={selectedProject} />}
        {activeTab === "form" && <FormControlsPage />}
      </div>
    </div>
  );
}
