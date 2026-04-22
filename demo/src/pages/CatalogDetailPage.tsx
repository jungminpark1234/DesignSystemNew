import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { DetailPage, DetailContentWithSidebar, PageTitle } from "../components/PageLayout";
import { CatalogItemData } from "../data/catalogReadme";
import { CreateAppDrawer } from "../components/CreateAppDrawer";
import { AirflowDeployDrawer } from "./AirflowDetail";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-javascript";

// Catalog logos
import logoChroma from "@ds/icons/catalog/chroma.svg";
import logoCodeserver from "@ds/icons/catalog/codeserver.svg";
import logoJupyterlab from "@ds/icons/catalog/jupyterlab.svg";
import logoLangflow from "@ds/icons/catalog/langflow.svg";
import logoMilvus from "@ds/icons/catalog/milvus.svg";
import logoQdrant from "@ds/icons/catalog/Qdrant.svg";
import logoAirflow from "@ds/icons/catalog/airflow.svg";
import logoPostgresql from "@ds/icons/platform/postgre.svg";

const LOGO_MAP: Record<string, string> = {
  chroma: logoChroma,
  codeserver: logoCodeserver,
  jupyterlab: logoJupyterlab,
  langflow: logoLangflow,
  milvus: logoMilvus,
  qdrant: logoQdrant,
  airflow: logoAirflow,
  postgresql: logoPostgresql,
};

interface CatalogDetailPageProps {
  item: CatalogItemData;
  onBack: () => void;
  onNavigate?: (key: string) => void;
  projectName?: string;
}

// ── Sidebar header ──────────────────────────────────────────────────────────
function SidebarHeader({ projectName = "NLP Models" }: { projectName?: string }) {
  const { colors } = useTheme();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#bf6a40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.inverse, lineHeight: 1 }}>D</span>
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: "'Pretendard', sans-serif" }}>
          Data studio
        </span>
        <Icon name="sidebar" size={20} color={colors.icon.secondary} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 8px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: colors.bg.warningSubtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="folder-fill" size={18} color={colors.icon.warning} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: "'Pretendard', sans-serif" }}>Projects</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: "'Pretendard', sans-serif" }}>{projectName}</div>
        </div>
      </div>
    </>
  );
}

// ── Create button ────────────────────────────────────────────────────────────
function CreateButton({ onClick }: { onClick?: () => void }) {
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
        color: "#fff", fontFamily: "'Pretendard', sans-serif",
        fontSize: 14, fontWeight: 600, lineHeight: "16px",
        cursor: "pointer", transition: "background-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="create" size={24} color="#fff" />
      Create
    </button>
  );
}

// ── More button ──────────────────────────────────────────────────────────────
function MoreButton() {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 24, border: "none",
        backgroundColor: hov ? `var(--ds-bg-tertiary, ${colors.bg.tertiary})` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "background-color 0.15s",
      }}
    >
      <Icon name="more-vertical" size={20} color={colors.icon.secondary} />
    </button>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: "'Pretendard', sans-serif", lineHeight: "16px" }}>
        {label}
      </span>
      <div style={{ fontSize: 14, color: colors.text.primary, fontFamily: "'Pretendard', sans-serif", lineHeight: "20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function CatalogDetailPage({ item, onBack, onNavigate, projectName = "NLP Models" }: CatalogDetailPageProps) {
  const { colors, isDark } = useTheme();
  const [selectedNav, setSelectedNav] = useState("catalog");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pgDrawerOpen, setPgDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [createdPg, setCreatedPg] = useState<{ id: string; name: string } | null>(null);

  const handleNavSelect = (key: string) => {
    setSelectedNav(key);
    onNavigate?.(key);
  };

  const borderColor = `var(--ds-border-secondary, ${colors.border.secondary})`;
  const ff = "'Pretendard', sans-serif";

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* LNB */}
      <Sidebar
        items={PROJECT_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={<SidebarHeader projectName={projectName} />}
        footer={
          <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>
            Runway v1.5.0
          </span>
        }
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* GNB */}
        <AppGnb
          breadcrumbs={[
            { label: projectName, icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
            { label: "Catalog", icon: <Icon name="catalog" size={20} color={colors.icon.secondary} />, onClick: onBack },
            { label: item.title },
          ]}
        />

        <DetailPage
          title={<PageTitle>{item.title}</PageTitle>}
          actions={
            <>
              <CreateButton onClick={() => setDrawerOpen(true)} />
              <MoreButton />
            </>
          }
        >
          <DetailContentWithSidebar
            sidebar={
              <>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
                  기본정보
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <InfoRow label="Description">
                    {item.desc}
                  </InfoRow>
                  <InfoRow label="ID">
                    <span style={{ fontFamily: "monospace", fontSize: 13 }}>{item.appId}</span>
                  </InfoRow>
                  <InfoRow label="Created at">
                    {item.createdAt}
                  </InfoRow>
                  <InfoRow label="Created by">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        backgroundColor: "#e11d48",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: ff,
                      }}>
                        JP
                      </div>
                      <span>Jungmin Park</span>
                    </div>
                  </InfoRow>
                </div>
              </>
            }
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
              Readme
            </h2>
            <div style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: 24,
              backgroundColor: `var(--ds-bg-primary, ${colors.bg.primary})`,
            }}>
              <div style={{
                color: colors.text.primary,
                fontFamily: ff,
                fontSize: 14,
                lineHeight: "24px",
              }}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 12, color: colors.text.primary, fontFamily: ff }}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 10, color: colors.text.primary, fontFamily: ff, borderBottom: `1px solid ${borderColor}`, paddingBottom: 6 }}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8, color: colors.text.primary, fontFamily: ff }}>{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p style={{ margin: "0 0 12px", color: colors.text.primary, fontFamily: ff, lineHeight: "24px" }}>{children}</p>
                    ),
                    code: ({ inline, className, children }: any) => {
                      if (inline) {
                        return <code style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", borderRadius: 4, padding: "1px 5px", fontSize: 13, fontFamily: "'Roboto Mono', monospace", color: colors.text.primary }}>{children}</code>;
                      }
                      const text = String(children).replace(/\n$/, "");
                      const lang = className?.replace("language-", "") || "";
                      const grammar = Prism.languages[lang] || Prism.languages.python;
                      const highlighted = Prism.highlight(text, grammar, lang || "python");
                      return (
                        <pre style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius: 8, padding: "12px 16px", overflow: "auto", margin: "0 0 16px" }}>
                          <code
                            style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 13, lineHeight: "20px", color: colors.text.primary }}
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                          />
                        </pre>
                      );
                    },
                    ul: ({ children }) => (
                      <ul style={{ paddingLeft: 20, margin: "0 0 12px", color: colors.text.primary, fontFamily: ff }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ paddingLeft: 20, margin: "0 0 12px", color: colors.text.primary, fontFamily: ff }}>{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginBottom: 4, lineHeight: "24px" }}>{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 600, color: colors.text.primary }}>{children}</strong>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>{children}</a>
                    ),
                    table: ({ children }) => (
                      <div style={{ overflowX: "auto", marginBottom: 16 }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: ff }}>{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th style={{ border: `1px solid ${borderColor}`, padding: "6px 12px", textAlign: "left", fontWeight: 600, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", color: colors.text.primary }}>{children}</th>
                    ),
                    td: ({ children }) => (
                      <td style={{ border: `1px solid ${borderColor}`, padding: "6px 12px", color: colors.text.primary }}>{children}</td>
                    ),
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt} style={{ maxWidth: "100%", height: "auto", borderRadius: 8, marginBottom: 16, display: "block" }} />
                    ),
                  }}
                >
                  {item.readme}
                </ReactMarkdown>
              </div>
            </div>
          </DetailContentWithSidebar>
        </DetailPage>
      </div>  {/* end main */}

      {/* Create Application Drawer — 앱 유형별 전용 배포 폼 */}
      {item.id === "airflow" ? (
        <>
          <AirflowDeployDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            existingNames={[]}
            availableCnpg={[]}
            autoSelectPg={createdPg}
            onRequestCreatePostgres={() => {
              setDrawerOpen(false);
              setTimeout(() => setPgDrawerOpen(true), 200);
            }}
          />
          {/* PostgreSQL 생성 Drawer */}
          <CreateAppDrawer
            open={pgDrawerOpen}
            onClose={() => setPgDrawerOpen(false)}
            onCreate={({ name, id }) => {
              // PG 생성 성공 시 — 실제 입력한 이름/ID로 저장
              setCreatedPg({ id: id || `pg-${Date.now()}`, name: name });
              setPgDrawerOpen(false);
              setTimeout(() => setConfirmDialogOpen(true), 200);
            }}
            catalogItem={{ id: "postgresql", title: "PostgreSQL (CNPG)", desc: "", appId: "", createdAt: "", readme: "" }}
          />
          {/* 이어서 Airflow 생성 Dialog */}
          {confirmDialogOpen && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 500, display: "flex",
              alignItems: "center", justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.4)",
            }} onClick={() => setConfirmDialogOpen(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: colors.bg.primary, borderRadius: 12, padding: 24,
                width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                display: "flex", flexDirection: "column", gap: 16,
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
                  PostgreSQL이 생성되었습니다
                </div>
                <div style={{ fontSize: 14, color: colors.text.secondary, fontFamily: ff, lineHeight: "22px" }}>
                  이어서 Airflow 애플리케이션을 생성할까요?<br/>
                  이전에 입력한 내용이 유지됩니다.
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <button onClick={() => setConfirmDialogOpen(false)} style={{
                    height: 36, padding: "8px 14px", borderRadius: 6, cursor: "pointer",
                    border: `1px solid ${colors.border.interactive.secondary}`,
                    backgroundColor: colors.bg.interactive.secondary, color: colors.text.interactive.secondary,
                    fontFamily: ff, fontSize: 14, fontWeight: 500,
                  }}>취소</button>
                  <button onClick={() => {
                    setConfirmDialogOpen(false);
                    setTimeout(() => setDrawerOpen(true), 200);
                  }} style={{
                    height: 36, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                    backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff",
                    fontFamily: ff, fontSize: 14, fontWeight: 500,
                  }}>이어서 생성</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <CreateAppDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          catalogItem={item}
        />
      )}
    </div>
  );
}
