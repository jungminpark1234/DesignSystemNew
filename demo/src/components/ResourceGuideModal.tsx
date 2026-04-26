import React, { useState, useEffect } from "react";
import { Icon } from "@ds/components/Icon";
import { Tabs } from "@ds/components/Tabs";
import { Alert } from "@ds/components/Alert";
import { CopyButton } from "@ds/components/CopyButton";
import { useTheme } from "../theme";
import { DrawerShell, SecondaryButton } from "./DrawerShell";

const ff = "'Pretendard', sans-serif";

// ── Animated progress bar (8px height) ──────────────────────────────────────
function ProgressBar({ pct, color, animate }: { pct: number; color: string; animate?: boolean }) {
  const [width, setWidth] = useState(animate ? 0 : pct);
  useEffect(() => {
    if (animate) {
      setWidth(0);
      const t = setTimeout(() => setWidth(pct), 50);
      return () => clearTimeout(t);
    } else {
      setWidth(pct);
    }
  }, [pct, animate]);
  return (
    <div style={{ width: "100%", height: 8, borderRadius: 9999, backgroundColor: "#d1d5dc" }}>
      <div style={{ width: `${Math.min(width, 100)}%`, height: "100%", borderRadius: 9999, backgroundColor: color, transition: animate ? "width 0.8s cubic-bezier(0.4,0,0.2,1)" : "none" }} />
    </div>
  );
}

function getPctColor(pct: number) {
  if (pct >= 90) return "#e7000b";
  if (pct >= 60) return "#f0a000";
  return "#00a63e";
}

// ── Resource allocation card (matches Figma exactly) ────────────────────────
function AllocationCard({ icon, label, pct, allocated, capacity, allocatable, allocatableUnit, animate }: {
  icon: string; label: string; pct: number; allocated: string; capacity: string; allocatable: string; allocatableUnit: string; animate?: boolean;
}) {
  const { colors } = useTheme();
  const color = getPctColor(pct);
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: 24, borderRadius: 16,
      border: `1px solid ${colors.border.secondary}`,
      backgroundColor: `var(--ds-bg-interactive-secondary-hovered, ${colors.bg.secondary})`,
      display: "flex", flexDirection: "column", gap: 24, overflow: "hidden",
    }}>
      {/* Title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon as any} size={24} color={colors.icon.secondary} />
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff }}>{label}</span>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Allocation rate */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>Allocation rate</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{pct}%</span>
        </div>

        {/* Progress + info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ProgressBar pct={pct} color={color} animate={animate} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: ff, fontSize: 10, fontWeight: 500, lineHeight: "16px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#6b7280" }}>Allocated</span>
              <span style={{ color: colors.text.primary }}>{allocated}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#6b7280" }}>Capacity</span>
              <span style={{ color: colors.text.primary }}>{capacity}</span>
            </div>
          </div>
        </div>

        {/* Allocatable */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff }}>Allocateble</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#476bfa", fontFamily: ff }}>{allocatable} {allocatableUnit}</span>
        </div>
      </div>
    </div>
  );
}

// ── Node CPU/Memory sub-card (white bg, same structure as AllocationCard) ───
function NodeStatCard({ icon, label, pct, allocated, capacity, allocatable, animate }: {
  icon: string; label: string; pct: number; allocated: string; capacity: string; allocatable: string; animate?: boolean;
}) {
  const { colors } = useTheme();
  const color = getPctColor(pct);
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: 16, borderRadius: 16,
      border: `1px solid ${colors.border.secondary}`,
      backgroundColor: "#ffffff",
      display: "flex", flexDirection: "column", gap: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon as any} size={24} color={colors.icon.secondary} />
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>Allocation rate</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{pct}%</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ProgressBar pct={pct} color={color} animate={animate} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: ff, fontSize: 10, fontWeight: 500, lineHeight: "16px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#6b7280" }}>Allocated</span>
              <span style={{ color: colors.text.primary }}>{allocated}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#6b7280" }}>Capacity</span>
              <span style={{ color: colors.text.primary }}>{capacity}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff }}>Allocateble</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#476bfa", fontFamily: ff }}>{allocatable}</span>
        </div>
      </div>
    </div>
  );
}

// ── Small progress bar (4px for GPU detail) ─────────────────────────────────
function SmallProgressBar({ pct, color, animate }: { pct: number; color: string; animate?: boolean }) {
  const [width, setWidth] = useState(animate ? 0 : pct);
  useEffect(() => {
    if (animate) {
      setWidth(0);
      const t = setTimeout(() => setWidth(pct), 50);
      return () => clearTimeout(t);
    } else {
      setWidth(pct);
    }
  }, [pct, animate]);
  return (
    <div style={{ width: "100%", height: 4, borderRadius: 9999, backgroundColor: "#d1d5dc" }}>
      <div style={{ width: `${Math.min(width, 100)}%`, height: "100%", borderRadius: 9999, backgroundColor: color, transition: animate ? "width 0.8s cubic-bezier(0.4,0,0.2,1)" : "none" }} />
    </div>
  );
}

// ── GPU detail row (interactive card: default/hovered/focused) ──────────────
function GpuDetailRow({ id, corePct, coreAllocPct, coreAllocatable, memAllocatable, memAllocated, memCapacity, memPct, animate }: {
  id: string; corePct: number; coreAllocPct: string; coreAllocatable: string;
  memAllocatable: string; memAllocated: string; memCapacity: string; memPct: number; animate?: boolean;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [usingMouse, setUsingMouse] = useState(false);
  const showFocusRing = focused && !usingMouse;

  const shadow2 = "0px 0px 1px 0px rgba(0,0,0,0.12), 0px 1px 2px 0px rgba(0,0,0,0.16)";
  const shadow8 = "0px 0px 4px 0px rgba(0,0,0,0.12), 0px 4px 8px 0px rgba(0,0,0,0.16)";

  return (
    <div
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setUsingMouse(true)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); setUsingMouse(false); }}
      style={{
        backgroundColor: hovered ? "#f9fafb" : "#ffffff",
        border: showFocusRing
          ? "2px solid #155dfc"
          : hovered
            ? "1px solid #d1d5dc"
            : "1px solid #f3f4f6",
        borderRadius: 16,
        padding: showFocusRing ? 15 : 16,
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: hovered || showFocusRing ? shadow8 : shadow2,
        cursor: "pointer",
        outline: "none",
        transition: "background-color 0.15s, border-color 0.15s, box-shadow 0.2s",
      }}
    >
      {/* GPU ID + copy */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.primary, fontFamily: ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{id}</span>
        <CopyButton text={id} size={24} />
      </div>

      {/* Core + Memory side by side */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* Core */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 500, fontFamily: ff }}>
            <span style={{ color: "#6b7280" }}>Core</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#48556a" }}>Allocateble</span>
              <span style={{ color: "#476bfa" }}>{coreAllocatable}</span>
            </div>
          </div>
          <SmallProgressBar pct={corePct} color={getPctColor(corePct)} animate={animate} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 400, fontFamily: ff, color: "#6b7280" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span>Allocated</span><span>{coreAllocPct}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span>Capacity</span><span>100 %</span>
            </div>
          </div>
        </div>
        {/* Memory */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 500, fontFamily: ff }}>
            <span style={{ color: "#6b7280" }}>Memory</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#48556a" }}>Allocateble</span>
              <span style={{ color: "#476bfa" }}>{memAllocatable}</span>
            </div>
          </div>
          <SmallProgressBar pct={memPct} color={getPctColor(memPct)} animate={animate} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 400, fontFamily: ff, color: "#6b7280" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span>Allocated</span><span>{memAllocated}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span>Capacity</span><span>{memCapacity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Node section (outer card: bg surface, inner cards: white) ───────────────
interface NodeData {
  name: string;
  cpuPct: number; cpuAlloc: string; cpuCap: string; cpuAllocatable: string;
  memPct: number; memAlloc: string; memCap: string; memAllocatable: string;
  gpu?: {
    label: string; memSize: string; count: string;
    rows: { id: string; corePct: number; coreAllocPct: string; coreAllocatable: string; memAllocatable: string; memAllocated: string; memCapacity: string; memPct: number }[];
  };
}

function NodeSection({ node }: { node: NodeData }) {
  const { colors } = useTheme();
  return (
    <div style={{
      backgroundColor: colors.bg.secondary, border: `1px solid ${colors.border.tertiary}`,
      borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 24,
    }}>
      {/* Node name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="disk" size={24} color={colors.icon.secondary} />
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff }}>{node.name}</span>
      </div>

      {/* CPU + Memory (white sub-cards) */}
      <div style={{ display: "flex", gap: 8 }}>
        <NodeStatCard icon="cpu" label="CPU" pct={node.cpuPct} allocated={node.cpuAlloc} capacity={node.cpuCap} allocatable={node.cpuAllocatable} animate />
        <NodeStatCard icon="memory" label="Memory" pct={node.memPct} allocated={node.memAlloc} capacity={node.memCap} allocatable={node.memAllocatable} animate />
      </div>

      {/* GPU section (white card) */}
      {node.gpu && (
        <div style={{
          backgroundColor: "#ffffff", border: `1px solid ${colors.border.secondary}`,
          borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden",
        }}>
          {/* GPU title bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="gpu" size={24} color={colors.icon.secondary} />
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff }}>GPU</span>
            <span style={{
              fontSize: 13, fontWeight: 500, padding: "4px 8px", borderRadius: 4,
              backgroundColor: "#f6ffe5", color: "#77b900",
            }}>CUDA v.12.0</span>
          </div>

          {/* GPU model info */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, fontFamily: ff }}>{node.gpu.label}</span>
            <CopyButton text={node.gpu.label} size={24} />
            <span style={{ fontSize: 10, color: colors.text.secondary, fontFamily: ff }}>({node.gpu.memSize})</span>
            <div style={{ width: 1, height: "100%", backgroundColor: "#ced3de" }} />
            <span style={{ fontSize: 10, color: colors.text.secondary, fontFamily: ff }}>{node.gpu.count}</span>
          </div>

          {/* GPU rows */}
          {node.gpu.rows.map((row, i) => <GpuDetailRow key={i} {...row} animate />)}
        </div>
      )}
    </div>
  );
}

// ── Sample data (all different values, GPU Core capacity always 100%) ───────
const NODES: NodeData[] = [
  {
    name: "black-cow-1",
    cpuPct: 82, cpuAlloc: "164 Cores", cpuCap: "200 Cores", cpuAllocatable: "36 Cores",
    memPct: 31, memAlloc: "54 GiB", memCap: "174 GiB", memAllocatable: "120 GiB",
    gpu: {
      label: "Tesla V100-SXM2-32GB", memSize: "31.7GiB", count: "3 GPUs",
      rows: [
        { id: "GPU-2e915f02-6b3a-4f9e-8c1d-7a5b3c2d1e0f", corePct: 72, coreAllocPct: "72 %", coreAllocatable: "28%", memAllocatable: "18.3 GiB", memAllocated: "13.4 GiB", memCapacity: "31.7 GiB", memPct: 42 },
        { id: "GPU-b5a14d93-2e8f-7c6a-0b5d-9e4f3a2b1c8d", corePct: 91, coreAllocPct: "91 %", coreAllocatable: "9%", memAllocatable: "5.2 GiB", memAllocated: "26.5 GiB", memCapacity: "31.7 GiB", memPct: 84 },
        { id: "GPU-c7d28a41-9f3e-4b1a-ae72-1c8d5f0e3b9a", corePct: 45, coreAllocPct: "45 %", coreAllocatable: "55%", memAllocatable: "22.1 GiB", memAllocated: "9.6 GiB", memCapacity: "31.7 GiB", memPct: 30 },
      ],
    },
  },
  {
    name: "black-cow-2",
    cpuPct: 58, cpuAlloc: "174 Cores", cpuCap: "300 Cores", cpuAllocatable: "126 Cores",
    memPct: 43, memAlloc: "74 GiB", memCap: "174 GiB", memAllocatable: "100 GiB",
    gpu: {
      label: "Tesla V100-SXM2-32GB", memSize: "27.7GiB", count: "3 GPUs",
      rows: [
        { id: "GPU-d4e56f78-1a2b-3c4d-5e6f-7a8b9c0d1e2f", corePct: 35, coreAllocPct: "35 %", coreAllocatable: "65%", memAllocatable: "16.8 GiB", memAllocated: "10.9 GiB", memCapacity: "27.7 GiB", memPct: 39 },
        { id: "GPU-e5f67a89-2b3c-4d5e-6f7a-8b9c0d1e2f3a", corePct: 67, coreAllocPct: "67 %", coreAllocatable: "33%", memAllocatable: "8.4 GiB", memAllocated: "19.3 GiB", memCapacity: "27.7 GiB", memPct: 70 },
        { id: "GPU-f6a78b90-3c4d-5e6f-7a8b-9c0d1e2f3a4b", corePct: 52, coreAllocPct: "52 %", coreAllocatable: "48%", memAllocatable: "14.1 GiB", memAllocated: "13.6 GiB", memCapacity: "27.7 GiB", memPct: 49 },
      ],
    },
  },
  {
    name: "black-cow-3",
    cpuPct: 94, cpuAlloc: "188 Cores", cpuCap: "200 Cores", cpuAllocatable: "12 Cores",
    memPct: 17, memAlloc: "30 GiB", memCap: "174 GiB", memAllocatable: "144 GiB",
    gpu: {
      label: "NVIDIA A100-SXM4-80GB", memSize: "79.3GiB", count: "1 GPU",
      rows: [
        { id: "GPU-a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", corePct: 28, coreAllocPct: "28 %", coreAllocatable: "72%", memAllocatable: "58.2 GiB", memAllocated: "21.1 GiB", memCapacity: "79.3 GiB", memPct: 27 },
      ],
    },
  },
  {
    name: "black-cow-4",
    cpuPct: 41, cpuAlloc: "82 Cores", cpuCap: "200 Cores", cpuAllocatable: "118 Cores",
    memPct: 62, memAlloc: "108 GiB", memCap: "174 GiB", memAllocatable: "66 GiB",
  },
];

// ── Main component ──────────────────────────────────────────────────────────
interface ResourceGuideModalProps {
  open: boolean;
  onClose: () => void;
  /** "Resource allocation" 섹션을 숨김 (e.g. 모니터링 페이지에서는 이미 동일 정보를 보여주므로 중복 제거) */
  hideResourceAllocation?: boolean;
  /** Base domain 섹션을 숨김 */
  hideBaseDomain?: boolean;
  /** 상단 탭(Resource overview / Volume)을 숨김. 숨기면 overview 콘텐츠만 표시 */
  hideTabs?: boolean;
  /** standalone=true 면 일반 right-side Drawer로 동작 (다른 Drawer 옆에 붙는 패널 모드 OFF) */
  standalone?: boolean;
}

export function ResourceGuideModal({
  open,
  onClose,
  hideResourceAllocation = false,
  hideBaseDomain = false,
  hideTabs = false,
  standalone = false,
}: ResourceGuideModalProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");

  // side-by-side 모드: panelStyle override 때문에 DS Drawer 의 transform 슬라이드가 작동하지 않음
  // → open=false 일 때 아예 unmount 해야 안 보임
  if (!standalone && !open) return null;

  const sideBySideProps = {
    noBackdrop: true,
    panelStyle: { position: "fixed" as const, top: 0, right: "max(800px, 40vw)", bottom: 0, zIndex: 401 },
  };
  const standaloneProps = {};

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      title="Resource guide"
      {...(standalone ? standaloneProps : sideBySideProps)}
      footer={<SecondaryButton label="Close" onClick={onClose} />}
    >
      {/* Base domain */}
      {!hideBaseDomain && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", height: 32, justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>Base domain</span>
          </div>
          <Alert
            status="brand"
            alertStyle="subtle"
            variant="desc"
            description="v2.mrxrunway.ai"
            icon={<Icon name="global" size={24} color={colors.icon.secondary} />}
            dismissible={false}
          />
        </div>
      )}

      {/* Tabs (DS component) */}
      {!hideTabs && (
        <div style={{ marginBottom: 24 }}>
          <Tabs
            items={[
              { key: "overview", label: "Resource overview" },
              { key: "volume", label: "Volume" },
            ]}
            selectedKey={activeTab}
            onChange={setActiveTab}
          />
        </div>
      )}

      {(hideTabs || activeTab === "overview") && (
        <>
          {/* Resource allocation */}
          {!hideResourceAllocation && (
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, fontFamily: ff, display: "block", marginBottom: 16 }}>
                Resource allocation
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <AllocationCard icon="cpu" label="CPU" pct={75} allocated="210 Cores" capacity="256 Cores" allocatable="46" allocatableUnit="Cores" animate />
                  <AllocationCard icon="memory" label="Memory" pct={25} allocated="24 GiB" capacity="174 GiB" allocatable="150" allocatableUnit="GiB" animate />
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <AllocationCard icon="disk" label="Storage" pct={99} allocated="48000 GiB" capacity="50000 GiB" allocatable="2000" allocatableUnit="GiB" animate />
                  <AllocationCard icon="gpu" label="GPU" pct={25} allocated="4 GPUs" capacity="16 GPUs" allocatable="12" allocatableUnit="GPUs" animate />
                </div>
              </div>
            </div>
          )}

          {/* Node resources */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>Node resources</span>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4, height: 28, padding: "0 8px",
                  borderRadius: 6, border: `1px solid ${colors.border.secondary}`, fontSize: 12, fontFamily: ff, color: colors.text.secondary,
                }}>
                  <Icon name="filter" size={14} color={colors.icon.secondary} />
                  필터
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4, height: 28, padding: "0 8px",
                  borderRadius: 6, border: `1px solid ${colors.border.secondary}`, fontSize: 12, fontFamily: ff, color: colors.text.secondary,
                }}>
                  <Icon name="sort" size={14} color={colors.icon.secondary} />
                  상태
                </div>
              </div>
            </div>

            {NODES.map((node) => <NodeSection key={node.name} node={node} />)}
          </div>
        </>
      )}

      {activeTab === "volume" && (
        <div style={{ padding: 40, textAlign: "center", color: colors.text.tertiary, fontFamily: ff, fontSize: 14 }}>
          Volume information will be displayed here.
        </div>
      )}
    </DrawerShell>
  );
}
