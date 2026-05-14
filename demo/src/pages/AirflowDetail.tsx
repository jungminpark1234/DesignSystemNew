import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { StatusChip } from "@ds/components/StatusChip";
import { CopyButton } from "@ds/components/CopyButton";
import { Alert } from "@ds/components/Alert";
import { Modal } from "@ds/components/Modal";
import { Checkbox } from "@ds/components/Checkbox";
import { TextField } from "@ds/components/TextField";
import { Tooltip } from "@ds/components/Tooltip";
import { TextArea } from "@ds/components/TextArea";
import { Select } from "@ds/components/Select";
import { Radio } from "@ds/components/Radio";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { DetailPage, DetailContentWithSidebar, PageTitle } from "../components/PageLayout";
import { DrawerShell, SecondaryButton, PrimaryButton } from "../components/DrawerShell";
import { ResourceGuideModal } from "../components/ResourceGuideModal";
import { CodeEditor } from "../components/CreateAppDrawer";
import { DetailActions } from "./ApplicationPage";
import type { AppItem } from "./ApplicationPage";

import logoAirflow from "@ds/icons/catalog/airflow.svg";

const ff = "'Pretendard', sans-serif";

// ═══════════════════════════════════════════════════════════════════════════════
// Status helpers
// ═══════════════════════════════════════════════════════════════════════════════
const STATUS_CHIP_MAP: Record<string, { label: string; state: "success" | "info" | "pending" | "stopped" | "error" }> = {
  running: { label: "Running", state: "success" },
  launched: { label: "Launched", state: "success" },
  creating: { label: "Creating", state: "info" },
  pending: { label: "Pending", state: "pending" },
  terminated: { label: "Terminated", state: "stopped" },
  failed: { label: "Failed", state: "error" },
  error: { label: "Error", state: "error" },
};

const RESOURCE_PRESETS: Record<string, string> = {
  small: "Small (2 CPU / 4 GiB)",
  medium: "Medium (4 CPU / 8 GiB)",
  large: "Large (8 CPU / 16 GiB)",
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sidebar Header
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarHeader({ projectName }: { projectName: string }) {
  const { colors } = useTheme();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#bf6a40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 }}>D</span>
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>Data studio</span>
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
// Info helpers (same pattern as DB detail)
// ═══════════════════════════════════════════════════════════════════════════════
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff, lineHeight: "16px" }}>{label}</span>
      <div style={{ fontSize: 14, color: colors.text.primary, fontFamily: ff, lineHeight: "20px" }}>{children}</div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// Linked Resource Chip
// ═══════════════════════════════════════════════════════════════════════════════
function ResourceChip({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => href && window.open(href, "_blank")}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8,
        border: `1px solid ${colors.border.secondary}`,
        backgroundColor: hov ? colors.bg.secondary : colors.bg.primary,
        cursor: href ? "pointer" : "default",
        transition: "background-color 0.15s",
      }}
    >
      <Icon name={icon as any} size={16} color={colors.icon.secondary} />
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.interactive.runwayPrimary, fontFamily: ff,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{value}</span>
      {href && <Icon name="global" size={14} color={colors.icon.secondary} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Deploy Progress (3-step)
// ═══════════════════════════════════════════════════════════════════════════════
type StepStatus = "completed" | "active" | "pending" | "failed";

function DeployProgress({ phase, skipDb }: { phase: string; skipDb?: boolean }) {
  const { colors } = useTheme();

  const getStepStatus = (step: number): StepStatus => {
    const phaseOrder = skipDb
      ? ["provisioning_app", "syncing_git", "running"]
      : ["provisioning_db", "provisioning_app", "syncing_git", "running"];
    const currentIdx = phaseOrder.indexOf(phase);
    if (phase === "failed") {
      // Last active step failed
      if (step === 0 && !skipDb && currentIdx <= 0) return "failed";
      if (step === (skipDb ? 0 : 1) && currentIdx <= (skipDb ? 0 : 1)) return "failed";
      return step < currentIdx ? "completed" : step === currentIdx ? "failed" : "pending";
    }
    if (phase === "running") return "completed";
    const adjustedStep = skipDb ? step + 1 : step; // offset for skipped DB step
    if (adjustedStep < currentIdx) return "completed";
    if (adjustedStep === currentIdx) return "active";
    return "pending";
  };

  const steps = skipDb
    ? [
        { label: "App 기동", desc: "Airflow 컨테이너 기동 중" },
        { label: "Git 동기화", desc: "Gitea에서 DAG 코드 동기화" },
      ]
    : [
        { label: "DB 생성", desc: "PostgreSQL(CNPG) 프로비저닝" },
        { label: "App 기동", desc: "Airflow 컨테이너 기동 중" },
        { label: "Git 동기화", desc: "Gitea에서 DAG 코드 동기화" },
      ];

  const stepColors: Record<StepStatus, { bg: string; border: string; icon: string }> = {
    completed: { bg: colors.bg.successSubtle, border: colors.border.success, icon: colors.text.success },
    active: { bg: colors.bg.infoSubtle, border: colors.border.info, icon: colors.text.info },
    pending: { bg: colors.bg.tertiary, border: colors.border.secondary, icon: colors.text.tertiary },
    failed: { bg: colors.bg.dangerSubtle, border: colors.border.danger, icon: colors.text.danger },
  };

  const stepIcons: Record<StepStatus, string> = {
    completed: "checkonly",
    active: "refresh",
    pending: "pending",
    failed: "xonly",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((step, i) => {
        const status = getStepStatus(i);
        const sc = stepColors[status];
        const isLast = i === steps.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            {/* Vertical line + circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${sc.border}`, backgroundColor: sc.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={stepIcons[status] as any} size={14} color={sc.icon} />
              </div>
              {!isLast && (
                <div style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: colors.border.secondary }} />
              )}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff, lineHeight: "24px" }}>{step.label}</div>
              <div style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Airflow Instance Detail
// ═══════════════════════════════════════════════════════════════════════════════
interface AirflowDetailProps {
  item: AppItem;
  allItems: AppItem[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onDeleteWithDb: (airflowId: string, dbId: string) => void;
  onNavigate?: (key: string) => void;
  projectName: string;
}

export function AirflowInstanceDetail({ item, allItems, onBack, onDelete, onDeleteWithDb, onNavigate, projectName }: AirflowDetailProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("application");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteWithDb, setDeleteWithDb] = useState(false);

  const handleNavSelect = (key: string) => { setSelectedNav(key); onNavigate?.(key); };
  const af = item.airflowMeta!;
  const status = STATUS_CHIP_MAP[item.status] || STATUS_CHIP_MAP.creating;
  const isRunning = af.deployPhase === "running";
  const isCreating = item.status === "deploying";
  const isFailed = item.status === "failed" || af.deployPhase === "failed";
  const borderColor = `var(--ds-border-secondary, ${colors.border.secondary})`;

  // Check if DB can be deleted with Airflow
  const canDeleteDb = af.dbCreatedInline &&
    !allItems.some(i => i.id !== item.id && i.airflowMeta?.connectedDbId === af.connectedDbId);

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
              linkUrl={isRunning ? af.airflowUiUrl : undefined}
            />
          }
        >
          <DetailContentWithSidebar
            sidebar={
              <>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>기본정보</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <InfoRow label="Description">{item.desc}</InfoRow>
                  <InfoRow label="Status"><StatusChip state={status.state} size="sm" label={status.label} /></InfoRow>
                  <InfoRow label="ID"><span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 13 }}>{item.id}</span></InfoRow>
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
                  <InfoRow label="Version">Airflow {af.version}</InfoRow>
                </div>
              </>
            }
          >
            {/* E6/E7: 배포 실패 */}
            {isFailed && (
              <Alert status="error" alertStyle="subtle" variant="desc"
                description={af.deployPhase === "provisioning_db"
                  ? "Database 생성에 실패했습니다. 리소스 쿼터를 확인해주세요."
                  : af.deployPhase === "provisioning_app"
                  ? "Airflow 기동에 실패했습니다. 리소스 쿼터 또는 Helm Chart 설정을 확인해주세요."
                  : af.deployPhase === "syncing_git"
                  ? "Git 동기화에 실패했습니다. Repository URL과 Credential을 확인해주세요."
                  : "배포에 실패했습니다. 설정을 확인하고 다시 시도해주세요."}
                dismissible={false} />
            )}

            {/* E9: 연결된 PG 비정상 상태 경고 */}
            {isRunning && af.gitSyncStatus === "error" && af.gitSyncErrorMsg && af.gitSyncErrorMsg.includes("Database") && (
              <Alert status="warning" alertStyle="subtle" variant="desc"
                description={`연결된 Database(${af.connectedDbName})가 비정상 상태입니다. Database 상태를 확인해주세요.`}
                dismissible={false} />
            )}

            {/* Deploy Progress (배포 중 또는 실패 시) */}
            {(isCreating || isFailed) && (
              <>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>배포 진행 상황</h2>
                <div style={{ border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
                  <DeployProgress phase={isFailed ? "failed" : af.deployPhase} skipDb={!af.dbCreatedInline} />
                </div>
              </>
            )}

            {/* Configuration */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>Configuration</h2>
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoItem label="Helm repository URL" value="https://charts.gitlab.io" copyable mono />
                <InfoItem label="Chart" value="bitnami/airflow" />
                <InfoItem label="Version" value="v2.1.0" />
              </div>
            </div>

            {/* Application open links */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>Application open links</h2>
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {isRunning ? (
                  <InfoItem label="Airflow UI" value={<a href={af.airflowUiUrl} target="_blank" rel="noreferrer" style={{ color: colors.text.interactive.runwayPrimary, textDecoration: "none", fontSize: 13, fontFamily: ff }}>{af.airflowUiUrl}</a>} copyable />
                ) : (
                  <div style={{ fontSize: 14, color: colors.text.tertiary, fontFamily: ff }}>배포 후 링크가 표시됩니다.</div>
                )}
              </div>
            </div>

            {/* Database 구성 (Airflow 전용) */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>Database 구성</h2>
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, backgroundColor: colors.bg.primary }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoItem label="PostgreSQL" value={<span style={{ color: colors.text.interactive.runwayPrimary, cursor: "pointer", fontSize: 13, fontFamily: ff }}>{af.connectedDbName}</span>} />
                <InfoItem label="생성 방식" value={af.dbCreatedInline ? "새로 생성하여 연결" : "기존 애플리케이션 연결"} />
              </div>
            </div>

            {/* values.yaml */}
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>values.yaml</h2>
            <CodeEditor value={`replicaCount: 1
image:
  repository: apache/airflow
  tag: "${af.version}"
gitSync:
  enabled: true
  repo: "${af.giteaRepoUrl}"
  branch: "${af.giteaBranch}"
  credentialsSecret: "${af.credentialName}"
  syncInterval: ${af.syncIntervalSec}
resources:
  limits:
    cpu: ${af.resourcePreset === "large" ? 8 : af.resourcePreset === "medium" ? 4 : 2}
    memory: ${af.resourcePreset === "large" ? "16Gi" : af.resourcePreset === "medium" ? "8Gi" : "4Gi"}`} onChange={() => {}} language="yaml" readOnly height={320} />
          </DetailContentWithSidebar>
        </DetailPage>
      </div>

      {/* Delete modal */}
      <Modal open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteWithDb(false); }}
        title="Airflow 인스턴스 삭제"
        secondaryAction={{ label: "취소", onClick: () => { setDeleteModalOpen(false); setDeleteWithDb(false); }, variant: "secondary" }}
        primaryAction={{ label: "삭제", onClick: () => {
          if (deleteWithDb) {
            onDeleteWithDb(item.id, af.connectedDbId);
          } else {
            onDelete(item.id);
          }
          setDeleteModalOpen(false);
          setDeleteWithDb(false);
        }, variant: "destructive" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* E18: Deploying 중 삭제 경고 */}
          {isCreating && (
            <Alert status="warning" alertStyle="subtle" variant="desc"
              description="배포가 진행 중입니다. 삭제하면 배포가 중단됩니다." dismissible={false} />
          )}
          <Alert status="error" alertStyle="subtle" variant="desc"
            description="이 인스턴스를 삭제하면 모든 DAG 실행 이력이 삭제됩니다." dismissible={false} />
          <div style={{ fontSize: 14, color: colors.text.secondary, fontFamily: ff, lineHeight: "20px" }}>
            <strong style={{ color: colors.text.primary }}>{item.title}</strong> 인스턴스를 삭제하시겠습니까?
          </div>
          {canDeleteDb ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 8, backgroundColor: colors.bg.tertiary }}>
              <Checkbox checked={deleteWithDb} onChange={(v) => setDeleteWithDb(!!v)} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>
                  연결된 DB 함께 삭제 ({af.connectedDbName})
                </span>
                <span style={{ fontSize: 12, color: colors.text.danger, fontFamily: ff }}>
                  DB를 함께 삭제하면 모든 실행 이력(Metadata)이 영구 삭제됩니다.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff, padding: "8px 12px", borderRadius: 8, backgroundColor: colors.bg.tertiary }}>
              <Icon name="info-circle-stroke" size={14} color={colors.icon.secondary} style={{ verticalAlign: "middle", marginRight: 4 }} />
              연결된 DB({af.connectedDbName})는 유지됩니다.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Airflow Deploy Drawer
// — values.yaml에 Gitea repo 정보 포함, DB 설정은 별도 섹션
// ═══════════════════════════════════════════════════════════════════════════════
const AIRFLOW_VALUES_YAML = `# Airflow (Managed) values.yaml
replicaCount: 1

image:
  repository: apache/airflow
  tag: "2.9.1"

# Git-Sync sidecar: Gitea 리포지토리에서 DAG 동기화
gitSync:
  enabled: true
  repo: "https://gitea.runway.dev/org/dags.git"
  branch: "main"
  credentialsSecret: "gitea-deploy-key"
  syncInterval: 60  # 초 (최소 30초)
  subPath: "dags"

service:
  type: ClusterIP
  port: 8080

resources:
  limits:
    cpu: 4
    memory: 8Gi`;

interface AirflowDeployDrawerProps {
  open: boolean;
  onClose: () => void;
  existingNames: string[];
  availableCnpg: AppItem[];
  /** PostgreSQL 직접 생성 요청 — 부모가 PG Drawer를 열어주고, 완료 후 Airflow Drawer를 다시 열도록 처리.
   *  initialName: Airflow 이름에서 자동 슬러그된 PG 이름을 PG Drawer에 그대로 전달하기 위한 값 */
  onRequestCreatePostgres?: (initialName?: string) => void;
  /** 외부에서 방금 생성된 PG를 자동으로 옵션 목록에 추가하고 선택 상태로 만들기 위한 값 */
  autoSelectPg?: { id: string; name: string } | null;
}

/**
 * Database naming rule shown via the Tooltip help icon next to the
 * "Database 이름" TextField. Kept short — full details live in helpMessage
 * below the input.
 */
const DB_NAME_RULE_TOOLTIP =
  "airflow_<프로젝트명> 형식\n" +
  "영문 소문자, 숫자, _ 만 (최대 63자)\n" +
  "예: airflow_dsdemo";

export function AirflowDeployDrawer({ open, onClose, existingNames, availableCnpg, onRequestCreatePostgres, autoSelectPg }: AirflowDeployDrawerProps) {
  const { colors } = useTheme();
  const dbNameHelpIcon = (
    <Tooltip content={DB_NAME_RULE_TOOLTIP} direction="above-center" tooltipStyle="inverse">
      <Icon name="help-circle-stroke" size={14} color={colors.icon.tertiary} />
    </Tooltip>
  );

  const [name, setName] = useState("");
  const [appId, setAppId] = useState("");
  const [appIdManual, setAppIdManual] = useState(false);
  const [desc, setDesc] = useState("");
  const [valuesYaml, setValuesYaml] = useState(AIRFLOW_VALUES_YAML);
  const [dbMode, setDbMode] = useState<"existing" | "new">("existing");
  const [selectedCnpg, setSelectedCnpg] = useState("");
  const [createdPgOptions, setCreatedPgOptions] = useState<{ value: string; label: string }[]>([]);
  const [newAppName, setNewAppName] = useState("");
  const [newAppNameTouched, setNewAppNameTouched] = useState(false);
  const [dbName, setDbName] = useState("airflow_metadata");
  const [dbNameManual, setDbNameManual] = useState(false);
  const [dbNameTouched, setDbNameTouched] = useState(false);
  const [links, setLinks] = useState<{ name: string; url: string }[]>([]);
  const [resourceGuideOpen, setResourceGuideOpen] = useState(false);
  const [newDbAdvancedOpen, setNewDbAdvancedOpen] = useState(false);

  // 방금 생성된 PG가 있으면 옵션에 추가 + 자동 선택
  const lastAutoSelectId = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (autoSelectPg && autoSelectPg.id !== lastAutoSelectId.current) {
      lastAutoSelectId.current = autoSelectPg.id;
      setCreatedPgOptions(prev => [{ value: autoSelectPg.id, label: autoSelectPg.name }, ...prev.filter(p => p.value !== autoSelectPg.id)]);
      setDbMode("existing");
      setSelectedCnpg(autoSelectPg.id);
    }
  }, [autoSelectPg]);
  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const nameErr = (() => {
    if (!nameTouched && !submitted) return null;
    if (!name.trim()) return "App 이름을 입력해주세요";
    if (name.length > 63) return "63자 이하로 입력해주세요";
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) return "소문자, 숫자, 하이픈만 사용할 수 있습니다";
    if (existingNames.includes(name)) return "이미 존재하는 이름입니다";
    return null;
  })();

  // ── DB 연동 검증 ──────────────────────────────────────────────────────────
  // 기존 PG 인스턴스가 보유한 DB 목록 (mock) — 중복 검증용. 실제로는 API 응답.
  const EXISTING_PG_DATABASES: Record<string, string[]> = {
    "nlp-models-pg": ["airflow_metadata", "experiments", "feature_store"],
    "shared-pg": ["airflow_metadata", "mlflow_meta"],
  };
  const dbListForSelectedPg = EXISTING_PG_DATABASES[selectedCnpg] ?? [];
  const isDbNameDuplicateInExistingPg =
    dbMode === "existing" &&
    selectedCnpg !== "" &&
    dbName.trim() !== "" &&
    dbListForSelectedPg.includes(dbName.trim());

  const newPgNameErr = (() => {
    if (dbMode !== "new") return null;
    if (!newAppNameTouched && !submitted) return null;
    const v = newAppName.trim();
    if (!v) return "PostgreSQL 애플리케이션 이름을 입력해주세요";
    if (v.length > 63) return "63자 이하로 입력해주세요";
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(v) && v.length > 1) return "소문자, 숫자, 하이픈만 사용할 수 있습니다";
    if (existingNames.includes(v)) return "이미 존재하는 애플리케이션 이름입니다";
    if (v === name.trim()) return "Airflow 애플리케이션과 동일한 이름은 사용할 수 없습니다";
    return null;
  })();

  const dbNameErr = (() => {
    if (!dbNameTouched && !submitted) return null;
    const v = dbName.trim();
    if (!v) return "Database 이름을 입력해주세요";
    if (!/^[a-z_][a-z0-9_]*$/.test(v)) return "소문자, 숫자, 언더스코어(_)만 사용 가능 (시작은 문자 또는 _)";
    if (v.length > 63) return "63자 이하로 입력해주세요";
    return null;
  })();

  const handleNameChange = (v: string) => {
    setName(v);
    const slug = v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 63);
    if (!appIdManual) setAppId(slug);
    if (!dbNameManual) {
      // DB 이름은 언더스코어(_) 스타일 + "_meta" 접미사
      const dbSlug = v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 50);
      setDbName(dbSlug ? `${dbSlug}_meta` : "airflow_metadata");
    }
    // 새 PG 앱 기본 이름 — Airflow 이름이 없거나 사용자가 직접 입력하지 않은 경우만 자동 채움
    if (!newAppNameTouched) {
      setNewAppName(slug ? `${slug}-pg` : "");
    }
  };

  const reset = () => {
    setName(""); setAppId(""); setAppIdManual(false); setDesc("");
    setValuesYaml(AIRFLOW_VALUES_YAML);
    setDbMode("existing"); setSelectedCnpg(""); setNewAppName(""); setNewAppNameTouched(false);
    setDbName("airflow_metadata"); setDbNameManual(false); setDbNameTouched(false);
    setLinks([]); setResourceGuideOpen(false); setCreatedPgOptions([]); setNewDbAdvancedOpen(false);
    setSubmitted(false); setNameTouched(false);
    lastAutoSelectId.current = null;
  };

  const handleSubmit = () => {
    setSubmitted(true); setNameTouched(true);
    setDbNameTouched(true); setNewAppNameTouched(true);
    if (nameErr) return;
    if (dbMode === "existing") {
      if (!selectedCnpg) return;
      if (dbNameErr) return;
      if (isDbNameDuplicateInExistingPg) return; // warning과 함께 차단
    }
    if (dbMode === "new") {
      if (newPgNameErr) return;
      if (dbNameErr) return;
    }
    onClose(); reset();
  };
  const handleClose = () => { onClose(); reset(); };

  return (
    <>
    <DrawerShell open={open} onClose={handleClose} title={
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <img src={logoAirflow} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
        Airflow 애플리케이션 생성
      </span>
    }
      borderLeft={resourceGuideOpen ? `1px solid ${colors.border.secondary}` : undefined}
      footer={<><SecondaryButton label="취소" onClick={handleClose} /><PrimaryButton label="생성" onClick={handleSubmit} /></>}
    >
      {/* Basic Info */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Basic Information</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="Name" value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)}
            onBlur={() => setNameTouched(true)} maxLength={128} placeholder="예: 학습 파이프라인 오케스트레이터"
            state={nameErr ? "error" : "default"} helpMessage={nameErr || undefined} />
          <TextField label="ID" value={appId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAppId(e.target.value); setAppIdManual(true); }}
            maxLength={63} placeholder="my-airflow"
            helpMessage="소문자, 숫자, 하이픈만 사용 가능 (최대 63자)" />
          <TextArea label="Description (Optional)" value={desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            maxLength={512} placeholder="Airflow 애플리케이션 용도를 설명해주세요" />
        </div>
      </div>

      {/* Database 애플리케이션 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Database 애플리케이션</span>
        </div>
        <div style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff, marginBottom: 16 }}>
          Airflow는 DAG 실행 이력과 메타데이터 저장을 위해 PostgreSQL 애플리케이션이 필요합니다.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 분기: 연동 방식 (기존 연결이 default) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: colors.text.interactive.secondary, fontFamily: ff }}>
              연동 방식
            </label>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Radio name="dbMode" label="기존 PostgreSQL 애플리케이션에 연결" checked={dbMode === "existing"} onChange={() => setDbMode("existing")} style={{ padding: "8px 0" }} />
              <Radio name="dbMode" label="새 PostgreSQL 애플리케이션 생성하여 연결" checked={dbMode === "new"} onChange={() => setDbMode("new")} style={{ padding: "8px 0" }} />
            </div>
          </div>

          {/* ── 1. 기존 PG 연결 ─────────────────────────────────────── */}
          {dbMode === "existing" && (() => {
            const baseOptions = availableCnpg.map(c => ({ value: c.id, label: c.title }));
            const mergedOptions = [...createdPgOptions, ...baseOptions];
            const finalOptions = mergedOptions.length > 0 ? mergedOptions : [
              { value: "nlp-models-pg", label: "nlp-models-pg" },
              { value: "shared-pg", label: "shared-pg" },
            ];
            const currentPgValue = selectedCnpg || finalOptions[0].value;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 8, backgroundColor: colors.bg.secondary }}>
                <Select label="PostgreSQL 애플리케이션" placeholder="애플리케이션 선택"
                  options={finalOptions}
                  value={currentPgValue} onChange={setSelectedCnpg}
                  helpMessage="기존에 생성된 PostgreSQL 애플리케이션을 선택하세요." />

                <TextField label="Database 이름" value={dbName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDbName(e.target.value); setDbNameManual(true); }}
                  onBlur={() => setDbNameTouched(true)}
                  placeholder="airflow_metadata"
                  state={dbNameErr || isDbNameDuplicateInExistingPg ? "error" : "default"}
                  helpMessage={dbNameErr || (isDbNameDuplicateInExistingPg ? `'${dbName}' 은(는) 이미 ${currentPgValue}에 존재하는 Database입니다.` : "선택한 PostgreSQL 애플리케이션 안에 새로 생성될 논리적 Database 이름입니다.")}
                  helpIcon={dbNameHelpIcon}
                />

                {isDbNameDuplicateInExistingPg && (
                  <Alert
                    status="warning"
                    alertStyle="subtle"
                    variant="title-desc"
                    title="이미 존재하는 Database 이름입니다"
                    description={
                      <span>
                        같은 PostgreSQL 인스턴스의 동일 Database를 다른 Airflow와 공유하면 메타데이터 마이그레이션이 충돌하여 양쪽 인스턴스의 DAG 실행 데이터가 손상될 수 있습니다. 다른 Database 이름을 사용해주세요.
                      </span>
                    }
                  />
                )}
              </div>
            );
          })()}

          {/* ── 2. 새 PG 생성 ───────────────────────────────────────── */}
          {dbMode === "new" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 8, backgroundColor: colors.bg.secondary }}>
              <TextField label="새 PostgreSQL 애플리케이션 이름" value={newAppName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setNewAppName(e.target.value); setNewAppNameTouched(true); }}
                onBlur={() => setNewAppNameTouched(true)}
                placeholder="my-airflow-pg"
                state={newPgNameErr ? "error" : "default"}
                helpMessage={newPgNameErr || "새로 만들 PostgreSQL 애플리케이션의 이름입니다. (소문자, 숫자, 하이픈)"} />

              <TextField label="Database 이름" value={dbName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDbName(e.target.value); setDbNameManual(true); }}
                onBlur={() => setDbNameTouched(true)}
                placeholder="airflow_metadata"
                state={dbNameErr ? "error" : "default"}
                helpMessage={dbNameErr || "새 PG 인스턴스 안에서 사용할 논리적 Database 이름입니다. 다른 PG 인스턴스의 Database와 이름이 같아도 무방합니다."}
                helpIcon={dbNameHelpIcon} />

              {/* 상세설정 아코디언 */}
              <button onClick={() => setNewDbAdvancedOpen(!newDbAdvancedOpen)} style={{
                display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff, padding: 0, alignSelf: "flex-start",
              }}>
                <Icon name={newDbAdvancedOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.icon.secondary} />
                상세설정
              </button>

              {newDbAdvancedOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${colors.border.secondary}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 13, color: colors.text.secondary, fontFamily: ff, lineHeight: "20px" }}>
                    리소스, 스토리지, 환경변수 등 PostgreSQL 애플리케이션을 상세하게 설정하려면 아래 버튼으로 직접 생성하세요.
                  </div>
                  <SecondaryButton label="PostgreSQL 직접 생성" onClick={() => onRequestCreatePostgres?.(newAppName.trim() || undefined)}
                    icon={<Icon name="create" size={16} color="currentColor" />}
                    style={{ alignSelf: "flex-start", height: 32, padding: "6px 12px", fontSize: 12 }} />
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Configuration */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Configuration</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="Helm repository URL" value="https://charts.gitlab.io" state="disabled" placeholder="" />
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: -8 }}>
            <Icon name="check-circle-stroke" size={16} color={colors.icon.success} />
            <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.success, fontFamily: ff }}>TLS verify</span>
          </div>
          <Select label="Chart" options={[{ value: "bitnami/airflow", label: "bitnami/airflow" }]} value="bitnami/airflow" onChange={() => {}} state="disabled" />
          <Select label="Chart version" options={[{ value: "v2.1.0", label: "v2.1.0" }]} value="v2.1.0" onChange={() => {}} state="disabled" />
        </div>
      </div>

      {/* Application open links */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Application open links</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map((link, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <TextField label="Name" value={link.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const nl = [...links]; nl[i] = { ...nl[i], name: e.target.value }; setLinks(nl); }}
                  placeholder="Link name" />
              </div>
              <div style={{ flex: 1 }}>
                <TextField label="URL" value={link.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const nl = [...links]; nl[i] = { ...nl[i], url: e.target.value }; setLinks(nl); }}
                  placeholder="https://" />
              </div>
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                style={{ width: 32, height: 32, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="minus" size={20} color={colors.icon.secondary} />
              </button>
            </div>
          ))}
          <SecondaryButton label="Add Link" onClick={() => setLinks([...links, { name: "", url: "" }])}
            icon={<Icon name="create" size={20} color="currentColor" />}
            style={{ width: "100%", justifyContent: "center" }} />
        </div>
      </div>

      {/* Helm chart (values.yaml + Resource Guide) */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 32, marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Helm chart</span>
          <SecondaryButton label="Resource Guide" onClick={() => setResourceGuideOpen(!resourceGuideOpen)} style={{ height: 32, padding: "6px 12px", fontSize: 12 }} />
        </div>
        <CodeEditor label="values.yaml" value={valuesYaml} onChange={setValuesYaml} language="yaml" height={360} />
      </div>
    </DrawerShell>

    {/* Resource Guide Modal (기존 컴포넌트 재사용) */}
    <ResourceGuideModal open={open && resourceGuideOpen} onClose={() => setResourceGuideOpen(false)} />
    </>
  );
}
