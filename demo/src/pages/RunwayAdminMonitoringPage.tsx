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
import { spacing, borderRadius } from "@ds/tokens/spacing";
import { body } from "@ds/tokens/typography";
import { ResCell, RatioCell } from "./ProjectMonitoringPage";

const ff = "'Pretendard', sans-serif";
const ffMono = "'Source Code Pro', 'Roboto Mono', monospace";

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
// Platform pod table — admin-only granular view (one row per pod)
// Used by the "Workloads" scope tab. Surfaces node placement, GPU UUIDs and
// per-pod resource Used · Request · Limit triples — info workspace admins
// don't see.
// ═══════════════════════════════════════════════════════════════════════════════
type PlatformWorkloadType = "추론 엔드포인트" | "애플리케이션";

interface PlatformPodRow {
  id: string;
  node: string;
  workspace: string;
  project: string;
  /** null = standalone pod (e.g., raw batch job not bound to a workload) */
  workloadName: string | null;
  workloadType: PlatformWorkloadType | null;
  podName: string;
  /** null when standalone (system-launched) */
  creator: string | null;
  cpu:    { used: number; request: number; limit: number };
  memory: { used: number; request: number; limit: number };
  /** Disk request/limit may be unspecified (PVC-backed); render as "—" */
  disk:   { used: number; request: number | null; limit: number | null };
  /** Optional — only when the pod requests GPU */
  gpu?: {
    core:   { used: number; request: number; limit: number };
    model:  string;
    count:  number;
    uuid:   string;
    node:   string;
    memory: { used: number; request: number; limit: number };
  };
}

const SAMPLE_PLATFORM_PODS: PlatformPodRow[] = [
  { id: "p1",
    node: "node-01", workspace: "ws-alpha", project: "project-alpha",
    workloadName: "llm-serving", workloadType: "추론 엔드포인트",
    podName: "llm-serving-7d4f8b-xkqpz", creator: "김민준",
    cpu:    { used: 1.8, request: 2,  limit: 4  },
    memory: { used: 6.2, request: 8,  limit: 16 },
    disk:   { used: 2.1, request: null, limit: null },
    gpu: {
      core:   { used: 3.2, request: 4, limit: 4 },
      model:  "A100", count: 1, uuid: "GPU-3f2a1b", node: "node-01",
      memory: { used: 12.4, request: 16, limit: 16 },
    },
  },
  { id: "p2",
    node: "node-01", workspace: "ws-alpha", project: "project-alpha",
    workloadName: "data-pipeline", workloadType: "애플리케이션",
    podName: "data-pipeline-3a1c9d-plmkj", creator: "이서연",
    cpu:    { used: 0.6, request: 1, limit: 2 },
    memory: { used: 2.8, request: 4, limit: 8 },
    disk:   { used: 1.2, request: null, limit: null },
  },
  { id: "p3",
    node: "node-02", workspace: "ws-beta", project: "project-beta",
    workloadName: null, workloadType: null,
    podName: "batch-job-9f2e1b-qwert", creator: null,
    cpu:    { used: 3.9, request: 4,  limit: 4  },
    memory: { used: 15.1, request: 16, limit: 16 },
    disk:   { used: 3.4, request: null, limit: null },
  },
  { id: "p4",
    node: "node-02", workspace: "ws-alpha", project: "project-alpha",
    workloadName: "llm-serving", workloadType: "추론 엔드포인트",
    podName: "llm-serving-7d4f8b-mnxvb", creator: "김민준",
    cpu:    { used: 2.1, request: 2,  limit: 4  },
    memory: { used: 7.4, request: 8,  limit: 16 },
    disk:   { used: 2.0, request: null, limit: null },
    gpu: {
      core:   { used: 3.5, request: 4, limit: 4 },
      model:  "A100", count: 1, uuid: "GPU-9e7c4d", node: "node-02",
      memory: { used: 13.8, request: 16, limit: 16 },
    },
  },
  { id: "p5",
    node: "node-03", workspace: "ws-gamma", project: "vision-research",
    workloadName: "feature-extractor", workloadType: "애플리케이션",
    podName: "feature-extractor-2b9c4f-tlkjh", creator: "박지훈",
    cpu:    { used: 1.2, request: 2, limit: 4 },
    memory: { used: 5.6, request: 8, limit: 16 },
    disk:   { used: 0.8, request: null, limit: null },
    gpu: {
      core:   { used: 0.7, request: 1, limit: 1 },
      model:  "RTX A6000", count: 1, uuid: "GPU-c8a02f", node: "node-03",
      memory: { used: 18.2, request: 24, limit: 24 },
    },
  },
  { id: "p6",
    node: "node-03", workspace: "ws-gamma", project: "vision-research",
    workloadName: "image-tagger", workloadType: "추론 엔드포인트",
    podName: "image-tagger-4e2d1f-poiuy", creator: "최예진",
    cpu:    { used: 0.4, request: 1, limit: 2 },
    memory: { used: 1.8, request: 4, limit: 8 },
    disk:   { used: 0.5, request: null, limit: null },
  },
];

function PlatformPodsTable({ rows }: { rows: PlatformPodRow[] }) {
  const { colors } = useTheme();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const groupBorder = `1px solid ${colors.border.secondary}`;
  const headerBase: React.CSSProperties = {
    padding: `${spacing[8]} ${spacing[12]}`,
    fontSize: body.md.semibold.fontSize,
    fontWeight: body.md.semibold.fontWeight,
    color: colors.text.secondary,
    backgroundColor: colors.bg.tertiary,
    fontFamily: ff,
    textAlign: "left",
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${colors.border.tertiary}`,
  };
  const subHeaderBase: React.CSSProperties = {
    ...headerBase,
    fontSize: body.md.medium.fontSize,
    fontWeight: body.md.medium.fontWeight,
    textAlign: "right",
  };
  const cellBase: React.CSSProperties = {
    padding: spacing[12],
    fontSize: body.lg.regular.fontSize,
    color: colors.text.primary,
    fontFamily: ff,
    whiteSpace: "nowrap",
  };
  const dim = (v: string | null) =>
    v && v !== "-" ? <span>{v}</span> : <span style={{ color: colors.text.tertiary, fontStyle: "italic" }}>—</span>;

  return (
    <div style={{ border: `1px solid ${colors.border.tertiary}`, borderRadius: borderRadius.xl, overflow: "auto", backgroundColor: colors.bg.primary }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 3400 }}>
        <thead>
          {/* Group header */}
          <tr>
            <th rowSpan={2} style={{ ...headerBase, position: "sticky", left: 0, zIndex: 2, minWidth: 120, borderRight: groupBorder }}>노드</th>
            <th rowSpan={2} style={headerBase}>워크스페이스</th>
            <th rowSpan={2} style={headerBase}>프로젝트</th>
            <th rowSpan={2} style={headerBase}>워크로드</th>
            <th rowSpan={2} style={headerBase}>워크로드 유형</th>
            <th rowSpan={2} style={{ ...headerBase, borderRight: groupBorder }}>파드</th>
            <th rowSpan={2} style={{ ...headerBase, borderRight: groupBorder }}>생성자</th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>CPU</th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>Memory</th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>Disk</th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>GPU Core</th>
            <th rowSpan={2} style={headerBase}>GPU Core Model</th>
            <th rowSpan={2} style={headerBase}>GPU Core Count</th>
            <th rowSpan={2} style={headerBase}>GPU Core UUID</th>
            <th rowSpan={2} style={{ ...headerBase, borderRight: groupBorder }}>GPU Core Node</th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center" }}>GPU Memory</th>
          </tr>
          {/* Sub headers — same 요청/리밋/사용/요청대비/리밋대비 pattern as WorkloadsTable */}
          <tr>
            <th style={subHeaderBase}>요청</th>
            <th style={subHeaderBase}>리밋</th>
            <th style={subHeaderBase}>사용</th>
            <th style={subHeaderBase}>요청대비</th>
            <th style={{ ...subHeaderBase, borderRight: groupBorder }}>리밋대비</th>
            <th style={subHeaderBase}>요청</th>
            <th style={subHeaderBase}>리밋</th>
            <th style={subHeaderBase}>사용</th>
            <th style={subHeaderBase}>요청대비</th>
            <th style={{ ...subHeaderBase, borderRight: groupBorder }}>리밋대비</th>
            <th style={subHeaderBase}>요청</th>
            <th style={subHeaderBase}>리밋</th>
            <th style={subHeaderBase}>사용</th>
            <th style={subHeaderBase}>요청대비</th>
            <th style={{ ...subHeaderBase, borderRight: groupBorder }}>리밋대비</th>
            <th style={subHeaderBase}>요청</th>
            <th style={subHeaderBase}>리밋</th>
            <th style={subHeaderBase}>사용</th>
            <th style={subHeaderBase}>요청대비</th>
            <th style={{ ...subHeaderBase, borderRight: groupBorder }}>리밋대비</th>
            <th style={subHeaderBase}>요청</th>
            <th style={subHeaderBase}>리밋</th>
            <th style={subHeaderBase}>사용</th>
            <th style={subHeaderBase}>요청대비</th>
            <th style={subHeaderBase}>리밋대비</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hovered = hoveredId === r.id;
            const stickyBg = hovered ? colors.bg.secondary : colors.bg.primary;
            // Underutilization rule mirrors WorkloadsTable: used / request < 10%
            const cpuLow  = r.cpu.request > 0 && r.cpu.used / r.cpu.request < 0.1;
            const memLow  = r.memory.request > 0 && r.memory.used / r.memory.request < 0.1;
            const diskLow = r.disk.request !== null && r.disk.request > 0 && r.disk.used / r.disk.request < 0.1;
            const gpuCoreLow = r.gpu ? r.gpu.core.request > 0 && r.gpu.core.used / r.gpu.core.request < 0.1 : false;
            const gpuMemLow  = r.gpu ? r.gpu.memory.request > 0 && r.gpu.memory.used / r.gpu.memory.request < 0.1 : false;
            return (
              <tr
                key={r.id}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.secondary;
                  setHoveredId(r.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  setHoveredId(null);
                }}
                style={{ borderTop: `1px solid ${colors.border.tertiary}`, transition: "background-color 0.12s ease" }}
              >
                <td style={{
                  ...cellBase,
                  position: "sticky", left: 0, zIndex: 1,
                  backgroundColor: stickyBg,
                  borderRight: groupBorder, fontWeight: 500,
                  transition: "background-color 0.12s ease",
                }}>
                  <span style={{ fontFamily: ffMono }}>{r.node}</span>
                </td>
                <td style={cellBase}>{r.workspace}</td>
                <td style={cellBase}>{r.project}</td>
                <td style={cellBase}>{dim(r.workloadName)}</td>
                <td style={cellBase}>
                  {r.workloadType ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8] }}>
                      <Icon
                        name={r.workloadType === "애플리케이션" ? "application" : "inference_endpoint"}
                        size={16}
                        color={colors.icon.secondary}
                      />
                      <span style={{ color: colors.text.secondary }}>{r.workloadType}</span>
                    </span>
                  ) : dim(null)}
                </td>
                <td style={{ ...cellBase, borderRight: groupBorder, fontFamily: ffMono, fontSize: 12, color: colors.text.secondary }}>
                  {r.podName}
                </td>
                <td style={{ ...cellBase, borderRight: groupBorder }}>{dim(r.creator)}</td>

                {/* CPU group */}
                <ResCell value={r.cpu.request} unit="Cores" />
                <ResCell value={r.cpu.limit}   unit="Cores" />
                <ResCell value={r.cpu.used}    unit="Cores" underutilized={cpuLow} />
                <RatioCell used={r.cpu.used} base={r.cpu.request} baseLabel="요청" baseValue={r.cpu.request} unit="Cores" />
                <RatioCell used={r.cpu.used} base={r.cpu.limit}   baseLabel="리밋" baseValue={r.cpu.limit}   unit="Cores" rightBorder />

                {/* Memory group */}
                <ResCell value={r.memory.request} unit="GiB" />
                <ResCell value={r.memory.limit}   unit="GiB" />
                <ResCell value={r.memory.used}    unit="GiB" underutilized={memLow} />
                <RatioCell used={r.memory.used} base={r.memory.request} baseLabel="요청" baseValue={r.memory.request} unit="GiB" />
                <RatioCell used={r.memory.used} base={r.memory.limit}   baseLabel="리밋" baseValue={r.memory.limit}   unit="GiB" rightBorder />

                {/* Disk group — request/limit may be null (PVC-backed) */}
                <ResCell value={r.disk.request} unit="GiB" />
                <ResCell value={r.disk.limit}   unit="GiB" />
                <ResCell value={r.disk.used}    unit="GiB" underutilized={diskLow} />
                <RatioCell used={r.disk.used} base={r.disk.request} baseLabel="요청" baseValue={r.disk.request} unit="GiB" />
                <RatioCell used={r.disk.used} base={r.disk.limit}   baseLabel="리밋" baseValue={r.disk.limit}   unit="GiB" rightBorder />

                {r.gpu ? (
                  <>
                    {/* GPU Core group */}
                    <ResCell value={r.gpu.core.request} unit="GPUs" />
                    <ResCell value={r.gpu.core.limit}   unit="GPUs" />
                    <ResCell value={r.gpu.core.used}    unit="GPUs" underutilized={gpuCoreLow} />
                    <RatioCell used={r.gpu.core.used} base={r.gpu.core.request} baseLabel="요청" baseValue={r.gpu.core.request} unit="GPUs" />
                    <RatioCell used={r.gpu.core.used} base={r.gpu.core.limit}   baseLabel="리밋" baseValue={r.gpu.core.limit}   unit="GPUs" rightBorder />

                    {/* GPU metadata */}
                    <td style={cellBase}>{r.gpu.model}</td>
                    <td style={{ ...cellBase, fontFamily: ffMono }}>{r.gpu.count}</td>
                    <td style={{ ...cellBase, fontFamily: ffMono, color: colors.text.secondary }}>{r.gpu.uuid}</td>
                    <td style={{ ...cellBase, fontFamily: ffMono, borderRight: groupBorder }}>{r.gpu.node}</td>

                    {/* GPU Memory group */}
                    <ResCell value={r.gpu.memory.request} unit="GiB" />
                    <ResCell value={r.gpu.memory.limit}   unit="GiB" />
                    <ResCell value={r.gpu.memory.used}    unit="GiB" underutilized={gpuMemLow} />
                    <RatioCell used={r.gpu.memory.used} base={r.gpu.memory.request} baseLabel="요청" baseValue={r.gpu.memory.request} unit="GiB" />
                    <RatioCell used={r.gpu.memory.used} base={r.gpu.memory.limit}   baseLabel="리밋" baseValue={r.gpu.memory.limit}   unit="GiB" />
                  </>
                ) : (
                  <>
                    {/* Empty GPU Core group (5) */}
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right", borderRight: groupBorder }}>—</td>
                    {/* Empty GPU metadata (4) */}
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", borderRight: groupBorder }}>—</td>
                    {/* Empty GPU Memory group (5) */}
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", textAlign: "right" }}>—</td>
                  </>
                )}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={36 /* 7 base + 5 CPU + 5 Mem + 5 Disk + 5 GPU Core + 4 GPU meta + 5 GPU Mem */} style={{ ...cellBase, textAlign: "center", color: colors.text.tertiary, padding: `${spacing[32]} ${spacing[12]}` }}>
                일치하는 파드가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div
        style={{
          padding: `${spacing[8]} ${spacing[16]}`,
          borderTop: `1px solid ${colors.border.tertiary}`,
          fontSize: body.md.regular.fontSize,
          color: colors.text.tertiary,
          fontFamily: ff,
          backgroundColor: colors.bg.secondary,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span>{rows.length} pod(s)</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8], color: colors.text.tertiary }}>
          <span style={{ display: "inline-block", width: spacing[8], height: spacing[8], borderRadius: borderRadius.rounded, backgroundColor: colors.bg.warning }} />
          저사용 파드 (요청 대비 사용률 10% 미만)
        </span>
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
  const [scope, setScope] = useState<"cluster" | "workspace" | "workloads">("cluster");
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
          {/* Scope tabs (Cluster | Workspace | Workloads) */}
          <div style={{ marginBottom: 24 }}>
            <Tabs
              items={[
                { key: "cluster",   label: "Cluster" },
                { key: "workspace", label: "Workspace" },
                { key: "workloads", label: "Workloads" },
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

          {/* ── Workloads tab ─────────────────────────────────────────── */}
          {scope === "workloads" && (
            <>
              <SectionTitle
                title="플랫폼 워크로드 (파드 단위)"
                hint={"클러스터 전체 파드의 노드 배치·리소스 점유·GPU 할당 현황입니다.\n• 각 자원 셀은 Used · Request · Limit 순\n• 워크로드 미연결 파드(예: batch-job)는 워크로드/유형/생성자가 비어 있음\n• Disk request/limit이 PVC 기반이면 — 로 표시"}
              />
              <PlatformPodsTable rows={SAMPLE_PLATFORM_PODS} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RunwayAdminMonitoringPage;
