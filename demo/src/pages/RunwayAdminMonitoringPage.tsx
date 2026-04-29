import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { Tabs } from "@ds/components/Tabs";
import { TextField } from "@ds/components/TextField";
import { useTheme } from "../theme";
import type { SidebarNavItem } from "@ds/components/Sidebar";
import { AppGnb } from "../components/AppGnb";
import { SecondaryButton } from "../components/DrawerShell";
import { ResourceGuideModal } from "../components/ResourceGuideModal";
import {
  AllocationCard,
  METRICS,
  Metric,
  PROJECTS,
  ProjectsTable,
  QuotaCard,
  SectionTitle,
  TimeRange,
  TimeRangeRow,
  TrendChart,
  WorkloadStats,
  formatNow,
  isoLocalNow,
} from "./AdminMonitoringPage";

const ff = "'Pretendard', sans-serif";

// ─── Per-workspace workload aggregates (mock) ────────────────────────────────
// Idle = workloads using <10% of allocated resources. Surfaced for capacity reclaim.
const WORKSPACE_WORKLOAD_STATS: Record<string, WorkloadStats> = {
  "Aurora DB":     { total: 12, avgUtil: "68%", idle: 1 },
  "Cassandra":     { total: 18, avgUtil: "71%", idle: 0 },
  "Athena Query":  { total:  4, avgUtil: "12%", idle: 3 },
  "BigQuery":      { total: 22, avgUtil: "67%", idle: 2 },
  "DynamoDB":      { total:  8, avgUtil: "28%", idle: 4 },
  "ElasticSearch": { total: 14, avgUtil: "33%", idle: 5 },
  "HBase":         { total: 11, avgUtil: "55%", idle: 1 },
  "Kafka":         { total:  9, avgUtil: "48%", idle: 0 },
  "Kinesis":       { total:  6, avgUtil: "20%", idle: 2 },
  "MongoDB":       { total: 26, avgUtil: "82%", idle: 0 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Runway Admin sidebar (different from Workspace LNB)
// ═══════════════════════════════════════════════════════════════════════════════
const RUNWAY_ADMIN_NAV: SidebarNavItem[] = [
  { key: "workspaces", label: "워크스페이스", icon: <Icon name="workspace" size={20} /> },
  { key: "users",      label: "사용자",       icon: <Icon name="user" size={20} /> },
  { key: "monitoring", label: "모니터링",     icon: <Icon name="monitoring" size={20} /> },
  { key: "security",   label: "보안설정",     icon: <Icon name="setting" size={20} /> },
];

function RunwayAdminSidebarHeader() {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: 6,
          background: "linear-gradient(135deg, #4f46e5 0%, #155dfc 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <Icon name="Platform" size={16} color={colors.text.inverse} />
      </div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>
        Runway<span style={{ marginLeft: 4, fontWeight: 500, color: colors.text.secondary }}>Admin</span>
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cluster resource KPI card (Capacity 큰 숫자 + Assigned/Assignable 두 줄)
// ═══════════════════════════════════════════════════════════════════════════════
function ClusterResourceCard({
  metric,
  capacity,
  capacityUnit,
  assigned,
  assignable,
  onViewDetails,
}: {
  metric: Pick<Metric, "label" | "iconName">;
  capacity: number;
  capacityUnit: string;
  assigned: number;
  assignable: number;
  onViewDetails?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        flex: 1, minWidth: 0,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        padding: 20,
        display: "flex", flexDirection: "column", gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={metric.iconName} size={24} color={colors.icon.secondary} />
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{metric.label}</span>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontSize: 12, fontWeight: 500, color: colors.text.interactive.runwayPrimary, fontFamily: ff,
            }}
          >
            View details
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
          Capacity
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 600, color: colors.text.primary, fontFamily: ff, lineHeight: 1 }}>
            {capacity.toLocaleString()}
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
            {capacityUnit}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: `1px solid ${colors.border.tertiary}`, fontSize: 12, fontFamily: ff }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: colors.text.secondary }}>Assigned</span>
          <span style={{ color: colors.text.primary, fontWeight: 500 }}>
            {assigned.toLocaleString()} <span style={{ color: colors.text.tertiary, fontWeight: 400 }}>{capacityUnit}</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: colors.text.secondary }}>Assignable</span>
          <span style={{ color: colors.text.primary, fontWeight: 500 }}>
            {assignable.toLocaleString()} <span style={{ color: colors.text.tertiary, fontWeight: 400 }}>{capacityUnit}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
interface RunwayAdminMonitoringPageProps {
  onNavigate?: (key: string) => void;
}

export function RunwayAdminMonitoringPage({ onNavigate }: RunwayAdminMonitoringPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("monitoring");
  const [scope, setScope] = useState<"cluster" | "workspace">("cluster");
  const [timeRange, setTimeRange] = useState<TimeRange>("1H");
  const [lastRefreshed, setLastRefreshed] = useState(() => formatNow());
  const [scrolled, setScrolled] = useState(false);
  const [nodeDetailsOpen, setNodeDetailsOpen] = useState(false);
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const [customFrom, setCustomFrom] = useState(() => isoLocalNow(-7));
  const [customTo, setCustomTo] = useState(() => isoLocalNow(0));

  const handleNavSelect = (k: string) => {
    setSelectedNav(k);
    onNavigate?.(k);
  };
  const refresh = () => setLastRefreshed(formatNow());

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
      <ResourceGuideModal
        open={nodeDetailsOpen}
        onClose={() => setNodeDetailsOpen(false)}
        hideResourceAllocation
        hideBaseDomain
        hideTabs
        standalone
      />
      <Sidebar
        items={RUNWAY_ADMIN_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={<RunwayAdminSidebarHeader />}
        footer={
          <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>
            Runway v1.5.0
          </span>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppGnb
          breadcrumbs={[
            { label: "Settings", icon: <Icon name="setting" size={20} color={colors.icon.secondary} /> },
            { label: "Roles" },
            { label: "Workspace Admin" },
          ]}
        />

        {/* Page title */}
        <div
          style={{
            padding: "24px 24px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexShrink: 0,
            borderBottom: scrolled ? `1px solid ${colors.border.secondary}` : "1px solid transparent",
            transition: "border-color 0.2s ease",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, lineHeight: "32px", color: colors.text.primary, fontFamily: ff, margin: 0 }}>
              Monitoring
            </h1>
            <p style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
              View resource allocation and usage trends across your workspace.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, paddingTop: 4 }}>
            <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
              Last refreshed: {lastRefreshed}
            </span>
            <SecondaryButton
              label="Refresh"
              onClick={refresh}
              icon={<Icon name="refresh" size={16} color="currentColor" />}
              style={{ height: 32, padding: "6px 12px", fontSize: 12 }}
            />
          </div>
        </div>

        <div
          onScroll={(e) => setScrolled((e.target as HTMLDivElement).scrollTop > 0)}
          style={{ flex: 1, overflow: "auto", padding: "16px 24px 32px" }}
        >
          {/* Scope tabs (Cluster | Workspace) */}
          <div style={{ marginBottom: 24 }}>
            <Tabs
              items={[
                { key: "cluster",   label: "Cluster" },
                { key: "workspace", label: "Workspace" },
              ]}
              selectedKey={scope}
              onChange={(k) => setScope(k as typeof scope)}
            />
          </div>

          {/* ── Cluster tab ───────────────────────────────────────────── */}
          {scope === "cluster" && (
            <>
              <SectionTitle
                title="Cluster resource"
                hint={"Shows the total cluster resource capacity.\n• Node Capacity: Total physical resources in the cluster\n• System Allocated: Resources allocated for system services\n• Platform Capacity: Resources available for workspace allocation"}
              />
              <div style={{ display: "grid", gap: 16, marginBottom: 32, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <ClusterResourceCard
                  metric={{ label: "CPU", iconName: "cpu" }}
                  capacity={640} capacityUnit="core"
                  assigned={384} assignable={640}
                />
                <ClusterResourceCard
                  metric={{ label: "Memory", iconName: "memory" }}
                  capacity={2560} capacityUnit="GiB"
                  assigned={25} assignable={2116}
                />
                <ClusterResourceCard
                  metric={{ label: "Storage", iconName: "storage" }}
                  capacity={25600} capacityUnit="GiB"
                  assigned={25} assignable={2116}
                />
                <ClusterResourceCard
                  metric={{ label: "GPU", iconName: "gpu" }}
                  capacity={68} capacityUnit="GPUs"
                  assigned={56} assignable={8}
                  onViewDetails={() => setNodeDetailsOpen(true)}
                />
              </div>

              <SectionTitle
                title="Resource usage trends"
                right={
                  <TimeRangeRow
                    value={timeRange} onChange={setTimeRange}
                    customFrom={customFrom} customTo={customTo}
                    onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo}
                    onApplyCustom={refresh}
                  />
                }
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
                <TrendChart metricKey="cpu" />
                <TrendChart metricKey="memory" />
                <TrendChart metricKey="storage" />
                <TrendChart metricKey="gpu" />
              </div>
            </>
          )}

          {/* ── Workspace tab ─────────────────────────────────────────── */}
          {scope === "workspace" && (
            <>
              <SectionTitle
                title="Resource allocation"
                hint={"Shows how cluster resources are allocated to workspaces.\n• Capacity: Total resources allocated to the platform\n• Allocation rate: Resource allocation rate relative to Capacity\n• Allocated: Resources allocated to workspaces\n• Allocatable: Resources available for additional allocation"}
              />
              <div style={{ display: "grid", gap: 16, marginBottom: 32, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {METRICS.map((m) => (
                  <AllocationCard
                    key={m.key}
                    metric={m}
                    onViewDetails={m.key === "gpu" ? () => setNodeDetailsOpen(true) : undefined}
                  />
                ))}
              </div>

              <SectionTitle
                title="Quota assignment"
                hint={"Shows how workspace quotas are allocated to projects.\n• Capacity: Total quota available for project allocation\n• Assignment rate: Quota allocation rate relative to Capacity\n• Assigned: Quotas allocated to projects\n• Assignable: Quotas available for additional allocation"}
              />
              <div style={{ display: "grid", gap: 16, marginBottom: 32, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <QuotaCard metric={{ ...METRICS[0], allocated: 182, capacity: 256, allocatable: 74 }} />
                <QuotaCard metric={{ ...METRICS[1], allocated: 412, capacity: 1024, allocatable: 612 }} />
                <QuotaCard metric={{ ...METRICS[2], allocated: 46000, capacity: 50000, allocatable: 4000 }} />
                <QuotaCard metric={METRICS[3]} sharedNote="Shared among workspace using the same nodes" />
              </div>

              <SectionTitle title="Workspaces" />
              <div style={{ marginBottom: 16, maxWidth: 280 }}>
                <TextField
                  value={workspaceQuery}
                  onChange={(e) => setWorkspaceQuery(e.target.value)}
                  placeholder="Search..."
                  leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
                />
              </div>
              <ProjectsTable
                rows={PROJECTS}
                query={workspaceQuery}
                leftHeader="workspace"
                workloadStats={WORKSPACE_WORKLOAD_STATS}
                onRowClick={() => {}}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RunwayAdminMonitoringPage;
