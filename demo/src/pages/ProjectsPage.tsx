import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { WORKSPACE_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { ListPage, PageTitle, PageDescription } from "../components/PageLayout";

const ff = "'Pretendard', sans-serif";

// ── Create project button ───────────────────────────────────────────────────
function CreateProjectButton({ onClick }: { onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 40, padding: "8px 16px", borderRadius: 4, border: "none",
        backgroundColor: hov ? "#1447e6" : "#155dfc",
        color: "#fff", fontFamily: ff,
        fontSize: 14, fontWeight: 600, lineHeight: "16px",
        cursor: "pointer", transition: "background-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="create" size={24} color="#fff" />
      Create project
    </button>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 160,
        width: "100%",
        borderRadius: 12,
        border: `1px solid ${colors.border.tertiary}`,
        backgroundColor: colors.bg.secondary,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 48, height: 48, borderRadius: 8,
          backgroundColor: colors.bg.tertiary,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon name="folder_open" size={24} color={colors.icon.secondary} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>
          No Projects
        </span>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", color: colors.text.secondary, fontFamily: ff }}>
          Create your first project to get started
        </span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
interface ProjectsPageProps {
  onNavigate?: (key: string) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("projects");

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Sidebar
        items={WORKSPACE_NAV}
        selectedKey={selectedNav}
        onSelect={(key) => {
          setSelectedNav(key);
          onNavigate?.(key);
        }}
        width={220}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 5.3,
              backgroundColor: "#bf6a40",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 }}>D</span>
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>
              Data studio
            </span>
            <Icon name="sidebar" size={20} color={colors.icon.secondary} />
          </div>
        }
        footer={
          <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>
            Runway v1.5.0
          </span>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AppGnb
          breadcrumbs={[
            { label: "Projects", icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
          ]}
        />

        <ListPage
          title={<PageTitle>Projects</PageTitle>}
          description={<PageDescription>Create and manage AI/ML projects in your workspace</PageDescription>}
          actions={<CreateProjectButton />}
        >
          <EmptyState />
        </ListPage>
      </div>
    </div>
  );
}
