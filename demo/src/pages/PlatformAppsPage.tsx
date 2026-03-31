import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { GridCard } from "@ds/components/GridCard";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { WORKSPACE_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";

// ─── Platform app logos (SVG imports via Vite) ───
import logoGitea from "@ds/icons/platform/gitea.svg";
import logoAirflow from "@ds/icons/platform/airflow.svg";
import logoArgocd from "@ds/icons/platform/argocd.svg";
import logoLitellm from "@ds/icons/platform/LiteLLM.svg";
import logoLitellmDark from "@ds/icons/platform/LiteLLM-dark.svg";
import logoChat from "@ds/icons/platform/chat.svg";
import logoMlflow from "@ds/icons/platform/mlflow.svg";
import logoMlflowDark from "@ds/icons/platform/mlflow-dark.svg";
import logoJupyterhub from "@ds/icons/platform/jupyterhub.svg";
import logoPostgresql from "@ds/icons/platform/postgre.svg";
import logoLangfuse from "@ds/icons/platform/langfuse.svg";

const APPS = [
  {
    id: "gitea",
    title: "Gitea",
    desc: "Git repository hosting and code review",
    logo: logoGitea,
  },
  {
    id: "airflow",
    title: "Apache Airflow",
    desc: "Data workflow orchestration dashboard",
    logo: logoAirflow,
  },
  {
    id: "argocd",
    title: "ArgoCD",
    desc: "GitOps continuous delivery platform",
    logo: logoArgocd,
  },
  {
    id: "litellm",
    title: "LLM Playground",
    desc: "Interact with deployed language models",
    logo: logoLitellm,
    logoDark: logoLitellmDark,
  },
  {
    id: "chat",
    title: "Chat",
    desc: "Team collaboration chat workspace",
    logo: logoChat,
  },
  {
    id: "mlflow",
    title: "MLflow",
    desc: "ML experiment and model lifecycle management",
    logo: logoMlflow,
    logoDark: logoMlflowDark,
  },
  {
    id: "jupyterhub",
    title: "JupyterHub",
    desc: "Multi-user Jupyter Notebook environments",
    logo: logoJupyterhub,
  },
  {
    id: "postgresql",
    title: "PostgreSQL",
    desc: "Relational database management system",
    logo: logoPostgresql,
  },
  {
    id: "langfuse",
    title: "Langfuse",
    desc: "Observability and analytics for LLM apps",
    logo: logoLangfuse,
  },
];

interface PlatformAppsPageProps {
  onNavigate?: (key: string) => void;
}

export function PlatformAppsPage({ onNavigate }: PlatformAppsPageProps) {
  const { colors, isDark } = useTheme();
  const [selectedNav, setSelectedNav] = useState("platform");
  const [checkedId, setCheckedId] = useState<string | null>(null);

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 16px 12px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 5.3,
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                D
              </span>
            </div>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: "16px",
                color: colors.text.primary,
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              Data studio
            </span>
            <Icon name="sidebar" size={20} color={colors.icon.secondary} />
          </div>
        }
        footer={
          <span
            style={{
              fontSize: 11,
              color: colors.text.disabled,
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            Runway v1.5.0
          </span>
        }
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <AppGnb
          breadcrumbs={[
            {
              label: "Platform Apps",
              icon: (
                <Icon name="Platform" size={20} color={colors.icon.secondary} />
              ),
            },
          ]}
        />

        <main style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: "'Pretendard', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: "32px",
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Platform apps
            </h1>
            <p
              style={{
                fontFamily: "'Pretendard', sans-serif",
                fontSize: 14,
                fontWeight: 400,
                lineHeight: "20px",
                color: colors.text.secondary,
              }}
            >
              A platform service managed through Runway.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "32px 16px",
            }}
          >
            {APPS.map((app) => {
              const logoSrc = isDark && app.logoDark ? app.logoDark : app.logo;
              return (
                <GridCard
                  key={app.id}
                  title={app.title}
                  desc={app.desc}
                  checked={checkedId === app.id}
                  onClick={() =>
                    setCheckedId((id) => (id === app.id ? null : app.id))
                  }
                >
                  <img
                    src={logoSrc}
                    alt={app.title}
                    style={{
                      maxWidth: "65%",
                      maxHeight: "41%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </GridCard>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
