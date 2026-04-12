import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { GlobalNav } from "@ds/components/GlobalNav";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { WORKSPACE_NAV, PROJECT_NAV } from "../data/navigation";

// ─── Workspace LNB Header ───
function WorkspaceHeader() {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#dc2626",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 }}>D</span>
      </div>
      <span
        style={{
          flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px",
          color: colors.text.primary, fontFamily: "'Pretendard', sans-serif",
        }}
      >
        Data studio
      </span>
      <Icon name="sidebar" size={20} color={colors.icon.secondary} />
    </div>
  );
}

// ─── Project LNB Header (with folder info) ───
function ProjectHeader({ projectName = "NLP Models" }: { projectName?: string }) {
  const { colors } = useTheme();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#bf6a40",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 }}>D</span>
        </div>
        <span
          style={{
            flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px",
            color: colors.text.primary, fontFamily: "'Pretendard', sans-serif",
          }}
        >
          Data studio
        </span>
        <Icon name="sidebar" size={20} color={colors.icon.secondary} />
      </div>
      {/* Project folder info */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 8px" }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#bf6a40",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Icon name="folder-fill" size={18} color={colors.icon.warning} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: "'Pretendard', sans-serif" }}>
            Projects
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: "'Pretendard', sans-serif" }}>
            {projectName}
          </div>
        </div>
      </div>
    </>
  );
}

function Footer() {
  const { colors } = useTheme();
  return (
    <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: "'Pretendard', sans-serif" }}>
      Runway v1.5.0
    </span>
  );
}

// ─── Section wrapper ───
function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: "'Pretendard', sans-serif", fontSize: 18, fontWeight: 600, color: colors.text.primary, marginBottom: 4 }}>
        {title}
      </h2>
      <p style={{ fontFamily: "'Pretendard', sans-serif", fontSize: 13, color: colors.text.tertiary, lineHeight: "20px", marginBottom: 24 }}>
        {desc}
      </p>
      {children}
    </section>
  );
}

// ─── Full layout wrapper ───
function LayoutPreview({ sidebar, selectedLabel }: { sidebar: React.ReactNode; selectedLabel: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", height: 520, border: `1px solid ${colors.border.secondary}`, borderRadius: 12, overflow: "hidden" }}>
      {sidebar}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <GlobalNav breadcrumbs={[{ label: selectedLabel }]} user={{ initial: "GH", avatarColor: "#dc2626" }} />
        <main style={{ flex: 1, padding: 32, overflow: "auto", backgroundColor: colors.bg.primary }}>
          <div style={{ fontFamily: "'Pretendard', sans-serif", fontSize: 20, fontWeight: 600, color: colors.text.primary, marginBottom: 8 }}>
            {selectedLabel}
          </div>
          <div style={{ fontFamily: "'Pretendard', sans-serif", fontSize: 14, color: colors.text.tertiary }}>
            Content area
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Page ───
export function LnbWorkspacePage({ projectName = "NLP Models" }: { projectName?: string }) {
  const { colors } = useTheme();

  const [wsSelected, setWsSelected] = useState("platform");
  const [projSelected, setProjSelected] = useState("data-connection");

  const wsLabel = WORKSPACE_NAV.find((i) => i.key === wsSelected)?.label ?? wsSelected;
  const projLabel =
    PROJECT_NAV.flatMap((i) => (i.children ? i.children : [i])).find((i) => i.key === projSelected)?.label ?? projSelected;

  return (
    <div style={{ height: "100%", overflow: "auto", backgroundColor: colors.bg.secondary, padding: "32px 40px" }}>
      {/* 1. Workspace LNB */}
      <Section title="1. Workspace LNB" desc="Top-level workspace navigation. Flat list: Projects, Platform Apps, Members, Monitoring, Settings.">
        <LayoutPreview
          selectedLabel={wsLabel}
          sidebar={
            <Sidebar
              items={WORKSPACE_NAV}
              selectedKey={wsSelected}
              onSelect={setWsSelected}
              width={220}
              header={<WorkspaceHeader />}
              footer={<Footer />}
            />
          }
        />
      </Section>

      {/* 2. Project LNB */}
      <Section title="2. Project LNB" desc="Project-level navigation. Shows project folder info + nav items with sub-menu (Setting > General, Role, Data connection).">
        <LayoutPreview
          selectedLabel={projLabel}
          sidebar={
            <Sidebar
              items={PROJECT_NAV}
              selectedKey={projSelected}
              onSelect={setProjSelected}
              width={220}
              header={<ProjectHeader projectName={projectName} />}
              footer={<Footer />}
            />
          }
        />
      </Section>

      {/* 3. Side by side comparison */}
      <Section title="Comparison" desc="Workspace LNB vs Project LNB side by side.">
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Pretendard', sans-serif", fontSize: 13, fontWeight: 600, color: colors.text.secondary, marginBottom: 12 }}>
              Workspace LNB
            </div>
            <div style={{ width: 220, height: 440, border: `1px solid ${colors.border.secondary}`, borderRadius: 12, overflow: "hidden" }}>
              <Sidebar
                items={WORKSPACE_NAV}
                selectedKey="projects"
                onSelect={() => {}}
                width={220}
                header={<WorkspaceHeader />}
                footer={<Footer />}
              />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Pretendard', sans-serif", fontSize: 13, fontWeight: 600, color: colors.text.secondary, marginBottom: 12 }}>
              Project LNB
            </div>
            <div style={{ width: 220, height: 440, border: `1px solid ${colors.border.secondary}`, borderRadius: 12, overflow: "hidden" }}>
              <Sidebar
                items={PROJECT_NAV}
                selectedKey="data-connection"
                onSelect={() => {}}
                width={220}
                header={<ProjectHeader projectName={projectName} />}
                footer={<Footer />}
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
