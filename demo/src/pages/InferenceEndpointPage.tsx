import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { IconButton } from "@ds/components/IconButton";
import { Tabs } from "@ds/components/Tabs";
import { TextField } from "@ds/components/TextField";
import { TextArea } from "@ds/components/TextArea";
import { Select } from "@ds/components/Select";
import { StatusChip } from "@ds/components/StatusChip";
import { Chip } from "@ds/components/Chip";
import { Checkbox } from "@ds/components/Checkbox";
import { Switch } from "@ds/components/Switch";
import { Radio } from "@ds/components/Radio";
import { CopyButton } from "@ds/components/CopyButton";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
import { Alert } from "@ds/components/Alert";
import { Tooltip } from "@ds/components/Tooltip";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import {
  DetailPage,
  DetailContentWithSidebar,
  ListPage,
  PageTitle,
  PageDescription,
} from "../components/PageLayout";
import {
  DrawerShell,
  PrimaryButton,
  SecondaryButton,
} from "../components/DrawerShell";
import { ResourceGuideModal } from "../components/ResourceGuideModal";
import { ApplicationMonitoringTab } from "./ApplicationMonitoringTab";
import { PaginationBar } from "./DataConnectionsPage";
import logoTriton from "@ds/icons/catalog/triton.svg";
import logoMlserver from "@ds/icons/catalog/mlserver.svg";
import logoProtobuf from "@ds/icons/platform/protobuf.svg";

const ff = "'Pretendard', sans-serif";

// ═══════════════════════════════════════════════════════════════════════════════
// Types & mock data
// ═══════════════════════════════════════════════════════════════════════════════
type EndpointStatus = "healthy" | "degraded" | "pending";
type ServingRuntime = "triton" | "mlserver";

interface InferenceEndpoint {
  id: string;
  name: string;
  description?: string;
  status: EndpointStatus;
  runtime: ServingRuntime;
  deployments: number;
  createdAt: string;
  creator: string;
  creatorInitial: string;
  inferenceUrl: string;
}

const STATUS_MAP: Record<EndpointStatus, { label: string; state: "success" | "error" | "pending" }> = {
  healthy:  { label: "Healthy",  state: "success" },
  degraded: { label: "Degraded", state: "error" },
  pending:  { label: "Pending",  state: "pending" },
};

const RUNTIME_MAP: Record<ServingRuntime, { label: string; logo: string }> = {
  triton:   { label: "Triton Inference Server", logo: logoTriton },
  mlserver: { label: "MLServer",                logo: logoMlserver },
};

function RuntimeBadge({ runtime }: { runtime: ServingRuntime }) {
  const { colors } = useTheme();
  const r = RUNTIME_MAP[runtime];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img src={r.logo} alt="" style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          fontSize: 13, color: colors.text.interactive.runwayPrimary, fontFamily: ff,
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        {r.label}
      </a>
    </span>
  );
}

const SAMPLE_ENDPOINTS: InferenceEndpoint[] = [
  { id: "ml-classifier-service", name: "ML Classifier Service",     status: "healthy",  runtime: "triton",   deployments: 2, createdAt: "2024-10-07 15:31:53", creator: "Jungmin Park", creatorInitial: "JP", inferenceUrl: "https://inference.example.com/aidev-nlp-models/ml-classifier-service/v2/models/default/infer", description: "Production-ready text classifier serving prod traffic." },
  { id: "degraded-service-api",  name: "Degraded Service API",      status: "healthy",  runtime: "triton",   deployments: 1, createdAt: "2024-10-07 14:37:26", creator: "Jungmin Park", creatorInitial: "JP", inferenceUrl: "https://inference.example.com/aidev-nlp-models/degraded-service-api/v2/models/default/infer", description: "Vision API for product catalog tagging." },
  { id: "multi-model-vision",    name: "Multi-Model Vision API",    status: "healthy",  runtime: "mlserver", deployments: 2, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP", inferenceUrl: "https://inference.example.com/aidev-nlp-models/multi-model-vision/v2/models/default/infer" },
  { id: "progressing-deployment",name: "Progressing Deployment API",status: "degraded", runtime: "triton",   deployments: 0, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP", inferenceUrl: "https://inference.example.com/aidev-nlp-models/progressing-deployment/v2/models/default/infer" },
  { id: "empty-endpoint-no-models", name: "Empty Endpoint (No Models)", status: "pending", runtime: "mlserver", deployments: 1, createdAt: "2024-10-07 16:10:08", creator: "Jungmin Park", creatorInitial: "JP", inferenceUrl: "https://inference.example.com/aidev-nlp-models/empty-endpoint-no-models/v2/models/default/infer", description: "Endpoint created but no model deployments yet — ready to deploy models." },
];

interface ModelDeployment {
  id: string;
  name: string;
  deployed: boolean;
  weight: number;     // user-set traffic weight (0-100)
  effective: number;  // actual effective traffic % (0-100)
  createdAt: string;
  creator: string;
  creatorInitial: string;
  /** Mock fields for topology view */
  replicas?: number;
  deploymentNumber?: number;
  trafficWeight?: number;
  autoScaling?: { min: number; max: number };
}

const SAMPLE_DEPLOYMENTS: Record<string, ModelDeployment[]> = {
  "ml-classifier-service": [
    { id: "d1", name: "classifier-v1",  deployed: true, weight: 70, effective: 70, createdAt: "2024-10-07 15:31:53", creator: "Jungmin Park", creatorInitial: "JP", replicas: 2, deploymentNumber: 74, trafficWeight: 1, autoScaling: { min: 1, max: 10 } },
    { id: "d2", name: "classifier-v2",  deployed: true, weight: 20, effective: 20, createdAt: "2024-10-07 14:37:26", creator: "Jungmin Park", creatorInitial: "JP", replicas: 1, deploymentNumber: 74, trafficWeight: 1, autoScaling: { min: 1, max: 10 } },
    { id: "d3", name: "classifier-canary", deployed: true, weight: 10, effective: 10, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP", replicas: 1, deploymentNumber: 74, trafficWeight: 1, autoScaling: { min: 1, max: 10 } },
  ],
  "degraded-service-api": [
    { id: "d4", name: "tagger-v1", deployed: true, weight: 100, effective: 100, createdAt: "2024-10-07 14:37:26", creator: "Jungmin Park", creatorInitial: "JP", replicas: 2, deploymentNumber: 91, trafficWeight: 1, autoScaling: { min: 1, max: 5 } },
  ],
  "multi-model-vision": [
    { id: "d5", name: "detector-base",  deployed: true, weight: 60, effective: 60, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP", replicas: 2, deploymentNumber: 88, trafficWeight: 1, autoScaling: { min: 2, max: 8 } },
    { id: "d6", name: "detector-small", deployed: true, weight: 40, effective: 40, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP", replicas: 1, deploymentNumber: 88, trafficWeight: 1, autoScaling: { min: 1, max: 4 } },
  ],
  "empty-endpoint-no-models": [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sidebar header (project context — same as other project pages)
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarHeader({ projectName }: { projectName: string }) {
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
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.inverse, lineHeight: 1 }}>D</span>
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>
          Data studio
        </span>
        <Icon name="sidebar" size={20} color={colors.icon.secondary} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 8px" }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 5.3, backgroundColor: colors.bg.warningSubtle,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Icon name="folder-fill" size={18} color={colors.icon.warning} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: ff }}>Projects</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: ff }}>
            {projectName}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Filter chip (size-aware)
// ═══════════════════════════════════════════════════════════════════════════════
function FilterChip({ label, value, onClear }: { label: string; value?: string; onClear?: () => void }) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => {}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 32, padding: "0 10px",
        borderRadius: 6,
        border: `1px solid ${hover ? colors.border.primary : colors.border.secondary}`,
        background: colors.bg.primary,
        fontSize: 12, fontFamily: ff, color: colors.text.secondary, cursor: "pointer",
      }}
    >
      <span>{label}</span>
      {value && <span style={{ color: colors.text.primary, fontWeight: 500 }}>· {value}</span>}
      <Icon name="chevron-down" size={14} color={colors.icon.secondary} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// List page
// ═══════════════════════════════════════════════════════════════════════════════
function EndpointListView({
  endpoints, query, onQueryChange, onSelect, onCreate,
}: {
  endpoints: InferenceEndpoint[];
  query: string;
  onQueryChange: (v: string) => void;
  onSelect: (e: InferenceEndpoint) => void;
  onCreate: () => void;
}) {
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return endpoints.filter((e) => e.name.toLowerCase().includes(q));
  }, [endpoints, query]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pagedRows = filtered.slice(pageStart, pageStart + rowsPerPage);

  const headerCell: React.CSSProperties = {
    padding: "10px 16px", fontSize: 12, fontWeight: 600,
    color: colors.text.secondary, backgroundColor: colors.bg.tertiary,
    fontFamily: ff, textAlign: "left", whiteSpace: "nowrap",
  };
  const cell: React.CSSProperties = {
    padding: "16px", fontSize: 13, color: colors.text.primary, fontFamily: ff, whiteSpace: "nowrap",
  };

  const isEmpty = endpoints.length === 0;
  const isFilteredEmpty = !isEmpty && filtered.length === 0;

  return (
    <ListPage
      title={<PageTitle>Inference endpoints</PageTitle>}
      description={<PageDescription>Create and manage inference endpoints to serve your ML models</PageDescription>}
      actions={
        <PrimaryButton
          label="Create"
          onClick={onCreate}
          icon={<Icon name="create" size={16} color="currentColor" />}
        />
      }
    >
      {/* Filters row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 280 }}>
          <TextField
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search..."
            leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
          />
        </div>
        <FilterChip label="Status" />
        <FilterChip label="Serving runtime" />
      </div>

      {/* Empty state */}
      {(isEmpty || isFilteredEmpty) && (
        <div
          style={{
            border: `1px solid ${colors.border.tertiary}`,
            borderRadius: 12,
            backgroundColor: colors.bg.secondary,
            padding: 80,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 12,
              backgroundColor: colors.bg.tertiary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="inference_endpoint" size={28} color={colors.icon.secondary} />
          </div>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
              {isFilteredEmpty ? "No matching endpoints" : "No Inference endpoint"}
            </span>
            <span style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff }}>
              {isFilteredEmpty ? "Try a different search term." : "Create an inference endpoint to deploy your models"}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isEmpty && !isFilteredEmpty && (
        <div style={{ border: `1px solid ${colors.border.tertiary}`, borderRadius: 12, overflow: "auto", backgroundColor: colors.bg.primary }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 980 }}>
            <thead>
              <tr>
                <th style={headerCell}>Endpoint name</th>
                <th style={headerCell}>Status</th>
                <th style={headerCell}>Serving runtime</th>
                <th style={{ ...headerCell, textAlign: "right" }}>Model deployments</th>
                <th style={headerCell}>생성일 ↓</th>
                <th style={headerCell}>생성자</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((e) => {
                const st = STATUS_MAP[e.status];
                return (
                  <tr
                    key={e.id}
                    onClick={() => onSelect(e)}
                    style={{ cursor: "pointer", borderTop: `1px solid ${colors.border.tertiary}` }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = colors.bg.secondary)}
                    onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ ...cell, fontWeight: 500 }}>{e.name}</td>
                    <td style={cell}><StatusChip state={st.state} size="sm" label={st.label} /></td>
                    <td style={cell}><RuntimeBadge runtime={e.runtime} /></td>
                    <td style={{ ...cell, textAlign: "right", color: colors.text.secondary }}>{e.deployments}</td>
                    <td style={{ ...cell, color: colors.text.secondary }}>{e.createdAt}</td>
                    <td style={cell}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Avatar initial={e.creatorInitial} size="sm" color={getAvatarColorFromInitial(e.creatorInitial)} />
                        <span>{e.creator}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table footer — DataConnectionsPage 패턴 */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px",
              borderTop: `1px solid ${colors.border.secondary}`,
              background: colors.bg.secondary,
              fontFamily: ff,
            }}
          >
            <span style={{ fontSize: 13, color: colors.text.tertiary, whiteSpace: "nowrap" }}>
              Total {totalItems}
            </span>
            <PaginationBar current={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: colors.text.tertiary, whiteSpace: "nowrap" }}>Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  height: 28, padding: "2px 8px", borderRadius: 6,
                  border: `1px solid ${colors.border.secondary}`,
                  backgroundColor: colors.bg.primary,
                  fontSize: 13, color: colors.text.primary, fontFamily: ff,
                  cursor: "pointer",
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </ListPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Endpoint detail page
// ═══════════════════════════════════════════════════════════════════════════════
function EndpointDetailView({
  endpoint, onDeployModel, onEditTraffic, initialDetailTab,
}: {
  endpoint: InferenceEndpoint; onDeployModel: () => void; onEditTraffic?: () => void; initialDetailTab?: "overview" | "monitoring";
}) {
  const { colors } = useTheme();
  const deployments = SAMPLE_DEPLOYMENTS[endpoint.id] ?? [];
  const [query, setQuery] = useState("");
  const [deployedFilter, setDeployedFilter] = useState<"all" | "deployed" | "undeployed">("all");
  const [detailTab, setDetailTab] = useState<"overview" | "monitoring">(initialDetailTab ?? "overview");
  const [deploymentView, setDeploymentView] = useState<"topology" | "table">("table");
  const [monitoringDeployment, setMonitoringDeployment] = useState<string>("all");
  const filtered = deployments.filter((d) => {
    if (!d.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (deployedFilter === "deployed" && !d.deployed) return false;
    if (deployedFilter === "undeployed" && d.deployed) return false;
    return true;
  });
  const st = STATUS_MAP[endpoint.status];

  const headerCell: React.CSSProperties = {
    padding: "10px 12px", fontSize: 12, fontWeight: 600, color: colors.text.secondary,
    backgroundColor: colors.bg.tertiary, fontFamily: ff, textAlign: "left", whiteSpace: "nowrap",
  };
  const cell: React.CSSProperties = {
    padding: "12px", fontSize: 13, color: colors.text.primary, fontFamily: ff, whiteSpace: "nowrap",
  };

  return (
    <DetailPage
      title={
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <PageTitle>{endpoint.name}</PageTitle>
          {endpoint.description && (
            <span style={{ fontSize: 13, color: colors.text.secondary, fontFamily: ff, lineHeight: "20px" }}>
              {endpoint.description}
            </span>
          )}
        </div>
      }
      actions={
        <>
          <SecondaryButton
            label="Edit traffic"
            onClick={() => onEditTraffic?.()}
            icon={<Icon name="setting" size={16} color="currentColor" />}
          />
          <PrimaryButton
            label="Deploy model"
            onClick={onDeployModel}
            icon={<Icon name="create" size={16} color="currentColor" />}
          />
        </>
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

      {detailTab === "monitoring" ? (() => {
        // Show all configured deployments in the scope dropdown (matches Model Deployments table count),
        // but resources/pods only come from deployed=true entries.
        const deployedDeployments = deployments.filter((d) => d.deployed);
        const totalDeployedPods = deployedDeployments
          .reduce((sum, d) => sum + Math.max(1, d.replicas ?? 1), 0);
        const selectedDeployment = deployedDeployments.find((d) => d.id === monitoringDeployment);
        const monitoringPodCount =
          monitoringDeployment === "all" ? totalDeployedPods :
          selectedDeployment              ? Math.max(1, selectedDeployment.replicas ?? 1) :
          0;
        return (
          <ApplicationMonitoringTab
            appName={endpoint.name}
            podCount={monitoringPodCount}
            scopeSelector={{
              label: "범위",
              value: monitoringDeployment,
              onChange: setMonitoringDeployment,
              options: [
                { value: "all", label: `전체 (${deployedDeployments.length} deployments)` },
                ...deployedDeployments.map((d) => ({
                  value: d.id,
                  label: `Deployment · ${d.name}`,
                })),
              ],
            }}
          />
        );
      })() : (
      <DetailContentWithSidebar
        sidebar={
          <>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>상세정보</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoRow label="Endpoint ID">
                <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 13 }}>{endpoint.id}</span>
              </InfoRow>
              <InfoRow label="Inference URL">
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 4,
                  padding: 8, borderRadius: 6,
                  backgroundColor: colors.bg.secondary,
                  border: `1px solid ${colors.border.tertiary}`,
                }}>
                  <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, wordBreak: "break-all", color: colors.text.secondary, flex: 1, minWidth: 0, lineHeight: "16px" }}>
                    {endpoint.inferenceUrl}
                  </span>
                  <CopyButton text={endpoint.inferenceUrl} size={24} iconSize={20} />
                </div>
              </InfoRow>
              <InfoRow label="gRPC endpoint Address">
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 4,
                  padding: 8, borderRadius: 6,
                  backgroundColor: colors.bg.secondary,
                  border: `1px solid ${colors.border.tertiary}`,
                }}>
                  <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, wordBreak: "break-all", color: colors.text.secondary, flex: 1, minWidth: 0, lineHeight: "16px" }}>
                    grpc.inference.example.com:443
                  </span>
                  <CopyButton text="grpc.inference.example.com:443" size={24} iconSize={20} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <SecondaryButton
                    label="OIP v2 Proto 다운로드"
                    onClick={() => {}}
                    icon={<img src={logoProtobuf} alt="" width={16} height={16} aria-hidden="true" />}
                  />
                </div>
              </InfoRow>
              <InfoRow label="상태">
                <StatusChip state={st.state} size="sm" label={st.label} />
              </InfoRow>
              <InfoRow label="Model Deployments">{deployments.length}</InfoRow>
              <InfoRow label="Serving Runtime"><RuntimeBadge runtime={endpoint.runtime} /></InfoRow>
              <InfoRow label="Created By">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar initial={endpoint.creatorInitial} size="sm" color={getAvatarColorFromInitial(endpoint.creatorInitial)} />
                  <span>{endpoint.creator}</span>
                </div>
              </InfoRow>
              <InfoRow label="Created At">{endpoint.createdAt}</InfoRow>
            </div>
          </>
        }
      >
        <div style={{ marginTop: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
            Model Deployments
          </h2>
        </div>

        {/* Search + Deployed filter on the left, view toggle on the right */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", visibility: deploymentView === "table" ? "visible" : "hidden" }}>
            <div style={{ width: 280 }}>
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
              />
            </div>
            <div style={{ width: 160 }}>
              <Select
                options={[
                  { value: "all",        label: "Deployed" },
                  { value: "deployed",   label: "Deployed only" },
                  { value: "undeployed", label: "Undeployed only" },
                ]}
                value={deployedFilter}
                onChange={(v) => setDeployedFilter(v as typeof deployedFilter)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {([
              { key: "table",    icon: "table" as const,   label: "Table view" },
              { key: "topology", icon: "Traffic" as const, label: "Topology view" },
            ] as const).map(({ key, icon, label }) => (
              <Tooltip key={key} content={label} direction="below-center">
                <IconButton
                  buttonType="outlined"
                  theme="runway"
                  selected={deploymentView === key}
                  onClick={() => setDeploymentView(key)}
                  aria-label={label}
                  aria-pressed={deploymentView === key}
                  icon={<Icon name={icon} size={20} color="currentColor" />}
                />
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Topology view */}
        {deploymentView === "topology" && (
          deployments.length === 0 ? (
            <div
              style={{
                border: `1px solid ${colors.border.tertiary}`,
                borderRadius: 12,
                backgroundColor: colors.bg.secondary,
                padding: 60,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: colors.bg.tertiary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="inference_endpoint" size={24} color={colors.icon.secondary} />
              </div>
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
                  No models deployed
                </span>
                <span style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff }}>
                  This endpoint has no deployed models yet. Deploy your first model to start serving inference requests.
                </span>
              </div>
            </div>
          ) : (
            <TopologyView endpoint={endpoint} deployments={deployments} />
          )
        )}

        {/* Table view */}
        {deploymentView === "table" && (filtered.length === 0 ? (
          <div
            style={{
              border: `1px solid ${colors.border.tertiary}`,
              borderRadius: 12,
              backgroundColor: colors.bg.secondary,
              padding: 60,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: colors.bg.tertiary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="inference_endpoint" size={24} color={colors.icon.secondary} />
            </div>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
                {deployments.length === 0 ? "No models deployed" : "No matching deployments"}
              </span>
              <span style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff }}>
                {deployments.length === 0
                  ? "This endpoint has no deployed models yet. Deploy your first model to start serving inference requests."
                  : "Try a different search term."}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ border: `1px solid ${colors.border.tertiary}`, borderRadius: 12, overflow: "auto", backgroundColor: colors.bg.primary }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 880 }}>
              <thead>
                <tr>
                  <th style={headerCell}>Model deployment name</th>
                  <th style={headerCell}>Deployed</th>
                  <th style={{ ...headerCell, textAlign: "right" }}>Weight</th>
                  <th style={headerCell}>Effective</th>
                  <th style={headerCell}>생성일 ↓</th>
                  <th style={headerCell}>생성자</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} style={{ borderTop: `1px solid ${colors.border.tertiary}` }}>
                    <td style={{ ...cell, fontWeight: 500 }}>{d.name}</td>
                    <td style={cell}>
                      {d.deployed ? (
                        <Icon name="check" size={16} color={colors.icon.success} />
                      ) : (
                        <span style={{ color: colors.text.tertiary }}>-</span>
                      )}
                    </td>
                    <td style={{ ...cell, textAlign: "right", color: colors.text.secondary }}>{d.weight}%</td>
                    <td style={cell}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
                        <span style={{ minWidth: 32, color: colors.text.primary }}>{d.effective}%</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 9999, backgroundColor: colors.bg.neutral, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.min(100, d.effective)}%`,
                              height: "100%",
                              backgroundColor: colors.bg.interactive.runwayPrimary,
                              borderRadius: 9999,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ ...cell, color: colors.text.secondary }}>{d.createdAt}</td>
                    <td style={cell}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Avatar initial={d.creatorInitial} size="sm" color={getAvatarColorFromInitial(d.creatorInitial)} />
                        <span>{d.creator}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </DetailContentWithSidebar>
      )}
    </DetailPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Topology view — Client → REST API → Deployments → Pods
// ═══════════════════════════════════════════════════════════════════════════════
function TopologyView({ endpoint, deployments }: { endpoint: InferenceEndpoint; deployments: ModelDeployment[] }) {
  const { colors } = useTheme();
  const activeColor = colors.bg.interactive.runwayPrimary;
  const idleColor   = colors.border.secondary;
  const anyActive   = deployments.some((d) => d.effective > 0);

  return (
    <div
      style={{
        padding: "32px 24px",
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        overflow: "auto",
      }}
    >
      {/* Local keyframes for the flowing dash animation */}
      <style>{`
        @keyframes topology-flow-v { from { background-position-y: 0; } to { background-position-y: 8px; } }
        @keyframes topology-flow-h { from { background-position-x: 0; } to { background-position-x: 8px; } }
      `}</style>

      <ClientNode />
      <FlowLineV height={28} active={anyActive} activeColor={activeColor} idleColor={idleColor} />

      {/* REST API + Inference logging */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        <RestApiCard url={endpoint.inferenceUrl} runtime={endpoint.runtime} />
        <InferenceLoggingCard />
      </div>

      <FlowLineV height={28} active={anyActive} activeColor={activeColor} idleColor={idleColor} />

      {/* Branch L-shapes — each deployment has its own (horizontal segment + vertical drop) colored per its effective traffic */}
      <BranchLayer deployments={deployments} activeColor={activeColor} idleColor={idleColor} />

      {/* Deployment cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${deployments.length}, minmax(280px, 1fr))`,
          gap: 16,
          width: "100%",
          marginTop: -1,
        }}
      >
        {deployments.map((d) => (
          <DeploymentNode key={d.id} deployment={d} runtime={endpoint.runtime} />
        ))}
      </div>
    </div>
  );
}

// Branch L-shapes — one per deployment. Each branch carries the deployment's color
// from the trunk center all the way down to the card, so 0% deployments are gray
// from the very start of the path (no blue→gray discontinuity).
function BranchLayer({
  deployments,
  activeColor,
  idleColor,
}: {
  deployments: ModelDeployment[];
  activeColor: string;
  idleColor: string;
}) {
  if (deployments.length === 0) return null;
  const verticalDropHeight = 20;
  const horizontalBandHeight = 2;
  const containerHeight = verticalDropHeight + horizontalBandHeight;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: containerHeight,
      }}
      aria-hidden="true"
    >
      {deployments.map((d, i) => {
        const colCenterPct   = ((i + 0.5) / deployments.length) * 100;
        const trunkCenterPct = 50;
        const isCenter = Math.abs(colCenterPct - trunkCenterPct) < 0.001;
        const active = d.effective > 0;
        const color = active ? activeColor : idleColor;

        const leftPct  = Math.min(colCenterPct, trunkCenterPct);
        const rightPct = 100 - Math.max(colCenterPct, trunkCenterPct);

        return (
          <React.Fragment key={d.id}>
            {/* Horizontal segment (from trunk center to this column's center) */}
            {!isCenter && (
              <div
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  right: `${rightPct}%`,
                  top: 0,
                  height: horizontalBandHeight,
                  backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`,
                  backgroundSize: "8px 2px",
                  backgroundRepeat: "repeat-x",
                  animation: active ? "topology-flow-h 0.8s linear infinite" : undefined,
                }}
              />
            )}
            {/* Vertical drop at this column's center */}
            <div
              style={{
                position: "absolute",
                left: `calc(${colCenterPct}% - 1px)`,
                top: 0,
                width: 2,
                height: containerHeight,
                backgroundImage: `linear-gradient(to bottom, ${color} 50%, transparent 50%)`,
                backgroundSize: "2px 8px",
                backgroundRepeat: "repeat-y",
                animation: active ? "topology-flow-v 0.8s linear infinite" : undefined,
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Animated dashed connector — vertical (CSS background-image dash flow)
function FlowLineV({
  height,
  active,
  activeColor,
  idleColor,
}: {
  height: number;
  active: boolean;
  activeColor: string;
  idleColor: string;
}) {
  const color = active ? activeColor : idleColor;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width: 2,
        height,
        backgroundImage: `linear-gradient(to bottom, ${color} 50%, transparent 50%)`,
        backgroundSize: "2px 8px",
        backgroundRepeat: "repeat-y",
        animation: active ? "topology-flow-v 0.8s linear infinite" : undefined,
      }}
    />
  );
}

// Animated dashed connector — horizontal (CSS background-image dash flow)
function FlowLineH({
  width,
  maxWidth,
  active,
  activeColor,
  idleColor,
}: {
  width: string;
  maxWidth?: number;
  active: boolean;
  activeColor: string;
  idleColor: string;
}) {
  const color = active ? activeColor : idleColor;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width,
        maxWidth,
        height: 2,
        backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`,
        backgroundSize: "8px 2px",
        backgroundRepeat: "repeat-x",
        animation: active ? "topology-flow-h 0.8s linear infinite" : undefined,
      }}
    />
  );
}

function ClientNode() {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        padding: "12px 20px",
        backgroundColor: "#dbeafe",
        border: `1px solid #bfdbfe`,
        borderRadius: 12,
        minWidth: 96,
      }}
    >
      <Icon name="user" size={24} color="#1e40af" />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1e3a8a", fontFamily: ff }}>Client</span>
    </div>
  );
}

function RestApiCard({ url, runtime }: { url: string; runtime: ServingRuntime }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: 16,
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        minWidth: 320, maxWidth: 480,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 24, height: 24, borderRadius: 6,
          backgroundColor: "#dbeafe",
        }}>
          <Icon name="inference_endpoint" size={16} color="#1d4ed8" />
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>Rest API</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
          <img src={RUNTIME_MAP[runtime].logo} alt="" style={{ width: 14, height: 14, objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>{RUNTIME_MAP[runtime].label}</span>
        </span>
      </div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 8px",
          backgroundColor: colors.bg.secondary,
          border: `1px solid ${colors.border.tertiary}`,
          borderRadius: 6,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 11,
            color: colors.text.secondary,
            flex: 1, minWidth: 0, lineHeight: "16px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {url}
        </span>
        <CopyButton text={url} size={16} />
      </div>
    </div>
  );
}

function InferenceLoggingCard() {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: 16,
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        minWidth: 240,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 24, height: 24, borderRadius: 6,
          backgroundColor: "#dbeafe",
        }}>
          <Icon name="storage" size={16} color="#1d4ed8" />
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>Inference logging</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: ff }}>
        <span style={{ color: colors.text.tertiary }}>Location</span>
        <span style={{ color: colors.text.interactive.runwayPrimary, fontWeight: 500 }}>MINIO</span>
      </div>
    </div>
  );
}

function DeploymentNode({ deployment, runtime: _runtime }: { deployment: ModelDeployment; runtime: ServingRuntime }) {
  const { colors } = useTheme();
  const replicas = deployment.replicas ?? 1;
  // Only render running pod cards when the deployment is actually deployed.
  const podCount = deployment.deployed ? Math.max(1, replicas) : 0;
  const trafficPct = deployment.effective;
  const trafficWeight = deployment.trafficWeight ?? 1;
  const deploymentNumber = deployment.deploymentNumber ?? 0;
  const auto = deployment.autoScaling ?? { min: 1, max: 10 };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        padding: 16,
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6,
            backgroundColor: "#dbeafe",
            display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="deploy" size={14} color="#1d4ed8" />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {deployment.name}
          </span>
          <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff, whiteSpace: "nowrap" }}>
            ({replicas} replica{replicas !== 1 ? "s" : ""})
          </span>
        </div>
        {deployment.deployed && (
          <Tooltip content="GPU 활성화" direction="above-center">
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              backgroundColor: "#dcfce7",
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="gpu" size={14} color="#15803d" />
            </span>
          </Tooltip>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, fontFamily: ff }}>
        <MetaItem label="Deployment ID" value={String(deploymentNumber)} />
        <MetaItem label="Traffic" value={`${trafficPct}%`} hint={`(Traffic weight:${trafficWeight})`} />
      </div>

      {/* Pods — auto-scaled replicas. Stack vertically by default; opt into 2-up only when card is wide enough */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
        {Array.from({ length: podCount }).map((_, i) => (
          <PodCard
            key={i}
            podId={`pod-${randomPodId(deployment.id, i)}`}
            running={deployment.deployed}
            trafficDistribution={Math.round(trafficPct / podCount)}
            trafficWeight={trafficWeight}
            auto={auto}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, paddingTop: 8, borderTop: `1px solid ${colors.border.tertiary}` }}>
        <button
          type="button"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 8px",
            border: `1px solid ${colors.border.secondary}`,
            borderRadius: 6,
            backgroundColor: colors.bg.primary,
            cursor: "pointer",
            fontFamily: ff, fontSize: 12, fontWeight: 500,
            color: colors.text.secondary,
          }}
        >
          <Icon name="undeploy" size={12} color={colors.icon.secondary} />
          Stop
        </button>
        <button
          type="button"
          aria-label="More actions"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28,
            border: "none", borderRadius: 6,
            backgroundColor: "transparent", cursor: "pointer",
          }}
        >
          <Icon name="more-vertical" size={16} color={colors.icon.secondary} />
        </button>
      </div>
    </div>
  );
}

function PodCard({ podId, running, trafficDistribution, trafficWeight, auto }: {
  podId: string; running: boolean; trafficDistribution: number; trafficWeight: number; auto: { min: number; max: number };
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: 10,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 8,
      }}
    >
      <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: colors.text.secondary }}>{podId}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontFamily: ff }}>
        <PodMetaRow label="Status" value={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{
              width: 6, height: 6, borderRadius: 9999,
              backgroundColor: running ? colors.bg.success : colors.bg.tertiary,
            }} />
            <span style={{ color: running ? colors.text.success : colors.text.tertiary }}>
              {running ? "Running" : "Stopped"}
            </span>
          </span>
        } />
        <PodMetaRow label="Traffic distribution" value={`${trafficDistribution}%`} hint={`(Traffic weight:${trafficWeight})`} />
        <PodMetaRow label="Auto scaling" value={String(auto.min)} hint={`(min:${auto.min}~max:${auto.max})`} />
      </div>
    </div>
  );
}

function MetaItem({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ color: colors.text.tertiary }}>{label}</span>
      <span style={{ color: colors.text.primary, fontWeight: 500 }}>{value}</span>
      {hint && <span style={{ color: colors.text.tertiary }}>{hint}</span>}
    </div>
  );
}

function PodMetaRow({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ color: colors.text.tertiary, minWidth: 88 }}>{label}</span>
      <span style={{ color: colors.text.primary, fontWeight: 500 }}>{value}</span>
      {hint && <span style={{ color: colors.text.tertiary }}>{hint}</span>}
    </div>
  );
}

function randomPodId(seed: string, i: number) {
  let h = 5381;
  const s = `${seed}-${i}`;
  for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) >>> 0;
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  let n = h;
  for (let k = 0; k < 7; k++) { id += chars[n % chars.length]; n = Math.floor(n / chars.length); }
  return id;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff, lineHeight: "16px" }}>{label}</span>
      <div style={{ fontSize: 14, color: colors.text.primary, fontFamily: ff, lineHeight: "20px" }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Access Endpoints — REST + gRPC transports for the same model.
// Two transport interfaces, two routing models:
//   • REST: path-based routing
//   • gRPC: metadata-header routing
// ═══════════════════════════════════════════════════════════════════════════════
function AccessEndpointsSection({ endpoint }: { endpoint: InferenceEndpoint }) {
  const { colors } = useTheme();
  const grpcAddress = "grpc.inference.example.com:443";
  const grpcModel = endpoint.inferenceUrl
    .replace("https://inference.example.com/", "")
    .replace("/v2/models/default/infer", "/default");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
            Access Endpoints
          </h2>
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
            Available Transports (2) · REST · gRPC · same model, two transport interfaces
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
        <RestEndpointCard url={endpoint.inferenceUrl} />
        <GrpcEndpointCard address={grpcAddress} modelMetadata={grpcModel} />
      </div>
    </div>
  );
}

function CapabilityBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "info" | "success" }) {
  const { colors } = useTheme();
  const map = {
    neutral: { bg: colors.bg.tertiary,      fg: colors.text.secondary, br: colors.border.tertiary },
    info:    { bg: colors.bg.infoSubtle ?? "#e0f2fe", fg: colors.text.info,      br: colors.border.tertiary },
    success: { bg: colors.bg.successSubtle ?? "#dcfce7", fg: colors.text.success,   br: colors.border.tertiary },
  } as const;
  const c = map[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 9999,
        backgroundColor: c.bg,
        color: c.fg,
        border: `1px solid ${c.br}`,
        fontFamily: ff,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function HealthMetrics({ p95, successRate, lastChecked }: { p95: string; successRate: string; lastChecked: string }) {
  const { colors } = useTheme();
  const Cell = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? colors.text.primary, fontFamily: ff }}>{value}</span>
    </div>
  );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        padding: 10,
        borderRadius: 6,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
      }}
    >
      <Cell label="Latency P95" value={p95} />
      <Cell label="Success Rate" value={successRate} valueColor={colors.text.success} />
      <Cell label="Last Health Check" value={lastChecked} />
    </div>
  );
}

function RestEndpointCard({ url }: { url: string }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        padding: 16,
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>REST</span>
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>· OIP v2</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <CapabilityBadge label="Unary" tone="neutral" />
          <CapabilityBadge label="JSON"  tone="info" />
          <CapabilityBadge label="path-routing" tone="neutral" />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff }}>Endpoint URL</span>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 10px", borderRadius: 6,
          backgroundColor: colors.bg.secondary,
          border: `1px solid ${colors.border.tertiary}`,
        }}>
          <span style={{
            fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: colors.text.secondary,
            flex: 1, minWidth: 0, lineHeight: "16px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{url}</span>
          <CopyButton text={url} size={16} />
        </div>
      </div>

      <HealthMetrics p95="42 ms" successRate="99.97%" lastChecked="30 sec ago" />
    </div>
  );
}

function GrpcEndpointCard({ address, modelMetadata }: { address: string; modelMetadata: string }) {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        padding: 16,
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>gRPC</span>
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>· OIP v2</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <CapabilityBadge label="Unary"     tone="neutral" />
          <CapabilityBadge label="Streaming" tone="success" />
          <CapabilityBadge label="Protobuf"  tone="info" />
          <CapabilityBadge label="mTLS"      tone="success" />
        </div>
      </div>

      <button
        type="button"
        style={{
          alignSelf: "flex-start",
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 10px",
          border: `1px solid ${colors.border.secondary}`,
          borderRadius: 6,
          backgroundColor: colors.bg.primary,
          fontFamily: ff, fontSize: 12, fontWeight: 500,
          color: colors.text.secondary,
          cursor: "pointer",
        }}
      >
        <Icon name="download" size={14} color={colors.icon.secondary} />
        OIP v2 Proto 다운로드
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff }}>Endpoint Address</span>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 10px", borderRadius: 6,
          backgroundColor: colors.bg.secondary,
          border: `1px solid ${colors.border.tertiary}`,
        }}>
          <span style={{
            fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: colors.text.secondary,
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{address}</span>
          <CopyButton text={address} size={16} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff }}>Metadata Headers</span>
          <Tooltip
            content="gRPC는 path 대신 metadata 헤더로 모델을 라우팅합니다. (REST는 path-based routing)"
            direction="above-center"
          >
            <span style={{ display: "inline-flex", cursor: "help" }}>
              <Icon name="info-circle-stroke" size={14} color={colors.icon.secondary} />
            </span>
          </Tooltip>
        </div>
        <MetadataKeyValueTable
          rows={[
            { key: "x-runway-model-name", value: modelMetadata },
            { key: "authorization",       value: "Bearer ••••••" },
            { key: "content-type",        value: "application/grpc" },
          ]}
        />
      </div>

      <HealthMetrics p95="18 ms" successRate="99.99%" lastChecked="30 sec ago" />
    </div>
  );
}

function MetadataKeyValueTable({ rows }: { rows: { key: string; value: string }[] }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: colors.bg.secondary,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.key}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(140px, 200px) 1fr auto",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderTop: i === 0 ? "none" : `1px solid ${colors.border.tertiary}`,
          }}
        >
          <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: colors.text.secondary, fontWeight: 500 }}>
            {r.key}
          </span>
          <span style={{
            fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: colors.text.primary,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0,
          }}>
            {r.value}
          </span>
          <CopyButton text={r.value} size={14} />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Create / Deploy Drawer (shared form)
// ═══════════════════════════════════════════════════════════════════════════════
// GPU multi-select — node → model → individual GPU UUID hierarchical picker
// ═══════════════════════════════════════════════════════════════════════════════
type GpuModelGroup = { name: string; uuids: string[] };
type GpuNode = { nodeName: string; models: GpuModelGroup[] };

const MOCK_GPU_NODES: GpuNode[] = [
  {
    nodeName: "Black-cow-1",
    models: [
      { name: "Tesla V100-SXM2-32GB", uuids: [
        "GPU-fab18675-8f17-5b08-115b-e85dd8216382",
        "GPU-9a7791e8-4bbb-c4ad-018a-0576195f6fa0",
        "GPU-aaaa1111-1111-1111-1111-111111111111",
        "GPU-bbbb2222-2222-2222-2222-222222222222",
      ] },
    ],
  },
  {
    nodeName: "Black-cow-2",
    models: [
      { name: "Tesla L4", uuids: [
        "GPU-36487c3e-9165-985e-4776-2b4968ea0313",
        "GPU-ecbce321-8a33-1dd6-5dd1-dc6aaafcc681",
      ] },
    ],
  },
  {
    nodeName: "Black-cow-3",
    models: [
      { name: "Tesla V100-SXM2-32GB", uuids: [
        "GPU-cccc3333-3333-3333-3333-333333333333",
        "GPU-dddd4444-4444-4444-4444-444444444444",
      ] },
    ],
  },
];

// Default selection — 3 + 2 + 1 = 6 GPUs across 3 (node, model) groups (matches Figma reference).
const DEFAULT_GPU_SELECTION = new Set<string>([
  "GPU-fab18675-8f17-5b08-115b-e85dd8216382",
  "GPU-9a7791e8-4bbb-c4ad-018a-0576195f6fa0",
  "GPU-aaaa1111-1111-1111-1111-111111111111",
  "GPU-36487c3e-9165-985e-4776-2b4968ea0313",
  "GPU-ecbce321-8a33-1dd6-5dd1-dc6aaafcc681",
  "GPU-cccc3333-3333-3333-3333-333333333333",
]);

type GpuSelectionGroup = { nodeName: string; modelName: string; uuids: string[] };

function groupSelections(nodes: GpuNode[], selectedUuids: Set<string>): GpuSelectionGroup[] {
  const result: GpuSelectionGroup[] = [];
  for (const node of nodes) {
    for (const model of node.models) {
      const picked = model.uuids.filter((u) => selectedUuids.has(u));
      if (picked.length > 0) {
        result.push({ nodeName: node.nodeName, modelName: model.name, uuids: picked });
      }
    }
  }
  return result;
}

function GpuModelMultiSelect({
  nodes, selectedUuids, onChange,
}: {
  nodes: GpuNode[]; selectedUuids: Set<string>; onChange: (next: Set<string>) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const groups = groupSelections(nodes, selectedUuids);
  const totalGpus = selectedUuids.size;
  const numGroups = groups.length;

  const isAllSelectedInModel = (m: GpuModelGroup) => m.uuids.every((u) => selectedUuids.has(u));
  const isSomeSelectedInModel = (m: GpuModelGroup) => m.uuids.some((u) => selectedUuids.has(u));
  const modelCheckState = (m: GpuModelGroup): boolean | "indeterminate" =>
    isAllSelectedInModel(m) ? true : isSomeSelectedInModel(m) ? "indeterminate" : false;

  const isAllSelectedInNode = (n: GpuNode) => n.models.every((m) => isAllSelectedInModel(m));
  const isSomeSelectedInNode = (n: GpuNode) => n.models.some((m) => isSomeSelectedInModel(m));
  const nodeCheckState = (n: GpuNode): boolean | "indeterminate" =>
    isAllSelectedInNode(n) ? true : isSomeSelectedInNode(n) ? "indeterminate" : false;

  const toggleGpu = (uuid: string) => {
    const next = new Set(selectedUuids);
    if (next.has(uuid)) next.delete(uuid); else next.add(uuid);
    onChange(next);
  };
  const toggleModel = (m: GpuModelGroup) => {
    const next = new Set(selectedUuids);
    if (isAllSelectedInModel(m)) m.uuids.forEach((u) => next.delete(u));
    else m.uuids.forEach((u) => next.add(u));
    onChange(next);
  };
  const toggleNode = (n: GpuNode) => {
    const next = new Set(selectedUuids);
    const allSel = isAllSelectedInNode(n);
    n.models.forEach((m) => m.uuids.forEach((u) => allSel ? next.delete(u) : next.add(u)));
    onChange(next);
  };

  // Search — match against node name, model name, or UUID
  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nodes;
    return nodes
      .map((n) => {
        const nodeMatch = n.nodeName.toLowerCase().includes(q);
        const filteredModels = n.models
          .map((m) => {
            const modelMatch = m.name.toLowerCase().includes(q);
            const filteredUuids = m.uuids.filter((u) => u.toLowerCase().includes(q));
            return nodeMatch || modelMatch
              ? m // keep all uuids when parent matches
              : filteredUuids.length > 0 ? { ...m, uuids: filteredUuids } : null;
          })
          .filter((m): m is GpuModelGroup => m !== null);
        return filteredModels.length > 0 ? { ...n, models: filteredModels } : null;
      })
      .filter((n): n is GpuNode => n !== null);
  }, [nodes, search]);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", height: 32,
          padding: "0 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          border: `1px solid ${open ? colors.text.interactive.runwayPrimary : colors.border.secondary}`,
          borderRadius: 6,
          backgroundColor: colors.bg.primary,
          fontSize: 13,
          color: colors.text.primary,
          cursor: "pointer",
          fontFamily: ff,
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {totalGpus > 0 ? (
          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 8px",
            borderRadius: 4,
            backgroundColor: colors.bg.interactive.runwaySelected,
            color: colors.text.interactive.runwayPrimary,
            fontSize: 12, fontWeight: 500,
          }}>
            {numGroups} Selected GPU model ({totalGpus} GPUs)
          </span>
        ) : (
          <span style={{ color: colors.text.tertiary }}>Select GPU model</span>
        )}
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.icon.secondary} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            maxHeight: 360, overflowY: "auto",
            backgroundColor: colors.bg.primary,
            border: `1px solid ${colors.border.secondary}`,
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: 8,
            zIndex: 10,
          }}
        >
          {/* Search */}
          <div style={{ padding: "0 0 8px" }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
            />
          </div>

          {filteredNodes.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: colors.text.tertiary, fontSize: 13, fontFamily: ff }}>
              No GPUs found.
            </div>
          ) : (
            filteredNodes.map((node) => (
              <div key={node.nodeName} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, padding: "4px 8px", fontFamily: ff }}>
                  {node.nodeName}
                </div>
                {node.models.map((model) => (
                  <div key={model.name} style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", cursor: "pointer", borderRadius: 4 }}>
                      <Checkbox
                        checked={modelCheckState(model)}
                        onChange={() => toggleModel(model)}
                      />
                      <span style={{ fontSize: 13, color: colors.text.primary, fontFamily: ff }}>
                        {model.name} ({model.uuids.length} GPUs)
                      </span>
                    </label>
                    {model.uuids.map((uuid) => (
                      <label key={uuid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 32px", cursor: "pointer", borderRadius: 4 }}>
                        <Checkbox
                          checked={selectedUuids.has(uuid)}
                          onChange={() => toggleGpu(uuid)}
                        />
                        <span style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: colors.text.secondary }}>
                          {uuid}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function GpuSelectionChips({
  nodes, selectedUuids, onChange,
}: {
  nodes: GpuNode[]; selectedUuids: Set<string>; onChange: (next: Set<string>) => void;
}) {
  const groups = groupSelections(nodes, selectedUuids);
  if (groups.length === 0) return null;
  const removeGroup = (g: GpuSelectionGroup) => {
    const next = new Set(selectedUuids);
    g.uuids.forEach((u) => next.delete(u));
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {groups.map((g) => (
        <Chip
          key={`${g.nodeName}-${g.modelName}`}
          label={`${g.modelName} * ${g.uuids.length} (${g.nodeName})`}
          tone="success"
          size="sm"
          closable
          onClose={() => removeGroup(g)}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
type DrawerMode = "create-endpoint" | "deploy-model";

function slugifyId(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 63);
}

function EndpointFormDrawer({
  open, onClose, mode, onSubmit,
}: {
  open: boolean; onClose: () => void; mode: DrawerMode;
  onSubmit?: (payload: { name: string; id: string; runtime?: ServingRuntime }) => void;
}) {
  const { colors } = useTheme();
  const [resourceGuideOpen, setResourceGuideOpen] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [idManual, setIdManual] = useState(false);
  const [desc, setDesc] = useState("");
  const [runtime, setRuntime] = useState<ServingRuntime>("triton");
  // deploy-only fields
  const [volume, setVolume] = useState("");
  const [modelPath, setModelPath] = useState("");
  const [cpu, setCpu] = useState("100000");
  const [memory, setMemory] = useState("10");
  const [gpuEnabled, setGpuEnabled] = useState(true);
  const [selectedGpuUuids, setSelectedGpuUuids] = useState<Set<string>>(() => new Set(DEFAULT_GPU_SELECTION));
  const [gpuCount, setGpuCount] = useState("1");
  const [gpuCorePct, setGpuCorePct] = useState("50");
  const [gpuMemoryMib, setGpuMemoryMib] = useState("510");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [shmPath, setShmPath] = useState("/dev/shm");
  const [shmSize, setShmSize] = useState("10");
  const [replicas, setReplicas] = useState("1");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!idManual) setId(slugifyId(v));
  };

  const reset = () => {
    setName(""); setId(""); setIdManual(false); setDesc("");
    setRuntime("triton");
    setVolume(""); setModelPath("");
    setCpu("100000"); setMemory("10"); setGpuEnabled(true);
    setSelectedGpuUuids(new Set(DEFAULT_GPU_SELECTION));
    setGpuCount("1"); setGpuCorePct("50"); setGpuMemoryMib("510");
    setAdvancedOpen(false);
    setShmPath("/dev/shm"); setShmSize("10"); setReplicas("1");
    setResourceGuideOpen(false);
  };
  const handleClose = () => { onClose(); reset(); };
  const handleSubmit = () => { onSubmit?.({ name: name.trim(), id: id.trim(), runtime }); handleClose(); };

  const isCreate = mode === "create-endpoint";
  const previewUrl = `https://inference.example.com/aidev-nlp-models/${id || "{endpoint-id}"}`;

  return (
    <>
      <DrawerShell
        open={open}
        onClose={handleClose}
        title={isCreate ? "Create Inference endpoint" : "Deploy model"}
        footer={
          <>
            <SecondaryButton label="Cancel" onClick={handleClose} />
            <PrimaryButton label={isCreate ? "Create" : "Deploy"} onClick={handleSubmit} />
          </>
        }
      >
        {/* Basic information */}
        <Section title="Basic information">
          <TextField
            label={isCreate ? "Inference endpoint name" : "Deployment name"} value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={128} placeholder={isCreate ? "my-endpoint" : "my-deployment"}
          />
          <TextField
            label={isCreate ? "Endpoint ID" : "Deployment ID"} value={id}
            onChange={(e) => { setId(e.target.value); setIdManual(true); }}
            maxLength={63} placeholder={isCreate ? "my-endpoint" : "my-deployment"}
            helpMessage="소문자, 숫자, 하이픈만 사용 가능 (최대 63자)"
          />
          {/* Preview URL — Create 모드에만 */}
          {isCreate && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
                Preview URL
              </span>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 12px",
                  borderRadius: 6,
                  backgroundColor: colors.bg.interactive.runwaySelected,
                  border: `1px solid ${colors.border.tertiary}`,
                }}
              >
                <span style={{ flex: 1, minWidth: 0, fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: colors.text.primary, wordBreak: "break-all" }}>
                  {previewUrl}
                </span>
                <CopyButton text={previewUrl} size={20} />
              </div>
            </div>
          )}
          <TextArea
            label="Description (optional)" value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={512} placeholder="Endpoint 용도 설명"
          />
        </Section>

        {/* ── Create 모드: Serving Runtime 선택 ─────────────────── */}
        {isCreate && (
          <Section title="Serving Runtime">
            <RuntimeOptionCard
              value="triton"
              selected={runtime === "triton"}
              onSelect={() => setRuntime("triton")}
              label="Triton"
              logo={logoTriton}
              description="NVIDIA Triton Inference Server for high-throughput serving"
              bestFor="Enterprise grade multi-framework model serving"
              supportedModels="TensorRT, PyTorch, TensorFlow, ONNX, OpenVINO, Python backends"
              endpointPath={`/v2/models/${id || "{name}"}/infer`}
            />
            <RuntimeOptionCard
              value="mlserver"
              selected={runtime === "mlserver"}
              onSelect={() => setRuntime("mlserver")}
              label="MLServer"
              logo={logoMlserver}
              description="Multi-framework serving with Seldon MLServer"
              bestFor="Kubernetes-native inference server supporting multiple ML frameworks"
              supportedModels="scikit-learn, XGBoost, LightGBM, MLflow, custom Python models"
              endpointPath={`/v2/models/${id || "{name}"}/infer`}
            />
          </Section>
        )}

        {/* ── Deploy 모드: Model Source / Resources / Scaling ─ */}
        {!isCreate && (
          <React.Fragment>
        <Section title="Model Source">
          <Select
            label="Volume"
            placeholder="Select a volume ..."
            options={[
              { value: "vol-1", label: "models-prod-volume" },
              { value: "vol-2", label: "models-staging-volume" },
              { value: "vol-3", label: "shared-models" },
            ]}
            value={volume}
            onChange={setVolume}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.secondary, fontFamily: ff, display: "inline-flex", alignItems: "center", gap: 4 }}>
              Model path
              <Icon name="info-circle-stroke" size={14} color={colors.icon.secondary} />
            </span>
            <div style={{
              display: "flex", alignItems: "center",
              border: `1px solid ${colors.border.secondary}`, borderRadius: 6,
              overflow: "hidden", backgroundColor: colors.bg.primary,
            }}>
              <span style={{ padding: "0 10px", fontSize: 13, color: colors.text.tertiary, fontFamily: "'Roboto Mono', monospace", borderRight: `1px solid ${colors.border.secondary}`, height: 32, display: "inline-flex", alignItems: "center" }}>
                /mnt/models/
              </span>
              <input
                value={modelPath}
                onChange={(e) => setModelPath(e.target.value)}
                placeholder="my-model"
                style={{
                  flex: 1, height: 32, border: "none", outline: "none",
                  padding: "0 10px", fontSize: 13, fontFamily: "'Roboto Mono', monospace",
                  backgroundColor: "transparent", color: colors.text.primary, minWidth: 0,
                }}
              />
            </div>
          </div>
        </Section>

        {/* Resources */}
        <Section
          title="Resources"
          actions={
            <SecondaryButton
              label="Resource overview"
              onClick={() => setResourceGuideOpen(true)}
              icon={<Icon name="storage" size={14} color="currentColor" />}
              style={{ height: 28, padding: "4px 10px", fontSize: 12 }}
            />
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <TextField
              label="CPU (millicores)" value={cpu}
              onChange={(e) => setCpu(e.target.value)}
              helpMessage="Project Quota: 10000"
            />
            <TextField
              label="Memory (MiB)" value={memory}
              onChange={(e) => setMemory(e.target.value)}
              helpMessage="Project Quota: 200"
            />
          </div>

          {/* GPU toggle box */}
          <div
            style={{
              padding: "12px 16px",
              border: `1px solid ${colors.border.secondary}`,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              backgroundColor: gpuEnabled ? colors.bg.interactive.runwaySelected : colors.bg.secondary,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="gpu" size={20} color={colors.icon.secondary} />
              <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>
                Enable GPU Acceleration
              </span>
            </div>
            <Switch checked={gpuEnabled} onChange={setGpuEnabled} />
          </div>

          {gpuEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, borderRadius: 8, backgroundColor: colors.bg.secondary }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
                  GPU model
                </span>
                <GpuModelMultiSelect
                  nodes={MOCK_GPU_NODES}
                  selectedUuids={selectedGpuUuids}
                  onChange={setSelectedGpuUuids}
                />
                <GpuSelectionChips
                  nodes={MOCK_GPU_NODES}
                  selectedUuids={selectedGpuUuids}
                  onChange={setSelectedGpuUuids}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <TextField label="GPU Count" value={gpuCount} onChange={(e) => setGpuCount(e.target.value)} helpMessage={`/ ${selectedGpuUuids.size || 0}`} />
                <TextField label="GPU core (%)" value={gpuCorePct} onChange={(e) => setGpuCorePct(e.target.value)} helpMessage="/ 100" />
                <TextField label="GPU memory (MiB)" value={gpuMemoryMib} onChange={(e) => setGpuMemoryMib(e.target.value)} helpMessage="/ 32510" />
              </div>
            </div>
          )}

          {/* Advanced memory options accordion */}
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", border: `1px solid ${colors.border.secondary}`, borderRadius: 8,
              backgroundColor: colors.bg.primary, cursor: "pointer", width: "100%",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="memory" size={20} color={colors.icon.secondary} />
              <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>Advanced Memory Options</span>
            </span>
            <Icon name={advancedOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.icon.secondary} />
          </button>

          {advancedOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 8, backgroundColor: colors.bg.secondary }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, display: "block", marginBottom: 4 }}>Shared memory</span>
                <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
                  inferenceEndpoints:shared_memory_description
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextField label="Shared memory mount path" value={shmPath} onChange={(e) => setShmPath(e.target.value)} />
                <TextField label="Share memory" value={shmSize} onChange={(e) => setShmSize(e.target.value)} helpMessage="/ 512 MiB" />
              </div>
            </div>
          )}
        </Section>

        {/* Scaling — Deploy 모드에서 첫 배포 시 traffic info */}
        <Section title="Scaling">
          <TextField label="Replicas" value={replicas} onChange={(e) => setReplicas(e.target.value)} />
          <Alert
            status="info"
            alertStyle="subtle"
            variant="desc"
            description="This deployment will receive 100% of the inference traffic as the first deployment for this endpoint."
            dismissible={false}
          />
        </Section>
          </React.Fragment>
        )}
      </DrawerShell>

      {/* Resource overview side-by-side drawer */}
      <ResourceGuideModal
        open={open && resourceGuideOpen}
        onClose={() => setResourceGuideOpen(false)}
      />
    </>
  );
}

function RuntimeOptionCard({
  value, selected, onSelect, label, logo, description, bestFor, supportedModels, endpointPath,
}: {
  value: string; selected: boolean; onSelect: () => void;
  label: string; logo: string; description: string;
  bestFor: string; supportedModels: string; endpointPath: string;
}) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(false);
  const borderColor = selected
    ? colors.border.interactive.runwayPrimary
    : hover
      ? colors.border.primary
      : colors.border.secondary;
  const bgColor = selected ? colors.bg.interactive.runwaySelected : colors.bg.primary;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        backgroundColor: bgColor,
        padding: 16,
        cursor: "pointer",
        transition: "border-color 0.15s, background-color 0.15s",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Radio name="serving-runtime" value={value} checked={selected} onChange={onSelect} />
        <img src={logo} alt="" style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{label}</span>
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, lineHeight: "16px" }}>{description}</span>
        </div>
      </div>

      {/* Expanded details — only when selected */}
      {selected && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 36, paddingTop: 4 }}>
          <DetailRow label="Best for" value={bestFor} colors={colors} />
          <DetailRow label="Supported Models" value={supportedModels} colors={colors} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.text.secondary, fontFamily: ff, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Supported Endpoints
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 4,
                backgroundColor: colors.bg.successSubtle,
                color: colors.text.success,
                fontSize: 11, fontWeight: 600, fontFamily: ff,
              }}>
                Tensor inference
              </span>
              <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: colors.text.tertiary }}>
                {endpointPath}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: colors.text.secondary, fontFamily: ff, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: colors.text.primary, fontFamily: ff, lineHeight: "18px" }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{title}</span>
        {actions}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page (router)
// ═══════════════════════════════════════════════════════════════════════════════
interface InferenceEndpointPageProps {
  onNavigate?: (key: string) => void;
  projectName?: string;
  /** Open this endpoint's detail on mount (matched by InferenceEndpoint.name; falls back to first endpoint). */
  initialEndpointName?: string;
  /** Detail tab to start on when initialEndpointName is supplied. */
  initialDetailTab?: "overview" | "monitoring";
}

export function InferenceEndpointPage({ onNavigate, projectName = "NLP Models", initialEndpointName, initialDetailTab }: InferenceEndpointPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("inference");
  const [endpoints, setEndpoints] = useState(SAMPLE_ENDPOINTS);
  const [selected, setSelected] = useState<InferenceEndpoint | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Deep-link: open detail when navigated from a workload drawer.
  React.useEffect(() => {
    if (!initialEndpointName) return;
    const ep = SAMPLE_ENDPOINTS.find((e) => e.name === initialEndpointName) ?? SAMPLE_ENDPOINTS[0];
    if (!ep) return;
    setSelected(ep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEndpointName]);

  const handleNavSelect = (k: string) => { setSelectedNav(k); onNavigate?.(k); };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppGnb
          breadcrumbs={[
            { label: projectName, icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
            {
              label: "Inference endpoint",
              icon: <Icon name="inference_endpoint" size={20} color={colors.icon.secondary} /> ,
              onClick: selected ? () => setSelected(null) : undefined,
            },
            { label: selected ? selected.name : "Deployments" },
          ]}
        />

        {selected ? (
          <EndpointDetailView
            endpoint={selected}
            onDeployModel={() => setDeployOpen(true)}
            initialDetailTab={initialDetailTab}
          />
        ) : (
          <EndpointListView
            endpoints={endpoints}
            query={query}
            onQueryChange={setQuery}
            onSelect={(e) => setSelected(e)}
            onCreate={() => setCreateOpen(true)}
          />
        )}
      </div>

      {/* Create endpoint drawer */}
      <EndpointFormDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create-endpoint"
        onSubmit={({ name, id, runtime }) => {
          if (!name) return;
          const newEndpoint: InferenceEndpoint = {
            id: id || `endpoint-${Date.now()}`,
            name,
            status: "pending",
            runtime: runtime ?? "triton",
            deployments: 0,
            createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            creator: "Jungmin Park",
            creatorInitial: "JP",
            inferenceUrl: `https://inference.example.com/aidev-nlp-models/${id || name}/v2/models/default/infer`,
          };
          setEndpoints((prev) => [newEndpoint, ...prev]);
        }}
      />

      {/* Deploy model drawer */}
      <EndpointFormDrawer
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
        mode="deploy-model"
      />
    </div>
  );
}

export default InferenceEndpointPage;
