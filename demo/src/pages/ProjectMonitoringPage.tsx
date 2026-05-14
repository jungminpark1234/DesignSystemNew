import React, { useMemo, useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { TextField } from "@ds/components/TextField";
import { StatusChip } from "@ds/components/StatusChip";
import { ProgressBar } from "@ds/components/ProgressBar";
import { Table, type TableColumn } from "@ds/components/Table";
import { Tabs } from "@ds/components/Tabs";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
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
const ffMono = "'Source Code Pro', 'Roboto Mono', monospace";

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
type WorkloadType = "application" | "inference" | "direct";
type WorkloadStatus = "running" | "stopped" | "failed" | "pending";

export interface Workload {
  id: string;
  /** Matches AppItem.title (application type) or InferenceEndpoint.name (inference type). Used for deep-link from "자세히 보기". */
  name: string;
  workspace: string;
  project: string;
  /** 'direct' = kubectl/ArgoCD 등 클러스터에 직접 배포된 파드 (Workload 추상화 밖) */
  type: WorkloadType;
  status: WorkloadStatus;
  /**
   * 워크로드 생성자. 'direct' 타입은 Runway 외부에서 배포되어 식별자 없음 → null.
   */
  creator: string | null;
  creatorInitial: string | null;
  /** Number of pods backing this workload. Inference: sum of deployed deployments' replicas. */
  podCount: number;
  /**
   * Per-resource request / limit / used (K8s convention).
   * - allocated: K8s request — guaranteed minimum (used for scheduling / quota)
   * - limit:     K8s limit   — hard cap above which the kernel throttles (CPU) or OOM-kills (Memory)
   * - used:      observed runtime usage
   */
  cpu:    { allocated: number; limit: number; used: number; unit: string };
  memory: { allocated: number; limit: number; used: number; unit: string };
  disk:   { allocated: number; limit: number; used: number; unit: string };
  gpu?:   { allocated: number; limit: number; used: number; unit: string };
  /** GPU model selected at deployment time (e.g., "NVIDIA A100 80GB"). Set only when gpu is allocated. */
  gpuModel?: string;
  /** Total physical GPU count (per pod × replicas). Workload-level aggregate. */
  gpuCount?: number;
  /** Concrete UUID — only meaningful when bound to a single pod / single GPU. Multi-pod = "—". */
  gpuUuid?: string;
  /** Node placement — single node name when pinned, "—" when scheduled across nodes. */
  gpuNode?: string;
  /** GPU VRAM request/limit/used (GiB). Independent of GPU core count. */
  gpuMemory?: { allocated: number; limit: number; used: number; unit: string };
  /**
   * Inference type only — per-deployment pod breakdown.
   * Each pod row in the table belongs to a specific deployment, and the
   * "Workload" column shows the deployment name (linking back to the same
   * deployment detail for all of its replicas).
   * Total replicas should equal podCount.
   */
  deployments?: { name: string; replicas: number }[];
}

// Workload list — names match APP_ITEMS.title (application) and SAMPLE_ENDPOINTS.name (inference).
// podCount mirrors the corresponding asset's runtime topology (e.g., sum of deployed model replicas).
export const SAMPLE_WORKLOADS: Workload[] = [
  // ── Application workloads (match ApplicationPage APP_ITEMS by title) ─────────
  // Convention: limit ≈ 1.5–2× allocated (request) for CPU/Memory/Disk; GPU usually request=limit.
  { id: "w1", name: "NLP 실험 노트북", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    creator: "Jungmin Park", creatorInitial: "JP",
    podCount: 1,
    cpu:{allocated: 4, limit: 8, used: 0.5, unit:"Cores"}, memory:{allocated: 16, limit: 32, used: 8, unit:"GiB"}, disk:{allocated: 50, limit: 100, used: 30, unit:"GiB"},
    gpu:{allocated: 1, limit: 1, used: 0.7, unit:"GPUs"}, gpuModel: "NVIDIA RTX 2080 Ti",
    gpuCount: 1, gpuUuid: "GPU-a3f1c9", gpuNode: "node-04",
    gpuMemory:{allocated: 11, limit: 11, used: 7.2, unit:"GiB"} },
  { id: "w2", name: "학습 파이프라인 오케스트레이터", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    creator: "이서연", creatorInitial: "이",
    // 1 workload = 3 pods 시나리오: 같은 application의 replicas 3개가 테이블에서 동일 Workload 이름으로 3행 표시됨
    podCount: 3,
    cpu:{allocated: 6, limit: 12, used: 3.6, unit:"Cores"}, memory:{allocated: 12, limit: 24, used: 6, unit:"GiB"}, disk:{allocated: 30, limit: 60, used: 15, unit:"GiB"} },
  { id: "w3", name: "데이터 수집 스케줄러", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    creator: "이서연", creatorInitial: "이",
    podCount: 1,
    cpu:{allocated: 2, limit: 4, used: 0.4, unit:"Cores"}, memory:{allocated: 8, limit: 16, used: 2.1, unit:"GiB"}, disk:{allocated: 30, limit: 60, used: 8, unit:"GiB"} },
  { id: "w4", name: "문서 임베딩 스토어", workspace: "Data studio", project: "NLP Models", type: "application", status: "running",
    creator: "박지훈", creatorInitial: "박",
    podCount: 1,
    cpu:{allocated: 2, limit: 4, used: 1.2, unit:"Cores"}, memory:{allocated: 8, limit: 16, used: 4, unit:"GiB"}, disk:{allocated: 100, limit: 150, used: 65, unit:"GiB"} },
  { id: "w5", name: "이미지 유사도 검색 엔진", workspace: "Data studio", project: "Vision Lab", type: "application", status: "running",
    creator: "박지훈", creatorInitial: "박",
    podCount: 2,
    cpu:{allocated: 4, limit: 8, used: 2.8, unit:"Cores"}, memory:{allocated: 16, limit: 24, used: 10, unit:"GiB"}, disk:{allocated: 50, limit: 100, used: 22, unit:"GiB"},
    gpu:{allocated: 1, limit: 1, used: 0.4, unit:"GPUs"}, gpuModel: "NVIDIA A10",
    gpuCount: 1, gpuUuid: "—", gpuNode: "—",
    gpuMemory:{allocated: 24, limit: 24, used: 9.5, unit:"GiB"} },
  { id: "w6", name: "데이터 전처리 노트북", workspace: "Data studio", project: "NLP Models", type: "application", status: "stopped",
    creator: "Jungmin Park", creatorInitial: "JP",
    podCount: 0,
    cpu:{allocated: 4, limit: 8, used: 0, unit:"Cores"}, memory:{allocated: 16, limit: 32, used: 0, unit:"GiB"}, disk:{allocated: 50, limit: 100, used: 8, unit:"GiB"} },
  { id: "w7", name: "챗봇 빌더", workspace: "Data studio", project: "NLP Models", type: "application", status: "failed",
    creator: "최예진", creatorInitial: "최",
    podCount: 0,
    cpu:{allocated: 2, limit: 4, used: 0, unit:"Cores"}, memory:{allocated: 4, limit: 8, used: 0, unit:"GiB"}, disk:{allocated: 10, limit: 20, used: 0, unit:"GiB"} },

  // ── Inference workloads (match InferenceEndpointPage SAMPLE_ENDPOINTS by name) ──
  // podCount = Σ replicas of deployed deployments (see SAMPLE_DEPLOYMENTS in InferenceEndpointPage)
  { id: "w8", name: "ML Classifier Service", workspace: "Data studio", project: "NLP Models", type: "inference", status: "running",
    creator: "Jungmin Park", creatorInitial: "JP",
    // classifier-v1을 3 replicas로 두어 "1 model deployment = 3 pods" 시나리오 노출
    podCount: 5, // d1.replicas=3 + d2.replicas=1 + d3.replicas=1 (all deployed)
    cpu:{allocated: 5, limit: 8, used: 3.6, unit:"Cores"}, memory:{allocated: 10, limit: 15, used: 7, unit:"GiB"}, disk:{allocated: 25, limit: 50, used: 15, unit:"GiB"},
    gpu:{allocated: 1, limit: 1, used: 0.85, unit:"GPUs"}, gpuModel: "NVIDIA A10",
    gpuCount: 1, gpuUuid: "—", gpuNode: "—",
    gpuMemory:{allocated: 30, limit: 30, used: 24, unit:"GiB"},
    deployments: [
      { name: "classifier-v1",     replicas: 3 },
      { name: "classifier-v2",     replicas: 1 },
      { name: "classifier-canary", replicas: 1 },
    ] },
  { id: "w9", name: "Degraded Service API", workspace: "Data studio", project: "NLP Models", type: "inference", status: "running",
    creator: "Jungmin Park", creatorInitial: "JP",
    podCount: 2, // d4.replicas=2 (deployed)
    cpu:{allocated: 2, limit: 4, used: 1.5, unit:"Cores"}, memory:{allocated: 8, limit: 16, used: 5, unit:"GiB"}, disk:{allocated: 20, limit: 40, used: 10, unit:"GiB"},
    deployments: [{ name: "tagger-v1", replicas: 2 }] },
  { id: "w10", name: "Multi-Model Vision API", workspace: "Data studio", project: "Vision Lab", type: "inference", status: "running",
    creator: "박지훈", creatorInitial: "박",
    podCount: 3, // d5.replicas=2 + d6.replicas=1 (both deployed)
    cpu:{allocated: 4, limit: 6, used: 3.1, unit:"Cores"}, memory:{allocated: 16, limit: 24, used: 12, unit:"GiB"}, disk:{allocated: 30, limit: 50, used: 18, unit:"GiB"},
    gpu:{allocated: 2, limit: 2, used: 1.7, unit:"GPUs"}, gpuModel: "NVIDIA A100 40GB",
    gpuCount: 2, gpuUuid: "—", gpuNode: "—",
    gpuMemory:{allocated: 80, limit: 80, used: 68.4, unit:"GiB"},
    deployments: [
      { name: "detector-base",  replicas: 2 },
      { name: "detector-small", replicas: 1 },
    ] },
  { id: "w11", name: "Progressing Deployment API", workspace: "Recsys", project: "Personalization", type: "inference", status: "pending",
    creator: "최예진", creatorInitial: "최",
    podCount: 0, // no deployed deployments
    cpu:{allocated: 2, limit: 4, used: 0, unit:"Cores"}, memory:{allocated: 4, limit: 8, used: 0, unit:"GiB"}, disk:{allocated: 10, limit: 20, used: 0, unit:"GiB"} },
  { id: "w12", name: "Empty Endpoint (No Models)", workspace: "Recsys", project: "Personalization", type: "inference", status: "pending",
    creator: "최예진", creatorInitial: "최",
    podCount: 0, // no deployments
    cpu:{allocated: 2, limit: 4, used: 0, unit:"Cores"}, memory:{allocated: 4, limit: 8, used: 0, unit:"GiB"}, disk:{allocated: 10, limit: 20, used: 0, unit:"GiB"} },

  // ── Direct-deploy pods (kubectl / ArgoCD) ───────────────────────────────────
  // Runway 외부에서 클러스터에 직접 배포된 파드.
  // 워크로드 추상화 밖이라 워크로드명/유형/생성자 모두 "-" 로 표시되고,
  // 행 클릭 시 워크로드 상세 페이지로 진입하지 않는다.
  // PRD §1.조회 대상 — "kubectl 등을 통해 클러스터에 직접 배포된 파드도 포함"
  { id: "w13", name: "batch-job-9f2e1b-qwert", workspace: "Recsys", project: "Personalization", type: "direct", status: "running",
    creator: null, creatorInitial: null,
    podCount: 1,
    cpu:{allocated: 4, limit: 4, used: 3.9, unit:"Cores"}, memory:{allocated: 16, limit: 16, used: 15.1, unit:"GiB"}, disk:{allocated: 0, limit: 0, used: 3.4, unit:"GiB"} },
  { id: "w14", name: "argo-rollout-canary-7b3c2a-vbnmm", workspace: "Data studio", project: "Vision Lab", type: "direct", status: "running",
    creator: null, creatorInitial: null,
    podCount: 1,
    cpu:{allocated: 1, limit: 2, used: 0.4, unit:"Cores"}, memory:{allocated: 2, limit: 4, used: 1.2, unit:"GiB"}, disk:{allocated: 0, limit: 0, used: 0.5, unit:"GiB"} },
];

const WORKLOAD_STATUS_MAP: Record<WorkloadStatus, { label: string; state: "success" | "stopped" | "error" | "pending" }> = {
  running: { label: "Running",  state: "success" },
  stopped: { label: "Stopped",  state: "stopped" },
  failed:  { label: "Failed",   state: "error"   },
  pending: { label: "Pending",  state: "pending" },
};

const WORKLOAD_TYPE_LABEL: Record<WorkloadType, string> = {
  application: "애플리케이션",
  inference:   "추론 엔드포인트",
  direct:      "-",
};

// ─── Pod-level row (output of expandToPods) ──────────────────────────────────
// Each Workload fans out into N pod rows. parentName is the link target —
// for application it's the workload name; for inference it's the deployment
// name (so all replicas of the same deployment share a parent and link to
// the same deployment detail).
//
// 'direct' kind → kubectl/ArgoCD로 직접 배포된 파드. workload 추상화 밖이라
// parentWorkload는 null, parentName/creator는 '-' 로 표시되고 행 클릭은
// 비활성화된다 (PRD §4 예외 케이스).
export interface PodTableRow {
  podId: string;
  podName: string;
  workspace: string;
  project: string;
  status: WorkloadStatus;
  /** The workload this pod belongs to — used for onRowClick navigation. null for direct-deploy pods. */
  parentWorkload: Workload | null;
  /** Display name shown in the "Workload" column. '-' for direct-deploy. */
  parentName: string;
  /** Type label shown in the "워크로드 유형" column. */
  parentTypeLabel: string;
  /** "application" → links to app detail; "inference-deployment" → links to deployment detail; "direct" → no link. */
  parentKind: "application" | "inference-deployment" | "direct";
  /** For inference pods, the model deployment name (= parentName). Helpful for downstream routing. */
  deploymentName?: string;
  /** Creator label + initial. null = direct-deploy (Runway 외부). */
  creator: string | null;
  creatorInitial: string | null;
  cpu:    { allocated: number; limit: number; used: number; unit: string };
  memory: { allocated: number; limit: number; used: number; unit: string };
  disk:   { allocated: number; limit: number; used: number; unit: string };
  gpu?:   { allocated: number; limit: number; used: number; unit: string };
  gpuModel?: string;
  gpuCount?: number;
  gpuUuid?: string;
  gpuNode?: string;
  gpuMemory?: { allocated: number; limit: number; used: number; unit: string };
}

/** Deterministic short hash from a string (used for pod suffix / GPU UUIDs). */
function hashStr(s: string, len = 6): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  const chars = "0123456789abcdef";
  let out = "";
  let n = h;
  for (let i = 0; i < len; i++) { out += chars[n % chars.length]; n = Math.floor(n / chars.length); }
  return out;
}

/** Slice an aggregate resource into a per-pod portion (rounded to 1 decimal). */
function perPod(value: number, total: number): number {
  if (total <= 0) return 0;
  const v = value / total;
  return Math.round(v * 10) / 10;
}

/**
 * Expand a Workload into pod-level rows.
 * - Application: workload.podCount pods, all linking to the workload itself.
 * - Inference:   distributed across `workload.deployments` (each deployment's replicas
 *                share that deployment as their parent).
 */
export function expandToPods(w: Workload): PodTableRow[] {
  if (w.podCount === 0) return [];

  // Direct-deploy 파드는 fan-out 없이 1행. Workload.name 자체가 pod 이름.
  if (w.type === "direct") {
    return [{
      podId: `${w.id}-pod-0`,
      podName: w.name,
      workspace: w.workspace,
      project: w.project,
      status: w.status,
      parentWorkload: null,           // 워크로드 상세 페이지 없음 → 행 클릭 비활성화
      parentName: "-",                // 워크로드명 컬럼: "-"
      parentTypeLabel: "-",           // 워크로드 유형 컬럼: "-"
      parentKind: "direct",
      creator: null,
      creatorInitial: null,
      cpu:    { ...w.cpu },
      memory: { ...w.memory },
      disk:   { ...w.disk },
      gpu:    w.gpu ? { ...w.gpu } : undefined,
      gpuModel: w.gpuModel,
      gpuCount: w.gpuCount,
      gpuUuid: w.gpuUuid,
      gpuNode: w.gpuNode,
      gpuMemory: w.gpuMemory ? { ...w.gpuMemory } : undefined,
    }];
  }

  // Build a flat list of (deploymentName | null) per pod index.
  let deploymentAssignment: (string | null)[] = [];
  if (w.type === "inference" && w.deployments && w.deployments.length > 0) {
    for (const d of w.deployments) {
      for (let i = 0; i < d.replicas; i++) deploymentAssignment.push(d.name);
    }
    // Pad if replicas-sum < podCount (shouldn't happen with consistent data).
    while (deploymentAssignment.length < w.podCount) deploymentAssignment.push(w.name);
  } else {
    deploymentAssignment = Array(w.podCount).fill(null);
  }

  const total = w.podCount;
  const rows: PodTableRow[] = [];
  for (let i = 0; i < total; i++) {
    const deploymentName = deploymentAssignment[i];
    const parentName = deploymentName ?? w.name;
    const parentKind: PodTableRow["parentKind"] =
      deploymentName ? "inference-deployment" : "application";
    const parentTypeLabel = deploymentName
      ? "모델 디플로이먼트"
      : WORKLOAD_TYPE_LABEL[w.type];
    const podShortId = hashStr(`${w.id}-${i}`, 5);
    const podName = `${parentName}-${podShortId.slice(0, 3)}-${String(i).padStart(2, "0")}`;
    rows.push({
      podId: `${w.id}-pod-${i}`,
      podName,
      workspace: w.workspace,
      project: w.project,
      status: w.status,
      parentWorkload: w,
      parentName,
      parentTypeLabel,
      parentKind,
      deploymentName: deploymentName ?? undefined,
      creator: w.creator,
      creatorInitial: w.creatorInitial,
      cpu:    { allocated: perPod(w.cpu.allocated, total),    limit: perPod(w.cpu.limit, total),    used: perPod(w.cpu.used, total),    unit: w.cpu.unit },
      memory: { allocated: perPod(w.memory.allocated, total), limit: perPod(w.memory.limit, total), used: perPod(w.memory.used, total), unit: w.memory.unit },
      disk:   { allocated: perPod(w.disk.allocated, total),   limit: perPod(w.disk.limit, total),   used: perPod(w.disk.used, total),   unit: w.disk.unit },
      gpu: w.gpu
        ? { allocated: perPod(w.gpu.allocated, total), limit: perPod(w.gpu.limit, total), used: perPod(w.gpu.used, total), unit: w.gpu.unit }
        : undefined,
      gpuModel: w.gpuModel,
      gpuCount: w.gpu ? Math.max(1, Math.round((w.gpuCount ?? w.gpu.allocated) / total)) : undefined,
      // Per-pod identifiers — synthesize deterministic UUID/node from the pod id.
      gpuUuid: w.gpu ? `GPU-${hashStr(`${w.id}-uuid-${i}`, 6)}` : undefined,
      gpuNode: w.gpu ? `node-${(parseInt(hashStr(`${w.id}-node-${i}`, 4), 16) % 8) + 1}` : undefined,
      gpuMemory: w.gpuMemory
        ? { allocated: perPod(w.gpuMemory.allocated, total), limit: perPod(w.gpuMemory.limit, total), used: perPod(w.gpuMemory.used, total), unit: w.gpuMemory.unit }
        : undefined,
    });
  }
  return rows;
}

type WorkloadSortKey =
  | "name" | "podName" | "status"
  | "cpuAllocated" | "cpuLimit" | "cpuUsed" | "cpuReqRatio" | "cpuLimRatio"
  | "memAllocated" | "memLimit" | "memUsed" | "memReqRatio" | "memLimRatio"
  | "diskAllocated" | "diskLimit" | "diskUsed" | "diskReqRatio" | "diskLimRatio"
  | "gpuAllocated" | "gpuLimit" | "gpuUsed" | "gpuReqRatio" | "gpuLimRatio";

export function WorkloadsTable({ workloads, query, onRowClick, showWorkspace = false, showProject = false, showCreator = false }: {
  workloads: Workload[];
  query: string;
  /** Fired with the parent workload — multiple pod rows of the same parent all yield the same workload, so consumers can route to the same screen. Not fired for direct-deploy pods (parentWorkload is null). */
  onRowClick?: (w: Workload) => void;
  /** 워크스페이스 컬럼 표시 (Runway Admin 등) */
  showWorkspace?: boolean;
  /** 프로젝트 컬럼 표시 (Workspace Monitoring 등) */
  showProject?: boolean;
  /** 생성자 컬럼 표시 — PRD §1: 추론 엔드포인트/워크스페이스/플랫폼 관리자 뷰에서 사용 */
  showCreator?: boolean;
}) {
  const { colors } = useTheme();
  const [sort, setSort] = useState<{ key: WorkloadSortKey; dir: "asc" | "desc" }>({ key: "cpuAllocated", dir: "desc" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Fan workloads out into pod-level rows. Each row links to its parent
  // (application or model deployment). Search query matches against parent
  // name OR pod name.
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const allPods = workloads.flatMap((w) => expandToPods(w));
    let arr = allPods.filter((p) =>
      p.parentName.toLowerCase().includes(q) || p.podName.toLowerCase().includes(q)
    );
    arr.sort((a, b) => {
      const get = (p: PodTableRow): number | string => {
        const ratio = (used: number, base: number) => (base > 0 ? used / base : -1);
        switch (sort.key) {
          case "name":          return p.parentName;
          case "podName":       return p.podName;
          case "status":        return p.status;
          case "cpuAllocated":  return p.cpu.allocated;
          case "cpuLimit":      return p.cpu.limit;
          case "cpuUsed":       return p.cpu.used;
          case "cpuReqRatio":   return ratio(p.cpu.used, p.cpu.allocated);
          case "cpuLimRatio":   return ratio(p.cpu.used, p.cpu.limit);
          case "memAllocated":  return p.memory.allocated;
          case "memLimit":      return p.memory.limit;
          case "memUsed":       return p.memory.used;
          case "memReqRatio":   return ratio(p.memory.used, p.memory.allocated);
          case "memLimRatio":   return ratio(p.memory.used, p.memory.limit);
          case "diskAllocated": return p.disk.allocated;
          case "diskLimit":     return p.disk.limit;
          case "diskUsed":      return p.disk.used;
          case "diskReqRatio":  return ratio(p.disk.used, p.disk.allocated);
          case "diskLimRatio":  return ratio(p.disk.used, p.disk.limit);
          case "gpuAllocated":  return p.gpu?.allocated ?? -1;
          case "gpuLimit":      return p.gpu?.limit ?? -1;
          case "gpuUsed":       return p.gpu?.used ?? -1;
          case "gpuReqRatio":   return p.gpu ? ratio(p.gpu.used, p.gpu.allocated) : -1;
          case "gpuLimRatio":   return p.gpu ? ratio(p.gpu.used, p.gpu.limit) : -1;
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
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 3000 }}>
        <thead>
          {/* Group header */}
          <tr>
            <th rowSpan={2} style={{ ...headerBase, position: "sticky", left: 0, zIndex: 2, minWidth: 240, borderRight: groupBorder }}>Pod</th>
            <th rowSpan={2} style={headerBase}>Workload</th>
            <th rowSpan={2} style={headerBase}>워크로드 유형</th>
            {showWorkspace && <th rowSpan={2} style={headerBase}>Workspace</th>}
            {showProject && <th rowSpan={2} style={headerBase}>Project</th>}
            {showCreator && <th rowSpan={2} style={headerBase}>생성자</th>}
            <th rowSpan={2} style={{ ...headerBase, borderRight: groupBorder }}>Status</th>
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
          {/* Sub headers (sortable) */}
          <tr>
            <SortHeader k="cpuAllocated"  label="요청" />
            <SortHeader k="cpuLimit"      label="리밋" />
            <SortHeader k="cpuUsed"       label="사용" />
            <SortHeader k="cpuReqRatio"   label="요청대비" />
            <SortHeader k="cpuLimRatio"   label="리밋대비" rightBorder />
            <SortHeader k="memAllocated"  label="요청" />
            <SortHeader k="memLimit"      label="리밋" />
            <SortHeader k="memUsed"       label="사용" />
            <SortHeader k="memReqRatio"   label="요청대비" />
            <SortHeader k="memLimRatio"   label="리밋대비" rightBorder />
            <SortHeader k="diskAllocated" label="요청" />
            <SortHeader k="diskLimit"     label="리밋" />
            <SortHeader k="diskUsed"      label="사용" />
            <SortHeader k="diskReqRatio"  label="요청대비" />
            <SortHeader k="diskLimRatio"  label="리밋대비" rightBorder />
            <SortHeader k="gpuAllocated"  label="요청" />
            <SortHeader k="gpuLimit"      label="리밋" />
            <SortHeader k="gpuUsed"       label="사용" />
            <SortHeader k="gpuReqRatio"   label="요청대비" />
            <SortHeader k="gpuLimRatio"   label="리밋대비" rightBorder />
            <th style={{ ...subHeaderBase, textAlign: "right" }}>요청</th>
            <th style={{ ...subHeaderBase, textAlign: "right" }}>리밋</th>
            <th style={{ ...subHeaderBase, textAlign: "right" }}>사용</th>
            <th style={{ ...subHeaderBase, textAlign: "right" }}>요청대비</th>
            <th style={{ ...subHeaderBase, textAlign: "right" }}>리밋대비</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const st = WORKLOAD_STATUS_MAP[p.status];
            const cpuLow  = isUnderutilized(p.cpu.allocated, p.cpu.used);
            const memLow  = isUnderutilized(p.memory.allocated, p.memory.used);
            const diskLow = isUnderutilized(p.disk.allocated, p.disk.used);
            const gpuLow  = p.gpu ? isUnderutilized(p.gpu.allocated, p.gpu.used) : false;
            return (
              <tr
                key={p.podId}
                onClick={() => p.parentWorkload && onRowClick?.(p.parentWorkload)}
                style={{
                  // Direct-deploy 파드는 워크로드 상세가 없어 클릭 비활성화
                  cursor: onRowClick && p.parentWorkload ? "pointer" : "default",
                  borderTop: `1px solid ${colors.border.tertiary}`,
                }}
                onMouseEnter={(e) => {
                  if (onRowClick && p.parentWorkload) {
                    e.currentTarget.style.backgroundColor = colors.bg.secondary;
                    setHoveredId(p.podId);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  setHoveredId(null);
                }}
              >
                {/* Pod name — sticky, primary identifier for each row. */}
                <td style={{
                  ...cellBase,
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                  backgroundColor: hoveredId === p.podId ? colors.bg.secondary : colors.bg.primary,
                  borderRight: groupBorder,
                  color: colors.text.primary,
                  fontWeight: 500,
                  transition: "background-color 0.12s ease",
                }}>
                  {p.podName}
                </td>
                {/* Workload — parent (application or model deployment). Multiple pod
                    rows share the same parent; clicking any one opens the same destination.
                    Direct-deploy 파드는 워크로드 추상화가 없어 '-' 로 표시. */}
                <td style={cellBase}>
                  {p.parentKind === "direct" ? (
                    <span style={{ color: colors.text.tertiary, fontStyle: "italic" }}>-</span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Icon
                        name={p.parentKind === "application" ? "application" : "inference_endpoint"}
                        size={14}
                        color={colors.icon.secondary}
                      />
                      <span style={{ color: colors.text.secondary }}>
                        {p.parentName}
                      </span>
                    </span>
                  )}
                </td>
                {/* 워크로드 유형 — 애플리케이션 / 추론 엔드포인트 / 모델 디플로이먼트 / '-' */}
                <td style={cellBase}>
                  {p.parentKind === "direct" ? (
                    <span style={{ color: colors.text.tertiary, fontStyle: "italic" }}>-</span>
                  ) : (
                    <span style={{ color: colors.text.secondary }}>{p.parentTypeLabel}</span>
                  )}
                </td>
                {showWorkspace && <td style={{ ...cellBase, color: colors.text.secondary }}>{p.workspace}</td>}
                {showProject && <td style={{ ...cellBase, color: colors.text.secondary }}>{p.project}</td>}
                {showCreator && (
                  <td style={cellBase}>
                    {p.creator && p.creatorInitial ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8] }}>
                        <Avatar initial={p.creatorInitial} size="sm" color={getAvatarColorFromInitial(p.creatorInitial)} />
                        <span style={{ color: colors.text.secondary }}>{p.creator}</span>
                      </span>
                    ) : (
                      <span style={{ color: colors.text.tertiary, fontStyle: "italic" }}>-</span>
                    )}
                  </td>
                )}
                <td style={{ ...cellBase, borderRight: groupBorder }}><StatusChip state={st.state} size="sm" label={st.label} /></td>

                <ResCell value={p.cpu.allocated}  unit={p.cpu.unit} />
                <ResCell value={p.cpu.limit}      unit={p.cpu.unit} />
                <ResCell value={p.cpu.used}       unit={p.cpu.unit}    underutilized={cpuLow} />
                <RatioCell used={p.cpu.used} base={p.cpu.allocated} baseLabel="요청" baseValue={p.cpu.allocated} unit={p.cpu.unit} />
                <RatioCell used={p.cpu.used} base={p.cpu.limit}     baseLabel="리밋" baseValue={p.cpu.limit}     unit={p.cpu.unit} rightBorder />

                <ResCell value={p.memory.allocated} unit={p.memory.unit} />
                <ResCell value={p.memory.limit}     unit={p.memory.unit} />
                <ResCell value={p.memory.used}      unit={p.memory.unit} underutilized={memLow} />
                <RatioCell used={p.memory.used} base={p.memory.allocated} baseLabel="요청" baseValue={p.memory.allocated} unit={p.memory.unit} />
                <RatioCell used={p.memory.used} base={p.memory.limit}     baseLabel="리밋" baseValue={p.memory.limit}     unit={p.memory.unit} rightBorder />

                <ResCell value={p.disk.allocated} unit={p.disk.unit} />
                <ResCell value={p.disk.limit}     unit={p.disk.unit} />
                <ResCell value={p.disk.used}      unit={p.disk.unit}    underutilized={diskLow} />
                <RatioCell used={p.disk.used} base={p.disk.allocated} baseLabel="요청" baseValue={p.disk.allocated} unit={p.disk.unit} />
                <RatioCell used={p.disk.used} base={p.disk.limit}     baseLabel="리밋" baseValue={p.disk.limit}     unit={p.disk.unit} rightBorder />

                {p.gpu ? (
                  <>
                    {/* GPU Core group (5) */}
                    <ResCell value={p.gpu.allocated} unit={p.gpu.unit} />
                    <ResCell value={p.gpu.limit}     unit={p.gpu.unit} />
                    <ResCell value={p.gpu.used}      unit={p.gpu.unit}     underutilized={gpuLow} />
                    <RatioCell used={p.gpu.used} base={p.gpu.allocated} baseLabel="요청" baseValue={p.gpu.allocated} unit={p.gpu.unit} />
                    <RatioCell used={p.gpu.used} base={p.gpu.limit}     baseLabel="리밋" baseValue={p.gpu.limit}     unit={p.gpu.unit} rightBorder />
                    {/* GPU metadata */}
                    <td style={{ ...cellBase, color: colors.text.secondary }}>{p.gpuModel ?? "—"}</td>
                    <td style={{ ...cellBase, textAlign: "right", fontFamily: ffMono }}>{p.gpuCount ?? "—"}</td>
                    <td style={{ ...cellBase, fontFamily: ffMono, color: colors.text.secondary }}>{p.gpuUuid ?? "—"}</td>
                    <td style={{ ...cellBase, fontFamily: ffMono, borderRight: groupBorder }}>{p.gpuNode ?? "—"}</td>
                    {/* GPU Memory group (5) */}
                    {p.gpuMemory ? (
                      <>
                        <ResCell value={p.gpuMemory.allocated} unit={p.gpuMemory.unit} />
                        <ResCell value={p.gpuMemory.limit}     unit={p.gpuMemory.unit} />
                        <ResCell value={p.gpuMemory.used}      unit={p.gpuMemory.unit} />
                        <RatioCell used={p.gpuMemory.used} base={p.gpuMemory.allocated} baseLabel="요청" baseValue={p.gpuMemory.allocated} unit={p.gpuMemory.unit} />
                        <RatioCell used={p.gpuMemory.used} base={p.gpuMemory.limit}     baseLabel="리밋" baseValue={p.gpuMemory.limit}     unit={p.gpuMemory.unit} />
                      </>
                    ) : (
                      <>
                        <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                        <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                        <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                        <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                        <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>—</td>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Empty GPU Core (5) */}
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic", borderRight: groupBorder }}>N/A</td>
                    {/* Empty GPU metadata (4) */}
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, color: colors.text.tertiary, fontStyle: "italic", borderRight: groupBorder }}>N/A</td>
                    {/* Empty GPU Memory (5) */}
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                  </>
                )}
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4 /* base: Pod, Workload, 워크로드 유형, Status */ + 5 + 5 + 5 /* CPU/Mem/Disk */ + 5 /* GPU Core */ + 4 /* GPU metadata */ + 5 /* GPU Memory */ + (showWorkspace ? 1 : 0) + (showProject ? 1 : 0) + (showCreator ? 1 : 0)} style={{ ...cellBase, textAlign: "center", color: colors.text.tertiary, padding: `${spacing[32]} ${spacing[12]}` }}>
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
        <span>{filtered.length} pod(s)</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: spacing[8], color: colors.text.tertiary }}>
          <span style={{ display: "inline-block", width: spacing[8], height: spacing[8], borderRadius: borderRadius.rounded, backgroundColor: colors.bg.warning }} />
          저사용 파드 (요청 대비 사용률 10% 미만)
        </span>
      </div>
    </div>
  );
}

export function ResCell({ value, unit, underutilized = false, rightBorder = false }: { value: number | null; unit: string; underutilized?: boolean; rightBorder?: boolean }) {
  const { colors } = useTheme();
  const isNull = value === null;
  return (
    <td style={{
      padding: spacing[12],
      fontSize: body.lg.regular.fontSize,
      fontFamily: ff,
      whiteSpace: "nowrap",
      textAlign: "right",
      color: isNull ? colors.text.tertiary : underutilized ? colors.text.warning : colors.text.primary,
      fontStyle: isNull ? "italic" : undefined,
      fontWeight: underutilized && !isNull ? body.lg.semibold.fontWeight : body.lg.regular.fontWeight,
      borderRight: rightBorder ? `1px solid ${colors.border.secondary}` : undefined,
    }}>
      {isNull ? "—" : `${value} ${unit}`}
    </td>
  );
}

/**
 * Compact ratio cell — shows used/base as a percentage with a small bar.
 * - When base is 0 (no allocation): "—"
 * - When ratio > 100%: red (over-limit / bursting)
 * - When ratio < 10%: warn color (저사용)
 * - Tooltip-style title shows the absolute "used / base unit" breakdown.
 */
export function RatioCell({
  used,
  base,
  baseLabel,
  baseValue,
  unit,
  rightBorder = false,
}: {
  used: number;
  base: number | null;
  baseLabel: string;
  baseValue: number | null;
  unit: string;
  rightBorder?: boolean;
}) {
  const { colors } = useTheme();
  if (base === null || base <= 0) {
    return (
      <td style={{
        padding: spacing[12], fontSize: body.lg.regular.fontSize, fontFamily: ff,
        whiteSpace: "nowrap", textAlign: "right",
        color: colors.text.tertiary, fontStyle: "italic",
        borderRight: rightBorder ? `1px solid ${colors.border.secondary}` : undefined,
      }}>
        —
      </td>
    );
  }
  const pct = (used / base) * 100;
  const display = Math.round(pct * 10) / 10;
  // Utilization-band coloring (matches monitoring convention):
  //   < 70%: 여유 (success / green)
  //   70-90%: 주의 (warning / yellow)
  //   ≥ 90%: 임박·초과 (danger / red)
  const danger = pct >= 90;
  const warn   = pct >= 70 && pct < 90;
  const fg =
    danger ? colors.text.danger :
    warn   ? colors.text.warning :
    colors.text.success;
  const barFill =
    danger ? colors.bg.danger :
    warn   ? colors.bg.warning :
    colors.bg.success;

  return (
    <td
      title={`${baseLabel} ${baseValue} ${unit} 대비 사용 ${used} ${unit} (${display}%)`}
      style={{
        padding: spacing[12],
        fontSize: body.lg.regular.fontSize,
        fontFamily: ff,
        whiteSpace: "nowrap",
        textAlign: "right",
        color: fg,
        fontWeight: danger || warn ? body.lg.semibold.fontWeight : body.lg.regular.fontWeight,
        borderRight: rightBorder ? `1px solid ${colors.border.secondary}` : undefined,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontFamily: ffMono }}>{display}%</span>
        <span style={{
          width: 56, height: 4, borderRadius: borderRadius.rounded,
          backgroundColor: colors.bg.tertiary, overflow: "hidden",
        }}>
          <span style={{
            display: "block",
            width: `${Math.min(100, pct)}%`,
            height: "100%",
            backgroundColor: barFill,
            transition: "width 0.2s ease",
          }} />
        </span>
      </div>
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
                title="파드별 자원 사용 현황"
                hint={"프로젝트의 모든 애플리케이션 / 추론 엔드포인트 파드의 자원 요청량과 실제 사용량입니다.\n• 요청 / 사용 컬럼 헤더를 클릭해 정렬할 수 있습니다.\n• 요청 대비 사용률이 10% 미만인 셀은 주황색으로 표시되어 자원 과다할당 파드를 식별할 수 있습니다."}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                <div style={{ maxWidth: 280, flex: 1 }}>
                  <TextField
                    value={workloadQuery}
                    onChange={(e) => setWorkloadQuery(e.target.value)}
                    placeholder="파드 또는 워크로드 이름 검색..."
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
