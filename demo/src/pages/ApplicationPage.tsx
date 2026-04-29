import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { DefaultCard } from "@ds/components/DefaultCard";
import { StatusChip } from "@ds/components/StatusChip";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
import { Icon } from "@ds/components/Icon";
import { Tabs } from "@ds/components/Tabs";
import { CopyButton } from "@ds/components/CopyButton";
import { TextField } from "@ds/components/TextField";
import { TextArea } from "@ds/components/TextArea";
import { Alert } from "@ds/components/Alert";
import { Modal } from "@ds/components/Modal";
import { ProgressBar } from "@ds/components/ProgressBar";
import { Radio } from "@ds/components/Radio";
import { Checkbox } from "@ds/components/Checkbox";
import { Switch } from "@ds/components/Switch";
import { Select } from "@ds/components/Select";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { ListPage, PageTitle, PageDescription, DetailPage, DetailContentWithSidebar } from "../components/PageLayout";
import { ApplicationMonitoringTab } from "./ApplicationMonitoringTab";
import { SAMPLE_WORKLOADS } from "./ProjectMonitoringPage";
import { DrawerShell, SecondaryButton, PrimaryButton } from "../components/DrawerShell";
import { AirflowInstanceDetail, AirflowDeployDrawer } from "./AirflowDetail";
import { CATALOG_README } from "../data/catalogReadme";
import { CreateAppDrawer, CodeEditor } from "../components/CreateAppDrawer";

import logoPostgresql from "@ds/icons/platform/postgre.svg";
import logoJupyterlab from "@ds/icons/catalog/jupyterlab.svg";
import logoCodeserver from "@ds/icons/catalog/codeserver.svg";
import logoAirflow from "@ds/icons/catalog/airflow.svg";
import logoChroma from "@ds/icons/catalog/chroma.svg";
import logoMilvus from "@ds/icons/catalog/milvus.svg";
import logoLangflow from "@ds/icons/catalog/langflow.svg";
import logoQdrant from "@ds/icons/catalog/Qdrant.svg";

const ff = "'Pretendard', sans-serif";

// ── App Categories ────────────────────────────────────────────────────────────
type AppCategory = "all" | "development" | "database" | "workflow" | "ai-ml";

const CATEGORY_TABS: { key: AppCategory; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "development", label: "Development" },
  { key: "database", label: "Database" },
  { key: "workflow", label: "Workflow" },
  { key: "ai-ml", label: "AI / ML" },
];

// ── App Deploy Status ─────────────────────────────────────────────────────────
// 카탈로그 = 템플릿, 어플리케이션 = 생성된 앱 정의 (배포됨/미배포)
type AppStatus = "not_deployed" | "deploying" | "running" | "failed" | "stopped";

const STATUS_CHIP_MAP: Record<AppStatus, { label: string; state: "success" | "info" | "pending" | "stopped" | "error" | "loading" }> = {
  not_deployed: { label: "미배포", state: "pending" },
  deploying: { label: "Deploying", state: "loading" },
  running: { label: "Running", state: "success" },
  failed: { label: "Failed", state: "error" },
  stopped: { label: "Stopped", state: "stopped" },
};

// ── Unified App Item ──────────────────────────────────────────────────────────
interface AppItem {
  id: string;
  title: string;
  desc: string;
  status: AppStatus;
  date: string;
  creator: string;
  category: AppCategory;
  logo?: string;
  /** 카탈로그 템플릿 기반 생성인지, 커스텀(values.yaml) 생성인지 */
  source: "catalog" | "custom";
  /** 카탈로그 템플릿 ID (source="catalog"일 때) */
  templateId?: string;
  /** Database-specific fields */
  dbMeta?: {
    host: string;
    port: number;
    database: string;
    user: string;
    storage: string;
    cpu: string;
    memory: string;
    storageUsedPct: number;
    version: string;
  };
  /** Airflow-specific fields */
  airflowMeta?: {
    giteaRepoUrl: string;
    giteaBranch: string;
    credentialName: string;
    syncIntervalSec: number;
    connectedDbId: string;
    connectedDbName: string;
    dbCreatedInline: boolean;
    resourcePreset: "small" | "medium" | "large";
    airflowUiUrl: string;
    deployPhase: "provisioning_db" | "provisioning_app" | "syncing_git" | "running" | "failed";
    gitSyncStatus: "synced" | "syncing" | "error";
    gitSyncLastTime: string;
    gitSyncErrorMsg?: string;
    version: string;
  };
}

export { DetailActions };
export type { AppItem, AppCategory, AppStatus };

const APP_ITEMS: AppItem[] = [
  // ── Development ──
  {
    id: "app-jupyter-1",
    title: "NLP 실험 노트북",
    desc: "자연어 처리 모델 학습 및 실험을 위한 JupyterLab 환경",
    status: "running",
    date: "2026-03-15 09:30",
    creator: "JP",
    category: "development",
    logo: logoJupyterlab,
    source: "catalog",
    templateId: "jupyterlab",
  },
  {
    id: "app-code-1",
    title: "모델 서빙 코드 에디터",
    desc: "추론 서버 코드 작성 및 디버깅을 위한 VS Code 환경",
    status: "running",
    date: "2026-03-20 14:15",
    creator: "GH",
    category: "development",
    logo: logoCodeserver,
    source: "catalog",
    templateId: "codeserver",
  },
  {
    id: "app-jupyter-2",
    title: "데이터 전처리 노트북",
    desc: "학습 데이터 정제 및 Feature Engineering 파이프라인",
    status: "stopped",
    date: "2026-02-10 17:42",
    creator: "SY",
    category: "development",
    logo: logoJupyterlab,
    source: "catalog",
    templateId: "jupyterlab",
  },
  {
    id: "app-custom-1",
    title: "커스텀 모델 서버",
    desc: "TorchServe 기반 커스텀 추론 서버 (values.yaml 직접 작성)",
    status: "not_deployed",
    date: "2026-04-19 11:30",
    creator: "JP",
    category: "development",
    source: "custom",
  },

  // ── Database (CNPG) ──
  {
    id: "cnpg-001",
    title: "ml-pipeline-db",
    desc: "ML 파이프라인 메타데이터 및 실험 결과 저장용 PostgreSQL",
    status: "running",
    date: "2026-04-10 14:30",
    creator: "JP",
    category: "database",
    logo: logoPostgresql,
    source: "catalog",
    templateId: "postgresql",
    dbMeta: {
      host: "ml-pipeline-db.nlp-models.svc.cluster.local",
      port: 5432,
      database: "postgres",
      user: "postgres",
      storage: "10Gi",
      cpu: "2 Cores",
      memory: "4 GiB",
      storageUsedPct: 34,
      version: "16.2",
    },
  },
  {
    id: "cnpg-002",
    title: "feature-store",
    desc: "Feature Store 백엔드 — 모델 학습용 피처 저장 및 서빙",
    status: "running",
    date: "2026-04-12 09:15",
    creator: "MK",
    category: "database",
    logo: logoPostgresql,
    source: "catalog",
    templateId: "postgresql",
    dbMeta: {
      host: "feature-store.nlp-models.svc.cluster.local",
      port: 5432,
      database: "postgres",
      user: "postgres",
      storage: "50Gi",
      cpu: "4 Cores",
      memory: "8 GiB",
      storageUsedPct: 67,
      version: "16.2",
    },
  },
  {
    id: "cnpg-003",
    title: "experiment-metadata",
    desc: "실험 메타데이터 및 하이퍼파라미터 기록용 DB",
    status: "deploying",
    date: "2026-04-20 10:00",
    creator: "JP",
    category: "database",
    logo: logoPostgresql,
    source: "catalog",
    templateId: "postgresql",
    dbMeta: {
      host: "experiment-metadata.nlp-models.svc.cluster.local",
      port: 5432,
      database: "postgres",
      user: "postgres",
      storage: "20Gi",
      cpu: "2 Cores",
      memory: "4 GiB",
      storageUsedPct: 0,
      version: "16.2",
    },
  },
  {
    id: "cnpg-004",
    title: "training-logs",
    desc: "모델 학습 로그 및 메트릭 수집용 DB",
    status: "failed",
    date: "2026-04-18 16:45",
    creator: "SL",
    category: "database",
    logo: logoPostgresql,
    source: "catalog",
    templateId: "postgresql",
    dbMeta: {
      host: "",
      port: 5432,
      database: "postgres",
      user: "postgres",
      storage: "10Gi",
      cpu: "2 Cores",
      memory: "4 GiB",
      storageUsedPct: 0,
      version: "16.2",
    },
  },

  // ── Workflow ──
  {
    id: "app-airflow-1",
    title: "학습 파이프라인 오케스트레이터",
    desc: "일일 모델 재학습 및 평가 DAG를 관리하는 Airflow 인스턴스",
    status: "running",
    date: "2026-03-01 08:20",
    creator: "HJ",
    category: "workflow",
    logo: logoAirflow,
    source: "catalog",
    templateId: "airflow",
    airflowMeta: {
      giteaRepoUrl: "https://gitea.runway.dev/nlp-models/training-dags.git",
      giteaBranch: "main",
      credentialName: "gitea-deploy-key",
      syncIntervalSec: 60,
      connectedDbId: "cnpg-001",
      connectedDbName: "ml-pipeline-db",
      dbCreatedInline: false,
      resourcePreset: "medium",
      airflowUiUrl: "https://airflow-train.nlp-models.runway.dev",
      deployPhase: "running",
      gitSyncStatus: "synced",
      gitSyncLastTime: "2026-04-20 14:23",
      version: "2.9.1",
    },
  },
  {
    id: "app-airflow-2",
    title: "데이터 수집 스케줄러",
    desc: "외부 데이터 소스 수집 및 전처리 워크플로우 자동화",
    status: "running",
    date: "2026-02-14 16:33",
    creator: "JP",
    category: "workflow",
    logo: logoAirflow,
    source: "catalog",
    templateId: "airflow",
    airflowMeta: {
      giteaRepoUrl: "https://gitea.runway.dev/nlp-models/data-collection-dags.git",
      giteaBranch: "production",
      credentialName: "ci-cd-pat-token",
      syncIntervalSec: 120,
      connectedDbId: "cnpg-airflow-2",
      connectedDbName: "airflow-scheduler-db",
      dbCreatedInline: true,
      resourcePreset: "small",
      airflowUiUrl: "https://airflow-data.nlp-models.runway.dev",
      deployPhase: "running",
      gitSyncStatus: "synced",
      gitSyncLastTime: "2026-04-20 14:20",
      version: "2.9.1",
    },
  },
  {
    id: "app-airflow-3",
    title: "모델 평가 파이프라인",
    desc: "배포 전 모델 품질 평가 및 A/B 테스트 DAG 실행 환경",
    status: "deploying",
    date: "2026-04-20 14:50",
    creator: "JP",
    category: "workflow",
    logo: logoAirflow,
    source: "catalog",
    templateId: "airflow",
    airflowMeta: {
      giteaRepoUrl: "https://gitea.runway.dev/nlp-models/eval-dags.git",
      giteaBranch: "main",
      credentialName: "gitea-deploy-key",
      syncIntervalSec: 60,
      connectedDbId: "cnpg-airflow-3",
      connectedDbName: "airflow-eval-db",
      dbCreatedInline: true,
      resourcePreset: "large",
      airflowUiUrl: "",
      deployPhase: "provisioning_app",
      gitSyncStatus: "syncing",
      gitSyncLastTime: "",
      version: "2.9.1",
    },
  },

  // ── AI / ML ──
  {
    id: "app-chroma-1",
    title: "문서 임베딩 스토어",
    desc: "RAG 파이프라인용 문서 벡터 임베딩 저장소",
    status: "running",
    date: "2026-03-25 11:05",
    creator: "DK",
    category: "ai-ml",
    logo: logoChroma,
    source: "catalog",
    templateId: "chroma",
  },
  {
    id: "app-milvus-1",
    title: "이미지 유사도 검색 엔진",
    desc: "제조 불량 이미지 유사도 검색을 위한 벡터 DB",
    status: "running",
    date: "2026-04-02 13:45",
    creator: "GH",
    category: "ai-ml",
    logo: logoMilvus,
    source: "catalog",
    templateId: "milvus",
  },
  {
    id: "app-langflow-1",
    title: "챗봇 빌더",
    desc: "드래그 앤 드롭 인터페이스로 LLM 에이전트 구축",
    status: "failed",
    date: "2026-04-05 09:20",
    creator: "MK",
    category: "ai-ml",
    logo: logoLangflow,
    source: "catalog",
    templateId: "langflow",
  },

  // ── 예외 케이스 데모 ──
  {
    id: "app-airflow-failed",
    title: "[E6] Airflow 배포 실패",
    desc: "PG 생성 성공 후 App 기동 단계에서 리소스 쿼터 초과로 실패",
    status: "failed",
    date: "2026-04-20 15:30",
    creator: "JP",
    category: "workflow",
    logo: logoAirflow,
    source: "catalog",
    templateId: "airflow",
    airflowMeta: {
      giteaRepoUrl: "https://gitea.runway.dev/nlp-models/failed-dags.git",
      giteaBranch: "main",
      credentialName: "gitea-deploy-key",
      syncIntervalSec: 60,
      connectedDbId: "cnpg-004",
      connectedDbName: "training-logs",
      dbCreatedInline: true,
      resourcePreset: "large",
      airflowUiUrl: "",
      deployPhase: "provisioning_app",
      gitSyncStatus: "syncing",
      gitSyncLastTime: "",
      version: "2.9.1",
    },
  },
  {
    id: "app-airflow-pg-down",
    title: "[E9] PG 비정상 Airflow",
    desc: "Running 상태이나 연결된 PG가 Failed 상태 — DB 연결 불가",
    status: "running",
    date: "2026-04-19 09:00",
    creator: "HJ",
    category: "workflow",
    logo: logoAirflow,
    source: "catalog",
    templateId: "airflow",
    airflowMeta: {
      giteaRepoUrl: "https://gitea.runway.dev/nlp-models/pipeline-dags.git",
      giteaBranch: "main",
      credentialName: "ci-cd-pat-token",
      syncIntervalSec: 60,
      connectedDbId: "cnpg-004",
      connectedDbName: "training-logs",
      dbCreatedInline: false,
      resourcePreset: "medium",
      airflowUiUrl: "https://airflow-pgdown.nlp-models.runway.dev",
      deployPhase: "running",
      gitSyncStatus: "error",
      gitSyncLastTime: "2026-04-20 13:50",
      gitSyncErrorMsg: "Database connection refused — 연결된 PostgreSQL(training-logs)이 Failed 상태입니다.",
      version: "2.9.1",
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCategoryCount(cat: AppCategory, items: AppItem[]): number {
  if (cat === "all") return items.length;
  return items.filter((i) => i.category === cat).length;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sidebar Header (reusable)
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarHeader({ projectName = "NLP Models" }: { projectName?: string }) {
  const { colors } = useTheme();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#bf6a40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 }}>D</span>
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>
          Data studio
        </span>
        <Icon name="sidebar" size={20} color={colors.icon.secondary} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 8px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: colors.bg.warningSubtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="folder-fill" size={18} color={colors.icon.warning} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: ff }}>Projects</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: ff }}>{projectName}</div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Card Footer (avatar + date)
// ═══════════════════════════════════════════════════════════════════════════════
function CardFooter({ creator, date }: { creator: string; date: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
      <Avatar initial={creator} size="sm" color={getAvatarColorFromInitial(creator)} />
      <span style={{ fontSize: 14, color: colors.text.primary, fontFamily: ff, lineHeight: "16px" }}>{date}</span>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Card Grid View (for non-Database tabs)
// ═══════════════════════════════════════════════════════════════════════════════
function CardGridView({ items, onSelectItem }: { items: AppItem[]; onSelectItem?: (item: AppItem) => void }) {
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 16 }}>
        <Icon name="application" size={48} color={colors.icon.disabled} />
        <div style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>앱이 없습니다</div>
        <div style={{ fontSize: 14, color: colors.text.tertiary, fontFamily: ff, textAlign: "center" }}>검색 조건에 맞는 앱이 없거나, 아직 생성된 앱이 없습니다.<br/>Create 버튼으로 새 앱을 만들어보세요.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px 8px" }}>
      {items.map((item) => {
        const status = STATUS_CHIP_MAP[item.status];
        return (
          <DefaultCard
            key={item.id}
            title={item.title}
            desc={item.desc}
            chip={
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusChip label={status.label} state={status.state} size="sm" />
                {item.templateId && (() => {
                  const tpl = CATALOG_TEMPLATES.find(t => t.id === item.templateId);
                  return tpl ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff,
                      padding: "2px 6px", borderRadius: 4, backgroundColor: colors.bg.tertiary, whiteSpace: "nowrap" }}>
                      <img src={tpl.logo} alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
                      {tpl.title}
                    </span>
                  ) : null;
                })()}
                {item.source === "custom" && (
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#4f39f6", fontFamily: ff,
                    padding: "2px 6px", borderRadius: 4, backgroundColor: "#e0e7ff", whiteSpace: "nowrap" }}>Custom</span>
                )}
              </div>
            }
            footer={<CardFooter creator={item.creator} date={item.date} />}
            onClick={() => onSelectItem?.(item)}
            style={{ width: "auto", height: 256 }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database Instance Detail
// ═══════════════════════════════════════════════════════════════════════════════
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{
      border: `1px solid ${colors.border.secondary}`, borderRadius: 12, padding: 20,
      backgroundColor: colors.bg.primary, display: "flex", flexDirection: "column", gap: 16,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "24px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function InfoItem({ label, value, copyable, mono }: { label: string; value: React.ReactNode; copyable?: boolean; mono?: boolean }) {
  const { colors } = useTheme();
  const textValue = typeof value === "string" ? value : "";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 24 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff, flexShrink: 0, marginRight: 16 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
        <span style={{
          fontSize: 13, fontWeight: 500, color: colors.text.primary,
          fontFamily: mono ? "'Roboto Mono', monospace" : ff,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</span>
        {copyable && textValue && <CopyButton text={textValue} size={20} />}
      </div>
    </div>
  );
}

interface DbDetailProps {
  item: AppItem;
  onBack: () => void;
  onDelete: (id: string) => void;
  onNavigate?: (key: string) => void;
  projectName: string;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff, lineHeight: "16px" }}>{label}</span>
      <div style={{ fontSize: 14, color: colors.text.primary, fontFamily: ff, lineHeight: "20px" }}>{children}</div>
    </div>
  );
}

function DbInstanceDetail({ item, onBack, onDelete, onNavigate, projectName }: DbDetailProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("application");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "monitoring">("overview");

  const handleNavSelect = (key: string) => { setSelectedNav(key); onNavigate?.(key); };
  const status = STATUS_CHIP_MAP[item.status];
  const db = item.dbMeta!;
  const isRunning = item.status === "running";
  const isFailed = item.status === "failed";
  const borderColor = `var(--ds-border-secondary, ${colors.border.secondary})`;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Sidebar items={PROJECT_NAV} selectedKey={selectedNav} onSelect={handleNavSelect} width={220}
        header={<SidebarHeader projectName={projectName} />}
        footer={<span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>Runway v1.5.0</span>}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppGnb breadcrumbs={[
          { label: projectName, icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
          { label: "Application", icon: <Icon name="application" size={20} color={colors.icon.secondary} />, onClick: onBack },
          { label: item.title },
        ]} />

        <DetailPage
          title={<PageTitle>{item.title}</PageTitle>}

          actions={
            <DetailActions item={item}
              onDelete={() => setDeleteModalOpen(true)}
              onToggleDeploy={() => {}}
            />
          }
        >
          {/* Detail tabs (Overview / Monitoring) */}
          <div style={{ alignSelf: "flex-start" }}>
            <Tabs
              items={[
                { key: "overview",   label: "Overview" },
                { key: "monitoring", label: "Monitoring" },
              ]}
              selectedKey={detailTab}
              onChange={(k) => setDetailTab(k as "overview" | "monitoring")}
            />
          </div>

          {detailTab === "monitoring" ? (
            <ApplicationMonitoringTab
              appName={item.title}
              podCount={SAMPLE_WORKLOADS.find((w) => w.name === item.title)?.podCount}
            />
          ) : (
          <DetailContentWithSidebar
            sidebar={
              <>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
                  기본정보
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <InfoRow label="Description">{item.desc}</InfoRow>
                  <InfoRow label="Status">
                    <StatusChip state={status.state} size="sm" label={status.label} />
                  </InfoRow>
                  <InfoRow label="ID">
                    <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 13 }}>{item.id}</span>
                  </InfoRow>
                  <InfoRow label="Created at">{item.date}</InfoRow>
                  <InfoRow label="Created by">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initial={item.creator} size="sm" color={getAvatarColorFromInitial(item.creator)} />
                      <span>{item.creator}</span>
                    </div>
                  </InfoRow>
                  <InfoRow label="ArgoCD URL">
                    <a href={`https://argocd.runway.dev/applications/${item.id}`} target="_blank" rel="noreferrer"
                      style={{ color: colors.text.interactive.runwayPrimary, textDecoration: "none", fontSize: 13 }}>
                      argocd.runway.dev
                    </a>
                  </InfoRow>
                  <InfoRow label="Version">PostgreSQL {db.version}</InfoRow>
                </div>
              </>
            }
          >
            {/* Failed alert */}
            {isFailed && (
              <Alert status="error" alertStyle="subtle" variant="desc"
                description="배포에 실패했습니다. 리소스 쿼터를 확인하고 다시 시도해주세요." dismissible={false} />
            )}

            {/* Configuration */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
              Configuration
            </h2>
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoItem label="Helm repository URL" value="https://charts.gitlab.io" copyable mono />
                <InfoItem label="Chart" value={`bitnami/${item.templateId || "postgresql"}`} />
                <InfoItem label="Version" value="v2.1.0" />
              </div>
            </div>

            {/* Application open links */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
              Application open links
            </h2>
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
              <div style={{ fontSize: 14, color: colors.text.tertiary, fontFamily: ff }}>등록된 링크가 없습니다.</div>
            </div>

            {/* values.yaml */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
              values.yaml
            </h2>
            <CodeEditor value={`cluster:
  instances: 1
  imageName: ghcr.io/cloudnative-pg/postgresql:${db.version}
  storage:
    size: ${db.storage}
  resources:
    limits:
      cpu: ${db.cpu.replace(" Cores", "")}
      memory: ${db.memory.replace(" GiB", "Gi")}`} onChange={() => {}} language="yaml" readOnly height={240} />
          </DetailContentWithSidebar>
          )}
        </DetailPage>
      </div>

      {/* Delete modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="인스턴스 삭제"
        secondaryAction={{ label: "취소", onClick: () => setDeleteModalOpen(false), variant: "secondary" }}
        primaryAction={{ label: "삭제", onClick: () => { onDelete(item.id); setDeleteModalOpen(false); }, variant: "destructive" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Alert status="error" alertStyle="subtle" variant="desc"
            description="이 인스턴스를 삭제하면 저장된 데이터는 복구할 수 없습니다." dismissible={false} />
          <div style={{ fontSize: 14, color: colors.text.secondary, fontFamily: ff, lineHeight: "20px" }}>
            <strong style={{ color: colors.text.primary }}>{item.title}</strong> 인스턴스를 삭제하시겠습니까?
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Deploy Drawer (Database)
// ═══════════════════════════════════════════════════════════════════════════════
function DeployDrawer({ open, onClose, existingNames }: { open: boolean; onClose: () => void; existingNames: string[] }) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [storageSizeStr, setStorageSizeStr] = useState("10");
  const [cpuStr, setCpuStr] = useState("2");
  const [memoryStr, setMemoryStr] = useState("4");
  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const nameErr = (() => {
    if (!nameTouched && !submitted) return null;
    if (!name.trim()) return "인스턴스 이름을 입력해주세요";
    if (name.length > 63) return "63자 이하로 입력해주세요";
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) return "소문자, 숫자, 하이픈만 사용할 수 있습니다";
    if (name.length === 1 && !/^[a-z0-9]$/.test(name)) return "소문자 또는 숫자로 시작해야 합니다";
    if (existingNames.includes(name)) return "이미 존재하는 이름입니다";
    return null;
  })();

  const storageErr = (() => {
    const v = parseInt(storageSizeStr);
    if (isNaN(v) || v < 1) return "최소 1Gi 이상이어야 합니다";
    if (v > 1000) return "최대 1000Gi까지 가능합니다";
    return null;
  })();

  const reset = () => {
    setName(""); setDesc(""); setStorageSizeStr("10"); setCpuStr("2"); setMemoryStr("4");
    setSubmitted(false); setNameTouched(false);
  };
  const handleSubmit = () => { setSubmitted(true); setNameTouched(true); if (nameErr || storageErr) return; onClose(); reset(); };
  const handleClose = () => { onClose(); reset(); };

  return (
    <DrawerShell open={open} onClose={handleClose} title="PostgreSQL(CNPG) 배포"
      footer={<><SecondaryButton label="취소" onClick={handleClose} /><PrimaryButton label="배포" onClick={handleSubmit} /></>}
    >
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <img src={logoPostgresql} alt="PostgreSQL" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>기본 정보</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="인스턴스 이름" value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)} maxLength={63} placeholder="my-postgres-db"
            state={nameErr ? "error" : "default"} helpMessage={nameErr || "소문자, 숫자, 하이픈만 사용 가능 (최대 63자)"} />
          <TextArea label="설명 (선택)" value={desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            maxLength={512} placeholder="인스턴스 용도를 설명해주세요" />
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>스토리지 설정</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <TextField label="스토리지 크기" value={storageSizeStr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStorageSizeStr(e.target.value.replace(/[^0-9]/g, ""))}
              state={storageErr ? "error" : "default"} helpMessage={storageErr || "최소 1Gi ~ 최대 1000Gi"} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.secondary, fontFamily: ff, paddingBottom: storageErr ? 24 : 0, lineHeight: "40px" }}>Gi</span>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>리소스 설정</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <TextField label="CPU" value={cpuStr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpuStr(e.target.value.replace(/[^0-9]/g, ""))} helpMessage="리소스 가이드에서 가용 자원을 확인하세요" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.secondary, fontFamily: ff, lineHeight: "40px" }}>Cores</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <TextField label="Memory" value={memoryStr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemoryStr(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.secondary, fontFamily: ff, lineHeight: "40px" }}>GiB</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Alert status="info" alertStyle="subtle" variant="desc"
          description="기본 계정은 패스워드 없이 제공됩니다. 필요 시 접속 후 직접 설정해주세요." dismissible={false} />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>배포 요약</span>
        </div>
        <div style={{
          border: `1px solid ${colors.border.secondary}`, borderRadius: 8, padding: 16,
          backgroundColor: colors.bg.secondary, display: "flex", flexDirection: "column", gap: 12,
        }}>
          {[
            ["인스턴스 이름", name || "-"],
            ["Database", "postgres"],
            ["User", "postgres"],
            ["스토리지", `${storageSizeStr || "-"} Gi`],
            ["CPU", `${cpuStr || "-"} Cores`],
            ["Memory", `${memoryStr || "-"} GiB`],
            ["버전", "PostgreSQL 16.2 (CNPG)"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Detail Page Action Bar (링크 열기 + 배포/배포해제 + More)
// ═══════════════════════════════════════════════════════════════════════════════
function DetailActions({ item, onDelete, onToggleDeploy, linkUrl }: {
  item: AppItem; onDelete: () => void; onToggleDeploy: () => void; linkUrl?: string;
}) {
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDeployed = item.status === "running" || item.status === "deploying";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* 링크 열기 (앱 링크가 있을 때만) */}
      {linkUrl && isDeployed && (
        <button onClick={() => window.open(linkUrl, "_blank")} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          height: 36, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer",
          backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff", fontFamily: ff,
          fontSize: 13, fontWeight: 500,
        }}>
          <Icon name="global" size={16} color="#fff" />
          열기
        </button>
      )}

      {/* 배포 / 배포 해제 */}
      {isDeployed ? (
        <button onClick={onToggleDeploy} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          height: 36, padding: "8px 14px", borderRadius: 6, cursor: "pointer",
          border: `1px solid ${colors.border.interactive.secondary}`,
          backgroundColor: colors.bg.interactive.secondary, color: colors.text.interactive.secondary,
          fontFamily: ff, fontSize: 13, fontWeight: 500,
        }}>
          <Icon name="undeploy" size={16} />
          배포 해제
        </button>
      ) : (
        <button onClick={onToggleDeploy} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          height: 36, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer",
          backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff", fontFamily: ff,
          fontSize: 13, fontWeight: 500,
        }}>
          <Icon name="play" size={16} color="#fff" />
          배포
        </button>
      )}

      {/* More 버튼 */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: 6, border: `1px solid ${colors.border.secondary}`,
          backgroundColor: colors.bg.primary, cursor: "pointer",
        }}>
          <Icon name="more-vertical" size={20} color={colors.icon.secondary} />
        </button>
        {menuOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(false)} />
            <div style={{
              position: "absolute", top: "100%", right: 0, marginTop: 4, zIndex: 10,
              border: `1px solid ${colors.border.secondary}`, borderRadius: 8, backgroundColor: colors.bg.primary,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 140,
            }}>
              <button onClick={() => { setMenuOpen(false); /* TODO: edit */ }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "10px 16px", border: "none", backgroundColor: "transparent", cursor: "pointer",
                fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff, textAlign: "left",
              }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Icon name="edit" size={16} />
                수정
              </button>
              <button onClick={() => { setMenuOpen(false); onDelete(); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "10px 16px", border: "none", backgroundColor: "transparent", cursor: "pointer",
                fontSize: 13, fontWeight: 500, color: colors.text.danger, fontFamily: ff, textAlign: "left",
              }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = colors.bg.dangerSubtle; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Icon name="trash" size={16} />
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helm Repo Section (Configuration)
// ═══════════════════════════════════════════════════════════════════════════════
function HelmRepoSection({ isCatalog, helmUrl, chart, chartVersion }: { isCatalog: boolean; helmUrl: string; chart: string; chartVersion: string }) {
  const { colors } = useTheme();
  const [registering, setRegistering] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [tlsVerify, setTlsVerify] = useState(true);
  const [repoUsername, setRepoUsername] = useState("");
  const [repoPassword, setRepoPassword] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repos] = useState([
    { value: "https://charts.gitlab.io", label: "https://charts.gitlab.io" },
    { value: "https://charts.bitnami.com/bitnami", label: "https://charts.bitnami.com/bitnami" },
  ]);

  if (isCatalog) {
    return (
      <>
        <TextField label="Helm repository URL" value={helmUrl} state="disabled" placeholder="" />
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: -8 }}>
          <Icon name="check-circle-stroke" size={16} color={colors.icon.success} />
          <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.success, fontFamily: ff }}>TLS verify</span>
        </div>
        <Select label="Chart" options={[{ value: chart, label: chart }]} value={chart} onChange={() => {}} state="disabled" />
        <Select label="Chart version" options={[{ value: chartVersion, label: chartVersion }]} value={chartVersion} onChange={() => {}} state="disabled" />
      </>
    );
  }

  return (
    <>
      {/* Helm repository URL — Select + 등록 버튼 */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: colors.text.interactive.secondary, fontFamily: ff }}>Helm repository URL</label>
          <PrimaryButton label="등록" onClick={() => setRegistering(true)}
            style={{ height: 28, padding: "4px 12px", fontSize: 12, borderRadius: 6 }} />
        </div>
        {!registering && (
          <Select options={repos} value={selectedRepo} onChange={setSelectedRepo} placeholder="Helm repository 선택" />
        )}
      </div>

      {/* 인라인 등록 폼 */}
      {registering && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 12,
          padding: 16, borderRadius: 8, border: `1px solid ${colors.border.secondary}`,
          backgroundColor: colors.bg.secondary,
        }}>
          <TextField label="Helm repository URL" value={newRepoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRepoUrl(e.target.value)}
            placeholder="https://charts.example.com" />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox checked={tlsVerify} onChange={(v) => setTlsVerify(!!v)} />
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>TLS 검증</span>
          </div>
          <TextField label="사용자 이름 (선택 사항)" value={repoUsername}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoUsername(e.target.value)}
            placeholder="" />
          <TextField label="비밀번호 (선택 사항)" value={repoPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoPassword(e.target.value)}
            placeholder="" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <SecondaryButton label="취소" onClick={() => { setRegistering(false); setNewRepoUrl(""); setRepoUsername(""); setRepoPassword(""); }} />
            <PrimaryButton label="저장" onClick={() => { setRegistering(false); setSelectedRepo(newRepoUrl); setNewRepoUrl(""); setRepoUsername(""); setRepoPassword(""); }} />
          </div>
        </div>
      )}

      {/* Chart — Select */}
      <Select label="Chart"
        options={selectedRepo ? [
          { value: "nginx", label: "nginx" },
          { value: "redis", label: "redis" },
          { value: "kafka", label: "kafka" },
          { value: "mongodb", label: "mongodb" },
          { value: "airflow", label: "airflow" },
        ] : []}
        value="" onChange={() => {}}
        placeholder={selectedRepo ? "Chart 선택" : "Helm repository를 먼저 선택하세요"}
        state={selectedRepo ? "default" : "disabled"}
      />

      {/* Chart version — Select */}
      <Select label="Chart version"
        options={[
          { value: "v2.1.0", label: "v2.1.0" },
          { value: "v2.0.3", label: "v2.0.3" },
          { value: "v1.9.5", label: "v1.9.5" },
        ]}
        value="" onChange={() => {}}
        placeholder="Version 선택"
        state="disabled"
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Unified Create App Drawer
// Radio(카탈로그/직접구성) → Select(카탈로그 검색) → 인라인 폼
// ═══════════════════════════════════════════════════════════════════════════════
const CATALOG_TEMPLATES = [
  { id: "postgresql", title: "PostgreSQL (CNPG)", category: "Database", logo: logoPostgresql },
  { id: "airflow", title: "Airflow", category: "Workflow", logo: logoAirflow },
  { id: "jupyterlab", title: "JupyterLab", category: "IDE", logo: logoJupyterlab },
  { id: "codeserver", title: "Code server", category: "IDE", logo: logoCodeserver },
  { id: "chroma", title: "Chroma DB", category: "Vector DB", logo: logoChroma },
  { id: "milvus", title: "Milvus", category: "Vector DB", logo: logoMilvus },
  { id: "langflow", title: "Langflow", category: "AI Agent", logo: logoLangflow },
  { id: "qdrant", title: "Qdrant", category: "Vector DB", logo: logoQdrant },
];

const DEFAULT_YAML: Record<string, string> = {
  postgresql: `# PostgreSQL (CNPG) values
cluster:
  instances: 1
  imageName: ghcr.io/cloudnative-pg/postgresql:16.2
  storage:
    size: 10Gi
  resources:
    limits:
      cpu: 2
      memory: 4Gi`,
  airflow: `# Airflow (Managed) values
replicaCount: 1
image:
  repository: apache/airflow
  tag: "2.9.1"
gitSync:
  enabled: true
  repo: "https://gitea.runway.dev/org/dags.git"
  branch: "main"
  credentialsSecret: "gitea-deploy-key"
  syncInterval: 60
resources:
  limits:
    cpu: 4
    memory: 8Gi`,
  custom: `# Custom application values
replicaCount: 1
image:
  repository: ""
  tag: "latest"
service:
  type: ClusterIP
  port: 8080
resources:
  limits:
    cpu: 2
    memory: 4Gi`,
};

function getDefaultYaml(id: string): string {
  return DEFAULT_YAML[id] || `# ${id} values\nreplicaCount: 1\nimage:\n  repository: ""\n  tag: "latest"\nresources:\n  limits:\n    cpu: 2\n    memory: 4Gi`;
}

interface CreateAppUnifiedDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  templateSearch: string;
  onSearchChange: (v: string) => void;
  items: AppItem[];
}

function CreateAppUnifiedDrawer({ open, onClose, selectedTemplate, onSelectTemplate, templateSearch, onSearchChange, items }: CreateAppUnifiedDrawerProps) {
  const { colors } = useTheme();
  const [sourceMode, setSourceMode] = useState<"catalog" | "custom">("catalog");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form state (mirrors CreateAppDrawer)
  const [appName, setAppName] = useState("");
  const [appId, setAppId] = useState("");
  const [appIdManual, setAppIdManual] = useState(false);
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [idTouched, setIdTouched] = useState(false);
  const [valuesYaml, setValuesYaml] = useState(getDefaultYaml(selectedTemplate));
  const [links, setLinks] = useState<{ name: string; url: string }[]>([]);

  // Sync yaml when template or sourceMode changes — only when drawer is open
  const lastSyncKey = React.useRef("");
  React.useEffect(() => {
    if (!open) return;
    const key = `${sourceMode}:${selectedTemplate}`;
    if (key === lastSyncKey.current) return;
    lastSyncKey.current = key;
    setValuesYaml(sourceMode === "custom" ? getDefaultYaml("custom") : getDefaultYaml(selectedTemplate));
  }, [open, sourceMode, selectedTemplate]);

  const handleNameChange = (v: string) => {
    setAppName(v);
    if (!appIdManual) setAppId(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 63));
  };

  const nameErr = (nameTouched || submitted) && !appName.trim() ? "Name을 입력해주세요" : null;
  const idErr = (idTouched || submitted) && !appId ? "ID를 입력해주세요" : null;

  const reset = () => {
    setAppName(""); setAppId(""); setAppIdManual(false); setDesc("");
    setSubmitted(false); setNameTouched(false); setIdTouched(false);
    setLinks([]); setSourceMode("catalog"); setDropdownOpen(false);
  };
  const handleClose = () => { onClose(); reset(); };
  const handleCreate = () => {
    setSubmitted(true); setNameTouched(true); setIdTouched(true);
    if (nameErr || idErr) return;
    handleClose();
  };

  const selectedTpl = CATALOG_TEMPLATES.find(t => t.id === selectedTemplate);
  const filtered = templateSearch
    ? CATALOG_TEMPLATES.filter(t => t.title.toLowerCase().includes(templateSearch.toLowerCase()) || t.category.toLowerCase().includes(templateSearch.toLowerCase()))
    : CATALOG_TEMPLATES;

  const isCatalog = sourceMode === "catalog";
  const helmUrl = isCatalog ? "https://charts.gitlab.io" : "";
  const chart = isCatalog ? `bitnami/${selectedTemplate}` : "";
  const chartVersion = isCatalog ? "v.2.1.0" : "";

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>{children}</span>
    </div>
  );

  return (
    <DrawerShell open={open} onClose={handleClose} title="Create application"
      footer={<><SecondaryButton label="Cancel" onClick={handleClose} /><PrimaryButton label="Create" onClick={handleCreate} /></>}
    >
      {/* ── Source: Radio ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Radio name="srcMode" label="카탈로그에서 생성" checked={sourceMode === "catalog"} onChange={() => setSourceMode("catalog")} />
        <Radio name="srcMode" label="새로 생성" checked={sourceMode === "custom"} onChange={() => setSourceMode("custom")} />
      </div>

      {/* ── Catalog Select (드롭다운) ── */}
      {isCatalog && (
        <div style={{ marginBottom: 24, position: "relative" }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: colors.text.interactive.secondary, fontFamily: ff, marginBottom: 8 }}>카탈로그</label>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "8px 12px", height: 40, borderRadius: 8, cursor: "pointer",
            border: `1px solid ${dropdownOpen ? colors.border.interactive.runwayPrimary : colors.border.secondary}`,
            backgroundColor: colors.bg.primary, textAlign: "left",
          }}>
            {selectedTpl && <img src={selectedTpl.logo} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />}
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>{selectedTpl?.title || "선택"}</span>
            {selectedTpl && <span style={{ fontSize: 11, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff, padding: "2px 8px", borderRadius: 4, backgroundColor: colors.bg.tertiary }}>{selectedTpl.category}</span>}
            <Icon name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.icon.secondary} />
          </button>
          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 10,
              border: `1px solid ${colors.border.secondary}`, borderRadius: 8, backgroundColor: colors.bg.primary,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden",
            }}>
              <div style={{ padding: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, height: 32, padding: "4px 8px", borderRadius: 6, border: `1px solid ${colors.border.secondary}`, backgroundColor: colors.bg.secondary }}>
                  <Icon name="search" size={16} color={colors.icon.disabled} />
                  <input type="text" placeholder="검색..." value={templateSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", backgroundColor: "transparent", fontFamily: ff, fontSize: 13, color: colors.text.primary }} />
                </div>
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {filtered.map((tpl) => {
                  const isSel = selectedTemplate === tpl.id;
                  return (
                    <button key={tpl.id} onClick={() => { onSelectTemplate(tpl.id); setDropdownOpen(false); onSearchChange(""); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", textAlign: "left", cursor: "pointer", backgroundColor: isSel ? colors.bg.interactive.runwaySelected : "transparent" }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (!isSel) e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!isSel) e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <img src={tpl.logo} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff, flex: 1 }}>{tpl.title}</span>
                      <span style={{ fontSize: 10, color: colors.text.tertiary, fontFamily: ff, padding: "1px 6px", borderRadius: 3, backgroundColor: colors.bg.tertiary }}>{tpl.category}</span>
                      {isSel && <Icon name="checkonly" size={16} color={colors.text.interactive.runwayPrimary} />}
                    </button>
                  );
                })}
                {filtered.length === 0 && <div style={{ padding: 16, textAlign: "center", color: colors.text.tertiary, fontFamily: ff, fontSize: 13 }}>검색 결과가 없습니다.</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Basic Information ── */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Basic Information</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="Name" value={appName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)} onBlur={() => setNameTouched(true)} maxLength={128} placeholder="애플리케이션 이름 입력" state={nameErr ? "error" : "default"} helpMessage={nameErr || undefined} />
          <TextField label="ID" value={appId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAppId(e.target.value); setAppIdManual(true); }} onBlur={() => setIdTouched(true)} maxLength={128} placeholder="my-image-classifier" state={idErr ? "error" : "default"} helpMessage={idErr || undefined} />
          <TextArea label="Description (Optional)" value={desc} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)} maxLength={512} placeholder="애플리케이션 설명 입력" />
        </div>
      </div>

      {/* ── Database 애플리케이션 (Airflow만) ── */}
      {isCatalog && selectedTemplate === "airflow" && (
        <div style={{ marginBottom: 32 }}>
          <SectionTitle>Database 애플리케이션</SectionTitle>
          <div style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff, marginBottom: 16, marginTop: -12 }}>
            Airflow는 DAG 실행 이력과 메타데이터 저장을 위해 PostgreSQL 애플리케이션이 필요합니다.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 공통: 논리적 DB 이름 */}
            <TextField label="Database 이름" value="" onChange={() => {}} placeholder="airflow_metadata"
              helpMessage="인스턴스 내에 생성될 논리적 Database 이름입니다." />

            {/* 분기: 연동 방식 */}
            <div style={{ display: "flex", gap: 16 }}>
              <Radio name="dbModeUnified" label="새로 생성하여 연결" checked={true} onChange={() => {}} />
              <Radio name="dbModeUnified" label="기존 인스턴스에 연결" checked={false} onChange={() => {}} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 8, backgroundColor: colors.bg.secondary }}>
              <TextField label="Database application" value="" onChange={() => {}} placeholder="airflow-pg"
                helpMessage="새로 생성할 Database application 이름" />
            </div>
          </div>
        </div>
      )}

      {/* ── Configuration ── */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Configuration</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <HelmRepoSection isCatalog={isCatalog} helmUrl={helmUrl} chart={chart} chartVersion={chartVersion} />
        </div>
      </div>

      {/* ── Application open links ── */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Application open links</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map((link, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}><TextField label="Name" value={link.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const nl = [...links]; nl[i] = { ...nl[i], name: e.target.value }; setLinks(nl); }} placeholder="Link name" /></div>
              <div style={{ flex: 1 }}><TextField label="URL" value={link.url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const nl = [...links]; nl[i] = { ...nl[i], url: e.target.value }; setLinks(nl); }} placeholder="https://" /></div>
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} style={{ width: 32, height: 32, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="minus" size={20} color={colors.icon.secondary} />
              </button>
            </div>
          ))}
          <SecondaryButton label="Add Link" onClick={() => setLinks([...links, { name: "", url: "" }])}
            icon={<Icon name="create" size={20} color="currentColor" />}
            style={{ width: "100%", justifyContent: "center" }} />
        </div>
      </div>

      {/* ── Helm chart (values.yaml) ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 32, marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Helm chart</span>
          <SecondaryButton label="Resource Guide" onClick={() => {}} style={{ height: 32, padding: "6px 12px", fontSize: 12 }} />
        </div>
        <CodeEditor label="values.yaml" value={valuesYaml} onChange={setValuesYaml} language="yaml" height={480} />
      </div>
    </DrawerShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════
interface ApplicationPageProps {
  onNavigate?: (key: string) => void;
  projectName?: string;
  /** Open this app's detail page on mount (matched by AppItem.title; falls back to first item if no match). */
  initialAppName?: string;
  /** Detail page tab to start on when initialAppName is supplied. */
  initialDetailTab?: "overview" | "monitoring";
}

export function ApplicationPage({ onNavigate, projectName = "NLP Models", initialAppName, initialDetailTab }: ApplicationPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("application");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<AppStatus>>(new Set()); // 복수 선택
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set()); // 복수 선택 (category or "custom")
  const [onlyMine, setOnlyMine] = useState<"all" | "mine">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [mineDropOpen, setMineDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  // 저장된 활성 필터 (기본으로 Status 포함)
  const [activeFilters, setActiveFilters] = useState<Array<"status" | "type" | "mine">>(["status"]);
  // 필터 추가 메뉴에서 체크하는 임시 선택 상태
  const [pendingFilters, setPendingFilters] = useState<Array<"status" | "type" | "mine">>([]);
  const CURRENT_USER = "JP"; // 현재 로그인 사용자 (데모용)
  const [items, setItems] = useState<AppItem[]>(APP_ITEMS);
  const [detailItem, setDetailItemRaw] = useState<AppItem | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  // Detail 페이지 상단 탭 — Overview / Monitoring
  const [detailTab, setDetailTab] = useState<"overview" | "monitoring">("overview");

  // 브라우저 뒤로가기 지원
  const setDetailItem = React.useCallback((item: AppItem | null) => {
    if (item && !detailItem) {
      window.history.pushState({ appDetail: item.id }, "");
    } else if (!item && detailItem) {
      // 뒤로가기로 이미 pop된 경우가 아니면 back
    }
    setDetailItemRaw(item);
    setDetailTab("overview"); // 다른 앱 진입 시 항상 Overview부터
  }, [detailItem]);

  React.useEffect(() => {
    const handler = () => { setDetailItemRaw(null); };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Deep-link: open detail (and target tab) when navigated from another page.
  React.useEffect(() => {
    if (!initialAppName) return;
    const item = APP_ITEMS.find((i) => i.title === initialAppName) ?? APP_ITEMS[0];
    if (!item) return;
    setDetailItemRaw(item);
    setDetailTab(initialDetailTab ?? "overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppName]);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");

  const handleNavSelect = (key: string) => { setSelectedNav(key); onNavigate?.(key); };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDetailItem(null);
  };

  // Filter + Sort
  const filteredItems = items
    .filter((item) => {
      const searchMatch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = !activeFilters.includes("status") || statusFilter.size === 0 || statusFilter.has(item.status);
      const typeMatch = !activeFilters.includes("type") || typeFilter.size === 0 || (() => {
        if (typeFilter.has("custom") && item.source === "custom") return true;
        if (!item.templateId) return false;
        // 이제 typeFilter는 catalog template id (postgresql, airflow, jupyterlab 등) 기준으로 매칭
        return typeFilter.has(item.templateId);
      })();
      const mineMatch = !activeFilters.includes("mine") || onlyMine === "all" || item.creator === CURRENT_USER;
      return searchMatch && statusMatch && typeMatch && mineMatch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "oldest") return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date); // newest
    });

  // Airflow detail view
  if (detailItem && detailItem.airflowMeta) {
    return (
      <AirflowInstanceDetail
        item={detailItem}
        allItems={items}
               onDelete={handleDelete}
        onDeleteWithDb={(airflowId, dbId) => {
          setItems((prev) => prev.filter((i) => i.id !== airflowId && i.id !== dbId));
          setDetailItem(null);
        }}
        onNavigate={onNavigate}
        projectName={projectName}
      />
    );
  }

  // Database detail view
  if (detailItem && detailItem.dbMeta) {
    return (
      <DbInstanceDetail
        item={detailItem}
               onDelete={handleDelete}
        onNavigate={onNavigate}
        projectName={projectName}
      />
    );
  }

  // Generic app detail view (JupyterLab, Code server, Chroma, etc.)
  if (detailItem) {
    const gStatus = STATUS_CHIP_MAP[detailItem.status] || STATUS_CHIP_MAP.not_deployed;
    const gBorder = `var(--ds-border-secondary, ${colors.border.secondary})`;
    const gYaml = getDefaultYaml(detailItem.templateId || "custom");
    return (
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        <Sidebar items={PROJECT_NAV} selectedKey={selectedNav} onSelect={handleNavSelect} width={220}
          header={<SidebarHeader projectName={projectName} />}
          footer={<span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>Runway v1.5.0</span>}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <AppGnb breadcrumbs={[
            { label: projectName, icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
            { label: "Application", icon: <Icon name="application" size={20} color={colors.icon.secondary} />, onClick: () => setDetailItem(null) },
            { label: detailItem.title },
          ]} />
          <DetailPage title={<PageTitle>{detailItem.title}</PageTitle>}
            actions={
              <DetailActions item={detailItem}
                onDelete={() => handleDelete(detailItem.id)}
                onToggleDeploy={() => {
                  const newStatus: AppStatus = detailItem.status === "running" ? "stopped" : detailItem.status === "stopped" || detailItem.status === "not_deployed" ? "running" : detailItem.status;
                  setItems(prev => prev.map(i => i.id === detailItem.id ? { ...i, status: newStatus } : i));
                  setDetailItem({ ...detailItem, status: newStatus });
                }}
              />
            }
          >
            {/* Detail tabs (Overview / Monitoring) */}
            <div style={{ alignSelf: "flex-start" }}>
              <Tabs
                items={[
                  { key: "overview",   label: "Overview" },
                  { key: "monitoring", label: "Monitoring" },
                ]}
                selectedKey={detailTab}
                onChange={(k) => setDetailTab(k as "overview" | "monitoring")}
              />
            </div>

            {detailTab === "monitoring" ? (
              <ApplicationMonitoringTab
                appName={detailItem.title}
                podCount={SAMPLE_WORKLOADS.find((w) => w.name === detailItem.title)?.podCount}
              />
            ) : (
            <DetailContentWithSidebar
              sidebar={
                <>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>기본정보</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <InfoRow label="Description">{detailItem.desc}</InfoRow>
                    <InfoRow label="Status"><StatusChip state={gStatus.state} size="sm" label={gStatus.label} /></InfoRow>
                    <InfoRow label="ID"><span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 13 }}>{detailItem.id}</span></InfoRow>
                    <InfoRow label="Created at">{detailItem.date}</InfoRow>
                    <InfoRow label="Created by">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar initial={detailItem.creator} size="sm" color={getAvatarColorFromInitial(detailItem.creator)} />
                        <span>{detailItem.creator}</span>
                      </div>
                    </InfoRow>
                    <InfoRow label="ArgoCD URL">
                      <a href={`https://argocd.runway.dev/applications/${detailItem.id}`} target="_blank" rel="noreferrer"
                        style={{ color: colors.text.interactive.runwayPrimary, textDecoration: "none", fontSize: 13 }}>
                        argocd.runway.dev
                      </a>
                    </InfoRow>
                    <InfoRow label="Version">{detailItem.templateId || "Custom"}</InfoRow>
                  </div>
                </>
              }
            >
              {/* 상태별 Alert */}
              {detailItem.status === "failed" && (
                <Alert status="error" alertStyle="subtle" variant="desc"
                  description="배포에 실패했습니다. Configuration과 values.yaml을 확인하고 다시 시도해주세요." dismissible={false} />
              )}
              {detailItem.status === "deploying" && (
                <Alert status="info" alertStyle="subtle" variant="desc"
                  description="배포가 진행 중입니다. 완료까지 몇 분 소요될 수 있습니다." dismissible={false} />
              )}
              {detailItem.status === "not_deployed" && (
                <Alert status="info" alertStyle="subtle" variant="desc"
                  description="아직 배포되지 않았습니다. 상단의 '배포' 버튼으로 배포할 수 있습니다." dismissible={false} />
              )}

              {/* Configuration */}
              <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>Configuration</h2>
              <div style={{ border: `1px solid ${gBorder}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <InfoItem label="Helm repository URL" value="https://charts.gitlab.io" copyable mono />
                  <InfoItem label="Chart" value={`bitnami/${detailItem.templateId || "custom"}`} />
                  <InfoItem label="Version" value="v2.1.0" />
                </div>
              </div>

              {/* Application open links */}
              <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>Application open links</h2>
              <div style={{ border: `1px solid ${gBorder}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
                <div style={{ fontSize: 14, color: colors.text.tertiary, fontFamily: ff }}>등록된 링크가 없습니다.</div>
              </div>

              {/* values.yaml */}
              <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>values.yaml</h2>
              <CodeEditor value={gYaml} onChange={() => {}} language="yaml" readOnly height={320} />
            </DetailContentWithSidebar>
            )}
          </DetailPage>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Sidebar items={PROJECT_NAV} selectedKey={selectedNav} onSelect={handleNavSelect} width={220}
        header={<SidebarHeader projectName={projectName} />}
        footer={<span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>Runway v1.5.0</span>}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppGnb breadcrumbs={[
          { label: projectName, icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
          { label: "Application", icon: <Icon name="application" size={20} color={colors.icon.secondary} /> },
        ]} />

        <ListPage
          title={<PageTitle>Application</PageTitle>}
          description={<PageDescription>프로젝트 내 배포된 앱을 카테고리별로 관리합니다.</PageDescription>}
          actions={
            <button
              onClick={() => setCreateMenuOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                height: 36, padding: "8px 14px", borderRadius: 6, border: "none",
                backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff", fontFamily: ff,
                fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              <Icon name="create" size={16} color="#fff" />
              Create
            </button>
          }
        >
          {/* Search, Filter, Sort */}
          {(() => {
            const FILTER_DEFS: Array<{ key: "status" | "type" | "mine"; label: string }> = [
              { key: "status", label: "Status" },
              { key: "type", label: "Type" },
              { key: "mine", label: "Created by" },
            ];
            // 카탈로그 템플릿 기반 필터 옵션 (Database/IDE 같은 카테고리 대신, 실제 카탈로그 항목으로 분류)
            const TYPE_TEMPLATES: Array<{ value: string; label: string; logo?: string }> = [
              ...CATALOG_TEMPLATES.map(t => ({ value: t.id, label: t.title, logo: t.logo })),
              { value: "custom", label: "Custom" },
            ];
            const STATUS_OPTS: Array<{ value: AppStatus; label: string }> = [
              { value: "running", label: "Running" },
              { value: "deploying", label: "Deploying" },
              { value: "stopped", label: "Stopped" },
              { value: "not_deployed", label: "Not Deployed" },
              { value: "failed", label: "Failed" },
            ];
            return (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 280 }}>
                  <TextField value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder="이름 또는 설명으로 검색..."
                    leadingIcon={<Icon name="search" size={20} />} />
                </div>

                {/* Status 필터 Select */}
                {activeFilters.includes("status") && (
                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setStatusDropOpen(!statusDropOpen); setTypeDropOpen(false); setMineDropOpen(false); setSortDropOpen(false); setAddFilterOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px",
                      borderRadius: 8, border: `1px solid ${colors.border.secondary}`,
                      backgroundColor: colors.bg.primary, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.secondary,
                    }}>
                      <span style={{ color: colors.text.tertiary }}>Status</span>
                      {statusFilter.size > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "0 6px", borderRadius: 9999, backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff" }}>{statusFilter.size}</span>
                      )}
                      <Icon name="chevron-down" size={14} />
                    </button>
                    {statusDropOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setStatusDropOpen(false)} />
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 10,
                          border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
                          backgroundColor: colors.bg.primary, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 180 }}>
                          {STATUS_OPTS.map((opt) => {
                            const checked = statusFilter.has(opt.value);
                            return (
                              <button key={opt.value} onClick={() => {
                                const next = new Set(statusFilter);
                                if (checked) next.delete(opt.value); else next.add(opt.value);
                                setStatusFilter(next);
                              }}
                                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px", border: "none", cursor: "pointer", textAlign: "left",
                                  backgroundColor: "transparent", fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                                <span style={{ pointerEvents: "none" }}><Checkbox checked={checked} onChange={() => {}} /></span>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 타입 필터 Select */}
                {activeFilters.includes("type") && (
                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setTypeDropOpen(!typeDropOpen); setStatusDropOpen(false); setMineDropOpen(false); setSortDropOpen(false); setAddFilterOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px",
                      borderRadius: 8, border: `1px solid ${colors.border.secondary}`,
                      backgroundColor: colors.bg.primary, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.secondary,
                    }}>
                      <span style={{ color: colors.text.tertiary }}>Type</span>
                      {typeFilter.size > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "0 6px", borderRadius: 9999, backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff" }}>{typeFilter.size}</span>
                      )}
                      <Icon name="chevron-down" size={14} />
                    </button>
                    {typeDropOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setTypeDropOpen(false)} />
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 10,
                          border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
                          backgroundColor: colors.bg.primary, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 180 }}>
                          {TYPE_TEMPLATES.map((opt) => {
                            const checked = typeFilter.has(opt.value);
                            return (
                              <button key={opt.value} onClick={() => {
                                const next = new Set(typeFilter);
                                if (checked) next.delete(opt.value); else next.add(opt.value);
                                setTypeFilter(next);
                              }}
                                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px", border: "none", cursor: "pointer", textAlign: "left",
                                  backgroundColor: "transparent", fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                                <span style={{ pointerEvents: "none" }}><Checkbox checked={checked} onChange={() => {}} /></span>
                                {opt.logo
                                  ? <img src={opt.logo} alt="" style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
                                  : <Icon name="application" size={16} color={colors.icon.secondary} />}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 내가 만든 앱 필터 Select (단일 선택) */}
                {activeFilters.includes("mine") && (
                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setMineDropOpen(!mineDropOpen); setStatusDropOpen(false); setTypeDropOpen(false); setSortDropOpen(false); setAddFilterOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px",
                      borderRadius: 8, border: `1px solid ${colors.border.secondary}`,
                      backgroundColor: colors.bg.primary, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.secondary,
                    }}>
                      <span style={{ color: colors.text.tertiary }}>Created by:</span>
                      <span style={{ color: colors.text.primary }}>{onlyMine === "all" ? "All" : "Me"}</span>
                      <Icon name="chevron-down" size={14} />
                    </button>
                    {mineDropOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setMineDropOpen(false)} />
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 10,
                          border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
                          backgroundColor: colors.bg.primary, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 160 }}>
                          {[{ value: "all" as const, label: "All" }, { value: "mine" as const, label: "Me" }].map((opt) => (
                            <button key={opt.value} onClick={() => { setOnlyMine(opt.value); setMineDropOpen(false); }}
                              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px", border: "none", cursor: "pointer", textAlign: "left",
                                backgroundColor: onlyMine === opt.value ? colors.bg.interactive.runwaySelected : "transparent",
                                fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}
                              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (onlyMine !== opt.value) e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (onlyMine !== opt.value) e.currentTarget.style.backgroundColor = "transparent"; }}>
                              {opt.label}
                              {onlyMine === opt.value && <Icon name="checkonly" size={14} color={colors.text.interactive.runwayPrimary} />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 필터 추가 버튼 */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => {
                    setPendingFilters([...activeFilters]);
                    setAddFilterOpen(!addFilterOpen);
                    setStatusDropOpen(false); setTypeDropOpen(false); setMineDropOpen(false); setSortDropOpen(false);
                  }} style={{
                    display: "flex", alignItems: "center", gap: 4, height: 32, padding: "0 12px",
                    borderRadius: 8, border: `1px dashed ${colors.border.secondary}`,
                    backgroundColor: "transparent", cursor: "pointer",
                    fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.secondary,
                  }}>
                    <Icon name="filter" size={16} />
                    필터
                  </button>
                  {addFilterOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setAddFilterOpen(false)} />
                      <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 10,
                        border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
                        backgroundColor: colors.bg.primary, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 200 }}>
                        <div style={{ padding: 8 }}>
                          {FILTER_DEFS.map((f) => {
                            const checked = pendingFilters.includes(f.key);
                            return (
                              <button key={f.key} onClick={() => {
                                if (checked) setPendingFilters(pendingFilters.filter(p => p !== f.key));
                                else setPendingFilters([...pendingFilters, f.key]);
                              }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", padding: "8px 12px", border: "none", cursor: "pointer", textAlign: "left",
                                  borderRadius: 6, backgroundColor: "transparent", fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                                <span>{f.label}</span>
                                <span style={{ pointerEvents: "none" }}><Switch checked={checked} onChange={() => {}} /></span>
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", padding: 8, borderTop: `1px solid ${colors.border.secondary}` }}>
                          <button onClick={() => setAddFilterOpen(false)} style={{
                            height: 28, padding: "0 10px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${colors.border.interactive.secondary}`, backgroundColor: colors.bg.primary,
                            fontFamily: ff, fontSize: 12, fontWeight: 500, color: colors.text.interactive.secondary,
                          }}>취소</button>
                          <button onClick={() => {
                            // 저장 — 제거된 필터의 값 초기화
                            if (!pendingFilters.includes("status")) setStatusFilter(new Set());
                            if (!pendingFilters.includes("type")) setTypeFilter(new Set());
                            if (!pendingFilters.includes("mine")) setOnlyMine("all");
                            setActiveFilters(pendingFilters);
                            setAddFilterOpen(false);
                          }} style={{
                            height: 28, padding: "0 10px", borderRadius: 6, cursor: "pointer",
                            border: "none", backgroundColor: colors.bg.interactive.runwayPrimary, color: "#fff",
                            fontFamily: ff, fontSize: 12, fontWeight: 500,
                          }}>저장</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 정렬 */}
                <div style={{ position: "relative", marginLeft: "auto" }}>
                  <button onClick={() => { setSortDropOpen(!sortDropOpen); setStatusDropOpen(false); setTypeDropOpen(false); setMineDropOpen(false); setAddFilterOpen(false); }} style={{
                    display: "flex", alignItems: "center", gap: 4, height: 32, padding: "0 12px",
                    borderRadius: 8, border: `1px solid ${colors.border.secondary}`,
                    backgroundColor: colors.bg.primary, cursor: "pointer",
                    fontSize: 13, fontWeight: 500, fontFamily: ff, color: colors.text.secondary,
                  }}>
                    <Icon name="sort" size={16} />
                    {sortBy === "newest" ? "최신순" : sortBy === "oldest" ? "오래된순" : "이름순"}
                    <Icon name="chevron-down" size={14} />
                  </button>
                  {sortDropOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setSortDropOpen(false)} />
                      <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, zIndex: 10,
                        border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
                        backgroundColor: colors.bg.primary, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 120 }}>
                        {[
                          { value: "newest" as const, label: "최신순" },
                          { value: "oldest" as const, label: "오래된순" },
                          { value: "name" as const, label: "이름순" },
                        ].map((opt) => (
                          <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortDropOpen(false); }}
                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px", border: "none", cursor: "pointer", textAlign: "left",
                              backgroundColor: sortBy === opt.value ? colors.bg.interactive.runwaySelected : "transparent",
                              fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (sortBy !== opt.value) e.currentTarget.style.backgroundColor = colors.bg.secondary; }}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (sortBy !== opt.value) e.currentTarget.style.backgroundColor = "transparent"; }}>
                            {opt.label}
                            {sortBy === opt.value && <Icon name="checkonly" size={14} color={colors.text.interactive.runwayPrimary} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}


          {/* Content: unified card grid for all categories */}
          <CardGridView
            items={filteredItems}
            onSelectItem={(item) => setDetailItem(item)}
          />
        </ListPage>
      </div>

      {/* ═══ 통합 Create Drawer ═══ */}
      <CreateAppUnifiedDrawer
        open={createMenuOpen}
        onClose={() => { setCreateMenuOpen(false); setSelectedTemplate(CATALOG_TEMPLATES[0].id); setTemplateSearch(""); }}
        selectedTemplate={selectedTemplate || CATALOG_TEMPLATES[0].id}
        onSelectTemplate={setSelectedTemplate}
        templateSearch={templateSearch}
        onSearchChange={setTemplateSearch}
        items={items}
      />
    </div>
  );
}
