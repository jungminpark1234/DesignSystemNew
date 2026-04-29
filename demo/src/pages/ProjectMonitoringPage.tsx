import React, { useMemo, useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { TextField } from "@ds/components/TextField";
import { StatusChip } from "@ds/components/StatusChip";
import { ProgressBar } from "@ds/components/ProgressBar";
import { Table, type TableColumn } from "@ds/components/Table";
import { Tabs } from "@ds/components/Tabs";
import { spacing, borderRadius, borderWidth } from "@ds/tokens/spacing";
import { body, fontWeight } from "@ds/tokens/typography";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { DrawerShell, SecondaryButton, PrimaryButton } from "../components/DrawerShell";
import { ResourceGuideModal } from "../components/ResourceGuideModal";
import {
  AllocationCard,
  METRICS,
  SectionTitle,
  TimeRange,
  TimeRangeRow,
  TrendChart,
  formatNow,
  isoLocalNow,
} from "./AdminMonitoringPage";

const ff = "'Pretendard', sans-serif";

// ═══════════════════════════════════════════════════════════════════════════════
// Project Sidebar header (Project LNB — matches LnbWorkspacePage 의 ProjectHeader)
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectSidebarHeader({ projectName }: { projectName: string }) {
  const { colors } = useTheme();
  return (
    <>
      {/* Workspace block — same as CatalogPage */}
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
      {/* Project context indicator — same as CatalogPage */}
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
          <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: ff }}>
            Projects
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {projectName}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Workloads (Application + Inference Endpoint) — 자원 사용 현황 테이블
// ═══════════════════════════════════════════════════════════════════════════════
type WorkloadType = "application" | "inference";
type WorkloadStatus = "running" | "stopped" | "failed" | "pending";

export interface Workload {
  id: string;
  /** Matches AppItem.title (application type) or InferenceEndpoint.name (inference type). Used for deep-link from "자세히 보기". */
  name: string;
  workspace: string;
  project: string;
  type: WorkloadType;
  status: WorkloadStatus;
  /** Number of pods backing this workload. Inference: sum of deployed deployments' replicas. */
  podCount: number;
  cpu:    { allocated: number; used: number; unit: string };
  memory: { allocated: number; used: number; unit: string };
  disk:   { allocated: number; used: number; unit: string };
  gpu?:   { allocated: number; used: number; unit: string };
  /** GPU model selected at deployment time (e.g., "NVIDIA A100 80GB"). Set only when gpu is allocated. */
  gpuModel?: string;
}

// Workload list — names match APP_ITEMS.title (application) and SAMPLE_ENDPOINTS.name (inference).
// podCount mirrors the corresponding asset's runtime topology (e.g., sum of deployed model replicas).
export const SAMPLE_WORKLOADS: Workload[] = [
  // ── Application workloads (match ApplicationPage APP_ITEMS by title) ─────────
  { id: "w1", name: "NLP 실험 노트북", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    podCount: 1,
    cpu:{allocated: 4, used: 0.5, unit:"Cores"}, memory:{allocated: 16, used: 8, unit:"GiB"}, disk:{allocated: 50, used: 30, unit:"GiB"}, gpu:{allocated: 1, used: 0.7, unit:"GPUs"}, gpuModel: "NVIDIA RTX 2080 Ti" },
  { id: "w2", name: "학습 파이프라인 오케스트레이터", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    podCount: 2,
    cpu:{allocated: 4, used: 2.5, unit:"Cores"}, memory:{allocated: 8, used: 5, unit:"GiB"}, disk:{allocated: 30, used: 15, unit:"GiB"} },
  { id: "w3", name: "데이터 수집 스케줄러", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    podCount: 1,
    cpu:{allocated: 2, used: 0.4, unit:"Cores"}, memory:{allocated: 8, used: 2.1, unit:"GiB"}, disk:{allocated: 30, used: 8, unit:"GiB"} },
  { id: "w4", name: "문서 임베딩 스토어", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    podCount: 1,
    cpu:{allocated: 2, used: 1.2, unit:"Cores"}, memory:{allocated: 8, used: 4, unit:"GiB"}, disk:{allocated: 100, used: 65, unit:"GiB"} },
  { id: "w5", name: "이미지 유사도 검색 엔진", workspace: "Data studio", project: "Vision Lab", type: "application", status: "running",
    podCount: 2,
    cpu:{allocated: 4, used: 2.8, unit:"Cores"}, memory:{allocated: 16, used: 10, unit:"GiB"}, disk:{allocated: 50, used: 22, unit:"GiB"}, gpu:{allocated: 1, used: 0.4, unit:"GPUs"}, gpuModel: "NVIDIA A10" },
  { id: "w6", name: "데이터 전처리 노트북", workspace: "Data studio", project: "NLP Models", type: "application", status: "stopped",
    podCount: 0,
    cpu:{allocated: 4, used: 0, unit:"Cores"}, memory:{allocated: 16, used: 0, unit:"GiB"}, disk:{allocated: 50, used: 8, unit:"GiB"} },
  { id: "w7", name: "챗봇 빌더", workspace: "Data studio", project: "NLP Models", type: "application", status: "failed",
    podCount: 0,
    cpu:{allocated: 2, used: 0, unit:"Cores"}, memory:{allocated: 4, used: 0, unit:"GiB"}, disk:{allocated: 10, used: 0, unit:"GiB"} },

  // ── Inference workloads (match InferenceEndpointPage SAMPLE_ENDPOINTS by name) ──
  // podCount = Σ replicas of deployed deployments (see SAMPLE_DEPLOYMENTS in InferenceEndpointPage)
  { id: "w8", name: "ML Classifier Service", workspace: "Data studio", project: "NLP Models", type: "inference", status: "running",
    podCount: 4, // d1.replicas=2 + d2.replicas=1 + d3.replicas=1 (all deployed)
    cpu:{allocated: 4, used: 3.0, unit:"Cores"}, memory:{allocated: 8, used: 6, unit:"GiB"}, disk:{allocated: 20, used: 12, unit:"GiB"}, gpu:{allocated: 1, used: 0.85, unit:"GPUs"}, gpuModel: "NVIDIA A10" },
  { id: "w9", name: "Degraded Service API", workspace: "Data studio", project: "NLP Models", type: "inference", status: "running",
    podCount: 2, // d4.replicas=2 (deployed)
    cpu:{allocated: 2, used: 1.5, unit:"Cores"}, memory:{allocated: 8, used: 5, unit:"GiB"}, disk:{allocated: 20, used: 10, unit:"GiB"} },
  { id: "w10", name: "Multi-Model Vision API", workspace: "Data studio", project: "Vision Lab", type: "inference", status: "running",
    podCount: 3, // d5.replicas=2 + d6.replicas=1 (both deployed)
    cpu:{allocated: 4, used: 3.1, unit:"Cores"}, memory:{allocated: 16, used: 12, unit:"GiB"}, disk:{allocated: 30, used: 18, unit:"GiB"}, gpu:{allocated: 2, used: 1.7, unit:"GPUs"}, gpuModel: "NVIDIA A100 40GB" },
  { id: "w11", name: "Progressing Deployment API", workspace: "Recsys", project: "Personalization", type: "inference", status: "pending",
    podCount: 0, // no deployed deployments
    cpu:{allocated: 2, used: 0, unit:"Cores"}, memory:{allocated: 4, used: 0, unit:"GiB"}, disk:{allocated: 10, used: 0, unit:"GiB"} },
  { id: "w12", name: "Empty Endpoint (No Models)", workspace: "Recsys", project: "Personalization", type: "inference", status: "pending",
    podCount: 0, // no deployments
    cpu:{allocated: 2, used: 0, unit:"Cores"}, memory:{allocated: 4, used: 0, unit:"GiB"}, disk:{allocated: 10, used: 0, unit:"GiB"} },
];

const WORKLOAD_STATUS_MAP: Record<WorkloadStatus, { label: string; state: "success" | "stopped" | "error" | "pending" }> = {
  running: { label: "Running",  state: "success" },
  stopped: { label: "Stopped",  state: "stopped" },
  failed:  { label: "Failed",   state: "error"   },
  pending: { label: "Pending",  state: "pending" },
};

const WORKLOAD_TYPE_LABEL: Record<WorkloadType, string> = {
  application: "Application",
  inference:   "Inference",
};

type WorkloadSortKey =
  | "name" | "type" | "status"
  | "cpuAllocated" | "cpuUsed"
  | "memAllocated" | "memUsed"
  | "diskAllocated" | "diskUsed"
  | "gpuAllocated" | "gpuUsed";

export function WorkloadsTable({ workloads, query, onRowClick, showWorkspace = false, showProject = false }: {
  workloads: Workload[];
  query: string;
  onRowClick?: (w: Workload) => void;
  /** 워크스페이스 컬럼 표시 (Runway Admin 등) */
  showWorkspace?: boolean;
  /** 프로젝트 컬럼 표시 (Workspace Monitoring 등) */
  showProject?: boolean;
}) {
  const { colors } = useTheme();
  const [sort, setSort] = useState<{ key: WorkloadSortKey; dir: "asc" | "desc" }>({ key: "cpuAllocated", dir: "desc" });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let arr = workloads.filter((w) => w.name.toLowerCase().includes(q));
    arr.sort((a, b) => {
      const get = (w: Workload): number | string => {
        switch (sort.key) {
          case "name":          return w.name;
          case "type":          return w.type;
          case "status":        return w.status;
          case "cpuAllocated":  return w.cpu.allocated;
          case "cpuUsed":       return w.cpu.used;
          case "memAllocated":  return w.memory.allocated;
          case "memUsed":       return w.memory.used;
          case "diskAllocated": return w.disk.allocated;
          case "diskUsed":      return w.disk.used;
          case "gpuAllocated":  return w.gpu?.allocated ?? -1;
          case "gpuUsed":       return w.gpu?.used ?? -1;
        }
      };
      const va = get(a); const vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [workloads, query, sort]);

  // 그룹 구분 border (CPU | Memory | Disk | GPU)
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
  const cellBase: React.CSSProperties = {
    padding: spacing[12],
    fontSize: body.lg.regular.fontSize,
    color: colors.text.primary,
    fontFamily: ff,
    whiteSpace: "nowrap",
  };
  const subHeaderBase: React.CSSProperties = {
    ...headerBase,
    fontSize: body.md.medium.fontSize,
    fontWeight: body.md.medium.fontWeight,
  };

  const SortHeader = ({ k, label, align = "right", rightBorder = false }: { k: WorkloadSortKey; label: string; align?: "left" | "right"; rightBorder?: boolean }) => {
    const active = sort.key === k;
    return (
      <th
        onClick={() => setSort({ key: k, dir: active && sort.dir === "asc" ? "desc" : "asc" })}
        style={{ ...subHeaderBase, cursor: "pointer", textAlign: align, userSelect: "none", borderRight: rightBorder ? groupBorder : undefined }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[4] }}>
          {label}
          <span style={{ opacity: active ? 1 : 0.3, fontSize: body.sm.regular.fontSize }}>
            {active && sort.dir === "desc" ? "▼" : "▲"}
          </span>
        </span>
      </th>
    );
  };

  /** Allocated 대비 Used 비율로 "저사용" 강조 (Used/Allocated < 0.1 이면서 Allocated > 0) */
  const isUnderutilized = (allocated: number, used: number) =>
    allocated > 0 && used / allocated < 0.1;

  return (
    <div style={{ border: `1px solid ${colors.border.tertiary}`, borderRadius: borderRadius.xl, overflow: "auto", backgroundColor: colors.bg.primary }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1200 }}>
        <thead>
          {/* Group header */}
          <tr>
            <th rowSpan={2} style={{ ...headerBase, position: "sticky", left: 0, zIndex: 2, minWidth: 220, borderRight: groupBorder }}>Workload</th>
            {showWorkspace && <th rowSpan={2} style={headerBase}>Workspace</th>}
            {showProject && <th rowSpan={2} style={headerBase}>Project</th>}
            <th rowSpan={2} style={headerBase}>Type</th>
            <th rowSpan={2} style={{ ...headerBase, borderRight: groupBorder }}>Status</th>
            <th colSpan={2} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>CPU</th>
            <th colSpan={2} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>Memory</th>
            <th colSpan={2} style={{ ...headerBase, textAlign: "center", borderRight: groupBorder }}>Disk</th>
            <th colSpan={3} style={{ ...headerBase, textAlign: "center" }}>GPU</th>
          </tr>
          {/* Sub headers (sortable) */}
          <tr>
            <SortHeader k="cpuAllocated"  label="할당됨" />
            <SortHeader k="cpuUsed"       label="사용됨" rightBorder />
            <SortHeader k="memAllocated"  label="할당됨" />
            <SortHeader k="memUsed"       label="사용됨" rightBorder />
            <SortHeader k="diskAllocated" label="할당됨" />
            <SortHeader k="diskUsed"      label="사용됨" rightBorder />
            <th style={{ ...subHeaderBase, textAlign: "left" }}>Model</th>
            <SortHeader k="gpuAllocated"  label="할당됨" />
            <SortHeader k="gpuUsed"       label="사용됨" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((w) => {
            const st = WORKLOAD_STATUS_MAP[w.status];
            const cpuLow  = isUnderutilized(w.cpu.allocated, w.cpu.used);
            const memLow  = isUnderutilized(w.memory.allocated, w.memory.used);
            const diskLow = isUnderutilized(w.disk.allocated, w.disk.used);
            const gpuLow  = w.gpu ? isUnderutilized(w.gpu.allocated, w.gpu.used) : false;
            return (
              <tr
                key={w.id}
                onClick={() => onRowClick?.(w)}
                style={{ cursor: onRowClick ? "pointer" : "default", borderTop: `1px solid ${colors.border.tertiary}` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg.secondary)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ ...cellBase, position: "sticky", left: 0, zIndex: 1, backgroundColor: "inherit", borderRight: groupBorder, fontWeight: 500 }}>
                  <span style={{ color: colors.text.interactive.runwayPrimary }}>{w.name}</span>
                </td>
                {showWorkspace && <td style={{ ...cellBase, color: colors.text.secondary }}>{w.workspace}</td>}
                {showProject && <td style={{ ...cellBase, color: colors.text.secondary }}>{w.project}</td>}
                <td style={cellBase}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8] }}>
                    <Icon
                      name={w.type === "application" ? "application" : "inference_endpoint"}
                      size={16}
                      color={colors.icon.secondary}
                    />
                    <span style={{ color: colors.text.secondary }}>{WORKLOAD_TYPE_LABEL[w.type]}</span>
                  </span>
                </td>
                <td style={{ ...cellBase, borderRight: groupBorder }}><StatusChip state={st.state} size="sm" label={st.label} /></td>

                <ResCell value={w.cpu.allocated}  unit={w.cpu.unit} />
                <ResCell value={w.cpu.used}       unit={w.cpu.unit}    underutilized={cpuLow} rightBorder />

                <ResCell value={w.memory.allocated} unit={w.memory.unit} />
                <ResCell value={w.memory.used}      unit={w.memory.unit} underutilized={memLow} rightBorder />

                <ResCell value={w.disk.allocated} unit={w.disk.unit} />
                <ResCell value={w.disk.used}      unit={w.disk.unit}    underutilized={diskLow} rightBorder />

                {w.gpu ? (
                  <>
                    <td style={{ ...cellBase, color: colors.text.secondary }}>{w.gpuModel ?? "—"}</td>
                    <ResCell value={w.gpu.allocated} unit={w.gpu.unit} />
                    <ResCell value={w.gpu.used}      unit={w.gpu.unit}     underutilized={gpuLow} />
                  </>
                ) : (
                  <>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                  </>
                )}
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={11 + (showWorkspace ? 1 : 0) + (showProject ? 1 : 0)} style={{ ...cellBase, textAlign: "center", color: colors.text.tertiary, padding: `${spacing[32]} ${spacing[12]}` }}>
                일치하는 워크로드가 없습니다.
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
        <span>{filtered.length} workload(s)</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8], color: colors.text.tertiary }}>
          <span style={{ display: "inline-block", width: spacing[8], height: spacing[8], borderRadius: borderRadius.rounded, backgroundColor: colors.bg.warning }} />
          저사용 워크로드 (할당 대비 사용률 10% 미만)
        </span>
      </div>
    </div>
  );
}

function ResCell({ value, unit, underutilized = false, rightBorder = false }: { value: number; unit: string; underutilized?: boolean; rightBorder?: boolean }) {
  const { colors } = useTheme();
  return (
    <td style={{
      padding: spacing[12],
      fontSize: body.lg.regular.fontSize,
      fontFamily: ff,
      whiteSpace: "nowrap",
      textAlign: "right",
      color: underutilized ? colors.text.warning : colors.text.primary,
      fontWeight: underutilized ? body.lg.semibold.fontWeight : body.lg.regular.fontWeight,
      borderRight: rightBorder ? `1px solid ${colors.border.secondary}` : undefined,
    }}>
      {value} {unit}
    </td>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Workload detail drawer — 1000px right-side drawer used by all monitoring pages
// ═══════════════════════════════════════════════════════════════════════════════
// ── Pod sub-resource (mock — generated deterministically from the workload) ──
type PodStatus = "Running" | "Pending" | "CrashLoopBackOff" | "Succeeded";

type PodRow = {
  name: string;
  status: PodStatus;
  node: string;
  cpu: string;
  memory: string;
  gpu: string;
  age: string;
};

function generatePods(w: Workload): PodRow[] {
  const podCount = w.podCount;
  if (podCount === 0) return [];
  const wIdNum = parseInt(w.id.replace(/\D/g, ""), 10) || 0;
  return Array.from({ length: podCount }, (_, i) => {
    const status: PodStatus =
      w.status === "pending" ? "Pending" :
      w.status === "failed" && i === 0 ? "CrashLoopBackOff" :
      w.status === "failed" ? "Pending" :
      "Running";
    const cpuAlloc = w.cpu.allocated / podCount;
    const cpuUsed  = (w.cpu.used / podCount) * (1 + i * 0.08);
    const memAlloc = w.memory.allocated / podCount;
    const memUsed  = (w.memory.used / podCount) * (1 + i * 0.08);
    const fmt = (n: number) => (n < 10 ? n.toFixed(2) : n.toFixed(1));
    return {
      name: `${w.name}-${String(i).padStart(2, "0")}`,
      status,
      node: `node-${((wIdNum + i) % 8) + 1}`,
      cpu:    `${fmt(cpuUsed)} / ${fmt(cpuAlloc)} ${w.cpu.unit}`,
      memory: `${fmt(memUsed)} / ${fmt(memAlloc)} ${w.memory.unit}`,
      gpu: w.gpu
        ? `${fmt(w.gpu.used / podCount)} / ${fmt(w.gpu.allocated / podCount)} ${w.gpu.unit}`
        : "—",
      age: `${i + 1}d ${(i * 7 + 3) % 24}h`,
    };
  });
}

const POD_STATUS_MAP: Record<PodStatus, { state: "success" | "warning" | "error" | "info"; label: string }> = {
  Running:           { state: "success", label: "Running" },
  Pending:           { state: "info",    label: "Pending" },
  CrashLoopBackOff:  { state: "error",   label: "CrashLoopBackOff" },
  Succeeded:         { state: "success", label: "Succeeded" },
};

export function WorkloadDetailDrawer({
  workload,
  onClose,
  onOpenFullPage,
}: {
  workload: Workload | null;
  onClose: () => void;
  onOpenFullPage?: (w: Workload) => void;
}) {
  const { colors } = useTheme();
  const open = !!workload;
  const w = workload;
  const st = w ? WORKLOAD_STATUS_MAP[w.status] : undefined;
  const pods = w ? generatePods(w) : [];
  const hasGpu = !!w?.gpu;

  const podColumns: TableColumn<PodRow>[] = [
    { key: "name",   label: "Pod",    minWidth: 220, flex: 1.4 },
    {
      key: "status", label: "Status", minWidth: 140,
      render: (v) => {
        const s = POD_STATUS_MAP[v as PodStatus];
        return <StatusChip state={s.state} size="sm" label={s.label} />;
      },
    },
    { key: "node",   label: "Node",   minWidth: 100 },
    { key: "cpu",    label: "CPU",    minWidth: 140, flex: 1 },
    { key: "memory", label: "Memory", minWidth: 140, flex: 1 },
    ...(hasGpu ? [{ key: "gpu" as const, label: "GPU", minWidth: 120, flex: 1 }] : []),
    { key: "age",    label: "Age",    minWidth: 80 },
  ];

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      width={1000}
      title={w ? `워크로드 · ${w.name}` : ""}
      footer={
        w && onOpenFullPage ? (
          <>
            <SecondaryButton label="닫기" onClick={onClose} />
            <PrimaryButton
              label="자세히 보기"
              onClick={() => onOpenFullPage(w)}
              icon={<Icon name="Link" size={16} color="currentColor" />}
            />
          </>
        ) : (
          <SecondaryButton label="닫기" onClick={onClose} />
        )
      }
    >
      {w && st && (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[24] }}>
          {/* Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: spacing[16],
              padding: spacing[16],
              borderRadius: borderRadius.lg,
              backgroundColor: colors.bg.secondary,
              border: `${borderWidth.sm} solid ${colors.border.tertiary}`,
            }}
          >
            <SummaryCell label="Type">
              <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8] }}>
                <Icon name={w.type === "application" ? "application" : "inference_endpoint"} size={16} color={colors.icon.secondary} />
                <span style={{ color: colors.text.primary }}>{WORKLOAD_TYPE_LABEL[w.type]}</span>
              </span>
            </SummaryCell>
            <SummaryCell label="Status">
              <StatusChip state={st.state} size="sm" label={st.label} />
            </SummaryCell>
            <SummaryCell label="Workspace">{w.workspace}</SummaryCell>
            <SummaryCell label="Project">{w.project}</SummaryCell>
          </div>

          {/* Pods */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: spacing[8] }}>
              <h3 style={{
                margin: 0,
                fontSize: body.lg.semibold.fontSize,
                fontWeight: fontWeight.semibold,
                color: colors.text.primary,
                fontFamily: ff,
              }}>
                Pods
              </h3>
              <span style={{
                fontSize: body.md.regular.fontSize,
                color: colors.text.tertiary,
                fontFamily: ff,
              }}>
                {pods.length}개
              </span>
            </div>
            {pods.length > 0 ? (
              <Table columns={podColumns} rows={pods} rowKey="name" />
            ) : (
              <div
                style={{
                  padding: spacing[24],
                  textAlign: "center",
                  fontSize: body.lg.regular.fontSize,
                  color: colors.text.tertiary,
                  fontFamily: ff,
                  border: `${borderWidth.sm} solid ${colors.border.tertiary}`,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.bg.secondary,
                }}
              >
                실행 중인 Pod가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </DrawerShell>
  );
}

function SummaryCell({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing[4], minWidth: 0 }}>
      <span style={{
        fontSize: body.sm.medium.fontSize,
        fontWeight: fontWeight.medium,
        color: colors.text.tertiary,
        fontFamily: ff,
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: body.lg.regular.fontSize,
        color: colors.text.primary,
        fontFamily: ff,
      }}>{children}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
interface ProjectMonitoringPageProps {
  onNavigate?: (key: string) => void;
  projectName?: string;
  /** 워크로드 행 클릭 시 — 해당 워크로드의 상세 페이지로 이동 */
  onSelectWorkload?: (w: { type: "application" | "inference"; name: string }) => void;
}

export function ProjectMonitoringPage({ onNavigate, projectName = "NLP Models", onSelectWorkload }: ProjectMonitoringPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("monitoring");
  const [scope, setScope] = useState<"project" | "workload">("project");
  const [timeRange, setTimeRange] = useState<TimeRange>("1W");
  const [lastRefreshed, setLastRefreshed] = useState(() => formatNow());
  const [scrolled, setScrolled] = useState(false);
  const [nodeDetailsOpen, setNodeDetailsOpen] = useState(false);

  // Custom 기본값 — 오늘 - 7일 ~ 오늘
  const [customFrom, setCustomFrom] = useState(() => isoLocalNow(-7));
  const [customTo, setCustomTo] = useState(() => isoLocalNow(0));

  const [workloadQuery, setWorkloadQuery] = useState("");
  const [selectedWorkload, setSelectedWorkload] = useState<Workload | null>(null);

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

      <WorkloadDetailDrawer
        workload={selectedWorkload}
        onClose={() => setSelectedWorkload(null)}
        onOpenFullPage={(w) => {
          setSelectedWorkload(null);
          onSelectWorkload?.({ type: w.type, name: w.name });
        }}
      />

      <Sidebar
        items={PROJECT_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={<ProjectSidebarHeader projectName={projectName} />}
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
            { label: "Monitoring" },
          ]}
        />

        {/* Page title row */}
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
              Monitor resource allocation status and usage trends of your project.
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

        {/* Scrollable content */}
        <div
          onScroll={(e) => setScrolled((e.target as HTMLDivElement).scrollTop > 0)}
          style={{ flex: 1, overflow: "auto", padding: "16px 24px 32px" }}
        >
          {/* Scope tabs (Project / Workload) */}
          <div style={{ marginBottom: 24 }}>
            <Tabs
              items={[
                { key: "project",  label: "Project" },
                { key: "workload", label: "Workload" },
              ]}
              selectedKey={scope}
              onChange={(k) => setScope(k as typeof scope)}
            />
          </div>

          {scope === "project" && (
            <>
              {/* Resource allocation */}
              <SectionTitle
                title="Resource allocation"
                hint={"Shows how project resources are allocated to applications.\n• Capacity: Total resources allocated to the project\n• Allocation rate: Resource allocation rate relative to Capacity\n• Allocated: Resources allocated to applications\n• Allocatable: Resources available for additional allocation"}
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

              {/* Resource usage trends */}
              <SectionTitle
                title="Resource usage trends"
                right={
                  <TimeRangeRow
                    value={timeRange}
                    onChange={setTimeRange}
                    customFrom={customFrom}
                    customTo={customTo}
                    onCustomFromChange={setCustomFrom}
                    onCustomToChange={setCustomTo}
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

          {scope === "workload" && (
            <div>
              <SectionTitle
                title="워크로드별 자원 사용 현황"
                hint={"프로젝트의 모든 애플리케이션 / 추론 엔드포인트의 자원 할당량과 실제 사용량입니다.\n• 할당됨 / 사용됨 컬럼 헤더를 클릭해 정렬할 수 있습니다.\n• 할당 대비 사용률이 10% 미만인 셀은 주황색으로 표시되어 자원 과다할당 워크로드를 식별할 수 있습니다."}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                <div style={{ maxWidth: 280, flex: 1 }}>
                  <TextField
                    value={workloadQuery}
                    onChange={(e) => setWorkloadQuery(e.target.value)}
                    placeholder="워크로드 이름 검색..."
                    leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
                  />
                </div>
                <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
                  행 클릭 시 해당 워크로드의 상세 모니터링으로 이동합니다
                </span>
              </div>
              <WorkloadsTable
                workloads={SAMPLE_WORKLOADS.filter((w) => w.project === projectName)}
                query={workloadQuery}
                onRowClick={(w) => setSelectedWorkload(w)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectMonitoringPage;
