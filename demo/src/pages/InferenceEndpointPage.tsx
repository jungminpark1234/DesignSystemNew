import React, { useMemo, useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { Tabs } from "@ds/components/Tabs";
import { TextField } from "@ds/components/TextField";
import { TextArea } from "@ds/components/TextArea";
import { Select } from "@ds/components/Select";
import { StatusChip } from "@ds/components/StatusChip";
import { Switch } from "@ds/components/Switch";
import { Radio } from "@ds/components/Radio";
import { CopyButton } from "@ds/components/CopyButton";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
import { Alert } from "@ds/components/Alert";
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
}

const SAMPLE_DEPLOYMENTS: Record<string, ModelDeployment[]> = {
  "ml-classifier-service": [
    { id: "d1", name: "ML Classifier Service",  deployed: true,  weight: 70, effective: 75, createdAt: "2024-10-07 15:31:53", creator: "Jungmin Park", creatorInitial: "JP" },
    { id: "d2", name: "Degraded Service API",   deployed: false, weight: 20, effective: 25, createdAt: "2024-10-07 14:37:26", creator: "Jungmin Park", creatorInitial: "JP" },
    { id: "d3", name: "Multi-Model Vision API", deployed: false, weight: 10, effective: 0,  createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP" },
  ],
  "degraded-service-api": [
    { id: "d4", name: "tagger-v1", deployed: true, weight: 100, effective: 100, createdAt: "2024-10-07 14:37:26", creator: "Jungmin Park", creatorInitial: "JP" },
  ],
  "multi-model-vision": [
    { id: "d5", name: "detector-base",  deployed: true, weight: 60, effective: 60, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP" },
    { id: "d6", name: "detector-small", deployed: true, weight: 40, effective: 40, createdAt: "2024-07-11 11:34:11", creator: "Jungmin Park", creatorInitial: "JP" },
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
  endpoint, onBack, onDeployModel, onEditTraffic,
}: {
  endpoint: InferenceEndpoint; onBack: () => void; onDeployModel: () => void; onEditTraffic?: () => void;
}) {
  const { colors } = useTheme();
  const deployments = SAMPLE_DEPLOYMENTS[endpoint.id] ?? [];
  const [query, setQuery] = useState("");
  const [deployedFilter, setDeployedFilter] = useState<"all" | "deployed" | "undeployed">("all");
  const [detailTab, setDetailTab] = useState<"overview" | "monitoring">("overview");
  const [monitoringDeployment, setMonitoringDeployment] = useState<string>(deployments[0]?.id ?? "all");
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
      onBack={onBack}
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

      {detailTab === "monitoring" ? (
        <ApplicationMonitoringTab
          appName={endpoint.name}
          scopeSelector={{
            label: "범위",
            value: monitoringDeployment,
            onChange: setMonitoringDeployment,
            options: [
              { value: "all",      label: `전체 (Endpoint + ${deployments.length} deployments)` },
              { value: "endpoint", label: "Endpoint 자원만 (router/ingress)" },
              ...deployments.map((d) => ({ value: d.id, label: `Deployment · ${d.name}` })),
            ],
          }}
        />
      ) : (
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
                  <CopyButton text={endpoint.inferenceUrl} size={20} />
                </div>
              </InfoRow>
              <InfoRow label="상태">
                <StatusChip state={st.state} size="sm" label={st.label} />
              </InfoRow>
              <InfoRow label="Model Deployments">{endpoint.deployments}</InfoRow>
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
        <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
          Model Deployments
        </h2>

        {/* Search + Deployed filter */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

        {/* Deployments table or empty */}
        {filtered.length === 0 ? (
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
        )}
      </DetailContentWithSidebar>
      )}
    </DetailPage>
  );
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
// Create / Deploy Drawer (shared form)
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
  const [gpuEnabled, setGpuEnabled] = useState(false);
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
    setCpu("100000"); setMemory("10"); setGpuEnabled(false); setAdvancedOpen(false);
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
            <Switch checked={gpuEnabled} onCheckedChange={setGpuEnabled} />
          </div>

          {gpuEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, borderRadius: 8, backgroundColor: colors.bg.secondary }}>
              <Select
                label="GPU model"
                placeholder="Select GPU model"
                options={[
                  { value: "v100",  label: "Tesla V100-SXM2-32GB" },
                  { value: "a100",  label: "Tesla A100-SXM4-80GB" },
                  { value: "h100",  label: "Tesla H100-80GB HBM3" },
                  { value: "l4",    label: "Tesla L4" },
                ]}
                value=""
                onChange={() => {}}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <TextField label="GPU Count" value="2" onChange={() => {}} helpMessage="/ 6" />
                <TextField label="GPU core (%)" value="50" onChange={() => {}} helpMessage="/ 100" />
                <TextField label="GPU memory (MiB)" value="510" onChange={() => {}} helpMessage="/ 32510" />
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
}

export function InferenceEndpointPage({ onNavigate, projectName = "NLP Models" }: InferenceEndpointPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("inference");
  const [endpoints, setEndpoints] = useState(SAMPLE_ENDPOINTS);
  const [selected, setSelected] = useState<InferenceEndpoint | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [query, setQuery] = useState("");

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
            { label: "Inference services", icon: <Icon name="inference_endpoint" size={20} color={colors.icon.secondary} /> },
            { label: selected ? selected.name : "Deployments" },
          ]}
        />

        {selected ? (
          <EndpointDetailView
            endpoint={selected}
            onBack={() => setSelected(null)}
            onDeployModel={() => setDeployOpen(true)}
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
