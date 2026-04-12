import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { GridCard } from "@ds/components/GridCard";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { ListPage, PageTitle, PageDescription } from "../components/PageLayout";
import { CatalogDetailPage } from "./CatalogDetailPage";
import { CATALOG_README } from "../data/catalogReadme";

import logoChroma from "@ds/icons/catalog/chroma.svg";
import logoCodeserver from "@ds/icons/catalog/codeserver.svg";
import logoJupyterlab from "@ds/icons/catalog/jupyterlab.svg";
import logoLangflow from "@ds/icons/catalog/langflow.svg";
import logoMilvus from "@ds/icons/catalog/milvus.svg";
import logoQdrant from "@ds/icons/catalog/Qdrant.svg";
import logoAirflow from "@ds/icons/catalog/airflow.svg";

interface CatalogPageProps {
  onNavigate?: (key: string) => void;
  projectName?: string;
}

const CATALOG_ITEMS = [
  {
    id: "chroma",
    title: "Chroma DB",
    desc: "open-source embedding database for building AI applications with vector similarity search",
    logo: logoChroma,
  },
  {
    id: "codeserver",
    title: "Code server",
    desc: "VS code in the browser with full development environment and extensions support",
    logo: logoCodeserver,
  },
  {
    id: "jupyterlab",
    title: "JupyterLab",
    desc: "Interactive development environment for jupyter notebooks with Python kernel",
    logo: logoJupyterlab,
  },
  {
    id: "langflow",
    title: "Langflow",
    desc: "Visual framework for building multi-agent and RAG applications with drag-and-drop interface",
    logo: logoLangflow,
  },
  {
    id: "milvus",
    title: "Milvus",
    desc: "Cloud-native vector database built for scalable similarity search and AI applications",
    logo: logoMilvus,
  },
  {
    id: "qdrant",
    title: "Qdrant",
    desc: "Cloud-native vector database built for scalable similarity search and AI applications",
    logo: logoQdrant,
  },
  {
    id: "airflow",
    title: "Airflow (Managed)",
    desc: "Data workflow orchestration dashboard",
    logo: logoAirflow,
  },
];

export function CatalogPage({ onNavigate, projectName = "NLP Models" }: CatalogPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("catalog");
  const [detailApp, setDetailApp] = useState<string | null>(null);

  const handleNavSelect = (key: string) => {
    setSelectedNav(key);
    setDetailApp(null);
    onNavigate?.(key);
  };

  // Detail page for any catalog item
  if (detailApp && CATALOG_README[detailApp]) {
    return (
      <CatalogDetailPage
        item={CATALOG_README[detailApp]}
        onBack={() => setDetailApp(null)}
        onNavigate={(key) => {
          setDetailApp(null);
          handleNavSelect(key);
        }}
        projectName={projectName}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Sidebar
        items={PROJECT_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={
          <>
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
                  backgroundColor: "#bf6a40",
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
                    color: colors.text.inverse,
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
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: "4px 12px 8px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 5.3,
                  backgroundColor: colors.bg.warningSubtle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  name="folder-fill"
                  size={18}
                  color={colors.icon.warning}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: colors.text.tertiary,
                    lineHeight: "14px",
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  Projects
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.text.primary,
                    lineHeight: "16px",
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {projectName}
                </div>
              </div>
            </div>
          </>
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
          minWidth: 0,
        }}
      >
        <AppGnb
          breadcrumbs={[
            {
              label: projectName,
              icon: (
                <Icon
                  name="folder_open"
                  size={20}
                  color={colors.icon.secondary}
                />
              ),
            },
            {
              label: "Catalog",
              icon: (
                <Icon name="catalog" size={20} color={colors.icon.secondary} />
              ),
            },
          ]}
        />

        <ListPage
          title={<PageTitle>Catalog</PageTitle>}
          description={<PageDescription>Explore available apps and models</PageDescription>}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "32px 8px",
            }}
          >
            {CATALOG_ITEMS.map((item) => (
              <GridCard
                key={item.id}
                title={item.title}
                desc={item.desc}
                onClick={() => setDetailApp(item.id)}
              >
                <img
                  src={item.logo}
                  alt={item.title}
                  style={{
                    maxWidth: "65%",
                    maxHeight: "41%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </GridCard>
            ))}
          </div>
        </ListPage>
      </div>
    </div>
  );
}
