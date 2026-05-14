import React, { useMemo, useState } from "react";
import { Icon } from "@ds/components/Icon";
import { Chip } from "@ds/components/Chip";
import { CopyButton } from "@ds/components/CopyButton";
import { Tooltip } from "@ds/components/Tooltip";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
import { Tabs } from "@ds/components/Tabs";
import { StatusChip } from "@ds/components/StatusChip";
import { Modal } from "@ds/components/Modal";
import { Drawer } from "@ds/components/Drawer";
import { Checkbox } from "@ds/components/Checkbox";
import { useTheme } from "../theme";
import {
  DetailPage,
  DetailContentWithSidebar,
  PageTitle,
} from "../components/PageLayout";
import { PrimaryButton, SecondaryButton } from "../components/DrawerShell";

const ff = "'Pretendard', sans-serif";
const ffMono = "'Roboto Mono', monospace";

// ═══════════════════════════════════════════════════════════════════════════════
// Types & demo data
// ═══════════════════════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────────────────────
// Endpoint-level audit log model.
// An endpoint hosts multiple model deployments simultaneously (canary / blue-
// green). The history therefore tracks *events* (deploy / traffic / scale /
// config / rollback / undeploy) rather than per-version snapshots.
// ─────────────────────────────────────────────────────────────────────────────
export type EventAction = "deploy" | "redeploy" | "traffic" | "scale" | "config" | "undeploy" | "rollback";
export type EventStatus = "succeeded" | "failed" | "in-progress";

export interface HistoryArtifact {
  /** Local file name produced by packaging */
  fileName: string;
  /** Human-readable size, e.g., "1.2 GB" */
  size: string;
  /** When the artifact was produced / last downloaded */
  exportedAt?: string;
  /** Whether the local artifact still exists (false → 보관 기간 만료) */
  available: boolean;
}

export interface DeploymentChange {
  /** "traffic" | "replicas" | "version" | "env.LOG_LEVEL" etc. */
  field: string;
  from: string;
  to: string;
}

/** Step kind in an auto-scaling decision sequence */
export type DecisionStepKind =
  | "observe"   // metric reading
  | "evaluate"  // window-averaged check
  | "trigger"   // scale decision made
  | "action"    // pod create / terminate started
  | "complete"  // pod ready / terminated
  | "limit";    // hit min / max boundary

export interface DecisionStep {
  /** HH:MM:SS or full timestamp */
  timestamp: string;
  kind: DecisionStepKind;
  text: string;
}

export interface DeploymentEvent {
  id: string;
  /** When the event happened */
  timestamp: string;
  action: EventAction;
  /** Target model deployment within the endpoint, e.g., "classifier-v1" */
  target: string;
  /** Model artifact version, if applicable */
  version?: string;
  /** Internal numeric build number used in the badge */
  buildNumber?: number;
  performer: string;
  performerInitial: string;
  status: EventStatus;
  /** Concise summary text shown in the row (e.g., "트래픽 20% → 0%") */
  summary: string;
  /** Per-field changes for the expanded view */
  changes?: DeploymentChange[];
  /** Local-export artifact info (deploy/redeploy events only) */
  artifact?: HistoryArtifact;
  /** Auto-scaling decision sequence (scale events only) */
  decisionTimeline?: DecisionStep[];
  /** Optional contextual note */
  note?: string;
  /**
   * K8s Deployment object identifier this event acted on. Surfaced in audit
   * detail so operators can correlate events with kubectl resources.
   */
  deploymentId?: string;
  /** Persistent Volume Claim attached to the model serving pod (storage). */
  pvc?: {
    name: string;
    /** e.g., "gp3", "io2", "rook-ceph-block" */
    storageClass?: string;
    /** Provisioned size, e.g., "20Gi". */
    size: string;
    /** e.g., "ReadWriteOnce", "ReadWriteMany". */
    accessMode?: string;
  };
  /**
   * Full configuration snapshot at deploy time — surfaced in the expanded
   * detail view as grouped sections with per-field clipboard copy buttons.
   * Required for `deploy` / `redeploy` events; optional for partial-change
   * events (traffic / scale / config) which display per-field diffs instead.
   * PRD §3.2.2 — operators copy these values into the new-deploy form to
   * recreate the same environment.
   */
  snapshot?: DeploymentConfigSnapshot;
}

/**
 * Captured "박제" of the deployment configuration at a single point in time.
 * Grouped exactly as the PRD §3.2.2 spec defines so the UI can render each
 * group as a card section without further mapping.
 */
export interface DeploymentConfigSnapshot {
  /** 기본 정보 */
  basic: {
    deploymentName: string;
    deploymentId: string;
    description?: string;
  };
  /** 모델 소스 */
  modelSource: {
    volume?: string;
    modelPath?: string;
  };
  /** 컴퓨팅 리소스 */
  compute: {
    cpuMillicores: number;
    memoryMiB: number;
    gpuModel?: string;
    gpuCount?: number;
    gpuCorePct?: number;
    gpuMemoryMiB?: number;
  };
  /** 고급 설정 */
  advanced: {
    sharedMemoryPath?: string;
    sharedMemoryMiB?: number;
  };
  /** 스케일링 — 라이브 디테일 페이지의 ScalingPolicyView와 동일한 정보 노출. */
  scaling: ScalingPolicy;
  /** 트래픽 설정 */
  traffic: {
    /** 사용자가 입력한 가중치 (정규화 전 원시 비율) */
    weight: number;
    /** 정규화 후 실제 라우팅되는 트래픽 % — 모델 상세의 Effective Traffic과 동일 의미 */
    effective: number;
  };
  /** 배포 메타데이터 (수행자/시각/결과는 이벤트에서 가져오므로 여기엔 보조 정보만) */
  meta?: {
    /** 수행자 이메일 (배포 메타데이터 §3.2.2). */
    performerEmail?: string;
    /** 완료 시각 — 시작 시각은 event.timestamp 사용. */
    completedAt?: string;
  };
}

export type ScalingMode = "manual" | "auto";
/** Resource-based scaling metrics (자원 기반 — OR 조건으로 다중 선택 가능) */
export type ScalingMetricType = "cpu" | "memory" | "gpu" | "gpu-mem";
export type ScalingMetricUnit = "%";
export type ScalingStatus = "scaling-up" | "scaling-down" | "at-limit" | "quota-exceeded" | "metric-stalled" | null;
export type StabilizationPreset = "conservative" | "balanced" | "aggressive";

export interface ScalingPolicy {
  mode: ScalingMode;
  /** Manual: fixed pod count. Auto: desired (between min/max). */
  replicas: number;
  /** Auto only — hard floor (min ≥ 1). */
  minReplicas?: number;
  /** Auto only — hard ceiling. */
  maxReplicas?: number;
  /** Auto only — metric targets that trigger scaling (OR 조건: any exceeds → scale-up). */
  targets?: Array<{ type: ScalingMetricType; value: number; unit: ScalingMetricUnit }>;
  /** Auto only — stabilization preset (cooldown / scale-down 안정화 윈도우). */
  stabilization?: StabilizationPreset;
  /** Auto only — most recent observed metric reading (live indicator). type matches one of the targets. */
  observed?: { type: ScalingMetricType; value: number; trend: "rising" | "falling" | "stable" };
  /** Optional — last scale event timestamp (for "Updated X ago" display). */
  lastScaledAt?: string;
}

export interface ActiveDeployment {
  /** Logical deployment name within the endpoint, e.g., "classifier-v1" */
  name: string;
  version: string;
  buildNumber: number;
  /** User-configured weight (relative ratio). System normalizes weights → trafficPct. */
  trafficWeight: number;
  trafficPct: number;
  /** Currently running pods (may differ from policy.replicas while scaling). */
  currentPods: number;
  /** Scaling policy snapshot. */
  scaling: ScalingPolicy;
  /** Transient scaling state badge (null = healthy). */
  scalingStatus: ScalingStatus;
  deployedAt: string;
  performer: string;
  performerInitial: string;
}

/**
 * Captured state of all active deployments at a point in time.
 * Replaces event-history-based rollback — operators take explicit snapshots
 * before risky changes and revert to one if needed.
 */
export interface DeploymentSnapshot {
  id: string;
  takenAt: string;
  takenBy: string;
  takenByInitial: string;
  /** Optional human label (e.g., "v1 100%", "before canary rollout") */
  label?: string;
  /** Captured `ActiveDeployment[]` at snapshot time */
  deployments: ActiveDeployment[];
}

export interface DeploymentDetail {
  // Sidebar meta
  deploymentName: string;
  deploymentId: string;
  deployed: boolean;
  createdBy: string;
  createdByInitial: string;
  createdAt: string;
  // Model source
  volume: string;
  modelPath: string;
  // Compute
  cpu: string;
  memory: string;
  sharedMemMountPath: string;
  sharedMemSize: string;
  gpuTypes: string[];
  gpuCount: string;
  gpuCorePct: string;
  gpuMemMib: string;
  // Scaling — full auto/manual policy
  scaling: ScalingPolicy;
  // Traffic
  trafficWeight: number;
  effectiveTraffic: number;
  // API
  apiUrl: string;
}

const DEMO_REQUEST_BODY = `{
  "inputs": [
    {
      "name": "input_ids",
      "shape": [1, 128],
      "datatype": "INT64",
      "data": [[101, 2023, 2003, 1037, 3231, 102, 0, 0]]
    },
    {
      "name": "attention_mask",
      "shape": [1, 128],
      "datatype": "INT64",
      "data": [[1, 1, 1, 1, 1, 1, 0, 0]]
    }
  ],
  "outputs": [{ "name": "output_0" }]
}`;

const DEMO_RESPONSE_BODY = `{
  "model_name": "wine-quality-predictor",
  "model_version": "1",
  "outputs": [
    {
      "name": "output_0",
      "shape": [
        1,
        2
      ],
      "datatype": "FP32",
      "data": [
        0.147382,
        0.852618
      ]
    }
  ]
}`;

export const DEMO_DEPLOYMENT_DETAIL: DeploymentDetail = {
  deploymentName: "ML Classifier Service",
  deploymentId: "empty-endpoint-no-models",
  deployed: true,
  createdBy: "Jungmin Park",
  createdByInitial: "JP",
  createdAt: "2025-01-22 17:00:00",
  volume: "ml-training-service",
  modelPath: "/mnt/models/wine-quality-predictor",
  cpu: "4000",
  memory: "8192",
  sharedMemMountPath: "/dev/shm",
  sharedMemSize: "64",
  gpuTypes: [
    "Tesla V100-SXM2-32GB * 3 (Black-cow-1)",
    "Tesla L4 * 2 (Black-cow-1)",
    "Tesla L4 * 2 (Black-cow-2)",
    "Tesla V100-SXM2-32GB * 1 (Black-cow-3)",
  ],
  gpuCount: "2",
  gpuCorePct: "50",
  gpuMemMib: "512",
  scaling: {
    mode: "auto",
    replicas: 2,
    minReplicas: 1,
    maxReplicas: 5,
    targets: [{ type: "gpu", value: 70, unit: "%" }],
    stabilization: "balanced",
    observed: { type: "gpu", value: 82, trend: "rising" },
    lastScaledAt: "2025-01-22 13:45:08",
  },
  trafficWeight: 3,
  effectiveTraffic: 75,
  apiUrl:
    "https://inference.example.com/aidev-nlp-models/sklearn-classifier/randomforest-classifier/v2/models/default/infer",
};

// Three model deployments running concurrently with traffic split + per-deployment scaling.
// Reflects the existing endpoint table (classifier-v1 70 / v2 0 / canary 10).
export const DEMO_ACTIVE_DEPLOYMENTS: ActiveDeployment[] = [
  // Weights 70/0/10 normalize to ~87.5/0/12.5%, but demo keeps the raw % for narrative continuity
  // (existing audit log events reference 70%, 100%→70%, etc.)
  {
    name: "classifier-v1",     version: "v1.4.2", buildNumber: 74,
    trafficWeight: 70, trafficPct: 70, currentPods: 2,
    scaling: { mode: "auto", replicas: 2, minReplicas: 1, maxReplicas: 5, targets: [{ type: "gpu", value: 70, unit: "%" }], stabilization: "balanced", observed: { type: "gpu", value: 82, trend: "rising" }, lastScaledAt: "2025-01-22 13:45:08" },
    scalingStatus: null,
    deployedAt: "2024-10-07 15:31:53", performer: "Jungmin Park", performerInitial: "JP",
  },
  {
    name: "classifier-v2",     version: "v2.0.0", buildNumber: 52,
    trafficWeight: 0, trafficPct: 0, currentPods: 1,
    scaling: { mode: "manual", replicas: 1 },
    scalingStatus: null,
    deployedAt: "2024-12-15 09:15:30", performer: "Jungmin Park", performerInitial: "JP",
  },
  {
    name: "classifier-canary", version: "v0.1.0", buildNumber: 41,
    trafficWeight: 10, trafficPct: 10, currentPods: 3,
    scaling: { mode: "auto", replicas: 3, minReplicas: 1, maxReplicas: 3, targets: [{ type: "gpu-mem", value: 85, unit: "%" }], stabilization: "aggressive", observed: { type: "gpu-mem", value: 95, trend: "rising" }, lastScaledAt: "2025-01-22 14:00:12" },
    scalingStatus: "at-limit",
    deployedAt: "2025-01-15 14:32:11", performer: "Jungmin Park", performerInitial: "JP",
  },
];

// Audit log of operations performed against the endpoint over time (latest first).
export const DEMO_EVENTS: DeploymentEvent[] = [
  {
    id: "e1", timestamp: "2025-01-22 17:00:00",
    action: "traffic", target: "classifier-v2",
    performer: "Jungmin Park", performerInitial: "JP",
    status: "succeeded",
    summary: "트래픽 20% → 0%",
    changes: [{ field: "traffic", from: "20%", to: "0%" }],
    note: "품질 회귀 발견 — 배포는 유지하되 트래픽 차단.",
  },
  {
    id: "es-canary", timestamp: "2025-01-22 14:00:12",
    action: "scale", target: "classifier-canary",
    performer: "system", performerInitial: "SY",
    status: "succeeded",
    summary: "auto · 파드 2 → 3 (GPU 메모리 95%, Max 한도)",
    changes: [{ field: "pods", from: "2", to: "3" }, { field: "trigger", from: "—", to: "GPU 메모리 95% (target 85%)" }],
    note: "최대치 도달 — 추가 부하는 큐잉됩니다.",
    decisionTimeline: [
      { timestamp: "13:59:42", kind: "observe",  text: "GPU 메모리 80% · scale-up 102%(capped 100) 미달 → 대기" },
      { timestamp: "13:59:55", kind: "observe",  text: "GPU 메모리 92% · 임계치 접근 (target 85% 초과)" },
      { timestamp: "14:00:01", kind: "observe",  text: "GPU 메모리 95% · 지속 상승" },
      { timestamp: "14:00:08", kind: "evaluate", text: "30s 평균 94% > target 85% × 1.2 임계치 ✓ (Aggressive · 30s up window)" },
      { timestamp: "14:00:12", kind: "trigger",  text: "Scale-up 결정 — pod 2 → 3" },
      { timestamp: "14:00:13", kind: "action",   text: "신규 pod (canary-pod-3) 생성 시작" },
      { timestamp: "14:00:25", kind: "complete", text: "canary-pod-3 ready (12s) — 트래픽 분배 완료" },
      { timestamp: "14:00:25", kind: "limit",    text: "At Limit · max 3 도달, 추가 확장 차단" },
    ],
  },
  {
    id: "es-v1", timestamp: "2025-01-22 13:45:08",
    action: "scale", target: "classifier-v1",
    performer: "system", performerInitial: "SY",
    status: "succeeded",
    summary: "auto · 파드 1 → 2 (GPU 82%)",
    changes: [{ field: "pods", from: "1", to: "2" }, { field: "trigger", from: "—", to: "GPU 82% (target 70%)" }],
    decisionTimeline: [
      { timestamp: "13:44:32", kind: "observe",  text: "GPU 76% · scale-up 84% 미달 → 대기" },
      { timestamp: "13:44:48", kind: "observe",  text: "GPU 80% · 임계치 접근" },
      { timestamp: "13:45:00", kind: "observe",  text: "GPU 84% · 임계치 도달 (60s 윈도우 평균 측정 시작)" },
      { timestamp: "13:45:08", kind: "evaluate", text: "60s 평균 86% > scale-up 84% ✓ (Balanced · 60s up window)" },
      { timestamp: "13:45:08", kind: "trigger",  text: "Scale-up 결정 — pod 1 → 2" },
      { timestamp: "13:45:09", kind: "action",   text: "신규 pod (v1-pod-2) 생성 시작" },
      { timestamp: "13:45:23", kind: "complete", text: "v1-pod-2 ready (14s) — 트래픽 분배 완료" },
    ],
  },
  {
    id: "ep-canary", timestamp: "2025-01-15 14:32:11",
    action: "config", target: "classifier-canary",
    performer: "Jungmin Park", performerInitial: "JP",
    status: "succeeded",
    summary: "오토스케일링 정책 활성화 (Min 1 / Max 3 / GPU 메모리 85%)",
    changes: [
      { field: "scaling.mode",        from: "manual",  to: "auto"          },
      { field: "scaling.minReplicas", from: "—",      to: "1"             },
      { field: "scaling.maxReplicas", from: "—",      to: "3"             },
      { field: "scaling.targets",     from: "—",      to: "GPU 메모리 85%" },
    ],
  },
  {
    id: "e2", timestamp: "2025-01-15 14:32:11",
    action: "deploy", target: "classifier-canary", version: "v0.1.0", buildNumber: 41,
    performer: "Jungmin Park", performerInitial: "JP",
    status: "succeeded",
    summary: "신규 배포 (v0.1.0, 트래픽 10%)",
    changes: [
      { field: "version",  from: "—", to: "v0.1.0" },
      { field: "traffic",  from: "—", to: "10%"   },
      { field: "replicas", from: "—", to: "1"     },
    ],
    artifact: { fileName: "classifier-canary-v0.1.0.tar", size: "1.2 GB", exportedAt: "2025-01-15 14:35:08", available: true },
    deploymentId: "dep-c4n9r1",
    pvc: { name: "classifier-canary-pvc", storageClass: "gp3", size: "20Gi", accessMode: "ReadWriteOnce" },
    snapshot: {
      basic: { deploymentName: "classifier-canary", deploymentId: "dep-c4n9r1", description: "Canary 트래픽 분배 검증용 작은 모델." },
      modelSource: { volume: "models-staging-volume", modelPath: "/mnt/models/classifier-canary" },
      compute: { cpuMillicores: 2000, memoryMiB: 4096, gpuModel: "NVIDIA A10", gpuCount: 1, gpuCorePct: 50, gpuMemoryMiB: 12288 },
      advanced: { sharedMemoryPath: "/dev/shm", sharedMemoryMiB: 512 },
      scaling: {
        mode: "auto",
        replicas: 1,
        minReplicas: 1,
        maxReplicas: 3,
        targets: [{ type: "gpu-mem", value: 85, unit: "%" }],
        stabilization: "aggressive",
      },
      traffic: { weight: 10, effective: 10 },
      meta: { performerEmail: "jungmin@makinarocks.ai", completedAt: "2025-01-15 14:35:08" },
    },
  },
  {
    id: "e3", timestamp: "2024-12-15 09:15:30",
    action: "deploy", target: "classifier-v2", version: "v2.0.0", buildNumber: 52,
    performer: "Jungmin Park", performerInitial: "JP",
    status: "succeeded",
    summary: "신규 배포 (v2.0.0, 트래픽 30%)",
    changes: [
      { field: "version",  from: "—", to: "v2.0.0" },
      { field: "traffic",  from: "—", to: "30%"   },
      { field: "replicas", from: "—", to: "1"     },
    ],
    artifact: { fileName: "classifier-v2-v2.0.0.tar", size: "1.4 GB", exportedAt: "2024-12-15 09:20:18", available: true },
    deploymentId: "dep-v2a8e3",
    pvc: { name: "classifier-v2-pvc", storageClass: "gp3", size: "30Gi", accessMode: "ReadWriteOnce" },
    snapshot: {
      basic: { deploymentName: "classifier-v2", deploymentId: "dep-v2a8e3", description: "분류 정확도 개선을 위한 v2 신규 배포." },
      modelSource: { volume: "models-prod-volume", modelPath: "/mnt/models/classifier-v2" },
      compute: { cpuMillicores: 4000, memoryMiB: 8192, gpuModel: "NVIDIA A10", gpuCount: 1, gpuCorePct: 70, gpuMemoryMiB: 16384 },
      advanced: { sharedMemoryPath: "/dev/shm", sharedMemoryMiB: 1024 },
      scaling: { mode: "manual", replicas: 1 },
      traffic: { weight: 30, effective: 30 },
      meta: { performerEmail: "jungmin@makinarocks.ai", completedAt: "2024-12-15 09:20:18" },
    },
  },
  {
    id: "e4", timestamp: "2024-12-15 09:15:30",
    action: "traffic", target: "classifier-v1",
    performer: "Jungmin Park", performerInitial: "JP",
    status: "succeeded",
    summary: "트래픽 100% → 70%",
    changes: [{ field: "traffic", from: "100%", to: "70%" }],
    note: "classifier-v2 신규 배포에 따른 트래픽 분배.",
  },
  {
    id: "e6", timestamp: "2024-10-12 16:30:08",
    action: "redeploy", target: "classifier-v1", version: "v1.5.0",
    performer: "Jungmin Park", performerInitial: "JP",
    status: "failed",
    summary: "재배포 실패 (v1.5.0)",
    note: "P99 지연 상승, 자동 헬스체크 실패로 빌드 롤아웃 중단.",
    deploymentId: "dep-v1f4b7",
    pvc: { name: "classifier-v1-pvc", storageClass: "gp3", size: "20Gi", accessMode: "ReadWriteOnce" },
  },
  {
    id: "e7", timestamp: "2024-10-07 15:31:53",
    action: "deploy", target: "classifier-v1", version: "v1.3.5", buildNumber: 60,
    performer: "Soyeon Kim", performerInitial: "SK",
    status: "succeeded",
    summary: "초기 배포 (v1.3.5, 트래픽 100%)",
    changes: [
      { field: "version",  from: "—", to: "v1.3.5" },
      { field: "traffic",  from: "—", to: "100%"  },
      { field: "replicas", from: "—", to: "2"     },
    ],
    artifact: { fileName: "classifier-v1-v1.3.5.tar", size: "1.0 GB", exportedAt: "2024-10-07 15:35:01", available: true },
    deploymentId: "dep-v1a2c8",
    pvc: { name: "classifier-v1-pvc", storageClass: "gp3", size: "20Gi", accessMode: "ReadWriteOnce" },
    snapshot: {
      basic: { deploymentName: "classifier-v1", deploymentId: "dep-v1a2c8", description: "초기 분류 모델 배포 (안정 버전)." },
      modelSource: { volume: "models-prod-volume", modelPath: "/mnt/models/classifier-v1" },
      compute: { cpuMillicores: 4000, memoryMiB: 8192, gpuModel: "NVIDIA A10", gpuCount: 1, gpuCorePct: 80, gpuMemoryMiB: 16384 },
      advanced: { sharedMemoryPath: "/dev/shm", sharedMemoryMiB: 1024 },
      scaling: {
        mode: "auto",
        replicas: 2,
        minReplicas: 1,
        maxReplicas: 5,
        targets: [{ type: "gpu", value: 70, unit: "%" }],
        stabilization: "balanced",
      },
      traffic: { weight: 100, effective: 100 },
      meta: { performerEmail: "soyeon@makinarocks.ai", completedAt: "2024-10-07 15:35:01" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Local primitives
// ═══════════════════════════════════════════════════════════════════════════════
function SectionHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 32,
      }}
    >
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: ff,
          margin: 0,
          lineHeight: "20px",
        }}
      >
        {title}
      </h2>
      {actions}
    </div>
  );
}

function SectionCard({
  title,
  actions,
  bordered = true,
  titleGap = 16,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  bordered?: boolean;
  /** Header(타이틀)와 본문 카드 사이 간격. 기본 16, 스냅샷 등 컴팩트 영역에선 8 사용. */
  titleGap?: number;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: titleGap }}>
      <SectionHeader title={title} actions={actions} />
      {bordered ? (
        <div
          style={{
            border: `1px solid ${colors.border.tertiary}`,
            borderRadius: 12,
            backgroundColor: colors.bg.primary,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function EditButton({ onClick }: { onClick?: () => void }) {
  return (
    <SecondaryButton
      label="Edit"
      onClick={onClick}
      icon={<Icon name="edit" size={16} color="currentColor" />}
      style={{ height: 32, padding: "6px 12px", fontSize: 13 }}
    />
  );
}

function HelpIcon({ tip }: { tip: string }) {
  const { colors } = useTheme();
  return (
    <Tooltip content={tip} direction="above-center">
      <span style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}>
        <Icon name="help-circle-stroke" size={14} color={colors.icon.tertiary} />
      </span>
    </Tooltip>
  );
}

// "Label  [value]  unit" — used in Compute Resources / GPU stats
function InlineKv({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontSize: 13,
          color: colors.text.secondary,
          fontFamily: ff,
          lineHeight: "20px",
        }}
      >
        {label}
      </span>
      <Chip label={value} size="sm" />
      {unit && (
        <span
          style={{
            fontSize: 12,
            color: colors.text.tertiary,
            fontFamily: ff,
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}

// Two-column row: fixed-width label + value
function KvRow({
  label,
  children,
  align = "center",
  labelWidth = 124,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "center" | "start";
  labelWidth?: number;
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: align === "start" ? "flex-start" : "center",
        minHeight: 24,
        gap: 8,
      }}
    >
      <div
        style={{
          width: labelWidth,
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 500,
          color: colors.text.primary,
          fontFamily: ff,
          lineHeight: "20px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          color: colors.text.primary,
          fontFamily: ff,
          lineHeight: "20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: colors.text.secondary,
          fontFamily: ff,
          lineHeight: "20px",
        }}
      >
        {label}
      </span>
      <div
        style={{
          fontSize: 13,
          color: colors.text.primary,
          fontFamily: ff,
          lineHeight: "20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-views: Direct API Access (request URL + req/resp panes + send)
// ═══════════════════════════════════════════════════════════════════════════════
function SendSpinner({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "ds-deploy-spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes ds-deploy-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CodePane({
  label,
  badge,
  badgeTone = "success",
  value,
  editable,
  onChange,
  actions,
}: {
  label: string;
  badge?: string;
  badgeTone?: "success" | "danger";
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  actions?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const badgeBg = badgeTone === "danger" ? colors.bg.dangerSubtle : colors.bg.successSubtle;
  const badgeText = badgeTone === "danger" ? colors.text.danger : colors.text.success;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: colors.text.primary,
            fontFamily: ff,
          }}
        >
          {label}
        </span>
        {badge && (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: badgeBg,
              color: badgeText,
              fontFamily: ffMono,
              fontSize: 11,
              fontWeight: 600,
              lineHeight: "14px",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div
        style={{
          position: "relative",
          border: `1px solid ${colors.border.tertiary}`,
          borderRadius: 8,
          backgroundColor: colors.bg.primary,
          minHeight: 280,
        }}
      >
        {editable ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 280,
              padding: "12px 40px 12px 12px",
              border: "none",
              outline: "none",
              resize: "vertical",
              backgroundColor: "transparent",
              fontFamily: ffMono,
              fontSize: 12,
              lineHeight: "18px",
              color: colors.text.primary,
              boxSizing: "border-box",
            }}
          />
        ) : (
          <pre
            style={{
              margin: 0,
              padding: "12px 40px 12px 12px",
              fontFamily: ffMono,
              fontSize: 12,
              lineHeight: "18px",
              color: colors.text.primary,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {value}
          </pre>
        )}
        <div style={{ position: "absolute", top: 8, right: 8 }}>{actions}</div>
      </div>
    </div>
  );
}

function DirectApiAccessSection({ apiUrl }: { apiUrl: string }) {
  const { colors } = useTheme();
  const [requestBody, setRequestBody] = useState(DEMO_REQUEST_BODY);
  const [responseBody, setResponseBody] = useState(DEMO_RESPONSE_BODY);
  const [responseStatus, setResponseStatus] = useState<{ code: number; label: string }>({
    code: 200,
    label: "200 OK",
  });
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (loading) return;
    setLoading(true);
    // Simulate inference latency. Parse the request body and produce a plausible mock response.
    window.setTimeout(() => {
      try {
        const parsed = JSON.parse(requestBody);
        const inputs = Array.isArray(parsed?.inputs) ? parsed.inputs : [];
        const firstRow = inputs[0]?.data?.[0];
        const seed = Array.isArray(firstRow) && typeof firstRow[0] === "number"
          ? Math.abs(firstRow[0]) % 1000
          : 137;
        const a = Math.min(0.999, Math.max(0.001, ((seed * 0.000914 + 0.13) % 1)));
        const b = 1 - a;
        const mock = {
          model_name: "wine-quality-predictor",
          model_version: "1",
          outputs: [
            {
              name: "output_0",
              shape: [1, 2],
              datatype: "FP32",
              data: [Number(a.toFixed(6)), Number(b.toFixed(6))],
            },
          ],
          request_id: `req_${Date.now().toString(36)}`,
        };
        setResponseBody(JSON.stringify(mock, null, 2));
        setResponseStatus({ code: 200, label: "200 OK" });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to parse request body";
        setResponseBody(JSON.stringify({ error: "InvalidRequestBody", message }, null, 2));
        setResponseStatus({ code: 400, label: "400 Bad Request" });
      }
      setLoading(false);
    }, 600);
  };

  const responseTone: "success" | "danger" = responseStatus.code >= 400 ? "danger" : "success";

  return (
    <SectionCard title="Direct API Access" bordered={false}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Request URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: colors.text.primary,
              fontFamily: ff,
            }}
          >
            Request URL
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              border: `1px solid ${colors.bg.success}`,
              backgroundColor: colors.bg.successSubtle,
              borderRadius: 8,
            }}
          >
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                backgroundColor: colors.bg.success,
                color: "#ffffff",
                fontFamily: ffMono,
                fontSize: 11,
                fontWeight: 600,
                lineHeight: "14px",
                flexShrink: 0,
              }}
            >
              POST
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: ffMono,
                color: colors.text.primary,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {apiUrl}
            </span>
            <CopyButton text={apiUrl} size={24} iconSize={16} />
          </div>
        </div>

        {/* Request body / Response side-by-side */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <CodePane
            label="Request Body"
            value={requestBody}
            editable
            onChange={setRequestBody}
            actions={
              <button
                aria-label="Reset request body"
                onClick={() => setRequestBody(DEMO_REQUEST_BODY)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <Icon name="reset" size={16} color={colors.icon.secondary} />
              </button>
            }
          />
          <CodePane
            label="Response"
            badge={responseStatus.label}
            badgeTone={responseTone}
            value={responseBody}
            actions={<CopyButton text={responseBody} size={24} iconSize={16} />}
          />
        </div>

        {/* Send Request — center */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SecondaryButton
            label={loading ? "Sending..." : "Send Request"}
            onClick={handleSend}
            icon={
              loading ? (
                <SendSpinner color={colors.icon.secondary} />
              ) : (
                <Icon name="play" size={16} color="currentColor" />
              )
            }
            style={{
              height: 32,
              padding: "6px 12px",
              fontSize: 13,
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Action / status maps used by Active card + History timeline
// ═══════════════════════════════════════════════════════════════════════════════
const ACTION_LABEL: Record<EventAction, { label: string; icon: string; tone: "primary" | "neutral" | "warn" | "danger" }> = {
  deploy:   { label: "신규 배포",  icon: "deploy",     tone: "primary" },
  redeploy: { label: "재배포",     icon: "refresh",    tone: "neutral" },
  traffic:  { label: "트래픽 변경", icon: "traffic",    tone: "neutral" },
  scale:    { label: "스케일 변경", icon: "parameter",  tone: "neutral" },
  config:   { label: "설정 변경",  icon: "edit",       tone: "neutral" },
  undeploy: { label: "배포 해제",  icon: "undeploy",   tone: "danger"  },
  rollback: { label: "롤백",       icon: "prev-arrow", tone: "warn"    },
};

const STATUS_LABEL: Record<EventStatus, { label: string; state: "success" | "error" | "pending" }> = {
  succeeded:     { label: "성공",   state: "success" },
  failed:        { label: "실패",   state: "error"   },
  "in-progress": { label: "진행 중", state: "pending" },
};

// Reversible event = configurational change we can undo without ambiguity in this demo.
function isReversibleEvent(e: DeploymentEvent): boolean {
  if (e.status !== "succeeded") return false;
  return e.action === "traffic" || e.action === "scale" || e.action === "config";
}

// ─────────────────────────────────────────────────────────────────────────────
// Scaling metric helpers — labels + auto-derived scale-up/scale-down thresholds
// ─────────────────────────────────────────────────────────────────────────────
const METRIC_LABEL: Record<ScalingMetricType, { full: string; abbr: string; description: string }> = {
  cpu:       { full: "CPU 코어 사용률",    abbr: "CPU",     description: "Pod 별 CPU 코어 사용률 (%). 전처리·후처리·CPU 추론 비중이 큰 모델에 적합." },
  memory:    { full: "Memory 사용률",      abbr: "Memory",  description: "Pod 별 시스템 메모리 사용률 (%). 큰 컨텍스트 / 캐싱 모델에 적합." },
  gpu:       { full: "GPU 코어 사용률",    abbr: "GPU",     description: "Pod 별 GPU 코어 사용률 (%). LLM·비전 등 GPU 추론에 가장 정확한 신호." },
  "gpu-mem": { full: "GPU 메모리 사용률",  abbr: "GPU mem", description: "Pod 별 GPU VRAM 사용률 (%). 큰 모델 / 긴 컨텍스트로 메모리 압박이 큰 추론에 적합." },
};

/** Resource metrics — 자원 기반 OR 조건 (editor에서 체크박스로 노출) */
const RESOURCE_METRIC_TYPES: ScalingMetricType[] = ["cpu", "memory", "gpu", "gpu-mem"];

function formatTarget(t?: { type: ScalingMetricType; value: number; unit: ScalingMetricUnit } | null): string {
  if (!t) return "—";
  return `${METRIC_LABEL[t.type].abbr} ${t.value}%`;
}

/** Format a list of targets into a compact OR-joined string. */
function formatTargets(targets?: ScalingPolicy["targets"]): string {
  if (!targets || targets.length === 0) return "—";
  if (targets.length === 1) return formatTarget(targets[0]);
  return targets.map((t) => formatTarget(t)).join(" OR ");
}

/** HPA-style: scale-up at +20% over target, scale-down at -20% under (% values capped at 100). */
function deriveThresholds(t: { type: ScalingMetricType; value: number; unit: ScalingMetricUnit }) {
  return {
    scaleUp:   Math.min(100, Math.round(t.value * 1.2)),
    scaleDown: Math.max(0,   Math.round(t.value * 0.8)),
    unit:      t.unit,
    abbr:      METRIC_LABEL[t.type].abbr,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Active Deployments Card — multiple models with traffic split + scaling state
// Reusable across Overview tab and 배포 이력 tab.
// ═══════════════════════════════════════════════════════════════════════════════
export function ActiveDeploymentsCard({
  deployments,
  snapshots = [],
  onTakeSnapshot,
  onRollback,
  showSnapshotControls = true,
  title = "활성 배포",
  onRowClick,
}: {
  deployments: ActiveDeployment[];
  /** Available snapshots (newest first). Used to populate the rollback dropdown. */
  snapshots?: DeploymentSnapshot[];
  /** Capture current `deployments` as a new snapshot. */
  onTakeSnapshot?: () => void;
  /** Restore activeDeployments to the snapshot identified by id. */
  onRollback?: (snapshotId: string) => void;
  /** Show the snapshot/rollback header buttons (default true). Pass false in read-only contexts. */
  showSnapshotControls?: boolean;
  /** Header label (default "활성 배포"). */
  title?: string;
  /** Optional click handler — when provided, rows are clickable. */
  onRowClick?: (deployment: ActiveDeployment) => void;
}) {
  const { colors } = useTheme();
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const totalTraffic = deployments.reduce((s, d) => s + d.trafficPct, 0);
  const hasSnapshots = snapshots.length > 0;
  const rollbackTooltip = hasSnapshots
    ? `${snapshots.length}개의 스냅샷에서 선택해 롤백`
    : "롤백할 스냅샷이 없습니다 — 먼저 '스냅샷'으로 현재 상태를 캡처하세요.";

  return (
    <div
      style={{
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        backgroundColor: colors.bg.primary,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "20px" }}>
            {title}
          </h2>
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
            {deployments.length} 모델 · 총 트래픽 {totalTraffic}%
            {showSnapshotControls && ` · 스냅샷 ${snapshots.length}개`}
          </span>
        </div>
        {showSnapshotControls && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Tooltip content="현재 활성 배포 상태(트래픽·스케일링·버전)를 캡처합니다." direction="above-center">
              <span style={{ display: "inline-flex" }}>
                <SecondaryButton
                  label="스냅샷"
                  onClick={onTakeSnapshot}
                  icon={<Icon name="storage" size={16} color="currentColor" />}
                  style={{ height: 32, padding: "6px 14px", fontSize: 13 }}
                />
              </span>
            </Tooltip>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Tooltip content={rollbackTooltip} direction="above-center">
                <span style={{ display: "inline-flex", opacity: hasSnapshots ? 1 : 0.5, pointerEvents: hasSnapshots ? "auto" : "none" }}>
                  <PrimaryButton
                    label="롤백"
                    onClick={() => hasSnapshots && setRollbackOpen((o) => !o)}
                    icon={<Icon name="prev-arrow" size={16} color="currentColor" />}
                    style={{ height: 32, padding: "6px 14px", fontSize: 13 }}
                  />
                </span>
              </Tooltip>
              {rollbackOpen && hasSnapshots && (
                <SnapshotPickerDropdown
                  snapshots={snapshots}
                  onSelect={(id) => {
                    setRollbackOpen(false);
                    onRollback?.(id);
                  }}
                  onClose={() => setRollbackOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* 트래픽 비중이 큰 deployment를 위로 — 운영자가 "지금 가장 영향력 있는 모델"
            을 먼저 보게 하는 것이 자연스럽다. 동률이면 deployedAt 최신순으로 tie-break. */}
        {[...deployments]
          .sort((a, b) =>
            b.trafficPct - a.trafficPct || (b.deployedAt || "").localeCompare(a.deployedAt || "")
          )
          .map((d) => (
            <ActiveDeploymentRow key={d.name} deployment={d} onClick={onRowClick} />
          ))}
      </div>
    </div>
  );
}

/** Floating list of snapshots — pick one to roll back to. */
function SnapshotPickerDropdown({
  snapshots,
  onSelect,
  onClose,
}: {
  snapshots: DeploymentSnapshot[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-snapshot-picker]")) onClose();
    };
    // Defer to avoid catching the same click that opened the dropdown
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  return (
    <div
      data-snapshot-picker
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        zIndex: 20,
        minWidth: 320,
        maxHeight: 360,
        overflow: "auto",
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${colors.border.tertiary}`, fontSize: 12, color: colors.text.secondary, fontFamily: ff, fontWeight: 600 }}>
        롤백할 스냅샷 선택
      </div>
      {snapshots.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg.secondary)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 4,
            padding: "10px 12px",
            border: "none",
            borderBottom: `1px solid ${colors.border.tertiary}`,
            backgroundColor: "transparent",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            fontFamily: ff,
            transition: "background-color 0.12s ease",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, flex: 1 }}>
              {s.label ?? "스냅샷"}
            </span>
            <span style={{ fontFamily: ffMono, fontSize: 11, color: colors.text.tertiary }}>{s.takenAt}</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: colors.text.tertiary }}>
            <Avatar initial={s.takenByInitial} size="sm" color={getAvatarColorFromInitial(s.takenByInitial)} />
            <span>{s.takenBy}</span>
            <span>·</span>
            <span>{s.deployments.length}개 배포 캡처</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function ActiveDeploymentRow({ deployment: d, onClick }: { deployment: ActiveDeployment; onClick?: (d: ActiveDeployment) => void }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const isIdle = d.trafficPct === 0;
  const isAuto = d.scaling.mode === "auto";
  const minR = d.scaling.minReplicas ?? d.scaling.replicas;
  const maxR = d.scaling.maxReplicas ?? d.scaling.replicas;
  const interactive = !!onClick;

  return (
    <div
      onClick={interactive ? () => onClick!(d) : undefined}
      onMouseEnter={interactive ? () => setHovered(true) : undefined}
      onMouseLeave={interactive ? () => setHovered(false) : undefined}
      style={{
        border: `1px solid ${interactive && hovered ? colors.border.primary : colors.border.tertiary}`,
        borderRadius: 8,
        backgroundColor: interactive && hovered ? colors.bg.tertiary : colors.bg.secondary,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: interactive ? "pointer" : "default",
        transition: "background-color 0.12s ease, border-color 0.12s ease",
      }}
    >
      {/* Top row — name / version / traffic / pods / performer */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 1.5fr) minmax(140px, 1fr) minmax(180px, 1.4fr) minmax(120px, 0.9fr) minmax(160px, 1fr)",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Icon name="model" size={16} color={colors.icon.secondary} />
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontFamily: ffMono, color: colors.text.primary }}>{d.version}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "1px 6px", borderRadius: 4,
                border: `1px solid ${colors.border.tertiary}`,
                backgroundColor: colors.bg.tertiary,
                fontSize: 11, fontFamily: ffMono, color: colors.text.tertiary,
              }}
            >
              <span style={{ fontFamily: ff, fontSize: 10, opacity: 0.7 }}>w</span>
              {d.trafficWeight}
            </span>
            <span style={{ minWidth: 36, fontSize: 13, fontFamily: ffMono, color: isIdle ? colors.text.tertiary : colors.text.primary, fontWeight: 600 }}>
              {d.trafficPct}%
            </span>
            <div style={{ flex: 1, height: 6, borderRadius: 9999, backgroundColor: colors.bg.neutral, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, d.trafficPct)}%`,
                  height: "100%",
                  // 트래픽 분배는 정적 share라 차분한 neutral 톤 — 아래 동적 observed
                  // metric bar(primary)와 시각적으로 구분된다. idle(0%)은 자연스럽게
                  // 막대가 안 보임.
                  backgroundColor: isIdle ? colors.bg.neutral : colors.text.tertiary,
                  borderRadius: 9999,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: colors.text.secondary, fontFamily: ff }}>
          <span style={{ fontFamily: ffMono, color: colors.text.primary }}>{d.currentPods}</span>
          {isAuto ? (
            <span>/ {maxR} pods</span>
          ) : (
            <span>pod{d.currentPods > 1 ? "s" : ""}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Avatar initial={d.performerInitial} size="sm" color={getAvatarColorFromInitial(d.performerInitial)} />
          <span style={{ fontSize: 12, color: colors.text.secondary, fontFamily: ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.deployedAt}
          </span>
        </div>
      </div>

      {/* Bottom row — scaling policy summary + status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 24,
          flexWrap: "wrap",
        }}
      >
        <ScalingPolicyChip policy={d.scaling} pods={d.currentPods} />
        <ScalingStatusBadge status={d.scalingStatus} maxR={maxR} />
        {d.scaling.lastScaledAt && (
          <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>
            마지막 스케일: {d.scaling.lastScaledAt}
          </span>
        )}
      </div>
      {/* Observed metric live bar — only when policy is auto with observed reading */}
      {d.scaling.mode === "auto" && d.scaling.observed && (
        <div style={{ paddingLeft: 24 }}>
          <ObservedMetricBar policy={d.scaling} />
        </div>
      )}
    </div>
  );
}

// Endpoint-level constraint banner for scaling exceptions
export function ScalingConstraintBanner({ deployments }: { deployments: ActiveDeployment[] }) {
  const { colors } = useTheme();
  const constraints = deployments.filter((d) => !!d.scalingStatus);
  if (constraints.length === 0) return null;

  // Severity: metric-stalled / quota-exceeded > at-limit
  const critical = constraints.find((d) => d.scalingStatus === "metric-stalled" || d.scalingStatus === "quota-exceeded");
  const warn = constraints.find((d) => d.scalingStatus === "at-limit");
  const tone = critical ? "danger" : "warn";
  const palette = tone === "danger"
    ? { bg: colors.bg.dangerSubtle,  fg: colors.text.danger,  border: colors.bg.danger,  icon: "error-fill" }
    : { bg: colors.bg.warningSubtle, fg: colors.text.warning, border: colors.bg.warning, icon: "waring-fill" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 12px",
        border: `1px solid ${palette.border}`,
        borderRadius: 8,
        backgroundColor: palette.bg,
      }}
    >
      <span style={{ display: "inline-flex", marginTop: 2, color: palette.fg }}>
        <Icon name={palette.icon as any} size={16} color="currentColor" />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {critical && (
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
            {critical.scalingStatus === "metric-stalled"
              ? `${critical.name} — 시스템 지표 수집 불가로 자동 스케일링이 일시 중지됨`
              : `${critical.name} — 프로젝트 쿼터 부족으로 추가 확장이 차단됨`}
          </span>
        )}
        {warn && (
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
            {warn.name} — Max {warn.scaling.maxReplicas} 도달, 추가 부하는 큐잉됩니다.
          </span>
        )}
        <span style={{ fontSize: 12, color: colors.text.secondary, fontFamily: ff }}>
          영향 받는 배포 {constraints.length}개 · 자세한 사유는 아래 배포 이력에서 확인하세요.
        </span>
      </div>
    </div>
  );
}

export function ScalingPolicyChip({ policy, pods }: { policy: ScalingPolicy; pods: number }) {
  const { colors } = useTheme();
  if (policy.mode === "manual") {
    return (
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: 9999,
          border: `1px solid ${colors.border.tertiary}`,
          backgroundColor: colors.bg.tertiary,
          color: colors.text.secondary,
          fontFamily: ff, fontSize: 11, fontWeight: 500,
        }}
      >
        <Icon name="parameter" size={12} color="currentColor" />
        Manual · {policy.replicas} pod{policy.replicas > 1 ? "s" : ""}
      </span>
    );
  }
  const minR = policy.minReplicas ?? 1;
  const maxR = policy.maxReplicas ?? pods;
  const ts = policy.targets ?? [];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 9999,
        border: `1px solid ${colors.bg.interactive.runwayPrimary}`,
        backgroundColor: colors.bg.interactive.runwaySelected,
        color: colors.text.interactive.runwayPrimary,
        fontFamily: ff, fontSize: 11, fontWeight: 500,
      }}
    >
      <Icon name="setting" size={12} color="currentColor" />
      Auto · Min {minR} / Max {maxR}
      {ts.length === 1 && <> · {formatTarget(ts[0])}</>}
      {ts.length >= 2 && <> · {formatTarget(ts[0])} +{ts.length - 1}</>}
    </span>
  );
}

export function ScalingStatusBadge({ status, maxR }: { status: ScalingStatus; maxR: number }) {
  const { colors } = useTheme();
  if (!status) return null;
  const palette = (() => {
    switch (status) {
      case "at-limit":         return { bg: colors.bg.warningSubtle, fg: colors.text.warning, border: colors.bg.warning, label: `At Limit · ${maxR}`, icon: "waring-fill" };
      case "quota-exceeded":   return { bg: colors.bg.dangerSubtle,  fg: colors.text.danger,  border: colors.bg.danger,  label: "Quota Exceeded",      icon: "waring-fill" };
      case "scaling-up":       return { bg: colors.bg.successSubtle, fg: colors.text.success, border: colors.bg.success, label: "Scaling ↑",           icon: "up-arrow" };
      case "scaling-down":     return { bg: colors.bg.successSubtle, fg: colors.text.success, border: colors.bg.success, label: "Scaling ↓",           icon: "down-arrow" };
      case "metric-stalled":   return { bg: colors.bg.dangerSubtle,  fg: colors.text.danger,  border: colors.bg.danger,  label: "지표 수집 중단",       icon: "error-fill" };
      default:                 return null;
    }
  })();
  if (!palette) return null;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 9999,
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.bg,
        color: palette.fg,
        fontFamily: ff, fontSize: 11, fontWeight: 600,
      }}
    >
      <Icon name={palette.icon as any} size={12} color="currentColor" />
      {palette.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Observed Metric Bar — live observed value vs target / scale-up / scale-down
// (Why is scaling happening / not happening — answers PRD §2 "사유 명확히")
// ─────────────────────────────────────────────────────────────────────────────
export function ObservedMetricBar({ policy }: { policy: ScalingPolicy }) {
  const { colors } = useTheme();
  if (policy.mode !== "auto" || !policy.targets || policy.targets.length === 0 || !policy.observed) return null;

  // Match observed reading to its corresponding target (multi-target → pick the one for `observed.type`)
  const t = policy.targets.find((x) => x.type === policy.observed!.type) ?? policy.targets[0];
  const o = policy.observed;
  const th = deriveThresholds(t);
  // % stays 0–100
  const max = Math.max(100, o.value * 1.05);

  const fmt = (v: number) => `${Math.round(v)}%`;

  const obsPct      = Math.min(100, (o.value / max) * 100);
  const targetPct   = (t.value / max) * 100;
  const scaleUpPct  = (th.scaleUp / max) * 100;
  const scaleDownPct = (th.scaleDown / max) * 100;

  // Auto-scaling observed metric bar — 브랜드 primary 색으로 통일.
  // Status 텍스트로 zone(scale-down 영역 / 정상 / target 초과 / 트리거) 정보를 전달.
  // 진짜 위험(큐잉)은 ScalingStatusBadge가 빨강으로 별도 노출.
  const palette = {
    fill: colors.bg.interactive.runwayPrimary,
    text: colors.text.interactive.runwayPrimary,
    status:
      o.value >= th.scaleUp
        ? `Scale-up 트리거 — 시스템이 파드를 늘리는 중`
        : o.value > t.value
          ? `target 초과 — Scale-up까지 ${fmt(th.scaleUp - o.value)}`
          : o.value < th.scaleDown
            ? `Scale-down 영역 — target까지 ${fmt(t.value - o.value)}`
            : "정상 운영 범위",
  };

  const trendIcon: "up-arrow" | "down-arrow" | "minus" =
    o.trend === "rising" ? "up-arrow" : o.trend === "falling" ? "down-arrow" : "minus";
  // 라벨은 아이콘 이름과 일관되게 up/down/stable — 짧고 모니터링 대시보드 관습에 맞음.
  const trendLabel = o.trend === "rising" ? "up" : o.trend === "falling" ? "down" : "stable";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "8px 10px",
        borderRadius: 6,
        border: `1px solid ${colors.border.tertiary}`,
        backgroundColor: colors.bg.primary,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
          {METRIC_LABEL[t.type].full}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: palette.text, fontFamily: ffMono }}>
          {fmt(o.value)}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>
          <Icon name={trendIcon} size={12} color="currentColor" />
          {trendLabel}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: palette.text, fontFamily: ff, fontWeight: 500 }}>
          {palette.status}
        </span>
      </div>
      {/* Track with markers */}
      <div style={{ position: "relative", height: 8, borderRadius: 9999, backgroundColor: colors.bg.neutral }}>
        {/* Fill */}
        <div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${obsPct}%`,
            backgroundColor: palette.fill,
            borderRadius: 9999,
            transition: "width 0.3s ease",
          }}
        />
        {/* Scale-down marker */}
        <Marker leftPct={scaleDownPct} color={colors.bg.success} />
        {/* Target marker */}
        <Marker leftPct={targetPct} color={colors.text.primary} thick />
        {/* Scale-up marker */}
        <Marker leftPct={scaleUpPct} color={colors.bg.warning} />
      </div>
      {/* Tick legend */}
      <div style={{ position: "relative", height: 12, fontSize: 10, color: colors.text.tertiary, fontFamily: ff }}>
        <TickLegend leftPct={scaleDownPct} label={`down ${fmt(th.scaleDown)}`} />
        <TickLegend leftPct={targetPct}   label={`target ${fmt(t.value)}`} bold />
        <TickLegend leftPct={scaleUpPct}  label={`up ${fmt(th.scaleUp)}`} />
      </div>
    </div>
  );
}

function Marker({ leftPct, color, thick }: { leftPct: number; color: string; thick?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: -2,
        bottom: -2,
        width: thick ? 2 : 1,
        backgroundColor: color,
        transform: "translateX(-50%)",
        borderRadius: 1,
      }}
    />
  );
}

function TickLegend({ leftPct, label, bold }: { leftPct: number; label: string; bold?: boolean }) {
  const { colors } = useTheme();
  return (
    <span
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
        fontWeight: bold ? 600 : 400,
        color: bold ? colors.text.secondary : colors.text.tertiary,
      }}
    >
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Rolling Progress Banner — shown during rollback (무중단 배포 시각화 — AC-3)
// ═══════════════════════════════════════════════════════════════════════════════
function RollingProgressBanner({
  current,
  target,
  progress,
}: {
  current: DeploymentHistoryEntry;
  target: DeploymentHistoryEntry;
  progress: number; // 0 - 100
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        border: `1px solid ${colors.bg.interactive.runwayPrimary}`,
        borderRadius: 12,
        backgroundColor: colors.bg.primary,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", color: colors.icon.interactive.runwayPrimary }}>
          <Icon name="prev-arrow" size={16} color="currentColor" />
        </span>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "20px" }}>
          롤백 진행 중 — 무중단 배포
        </h2>
        <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
          약 1-2분 소요
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 16, alignItems: "stretch" }}>
        <RollingPanel
          tone="terminating"
          tag="종료 중"
          version={current.version}
          progressLabel={`트래픽 ${100 - progress}%`}
          progress={100 - progress}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: colors.icon.tertiary }}>
          <Icon name="next-arrow" size={20} color="currentColor" />
        </div>
        <RollingPanel
          tone="starting"
          tag="기동 중"
          version={target.version}
          progressLabel={`트래픽 ${progress}%`}
          progress={progress}
        />
      </div>
    </div>
  );
}

function RollingPanel({
  tone, tag, version, progressLabel, progress,
}: { tone: "terminating" | "starting"; tag: string; version: string; progressLabel: string; progress: number }) {
  const { colors } = useTheme();
  const accent = tone === "terminating" ? colors.bg.warning : colors.bg.interactive.runwayPrimary;
  return (
    <div
      style={{
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 8,
        backgroundColor: colors.bg.secondary,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{version}</span>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 9999,
            backgroundColor: tone === "terminating" ? colors.bg.warningSubtle : colors.bg.successSubtle,
            color: tone === "terminating" ? colors.text.warning : colors.text.success,
            fontFamily: ff,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {tag}
        </span>
      </div>
      <div style={{ fontSize: 12, color: colors.text.secondary, fontFamily: ff }}>{progressLabel}</div>
      <div style={{ height: 6, borderRadius: 9999, backgroundColor: colors.bg.neutral, overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, Math.min(100, progress))}%`, height: "100%", backgroundColor: accent, borderRadius: 9999, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Event Timeline Tab — endpoint-level audit log table with row expansion
// ═══════════════════════════════════════════════════════════════════════════════
function EventTimelineTab({
  events,
}: {
  events: DeploymentEvent[];
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const headerCell: React.CSSProperties = {
    padding: "10px 12px", fontSize: 12, fontWeight: 600,
    color: colors.text.secondary, backgroundColor: colors.bg.tertiary,
    fontFamily: ff, textAlign: "left", whiteSpace: "nowrap",
  };
  const cell: React.CSSProperties = {
    padding: "12px", fontSize: 13, color: colors.text.primary, fontFamily: ff,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "20px" }}>
        배포 이력
      </h2>
      <div
        style={{
          border: `1px solid ${colors.border.tertiary}`,
          borderRadius: 12,
          overflow: "auto",
          backgroundColor: colors.bg.primary,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 980 }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, width: 36 }} aria-label="" />
              <th style={headerCell}>시각</th>
              <th style={headerCell}>대상</th>
              <th style={headerCell}>작업</th>
              <th style={headerCell}>변경 사항</th>
              <th style={headerCell}>상태</th>
              <th style={headerCell}>수행자</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => {
              const st = STATUS_LABEL[ev.status];
              const isExpanded = expanded === ev.id;
              const isHovered = hovered === ev.id;
              const isFailed = ev.status === "failed";
              return (
                <React.Fragment key={ev.id}>
                  <tr
                    onClick={() => setExpanded(isExpanded ? null : ev.id)}
                    onMouseEnter={() => setHovered(ev.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      cursor: "pointer",
                      borderTop: `1px solid ${colors.border.tertiary}`,
                      backgroundColor: isHovered ? colors.bg.secondary : "transparent",
                      transition: "background-color 0.12s ease",
                    }}
                  >
                    <td style={{ ...cell, padding: "12px 4px 12px 12px" }}>
                      <span style={{ display: "inline-flex", color: colors.icon.tertiary, transition: "transform 0.15s ease", transform: isExpanded ? "rotate(90deg)" : "none" }}>
                        <Icon name="chevron-right" size={14} color="currentColor" />
                      </span>
                    </td>
                    <td style={{ ...cell, color: colors.text.secondary, fontFamily: ffMono, fontSize: 12, whiteSpace: "nowrap" }}>
                      {ev.timestamp}
                    </td>
                    <td style={cell}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <Icon name="model" size={14} color={colors.icon.tertiary} />
                        <span style={{ fontWeight: 500, color: isFailed ? colors.text.tertiary : colors.text.primary }}>
                          {ev.target}
                        </span>
                        {ev.version && (
                          <span style={{ fontFamily: ffMono, color: colors.text.tertiary, fontSize: 12 }}>
                            {ev.version}{ev.buildNumber ? ` · build #${ev.buildNumber}` : ""}
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={cell}>
                      <ActionChip action={ev.action} />
                    </td>
                    <td style={{ ...cell, color: colors.text.secondary }}>
                      {ev.summary}
                    </td>
                    <td style={cell}>
                      <StatusChip state={st.state} size="sm" label={st.label} />
                    </td>
                    <td style={cell}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Avatar initial={ev.performerInitial} size="sm" color={getAvatarColorFromInitial(ev.performerInitial)} />
                        <span>{ev.performer}</span>
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ backgroundColor: colors.bg.secondary }}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <EventExpandedDetail event={ev} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* PRD §4.2 — 모든 배포 로그는 2년 보관 후 자동 삭제. */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: colors.text.tertiary,
          fontFamily: ff,
        }}
      >
        <Icon name="info-circle-stroke" size={14} color={colors.icon.tertiary} />
        배포 이력은 최근 2년 범위만 표시되며, 2년이 경과한 이력은 자동으로 삭제됩니다.
      </div>
    </div>
  );
}

function ActionChip({ action }: { action: EventAction }) {
  const { colors } = useTheme();
  const a = ACTION_LABEL[action];
  // 톤별 텍스트 색만 유지 — 칩 배경/테두리는 제거하고 아이콘 + 라벨 인라인으로 표시.
  const fg = (() => {
    switch (a.tone) {
      case "primary": return colors.text.success;
      case "warn":    return colors.text.warning;
      case "danger":  return colors.text.danger;
      case "neutral":
      default:        return colors.text.secondary;
    }
  })();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: fg,
        fontFamily: ff,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <Icon name={a.icon as any} size={14} color="currentColor" />
      {a.label}
    </span>
  );
}

function EventExpandedDetail({ event }: { event: DeploymentEvent }) {
  const { colors } = useTheme();
  const hasChanges = !!event.changes && event.changes.length > 0;
  const hasSnapshot = !!event.snapshot;
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Full configuration snapshot — PRD §3.2.2.
          Renders only when the event carries a snapshot (deploy/redeploy).
          Each field has a clipboard copy button so operators can paste the
          exact value into the new-deploy form (수동 재배포 가이드 §3.3). */}
      {hasSnapshot && (
        <ConfigSnapshotView snapshot={event.snapshot!} event={event} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>변경 사항</SectionLabel>
          {hasChanges ? (
            <div
              style={{
                border: `1px solid ${colors.border.tertiary}`,
                borderRadius: 8,
                backgroundColor: colors.bg.primary,
                overflow: "hidden",
              }}
            >
              {event.changes!.map((c, i) => {
                // 실패한 이벤트는 변경 사항 텍스트를 danger 톤으로 강조해
                // 어떤 값으로의 전환이 실패했는지 한눈에 식별되도록 한다.
                const failed = event.status === "failed";
                const labelColor = failed ? colors.text.danger : colors.text.secondary;
                const fromColor  = failed ? colors.text.danger : colors.text.tertiary;
                const toColor    = failed ? colors.text.danger : colors.text.primary;
                const arrowColor = failed ? colors.text.danger : colors.icon.tertiary;
                return (
                <div
                  key={c.field + i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 24px 1fr",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 12px",
                    borderTop: i === 0 ? "none" : `1px solid ${colors.border.tertiary}`,
                  }}
                >
                  <span style={{ fontSize: 12, fontFamily: ff, color: labelColor, fontWeight: failed ? 500 : 400 }}>{c.field}</span>
                  <span style={{ fontSize: 12, fontFamily: ffMono, color: fromColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.from}
                  </span>
                  <span style={{ display: "flex", justifyContent: "center", color: arrowColor }}>
                    <Icon name="next-arrow" size={14} color="currentColor" />
                  </span>
                  <span style={{ fontSize: 12, fontFamily: ffMono, color: toColor, fontWeight: failed ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.to}
                  </span>
                </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
              세부 변경 사항이 기록되지 않았습니다.
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {event.note && (
            <>
              <SectionLabel>설명</SectionLabel>
              <p style={{ margin: 0, fontSize: 13, color: colors.text.primary, fontFamily: ff, lineHeight: "20px" }}>
                {event.note}
              </p>
            </>
          )}
          {(event.artifact || (event.deploymentId && !hasSnapshot) || event.pvc) && (
            <>
              <SectionLabel>메타</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {event.deploymentId && !hasSnapshot && (
                  <SnapshotKv label="Deployment ID" value={event.deploymentId} mono />
                )}
                {event.pvc && (
                  <SnapshotKv
                    label="PVC"
                    value={
                      `${event.pvc.name} · ${event.pvc.size}` +
                      (event.pvc.storageClass ? ` · ${event.pvc.storageClass}` : "") +
                      (event.pvc.accessMode  ? ` · ${event.pvc.accessMode}`  : "")
                    }
                    mono
                  />
                )}
                {event.artifact && (
                  <SnapshotKv
                    label="아티팩트"
                    value={`${event.artifact.fileName} · ${event.artifact.size}${event.artifact.exportedAt ? ` · ${event.artifact.exportedAt}` : ""}${event.artifact.available ? "" : " · 만료"}`}
                    mono
                  />
                )}
              </div>
            </>
          )}
          {!event.note && !event.artifact && !event.deploymentId && !event.pvc && !hasSnapshot && (
            <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>추가 정보 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 배포 시점 설정 스냅샷 — Model Deployment 상세 페이지의 `ServiceConfigSections`와
 * 동일한 레이아웃(SectionCard + KvRow + InlineKv)으로 렌더하여 운영자가
 * 익숙한 시각 위계 안에서 값을 읽고 새 배포 폼으로 복사할 수 있도록 한다.
 *
 * 디테일 페이지는 Edit 가능한 라이브 상태고, 여기는 과거 시점의 박제 상태라
 * 모든 Edit 버튼은 제거하고 값 옆에 hover-reveal 복사 버튼을 둔다.
 */
function ConfigSnapshotView({
  snapshot,
  event,
}: {
  snapshot: DeploymentConfigSnapshot;
  event: DeploymentEvent;
}) {
  const { colors } = useTheme();
  const cpu = snapshot.compute.cpuMillicores;
  const mem = snapshot.compute.memoryMiB;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 라벨은 wrapper 밖 — 흰 카드의 "헤더"가 아니라 "이 영역은 스냅샷"이라는 표지. */}
      <SectionLabel>배포 시점 설정 스냅샷</SectionLabel>
    <div
      style={{
        // 외부 expanded row의 회색 배경에서 시각적으로 분리 — 흰 배경 + 테두리로
        // 스냅샷 영역의 시작/끝을 명확히 한다.
        backgroundColor: colors.bg.primary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* 작은 헤더 정보 — 배포 ID + 설명. 배포 이름/시각/수행자/결과는 테이블 행에 이미 있어 생략. */}
      {(snapshot.basic.deploymentId || snapshot.basic.description) && (
        <div
          style={{
            border: `1px solid ${colors.border.tertiary}`,
            borderRadius: 8,
            backgroundColor: colors.bg.secondary,
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {snapshot.basic.deploymentId && (
            <CopyableLine label="Deployment ID" value={snapshot.basic.deploymentId} mono />
          )}
          {snapshot.basic.description && (
            <CopyableLine label="설명" value={snapshot.basic.description} />
          )}
        </div>
      )}

      {/* 섹션 컨테이너 — 4 SectionCard 간 간격 32px (요청사항). */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ───── Model source ───── */}
      <SectionCard title="Model source" titleGap={8}>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <KvRow label="Volume">
            <CopyableInline value={snapshot.modelSource.volume} />
          </KvRow>
          <KvRow label="Model path">
            <CopyableInline value={snapshot.modelSource.modelPath} mono />
          </KvRow>
        </div>
      </SectionCard>

      {/* ───── Compute Resources ───── */}
      <SectionCard title="Compute Resources" titleGap={8}>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <InlineKvCopy label="CPU"    value={String(cpu)} unit="millicores" />
            <InlineKvCopy label="Memory" value={String(mem)} unit="MiB" />
          </div>

          {/* Advance options — 디테일 페이지와 동일한 sub-card 톤 */}
          <div
            style={{
              border: `1px solid ${colors.border.tertiary}`,
              borderRadius: 8,
              backgroundColor: colors.bg.secondary,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "20px" }}>
              Advance options
            </h3>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <InlineKvCopy
                label="Shared memory mount path"
                value={snapshot.advanced.sharedMemoryPath}
                mono
              />
              <InlineKvCopy
                label="Shared memory"
                value={snapshot.advanced.sharedMemoryMiB != null ? String(snapshot.advanced.sharedMemoryMiB) : undefined}
                unit="MiB"
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: colors.border.tertiary }} />

          {/* GPU block — 디테일 페이지의 GPU 영역 패턴 */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", minHeight: 24 }}>
            <div
              style={{
                width: 60, flexShrink: 0,
                fontSize: 13, fontWeight: 500,
                color: colors.text.primary, fontFamily: ff,
                lineHeight: "20px", paddingTop: 4,
              }}
            >
              GPU
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {snapshot.compute.gpuModel && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <Chip label={snapshot.compute.gpuModel} size="sm" tone="success" />
                </div>
              )}
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", paddingTop: 4 }}>
                <InlineKvCopy
                  label="GPU Count"
                  value={snapshot.compute.gpuCount != null ? String(snapshot.compute.gpuCount) : undefined}
                  unit="GPUs"
                />
                <InlineKvCopy
                  label="GPU core (%)"
                  value={snapshot.compute.gpuCorePct != null ? String(snapshot.compute.gpuCorePct) : undefined}
                  unit="%"
                />
                <InlineKvCopy
                  label="GPU memory (MiB)"
                  value={snapshot.compute.gpuMemoryMiB != null ? String(snapshot.compute.gpuMemoryMiB) : undefined}
                  unit="MiB"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ───── Scaling — 라이브 모델 상세 페이지의 ScalingPolicyView 그대로 재사용.
              Manual 모드: 모드 토글 + Replicas
              Auto 모드:   모드 토글 + Min/Max/Current desired + Scaling Target + Quota hint */}
      <SectionCard title="Scaling" titleGap={8}>
        <ScalingPolicyView policy={snapshot.scaling} />
      </SectionCard>

      {/* ───── Traffic Configuration — 모델 상세 페이지와 동일한 스타일.
              가중치(Traffic Weight)와 정규화된 실제 트래픽(Effective Traffic)을
              progress bar와 함께 표시. */}
      <SectionCard title="Traffic Configuration" titleGap={8}>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <KvRow
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                Traffic Weight <HelpIcon tip="User-set traffic weight relative to other deployments." />
              </span>
            }
            labelWidth={140}
          >
            <CopyableInline value={String(snapshot.traffic.weight)} mono />
          </KvRow>
          <KvRow
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                Effective Traffic <HelpIcon tip="Actual percentage of traffic routed to this deployment." />
              </span>
            }
            labelWidth={140}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
              <span style={{ minWidth: 36, color: colors.text.primary }}>
                {snapshot.traffic.effective}%
              </span>
              <div
                style={{
                  flex: 1,
                  maxWidth: 140,
                  height: 6,
                  borderRadius: 9999,
                  backgroundColor: colors.bg.neutral,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, snapshot.traffic.effective)}%`,
                    height: "100%",
                    backgroundColor: colors.bg.interactive.runwayPrimary,
                    borderRadius: 9999,
                  }}
                />
              </div>
            </div>
          </KvRow>
        </div>
      </SectionCard>
      </div>
    </div>
    </div>
  );
}

/**
 * 인라인 값 + hover 복사 — KvRow의 자식으로 들어가는 값 표현.
 * 디테일 페이지 라이브 값 표시와 동일한 톤 유지.
 */
function CopyableInline({ value, mono = false }: { value: string | undefined | null; mono?: boolean }) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(false);
  const isEmpty = value == null || value === "";
  if (isEmpty) {
    return <span style={{ color: colors.text.tertiary, fontStyle: "italic", fontFamily: ff }}>—</span>;
  }
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: mono ? ffMono : ff }}
    >
      <span>{value}</span>
      <span style={{ display: "inline-flex", opacity: hover ? 1 : 0, transition: "opacity 0.12s ease" }}>
        <CopyButton text={value!} size={20} iconSize={14} />
      </span>
    </span>
  );
}

/**
 * 디테일 페이지의 InlineKv 변형 — chip 표시 + hover 복사.
 * Compute Resources의 CPU/Memory/GPU 수치 같은 "label [value] unit" 형식.
 */
function InlineKvCopy({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | undefined | null;
  unit?: string;
}) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(false);
  const isEmpty = value == null || value === "";
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <span style={{ fontSize: 13, color: colors.text.secondary, fontFamily: ff, lineHeight: "20px" }}>
        {label}
      </span>
      {isEmpty ? (
        <span style={{ fontSize: 12, color: colors.text.tertiary, fontStyle: "italic", fontFamily: ff }}>—</span>
      ) : (
        <>
          <Chip label={String(value)} size="sm" />
          {unit && (
            <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>{unit}</span>
          )}
          <span style={{ display: "inline-flex", opacity: hover ? 1 : 0, transition: "opacity 0.12s ease" }}>
            <CopyButton text={String(value)} size={20} iconSize={14} />
          </span>
        </>
      )}
    </div>
  );
}

/** Deployment ID / 설명 같은 헤더용 한 줄 라벨+값 — 작은 회색 박스 안에서 사용. */
function CopyableLine({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, minWidth: 100 }}>{label}</span>
      <span
        style={{
          flex: 1,
          fontSize: 12,
          fontFamily: mono ? ffMono : ff,
          color: colors.text.primary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
      <span style={{ display: "inline-flex", opacity: hover ? 1 : 0, transition: "opacity 0.12s ease" }}>
        <CopyButton text={value} size={20} iconSize={14} />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Decision Timeline — vertical step list with kind-based icon/color (scale events)
// ─────────────────────────────────────────────────────────────────────────────
const STEP_PALETTE: Record<DecisionStepKind, { icon: string; tone: "neutral" | "info" | "primary" | "warn" | "success" }> = {
  observe:  { icon: "info-circle-stroke", tone: "neutral" },
  evaluate: { icon: "monitoring",         tone: "info"    },
  trigger:  { icon: "up-arrow",           tone: "primary" },
  action:   { icon: "play",               tone: "primary" },
  complete: { icon: "checkonly",          tone: "success" },
  limit:    { icon: "waring-fill",        tone: "warn"    },
};

function DecisionTimelineView({ steps }: { steps: DecisionStep[] }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 8,
        backgroundColor: colors.bg.primary,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {steps.map((step, i) => (
        <DecisionTimelineStep
          key={i}
          step={step}
          isFirst={i === 0}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  );
}

function DecisionTimelineStep({
  step, isFirst, isLast,
}: { step: DecisionStep; isFirst: boolean; isLast: boolean }) {
  const { colors } = useTheme();
  const p = STEP_PALETTE[step.kind];
  const palette = (() => {
    switch (p.tone) {
      case "primary": return { fg: colors.text.interactive.runwayPrimary, bg: colors.bg.interactive.runwaySelected, line: colors.bg.interactive.runwayPrimary };
      case "warn":    return { fg: colors.text.warning, bg: colors.bg.warningSubtle, line: colors.bg.warning };
      case "success": return { fg: colors.text.success, bg: colors.bg.successSubtle, line: colors.bg.success };
      case "info":    return { fg: colors.text.interactive.runwayPrimary, bg: colors.bg.primary, line: colors.bg.interactive.runwayPrimary };
      case "neutral":
      default:        return { fg: colors.text.tertiary, bg: colors.bg.primary, line: colors.border.tertiary };
    }
  })();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 24px 1fr", gap: 8, alignItems: "stretch", padding: "4px 0" }}>
      {/* Timestamp column */}
      <span
        style={{
          fontSize: 11,
          fontFamily: ffMono,
          color: colors.text.tertiary,
          paddingTop: 4,
        }}
      >
        {step.timestamp}
      </span>
      {/* Icon + connector column */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Top connector */}
        <div style={{ width: 1, flex: isFirst ? 0 : 1, backgroundColor: palette.line, opacity: 0.5, height: isFirst ? 0 : 4 }} />
        {/* Dot icon */}
        <span
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: "50%",
            backgroundColor: palette.bg,
            border: `1px solid ${palette.line}`,
            color: palette.fg,
            flexShrink: 0,
          }}
        >
          <Icon name={p.icon as any} size={12} color="currentColor" />
        </span>
        {/* Bottom connector */}
        <div style={{ width: 1, flex: 1, backgroundColor: palette.line, opacity: 0.5, minHeight: 4, display: isLast ? "none" : "block" }} />
      </div>
      {/* Text column */}
      <span
        style={{
          fontSize: 12,
          fontFamily: ff,
          color: colors.text.primary,
          lineHeight: "20px",
          paddingTop: 2,
        }}
      >
        {step.text}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: colors.text.tertiary, fontFamily: ff, lineHeight: "16px", textTransform: "uppercase", letterSpacing: 0.4 }}>
      {children}
    </div>
  );
}

function SnapshotKv({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, fontSize: 13, lineHeight: "20px" }}>
      <span style={{ color: colors.text.secondary, fontFamily: ff }}>{label}</span>
      <span style={{ color: colors.text.primary, fontFamily: mono ? ffMono : ff, overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Rollback Confirmation Modal — Revert the most recent reversible event
// ═══════════════════════════════════════════════════════════════════════════════
function RollbackConfirmModal({
  open, onClose, onConfirm, recent,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** The most recent reversible event whose effect will be undone */
  recent: DeploymentEvent | null;
}) {
  const { colors } = useTheme();
  const [confirmText, setConfirmText] = useState("");

  React.useEffect(() => {
    if (open) setConfirmText("");
  }, [open]);

  if (!recent) return null;

  // Reverse the change direction (rollback = "to → from")
  const reversedChanges: DeploymentChange[] = (recent.changes ?? []).map((c) => ({
    field: c.field,
    from: c.to,    // currently this value is in effect
    to: c.from,    // rollback restores the prior value
  }));

  const requiredText = recent.target;
  const ok = confirmText.trim() === requiredText;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="이전 상태로 롤백"
      width={720}
      style={{ minHeight: 480 }}
      primaryAction={{
        label: "롤백 실행",
        onClick: onConfirm,
        variant: "destructive",
        disabled: !ok,
      }}
      secondaryAction={{ label: "취소", onClick: onClose, variant: "secondary" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            padding: "10px 12px",
            border: `1px solid ${colors.bg.warning}`,
            borderRadius: 8,
            backgroundColor: colors.bg.warningSubtle,
          }}
        >
          <span style={{ display: "inline-flex", marginTop: 2, color: colors.icon.warning }}>
            <Icon name="waring-fill" size={16} color="currentColor" />
          </span>
          <div style={{ fontSize: 13, color: colors.text.primary, fontFamily: ff, lineHeight: "20px" }}>
            <strong>{recent.target}</strong>의 직전 변경(<code style={{ fontFamily: ffMono, color: colors.text.interactive.runwayPrimary }}>{recent.summary}</code>)을 되돌립니다.
            <br />
            <span style={{ color: colors.text.secondary }}>무중단 배포로 진행되며 약 1-2분 소요됩니다.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>되돌릴 변경 ({reversedChanges.length})</SectionLabel>
          <div
            style={{
              border: `1px solid ${colors.border.tertiary}`,
              borderRadius: 8,
              backgroundColor: colors.bg.primary,
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {reversedChanges.length === 0 ? (
              <div style={{ padding: 16, fontSize: 13, color: colors.text.tertiary, fontFamily: ff }}>
                세부 변경 사항이 기록되지 않았습니다.
              </div>
            ) : (
              reversedChanges.map((c, i) => (
                <div
                  key={c.field + i}
                  style={{
                    display: "grid", gridTemplateColumns: "160px 1fr 24px 1fr",
                    gap: 8, alignItems: "center",
                    padding: "8px 12px",
                    borderTop: i === 0 ? "none" : `1px solid ${colors.border.tertiary}`,
                    backgroundColor: colors.bg.warningSubtle,
                  }}
                >
                  <span style={{ fontSize: 12, fontFamily: ff, color: colors.text.secondary, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.field}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: ffMono, color: colors.text.tertiary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "line-through" }}>
                    {c.from}
                  </span>
                  <span style={{ display: "flex", justifyContent: "center", color: colors.icon.warning }}>
                    <Icon name="next-arrow" size={14} color="currentColor" />
                  </span>
                  <span style={{ fontSize: 12, fontFamily: ffMono, color: colors.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.to}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: colors.text.primary, fontFamily: ff }}>
            확인을 위해 대상 배포명 <code style={{ fontFamily: ffMono, color: colors.text.interactive.runwayPrimary }}>{requiredText}</code>를 입력하세요.
          </span>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={requiredText}
            spellCheck={false}
            style={{
              height: 36,
              padding: "0 12px",
              borderRadius: 6,
              border: `1px solid ${ok ? colors.bg.success : colors.border.secondary}`,
              backgroundColor: colors.bg.primary,
              color: colors.text.primary,
              fontFamily: ffMono,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sidebar: 상세정보
// ═══════════════════════════════════════════════════════════════════════════════
function DeploymentMetaSidebar({ detail }: { detail: DeploymentDetail }) {
  const { colors } = useTheme();
  return (
    <>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: ff,
          margin: 0,
          lineHeight: "32px",
        }}
      >
        상세정보
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <InfoRow label="Deployment name">{detail.deploymentName}</InfoRow>
        <InfoRow label="Deployment ID">
          <span style={{ fontFamily: ffMono, fontSize: 13 }}>
            {detail.deploymentId}
          </span>
        </InfoRow>
        <InfoRow label="Deployed">
          {detail.deployed ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: colors.text.success,
              }}
            >
              <Icon name="checkonly" size={16} color={colors.icon.success} />
              Yes
            </span>
          ) : (
            <span style={{ color: colors.text.tertiary }}>No</span>
          )}
        </InfoRow>
        <InfoRow label="Created By">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar
              initial={detail.createdByInitial}
              size="sm"
              color={getAvatarColorFromInitial(detail.createdByInitial)}
            />
            <span>{detail.createdBy}</span>
          </div>
        </InfoRow>
        <InfoRow label="Created At">{detail.createdAt}</InfoRow>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DeploymentHistoryView — Endpoint-level audit log.
// Owned by EndpointDetailView (rendered in its "배포 이력" tab).
// Rollback events are appended by the parent when a snapshot rollback happens.
// ═══════════════════════════════════════════════════════════════════════════════
export function DeploymentHistoryView({
  events,
  initialEvents = DEMO_EVENTS,
}: {
  /** Controlled events list — when provided, overrides initialEvents. */
  events?: DeploymentEvent[];
  initialEvents?: DeploymentEvent[];
}) {
  const [internalEvents] = useState<DeploymentEvent[]>(initialEvents);
  return <EventTimelineTab events={events ?? internalEvents} />;
}

// Rolling banner adapted to event-based (single deployment 트래픽 변화) flow
function RollingDeploymentBanner({
  target, fromPct, toPct, progress,
}: { target: string; fromPct: number; toPct: number; progress: number }) {
  const { colors } = useTheme();
  // Interpolate currently-applied %
  const live = Math.round(fromPct + (toPct - fromPct) * (progress / 100));
  return (
    <div
      style={{
        border: `1px solid ${colors.bg.interactive.runwayPrimary}`,
        borderRadius: 12,
        backgroundColor: colors.bg.primary,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", color: colors.icon.interactive.runwayPrimary }}>
          <Icon name="prev-arrow" size={16} color="currentColor" />
        </span>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>
          롤백 진행 중 — 무중단 배포
        </h2>
        <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>
          약 1-2분 소요 · {target}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 16, alignItems: "stretch" }}>
        <RollingPanel tone="terminating" tag="이전 상태" version={`${target} · ${fromPct}%`} progressLabel={`현재 ${live}%`} progress={100 - progress} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: colors.icon.tertiary }}>
          <Icon name="next-arrow" size={20} color="currentColor" />
        </div>
        <RollingPanel tone="starting" tag="롤백 후" version={`${target} · ${toPct}%`} progressLabel={`현재 ${live}%`} progress={progress} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main: DeploymentDetailView — per-deployment service configuration.
// Rendered inside InferenceEndpointPage's Sidebar+AppGnb shell.
// (No back button on the title row — navigation via breadcrumb)
// ═══════════════════════════════════════════════════════════════════════════════
export function DeploymentDetailView({
  deploymentName,
  detail = DEMO_DEPLOYMENT_DETAIL,
  onUndeploy,
  onScalingChange,
}: {
  deploymentName: string;
  detail?: DeploymentDetail;
  onBack?: () => void;
  onUndeploy?: () => void;
  /** Called when the user saves a Scaling policy edit — parent should propagate to active state. */
  onScalingChange?: (policy: ScalingPolicy) => void;
}) {
  const { colors } = useTheme();

  return (
    <DetailPage
      title={<PageTitle>{deploymentName}</PageTitle>}
      actions={
        <>
          <PrimaryButton
            label="Undeploy model"
            onClick={onUndeploy}
            icon={<Icon name="undeploy" size={16} color="currentColor" />}
          />
          <button
            aria-label="More"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${colors.border.secondary}`,
              backgroundColor: colors.bg.primary,
              cursor: "pointer",
            }}
          >
            <Icon name="more-vertical" size={16} color={colors.icon.secondary} />
          </button>
        </>
      }
    >
      <DetailContentWithSidebar sidebar={<DeploymentMetaSidebar detail={detail} />}>
        <ServiceConfigSections detail={detail} onScalingChange={onScalingChange} />
      </DetailContentWithSidebar>
    </DetailPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service Configuration Tab — runtime, resource, env, API endpoint sections
// (extracted from original layout)
// ═══════════════════════════════════════════════════════════════════════════════
// Per-deployment Scaling section body (used in service config tab)
function ScalingPolicyView({ policy }: { policy: ScalingPolicy }) {
  const { colors } = useTheme();
  const isAuto = policy.mode === "auto";
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mode pills (read-only display) */}
      <div style={{ display: "flex", gap: 8 }}>
        <ModePill label="Manual" selected={!isAuto} />
        <ModePill label="Auto" selected={isAuto} />
        <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff, alignSelf: "center", marginLeft: "auto" }}>
          저장 시 현재 서비스 중단 없이 즉시 적용됩니다.
        </span>
      </div>

      {isAuto ? (
        <>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <InlineKv label="Min Replicas" value={String(policy.minReplicas ?? 1)} unit="pod" />
            <InlineKv label="Max Replicas" value={String(policy.maxReplicas ?? policy.replicas)} unit="pod" />
            <InlineKv label="현재 desired" value={String(policy.replicas)} unit="pod" />
          </div>
          {/* Target metric + auto-derived thresholds */}
          <div
            style={{
              border: `1px solid ${colors.border.tertiary}`,
              borderRadius: 8,
              backgroundColor: colors.bg.secondary,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "20px" }}>
              Scaling Target
              <span style={{ marginLeft: 6, fontWeight: 400, color: colors.text.tertiary, fontSize: 12 }}>
                — 이 지표를 기준으로 파드 수가 자동 조정됩니다.
              </span>
            </h3>
            {policy.targets && policy.targets.length > 0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {policy.targets.map((t) => (
                    <div key={t.type} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: colors.text.primary, fontFamily: ff, fontWeight: 500, minWidth: 160 }}>
                        {METRIC_LABEL[t.type].full}
                        <Tooltip content={METRIC_LABEL[t.type].description} direction="above-center">
                          <span style={{ display: "inline-flex", color: colors.icon.tertiary, cursor: "help" }}>
                            <Icon name="help-circle-stroke" size={14} color="currentColor" />
                          </span>
                        </Tooltip>
                      </span>
                      <span style={{ fontSize: 13, color: colors.text.secondary, fontFamily: ff }}>
                        Target
                      </span>
                      <Chip label={String(t.value)} size="sm" />
                      <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>%</span>
                    </div>
                  ))}
                </div>
                {policy.targets.length >= 2 && (
                  <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>
                    ⓘ 다중 메트릭은 OR 조건 — 어느 하나라도 임계치를 초과하면 Scale-up.
                  </span>
                )}
                <MultiThresholdPreview targets={policy.targets} />
              </>
            ) : (
              <span style={{ fontSize: 13, color: colors.text.tertiary, fontFamily: ff }}>
                타겟 메트릭이 설정되지 않았습니다.
              </span>
            )}
          </div>
          {/* Stabilization preset은 기능 미구현 상태라 화면에 노출하지 않음. */}
          {/* Quota guard hint */}
          <div
            style={{
              padding: "8px 12px",
              border: `1px dashed ${colors.border.tertiary}`,
              borderRadius: 8,
              backgroundColor: "transparent",
              fontSize: 12, color: colors.text.tertiary, fontFamily: ff,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Icon name="info-circle-stroke" size={14} color={colors.icon.tertiary} />
            Max Replicas가 프로젝트 잔여 쿼터(12 cores)보다 클 경우 저장은 가능하나 확장 시 Quota Exceeded 상태가 될 수 있습니다.
          </div>
        </>
      ) : (
        <KvRow label="Replicas" labelWidth={100}>
          <span>{policy.replicas}</span>
        </KvRow>
      )}
    </div>
  );
}

// Stabilization preset cards — flapping 방지 cooldown 정책
const STABILIZATION_OPTIONS: { key: StabilizationPreset; label: string; up: string; down: string; tagline: string }[] = [
  { key: "conservative", label: "Conservative", up: "60s",  down: "10min", tagline: "안정성 우선 — 보수적으로 천천히" },
  { key: "balanced",     label: "Balanced",     up: "60s",  down: "5min",  tagline: "기본값 — 균형 잡힌 반응성"     },
  { key: "aggressive",   label: "Aggressive",   up: "30s",  down: "2min",  tagline: "탄력성 우선 — 빠르게 반응"     },
];

function StabilizationPresetView({ value }: { value?: StabilizationPreset }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 8,
        backgroundColor: colors.bg.secondary,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "20px" }}>
        Stabilization (안정화 윈도우)
        <span style={{ marginLeft: 6, fontWeight: 400, color: colors.text.tertiary, fontSize: 12 }}>
          — 짧은 시간 내 반복 변동(플래핑)을 방지합니다.
        </span>
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {STABILIZATION_OPTIONS.map((opt) => (
          <PresetCard
            key={opt.key}
            label={opt.label}
            up={opt.up}
            down={opt.down}
            tagline={opt.tagline}
            selected={opt.key === value}
          />
        ))}
      </div>
    </div>
  );
}

function PresetCard({
  label, up, down, tagline, selected, onClick,
}: { label: string; up: string; down: string; tagline: string; selected: boolean; onClick?: () => void }) {
  const { colors } = useTheme();
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${selected ? colors.bg.interactive.runwayPrimary : colors.border.tertiary}`,
        borderRadius: 8,
        padding: 12,
        backgroundColor: selected ? colors.bg.interactive.runwaySelected : colors.bg.primary,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        cursor: interactive ? "pointer" : "default",
        transition: "border-color 0.12s ease, background-color 0.12s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: selected ? colors.text.interactive.runwayPrimary : colors.text.primary, fontFamily: ff }}>
          {label}
        </span>
        {selected && (
          <Icon name="checkonly" size={14} color={colors.icon.interactive.runwayPrimary} />
        )}
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, fontFamily: ffMono, color: colors.text.secondary }}>
        <span>↑ {up}</span>
        <span>↓ {down}</span>
      </div>
      <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff, lineHeight: "14px" }}>
        {tagline}
      </span>
    </div>
  );
}

// Auto-derived thresholds preview for one or more targets (HPA-style ±20%)
function MultiThresholdPreview({ targets }: { targets: NonNullable<ScalingPolicy["targets"]> }) {
  const { colors } = useTheme();
  if (targets.length === 0) return null;
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: "10px 12px",
        borderRadius: 6,
        border: `1px solid ${colors.border.tertiary}`,
        backgroundColor: colors.bg.primary,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: colors.text.tertiary, fontFamily: ff, textTransform: "uppercase", letterSpacing: 0.4 }}>
        자동 산출 임계치 (target × 1.2 / × 0.8)
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(120px, 1fr) auto auto",
          gap: "4px 16px",
          alignItems: "center",
        }}
      >
        {targets.map((t, i) => {
          const th = deriveThresholds(t);
          return (
            <React.Fragment key={t.type + i}>
              <span style={{ fontSize: 12, color: colors.text.secondary, fontFamily: ff, fontWeight: 500 }}>
                {METRIC_LABEL[t.type].full}
              </span>
              <span style={{ fontSize: 12, color: colors.text.success, fontFamily: ff, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="up-arrow" size={12} color="currentColor" />
                <strong style={{ fontFamily: ffMono }}>&gt; {th.scaleUp}%</strong>
              </span>
              <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="down-arrow" size={12} color="currentColor" />
                <strong style={{ fontFamily: ffMono }}>&lt; {th.scaleDown}%</strong>
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/** Backwards-compat single-target preview (used by editor live preview). */
function ThresholdPreview({ target }: { target: { type: ScalingMetricType; value: number; unit: ScalingMetricUnit } }) {
  return <MultiThresholdPreview targets={[target]} />;
}

function ModePill({ label, selected }: { label: string; selected: boolean }) {
  const { colors } = useTheme();
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "6px 16px",
        borderRadius: 9999,
        border: `1px solid ${selected ? colors.bg.interactive.runwayPrimary : colors.border.tertiary}`,
        backgroundColor: selected ? colors.bg.interactive.runwaySelected : colors.bg.primary,
        color: selected ? colors.text.interactive.runwayPrimary : colors.text.secondary,
        fontFamily: ff, fontSize: 13, fontWeight: 500,
        cursor: "default",
      }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scaling Policy Editor — Drawer slide-from-right with full edit form
// (mode / min-max / 자원 기반 multi-target / stabilization)
// ─────────────────────────────────────────────────────────────────────────────
const RESOURCE_DEFAULT_VALUES: Record<ScalingMetricType, number> = {
  cpu: 70,
  memory: 80,
  gpu: 70,
  "gpu-mem": 85,
};

function ScalingPolicyEditor({
  initial,
  open,
  onClose,
  onSave,
}: {
  initial: ScalingPolicy;
  open: boolean;
  onClose: () => void;
  onSave: (next: ScalingPolicy) => void;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<ScalingPolicy>(initial);

  React.useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  const isAuto = draft.mode === "auto";
  const min = draft.minReplicas ?? 1;
  const max = draft.maxReplicas ?? draft.replicas;
  const targets = draft.targets ?? [];

  // Validation
  const errors: string[] = [];
  if (isAuto) {
    if (min < 1) errors.push("Min Replicas는 1 이상이어야 합니다 (Scale-to-Zero 미지원).");
    if (min > max) errors.push("Min은 Max를 초과할 수 없습니다.");
    if (targets.length === 0) errors.push("Scaling Target 메트릭을 1개 이상 선택해주세요.");
    if (targets.some((t) => t.value <= 0)) errors.push("Target 값은 0보다 커야 합니다.");
    if (targets.some((t) => t.value > 100)) errors.push("자원 사용률은 100%를 초과할 수 없습니다.");
  } else {
    if (draft.replicas < 1) errors.push("Replicas는 1 이상이어야 합니다.");
  }

  // Quota warning (demo: project quota = 12 cores; assume 1 core per pod)
  const quotaWarn = isAuto && max > 12;

  const isMetricEnabled = (type: ScalingMetricType) => targets.some((t) => t.type === type);
  const getMetricValue = (type: ScalingMetricType) =>
    targets.find((t) => t.type === type)?.value ?? RESOURCE_DEFAULT_VALUES[type];

  const toggleMetric = (type: ScalingMetricType, on: boolean) => {
    setDraft((d) => {
      const cur = d.targets ?? [];
      if (on) {
        if (cur.some((t) => t.type === type)) return d;
        return { ...d, targets: [...cur, { type, value: RESOURCE_DEFAULT_VALUES[type], unit: "%" as ScalingMetricUnit }] };
      }
      return { ...d, targets: cur.filter((t) => t.type !== type) };
    });
  };

  const setMetricValue = (type: ScalingMetricType, value: number) => {
    setDraft((d) => ({
      ...d,
      targets: (d.targets ?? []).map((t) => (t.type === type ? { ...t, value } : t)),
    }));
  };

  const setMode = (mode: ScalingMode) =>
    setDraft((d) => {
      if (mode === "auto" && (!d.targets || d.targets.length === 0)) {
        return {
          ...d,
          mode,
          minReplicas: d.minReplicas ?? Math.max(1, d.replicas - 1),
          maxReplicas: d.maxReplicas ?? d.replicas + 1,
          targets: [{ type: "cpu", value: 70, unit: "%" }],
          stabilization: d.stabilization ?? "balanced",
        };
      }
      return { ...d, mode };
    });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Scaling 정책 편집"
      width={720}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <SecondaryButton label="취소" onClick={onClose} />
          <PrimaryButton
            label="저장"
            onClick={() => onSave(draft)}
            style={{ opacity: errors.length > 0 ? 0.5 : 1, pointerEvents: errors.length > 0 ? "none" : "auto" }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "8px 4px" }}>
        {/* Mode */}
        <FieldGroup label="모드">
          <div style={{ display: "flex", gap: 8 }}>
            <ModePillButton label="Manual" selected={!isAuto} onClick={() => setMode("manual")} />
            <ModePillButton label="Auto"   selected={isAuto}  onClick={() => setMode("auto")} />
          </div>
        </FieldGroup>

        {/* Replicas */}
        {isAuto ? (
          <FieldGroup label="Replicas" hint="Min은 1 이상 (Scale-to-Zero 미지원)">
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
              <NumberField
                label="Min"
                value={min}
                onChange={(n) => setDraft((d) => ({ ...d, minReplicas: Math.max(1, n) }))}
                min={1}
                unit="pod"
              />
              <NumberField
                label="Max"
                value={max}
                onChange={(n) => setDraft((d) => ({ ...d, maxReplicas: Math.max(1, n) }))}
                min={1}
                unit="pod"
              />
              <NumberField
                label="현재 desired"
                value={draft.replicas}
                onChange={(n) => setDraft((d) => ({ ...d, replicas: Math.max(1, n) }))}
                min={1}
                unit="pod"
                readOnly
              />
            </div>
          </FieldGroup>
        ) : (
          <FieldGroup label="Replicas">
            <NumberField
              label="Replicas"
              value={draft.replicas}
              onChange={(n) => setDraft((d) => ({ ...d, replicas: Math.max(1, n) }))}
              min={1}
              unit="pod"
            />
          </FieldGroup>
        )}

        {isAuto && (
          <>
            {/* Scaling Targets — multi-checkbox grid (자원 기반 OR) */}
            <FieldGroup
              label="Scaling Targets — 자원 기반"
              hint="여러 지표 선택 시 OR 조건 — 어느 하나라도 임계치 초과 시 Scale-up. Target 값은 '유지' 기준이며 자동으로 ±20% 임계치를 산출합니다."
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  border: `1px solid ${colors.border.tertiary}`,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: colors.bg.primary,
                }}
              >
                {RESOURCE_METRIC_TYPES.map((type) => (
                  <MetricCheckboxRow
                    key={type}
                    type={type}
                    enabled={isMetricEnabled(type)}
                    value={getMetricValue(type)}
                    onToggle={(on) => toggleMetric(type, on)}
                    onValueChange={(v) => setMetricValue(type, v)}
                  />
                ))}
              </div>
            </FieldGroup>

            {/* Live threshold preview for all selected targets */}
            {targets.length > 0 && <MultiThresholdPreview targets={targets} />}

            {/* Stabilization 설정은 기능 미구현 상태라 편집 UI에서 일단 제거. */}
          </>
        )}

        {/* Validation errors */}
        {errors.length > 0 && (
          <div
            style={{
              padding: "10px 12px",
              border: `1px solid ${colors.bg.danger}`,
              borderRadius: 8,
              backgroundColor: colors.bg.dangerSubtle,
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            {errors.map((e, i) => (
              <span key={i} style={{ fontSize: 12, color: colors.text.danger, fontFamily: ff }}>
                ⚠ {e}
              </span>
            ))}
          </div>
        )}

        {/* Quota warning (non-blocking) */}
        {quotaWarn && (
          <div
            style={{
              padding: "10px 12px",
              border: `1px solid ${colors.bg.warning}`,
              borderRadius: 8,
              backgroundColor: colors.bg.warningSubtle,
              display: "flex", alignItems: "flex-start", gap: 8,
            }}
          >
            <Icon name="waring-fill" size={16} color={colors.icon.warning} />
            <span style={{ fontSize: 12, color: colors.text.primary, fontFamily: ff, lineHeight: "18px" }}>
              Max Replicas {max}이(가) 프로젝트 잔여 쿼터 12 cores를 초과합니다.
              <span style={{ color: colors.text.secondary }}> 저장은 가능하나 확장 시 Quota Exceeded 상태가 될 수 있습니다.</span>
            </span>
          </div>
        )}

        {/* Hint */}
        <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, display: "inline-flex", gap: 4, alignItems: "center" }}>
          <Icon name="info-circle-stroke" size={14} color={colors.icon.tertiary} />
          저장 시 현재 서비스 중단 없이 즉시 적용됩니다.
        </span>
      </div>
    </Drawer>
  );
}

/**
 * Controlled inline scaling policy form — same UX as the ScalingPolicyEditor
 * drawer but without the Drawer wrapper, so it can be embedded in flows like
 * the Deploy model drawer where scaling is configured at create time.
 */
export function ScalingPolicyForm({
  value,
  onChange,
}: {
  value: ScalingPolicy;
  onChange: (next: ScalingPolicy) => void;
}) {
  const { colors } = useTheme();
  const isAuto = value.mode === "auto";
  const min = value.minReplicas ?? 1;
  const max = value.maxReplicas ?? value.replicas;
  const targets = value.targets ?? [];

  const errors: string[] = [];
  if (isAuto) {
    if (min < 1) errors.push("Min Replicas는 1 이상이어야 합니다 (Scale-to-Zero 미지원).");
    if (min > max) errors.push("Min은 Max를 초과할 수 없습니다.");
    if (targets.length === 0) errors.push("Scaling Target 메트릭을 1개 이상 선택해주세요.");
    if (targets.some((t) => t.value <= 0)) errors.push("Target 값은 0보다 커야 합니다.");
    if (targets.some((t) => t.value > 100)) errors.push("자원 사용률은 100%를 초과할 수 없습니다.");
  } else {
    if (value.replicas < 1) errors.push("Replicas는 1 이상이어야 합니다.");
  }
  const quotaWarn = isAuto && max > 12;

  const isMetricEnabled = (type: ScalingMetricType) => targets.some((t) => t.type === type);
  const getMetricValue = (type: ScalingMetricType) =>
    targets.find((t) => t.type === type)?.value ?? RESOURCE_DEFAULT_VALUES[type];
  const update = (patch: Partial<ScalingPolicy>) => onChange({ ...value, ...patch });
  const toggleMetric = (type: ScalingMetricType, on: boolean) => {
    const cur = value.targets ?? [];
    if (on) {
      if (cur.some((t) => t.type === type)) return;
      update({ targets: [...cur, { type, value: RESOURCE_DEFAULT_VALUES[type], unit: "%" as ScalingMetricUnit }] });
    } else {
      update({ targets: cur.filter((t) => t.type !== type) });
    }
  };
  const setMetricValue = (type: ScalingMetricType, v: number) =>
    update({ targets: (value.targets ?? []).map((t) => (t.type === type ? { ...t, value: v } : t)) });
  const setMode = (mode: ScalingMode) => {
    if (mode === "auto" && (!value.targets || value.targets.length === 0)) {
      onChange({
        ...value,
        mode,
        minReplicas: value.minReplicas ?? Math.max(1, value.replicas - 1),
        maxReplicas: value.maxReplicas ?? value.replicas + 1,
        targets: [{ type: "cpu", value: 70, unit: "%" }],
        stabilization: value.stabilization ?? "balanced",
      });
    } else {
      update({ mode });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <FieldGroup label="모드">
        <div style={{ display: "flex", gap: 8 }}>
          <ModePillButton label="Manual" selected={!isAuto} onClick={() => setMode("manual")} />
          <ModePillButton label="Auto"   selected={isAuto}  onClick={() => setMode("auto")} />
        </div>
      </FieldGroup>

      {isAuto ? (
        <FieldGroup label="Replicas" hint="Min은 1 이상 (Scale-to-Zero 미지원)">
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <NumberField
              label="Min"
              value={min}
              onChange={(n) => update({ minReplicas: Math.max(1, n) })}
              min={1}
              unit="pod"
            />
            <NumberField
              label="Max"
              value={max}
              onChange={(n) => update({ maxReplicas: Math.max(1, n) })}
              min={1}
              unit="pod"
            />
          </div>
        </FieldGroup>
      ) : (
        <FieldGroup label="Replicas">
          <NumberField
            label="Replicas"
            value={value.replicas}
            onChange={(n) => update({ replicas: Math.max(1, n) })}
            min={1}
            unit="pod"
          />
        </FieldGroup>
      )}

      {isAuto && (
        <>
          <FieldGroup
            label="Scaling Targets — 자원 기반"
            hint="여러 지표 선택 시 OR 조건 — 어느 하나라도 임계치 초과 시 Scale-up. Target 값은 '유지' 기준이며 자동으로 ±20% 임계치를 산출합니다."
          >
            <div
              style={{
                display: "flex", flexDirection: "column", gap: 8,
                border: `1px solid ${colors.border.tertiary}`,
                borderRadius: 8,
                padding: 12,
                backgroundColor: colors.bg.primary,
              }}
            >
              {RESOURCE_METRIC_TYPES.map((type) => (
                <MetricCheckboxRow
                  key={type}
                  type={type}
                  enabled={isMetricEnabled(type)}
                  value={getMetricValue(type)}
                  onToggle={(on) => toggleMetric(type, on)}
                  onValueChange={(v) => setMetricValue(type, v)}
                />
              ))}
            </div>
          </FieldGroup>

          {targets.length > 0 && <MultiThresholdPreview targets={targets} />}

          {/* Stabilization 설정은 기능 미구현 상태라 폼에서 일단 제거. */}
        </>
      )}

      {errors.length > 0 && (
        <div
          style={{
            padding: "10px 12px",
            border: `1px solid ${colors.bg.danger}`,
            borderRadius: 8,
            backgroundColor: colors.bg.dangerSubtle,
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          {errors.map((e, i) => (
            <span key={i} style={{ fontSize: 12, color: colors.text.danger, fontFamily: ff }}>
              ⚠ {e}
            </span>
          ))}
        </div>
      )}

      {quotaWarn && (
        <div
          style={{
            padding: "10px 12px",
            border: `1px solid ${colors.bg.warning}`,
            borderRadius: 8,
            backgroundColor: colors.bg.warningSubtle,
            display: "flex", alignItems: "flex-start", gap: 8,
          }}
        >
          <Icon name="waring-fill" size={16} color={colors.icon.warning} />
          <span style={{ fontSize: 12, color: colors.text.primary, fontFamily: ff, lineHeight: "18px" }}>
            Max Replicas {max}이(가) 프로젝트 잔여 쿼터 12 cores를 초과합니다.
            <span style={{ color: colors.text.secondary }}> 저장은 가능하나 확장 시 Quota Exceeded 상태가 될 수 있습니다.</span>
          </span>
        </div>
      )}
    </div>
  );
}

function MetricCheckboxRow({
  type,
  enabled,
  value,
  onToggle,
  onValueChange,
}: {
  type: ScalingMetricType;
  enabled: boolean;
  value: number;
  onToggle: (on: boolean) => void;
  onValueChange: (v: number) => void;
}) {
  const { colors } = useTheme();
  const m = METRIC_LABEL[type];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) auto auto auto",
        gap: 12,
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 6,
        backgroundColor: enabled ? colors.bg.interactive.runwaySelected : "transparent",
        transition: "background-color 0.12s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <Checkbox checked={enabled} onChange={onToggle} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: enabled ? colors.text.primary : colors.text.secondary, fontFamily: ff }}>
            {m.full}
          </span>
          <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff, overflow: "hidden", textOverflow: "ellipsis" }}>
            {m.description}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>Target</span>
      <input
        type="number"
        value={value}
        min={1}
        max={100}
        disabled={!enabled}
        onChange={(e) => onValueChange(parseInt(e.target.value, 10) || 0)}
        style={{
          width: 72,
          height: 32,
          padding: "0 10px",
          borderRadius: 6,
          border: `1px solid ${colors.border.secondary}`,
          backgroundColor: enabled ? colors.bg.primary : colors.bg.secondary,
          color: enabled ? colors.text.primary : colors.text.tertiary,
          fontFamily: ffMono,
          fontSize: 13,
          textAlign: "right",
          outline: "none",
          cursor: enabled ? "text" : "not-allowed",
        }}
      />
      <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, minWidth: 12 }}>%</span>
    </div>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{label}</span>
      {children}
      {hint && (
        <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>{hint}</span>
      )}
    </div>
  );
}

function NumberField({
  label, value, onChange, min, unit, readOnly,
}: { label: string; value: number; onChange: (n: number) => void; min?: number; unit?: string; readOnly?: boolean }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120 }}>
      {label && (
        <span style={{ fontSize: 11, fontWeight: 500, color: colors.text.tertiary, fontFamily: ff }}>{label}</span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          value={value}
          min={min}
          readOnly={readOnly}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          style={{
            width: 84,
            height: 36,
            padding: "0 10px",
            borderRadius: 6,
            border: `1px solid ${colors.border.secondary}`,
            backgroundColor: readOnly ? colors.bg.secondary : colors.bg.primary,
            color: readOnly ? colors.text.secondary : colors.text.primary,
            fontFamily: ffMono,
            fontSize: 13,
            outline: "none",
            cursor: readOnly ? "not-allowed" : "text",
          }}
        />
        {unit && (
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function ModePillButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "8px 18px",
        borderRadius: 9999,
        border: `1px solid ${selected ? colors.bg.interactive.runwayPrimary : colors.border.tertiary}`,
        backgroundColor: selected ? colors.bg.interactive.runwaySelected : colors.bg.primary,
        color: selected ? colors.text.interactive.runwayPrimary : colors.text.secondary,
        fontFamily: ff, fontSize: 13, fontWeight: selected ? 600 : 500,
        cursor: "pointer",
        transition: "background-color 0.12s ease, border-color 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

// Stateful wrapper around the Scaling section: holds the live policy + edit modal state.
// ─────────────────────────────────────────────────────────────────────────────
// Traffic Edit Drawer — endpoint-level traffic weight editor
// Per-deployment weight inputs + 변경 사유 (선택) → records as "traffic" event(s)
// ─────────────────────────────────────────────────────────────────────────────
export interface TrafficEditResult {
  /** Per-deployment weight changes; only items whose weight changed are returned. */
  updates: Array<{ name: string; from: number; to: number }>;
  /** Required reason for the change — written to audit log as the event note. */
  reason: string;
}

export function TrafficEditDrawer({
  open,
  onClose,
  deployments,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  deployments: ActiveDeployment[];
  onSave: (result: TrafficEditResult) => void;
}) {
  const { colors } = useTheme();
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");

  // Reset form when reopened — pre-fill with the user's last ratio (trafficWeight),
  // not the normalized % (trafficPct). System still auto-normalizes on save.
  React.useEffect(() => {
    if (open) {
      const initial: Record<string, number> = {};
      deployments.forEach((d) => { initial[d.name] = d.trafficWeight; });
      setWeights(initial);
      setReason("");
    }
  }, [open, deployments]);

  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  const isExactly100 = total === 100;
  const allZero = total === 0;

  // Auto-normalize: input is treated as a weight (ratio), system computes actual %.
  // 70 / 0 / 10 → total 80 → normalized 87.5 / 0 / 12.5 → rounded 88 / 0 / 12 (rounding error fixed below).
  const normalizedRaw = (w: number) => (allZero ? 0 : (w / total) * 100);
  const normalize = (w: number) => Math.round(normalizedRaw(w) * 10) / 10; // 1 decimal place

  const updates = deployments
    .map((d) => ({ name: d.name, from: d.trafficPct, to: normalize(weights[d.name] ?? 0) }))
    .filter((u) => u.from !== u.to);
  const noChanges = updates.length === 0;

  const errors: string[] = [];
  if (allZero) errors.push("최소 하나의 가중치는 0보다 커야 합니다.");
  if (noChanges) errors.push("변경된 가중치 값이 없습니다.");
  Object.entries(weights).forEach(([name, w]) => {
    if (w < 0) errors.push(`${name}: 가중치는 0 이상이어야 합니다.`);
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="트래픽 분배 편집"
      width={680}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <SecondaryButton label="취소" onClick={onClose} />
          <PrimaryButton
            label="저장"
            onClick={() => onSave({ updates, reason: reason.trim() })}
            style={{
              opacity: errors.length > 0 ? 0.5 : 1,
              pointerEvents: errors.length > 0 ? "none" : "auto",
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "8px 4px" }}>
        {/* Weight grid */}
        <FieldGroup
          label="모델별 트래픽 가중치 (Weight)"
          hint="입력은 상대적 비율이며 합계가 100이 아니어도 시스템이 자동 정규화합니다."
        >
          <div
            style={{
              border: `1px solid ${colors.border.tertiary}`,
              borderRadius: 8,
              padding: 12,
              backgroundColor: colors.bg.primary,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {deployments.map((d) => {
              const cur = weights[d.name] ?? 0;
              const normalizedPct = normalize(cur);
              return (
                <div
                  key={d.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(160px, 1.4fr) auto auto minmax(64px, auto) minmax(160px, 1fr)",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: colors.text.primary, fontFamily: ff, fontWeight: 500 }}>
                    <Icon name="model" size={14} color={colors.icon.secondary} />
                    {d.name}
                  </span>
                  <input
                    type="number"
                    value={cur}
                    min={0}
                    onChange={(e) => {
                      const v = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setWeights((w) => ({ ...w, [d.name]: v }));
                    }}
                    style={{
                      width: 76,
                      height: 32,
                      padding: "0 10px",
                      borderRadius: 6,
                      border: `1px solid ${colors.border.secondary}`,
                      backgroundColor: colors.bg.primary,
                      color: colors.text.primary,
                      fontFamily: ffMono,
                      fontSize: 13,
                      textAlign: "right",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff, minWidth: 38 }}>weight</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: ffMono,
                      color: cur === 0 ? colors.text.tertiary : colors.text.primary,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      textAlign: "right",
                    }}
                  >
                    → {normalizedPct.toFixed(normalizedPct % 1 === 0 ? 0 : 1)}%
                  </span>
                  <div style={{ height: 6, borderRadius: 9999, backgroundColor: colors.bg.neutral, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${normalizedPct}%`,
                        height: "100%",
                        backgroundColor: normalizedPct === 0 ? colors.bg.neutral : colors.bg.interactive.runwayPrimary,
                        borderRadius: 9999,
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div
              style={{
                marginTop: 4,
                paddingTop: 10,
                borderTop: `1px solid ${colors.border.tertiary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 12, color: colors.text.secondary, fontFamily: ff }}>
                Weight 합계 <span style={{ fontFamily: ffMono, color: colors.text.primary, marginLeft: 6 }}>{total}</span>
              </span>
              {!isExactly100 && !allZero && (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontFamily: ff, color: colors.text.interactive.runwayPrimary,
                  }}
                >
                  <Icon name="refresh" size={12} color="currentColor" />
                  자동 정규화 적용 — 합계 100%로 변환됨
                </span>
              )}
              {isExactly100 && (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontFamily: ff, color: colors.text.success,
                  }}
                >
                  <Icon name="success-fill" size={12} color="currentColor" />
                  정확히 100%
                </span>
              )}
              {allZero && (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontFamily: ff, color: colors.text.danger,
                  }}
                >
                  <Icon name="waring-fill" size={12} color="currentColor" />
                  최소 하나의 가중치는 0보다 커야 합니다
                </span>
              )}
            </div>
          </div>
        </FieldGroup>

        {/* Description — optional */}
        <FieldGroup
          label="설명 (선택)"
          hint="예: classifier-v2 품질 회귀로 트래픽 차단; canary 비중 축소"
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="이번 트래픽 변경의 배경과 목적을 작성해주세요. (선택)"
            rows={4}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: `1px solid ${colors.border.secondary}`,
              backgroundColor: colors.bg.primary,
              color: colors.text.primary,
              fontFamily: ff,
              fontSize: 13,
              lineHeight: "20px",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </FieldGroup>

        {/* Validation errors — only weight-related (reason is optional) */}
        {errors.length > 0 && (
          <div
            style={{
              padding: "10px 12px",
              border: `1px solid ${colors.bg.danger}`,
              borderRadius: 8,
              backgroundColor: colors.bg.dangerSubtle,
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            {errors.map((e, i) => (
              <span key={i} style={{ fontSize: 12, color: colors.text.danger, fontFamily: ff }}>⚠ {e}</span>
            ))}
          </div>
        )}

        <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, display: "inline-flex", gap: 4, alignItems: "center" }}>
          <Icon name="info-circle-stroke" size={14} color={colors.icon.tertiary} />
          저장 시 각 deployment에 대한 트래픽 변경 이벤트가 배포 이력에 자동 기록되며, 입력한 설명이 함께 저장됩니다.
        </span>
      </div>
    </Drawer>
  );
}

function ScalingSection({ initialPolicy, onChange }: { initialPolicy: ScalingPolicy; onChange?: (policy: ScalingPolicy) => void }) {
  const [policy, setPolicy] = useState<ScalingPolicy>(initialPolicy);
  const [editorOpen, setEditorOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const { colors } = useTheme();

  // Reset when the upstream initial policy changes (e.g., navigating between deployments)
  React.useEffect(() => { setPolicy(initialPolicy); }, [initialPolicy]);

  const handleSave = (next: ScalingPolicy) => {
    setPolicy(next);
    setEditorOpen(false);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2500);
    onChange?.(next);
  };

  return (
    <>
      <SectionCard title="Scaling" actions={<EditButton onClick={() => setEditorOpen(true)} />}>
        <ScalingPolicyView policy={policy} />
      </SectionCard>
      <ScalingPolicyEditor
        open={editorOpen}
        initial={policy}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
      {savedToast && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            padding: "12px 16px",
            borderRadius: 8,
            border: `1px solid ${colors.border.tertiary}`,
            backgroundColor: colors.bg.primary,
            color: colors.text.primary,
            fontFamily: ff, fontSize: 13,
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <Icon name="success-fill" size={16} color={colors.icon.success} />
          Scaling 정책이 저장됐습니다 — 무중단으로 즉시 적용됩니다.
        </div>
      )}
    </>
  );
}

function ServiceConfigSections({
  detail,
  onScalingChange,
}: {
  detail: DeploymentDetail;
  onScalingChange?: (policy: ScalingPolicy) => void;
}) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* ───── Model source ───── */}
        <SectionCard title="Model source">
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <KvRow label="Volume">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: colors.text.interactive.runwayPrimary,
                  textDecoration: "none",
                  fontFamily: ff,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                {detail.volume}
              </a>
            </KvRow>
            <KvRow label="Model path">
              <span style={{ fontFamily: ffMono }}>{detail.modelPath}</span>
            </KvRow>
          </div>
        </SectionCard>

        {/* ───── Compute Resources ───── */}
        <SectionCard title="Compute Resources" actions={<EditButton />}>
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* CPU + Memory */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <InlineKv label="CPU" value={detail.cpu} unit="milicores" />
              <InlineKv label="Memory" value={detail.memory} unit="MiB" />
            </div>

            {/* Advance options sub-card */}
            <div
              style={{
                border: `1px solid ${colors.border.tertiary}`,
                borderRadius: 8,
                backgroundColor: colors.bg.secondary,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: ff,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                Advance options
              </h3>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <InlineKv
                  label="Shared memory mount path"
                  value={detail.sharedMemMountPath}
                />
                <InlineKv
                  label="Shared memory"
                  value={detail.sharedMemSize}
                  unit="MiB"
                />
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                backgroundColor: colors.border.tertiary,
              }}
            />

            {/* GPU block */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                minHeight: 24,
              }}
            >
              <div
                style={{
                  width: 60,
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: 500,
                  color: colors.text.primary,
                  fontFamily: ff,
                  lineHeight: "20px",
                  paddingTop: 4,
                }}
              >
                GPU
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {detail.gpuTypes.map((g) => (
                    <Chip key={g} label={g} size="sm" tone="success" />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 32,
                    flexWrap: "wrap",
                    paddingTop: 4,
                  }}
                >
                  <InlineKv
                    label="GPU Count"
                    value={detail.gpuCount}
                    unit="GPUs"
                  />
                  <InlineKv
                    label="GPU core (%)"
                    value={detail.gpuCorePct}
                    unit="%"
                  />
                  <InlineKv
                    label="GPU memory (MiB)"
                    value={detail.gpuMemMib}
                    unit="MiB"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ───── Scaling ───── */}
        <ScalingSection initialPolicy={detail.scaling} onChange={onScalingChange} />

        {/* ───── Traffic Configuration ───── */}
        <SectionCard title="Traffic Configuration">
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <KvRow
              label={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Traffic Weight{" "}
                  <HelpIcon tip="User-set traffic weight relative to other deployments." />
                </span>
              }
              labelWidth={140}
            >
              {detail.trafficWeight}
            </KvRow>
            <KvRow
              label={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Effective Traffic{" "}
                  <HelpIcon tip="Actual percentage of traffic routed to this deployment." />
                </span>
              }
              labelWidth={140}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 200,
                }}
              >
                <span style={{ minWidth: 36, color: colors.text.primary }}>
                  {detail.effectiveTraffic}%
                </span>
                <div
                  style={{
                    flex: 1,
                    maxWidth: 140,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: colors.bg.neutral,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, detail.effectiveTraffic)}%`,
                      height: "100%",
                      backgroundColor: colors.bg.interactive.runwayPrimary,
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            </KvRow>
          </div>
        </SectionCard>

        {/* ───── Direct API Access ───── */}
        <DirectApiAccessSection apiUrl={detail.apiUrl} />
    </div>
  );
}
