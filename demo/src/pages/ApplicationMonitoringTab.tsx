import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer,
  Tooltip as ReTooltip, XAxis, YAxis,
} from "recharts";
import { Icon } from "@ds/components/Icon";
import { Select, SelectOption } from "@ds/components/Select";
import { Checkbox } from "@ds/components/Checkbox";
import { StatusChip } from "@ds/components/StatusChip";
import { TextField } from "@ds/components/TextField";
import { useTheme } from "../theme";
import {
  SectionTitle,
  TimeRange,
  TimeRangeRow,
  isoLocalNow,
} from "./AdminMonitoringPage";

const ff = "'Pretendard', sans-serif";

// ═══════════════════════════════════════════════════════════════════════════════
// Types & mock data
// ═══════════════════════════════════════════════════════════════════════════════
type ResourceKey = "cpu" | "memory" | "disk" | "gpu";

interface ResourceUsage {
  key: ResourceKey;
  label: string;
  iconName: "cpu" | "memory" | "storage" | "gpu";
  unit: string;
  request: number;
  limit: number;
  usage: number;
  /** N/A 상태 (e.g. GPU 미할당) */
  na?: boolean;
}

interface PodRow {
  name: string;
  status: "running" | "pending" | "failed" | "stopped";
  cpu: { req: number; limit: number; usage: number };
  memory: { req: number; limit: number; usage: number };
  disk: { req: number; limit: number; usage: number };
  gpu?: { req: number; limit: number; usage: number };
}

const SAMPLE_PODS: PodRow[] = [
  { name: "postgres-0",  status: "running", cpu: { req: 0.5, limit: 2,   usage: 0.42 }, memory: { req: 1,   limit: 4,   usage: 1.8 }, disk: { req: 8,  limit: 20, usage: 6.2 }, gpu: { req: 1, limit: 1, usage: 0.62 } },
  { name: "postgres-1",  status: "running", cpu: { req: 0.5, limit: 2,   usage: 1.94 }, memory: { req: 1,   limit: 4,   usage: 3.95 }, disk: { req: 8,  limit: 20, usage: 4.1 }, gpu: { req: 1, limit: 1, usage: 0.97 } },
  { name: "postgres-2",  status: "running", cpu: { req: 0.5, limit: 2,   usage: 0.18 }, memory: { req: 1,   limit: 4,   usage: 1.2 }, disk: { req: 8,  limit: 20, usage: 3.5 } },
  { name: "pgpool-0",    status: "pending", cpu: { req: 0.25, limit: 1,  usage: 0    }, memory: { req: 0.5, limit: 2,   usage: 0   }, disk: { req: 2,  limit: 5,  usage: 0   } },
  { name: "pgbouncer-0", status: "running", cpu: { req: 0.1,  limit: 0.5, usage: 0.08 }, memory: { req: 0.25, limit: 1,  usage: 0.4 }, disk: { req: 1,  limit: 2,  usage: 0.3 } },
];

function aggregate(pods: PodRow[]): ResourceUsage[] {
  const sum = (sel: (p: PodRow) => { req: number; limit: number; usage: number } | undefined) => {
    return pods.reduce(
      (acc, p) => {
        const v = sel(p);
        if (v) {
          acc.req += v.req;
          acc.limit += v.limit;
          acc.usage += v.usage;
        }
        return acc;
      },
      { req: 0, limit: 0, usage: 0 }
    );
  };
  const cpu = sum((p) => p.cpu);
  const mem = sum((p) => p.memory);
  const disk = sum((p) => p.disk);
  const gpu = sum((p) => p.gpu);
  return [
    { key: "cpu",    label: "CPU",    iconName: "cpu",     unit: "Cores", request: round2(cpu.req), limit: round2(cpu.limit), usage: round2(cpu.usage) },
    { key: "memory", label: "Memory", iconName: "memory",  unit: "GiB",   request: round2(mem.req), limit: round2(mem.limit), usage: round2(mem.usage) },
    { key: "disk",   label: "Disk",   iconName: "storage", unit: "GiB",   request: round2(disk.req), limit: round2(disk.limit), usage: round2(disk.usage) },
    { key: "gpu",    label: "GPU",    iconName: "gpu",     unit: "GPUs",  request: round2(gpu.req), limit: round2(gpu.limit), usage: round2(gpu.usage), na: gpu.limit === 0 },
  ];
}
function round2(n: number) { return Math.round(n * 100) / 100; }

// ═══════════════════════════════════════════════════════════════════════════════
// Aggregate resource card (request/limit/usage)
// ═══════════════════════════════════════════════════════════════════════════════
function AggregateCard({ res }: { res: ResourceUsage }) {
  const { colors } = useTheme();
  // usage / limit 기반 색상
  const pct = res.limit > 0 ? Math.min(100, (res.usage / res.limit) * 100) : 0;
  const overLimit = res.limit > 0 && res.usage >= res.limit;
  const barColor =
    overLimit            ? colors.bg.danger :
    pct >= 70            ? colors.bg.warning :
    colors.bg.success;

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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={res.iconName} size={24} color={colors.icon.secondary} />
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{res.label}</span>
        {overLimit && (
          <span style={{
            marginLeft: "auto", padding: "2px 8px", borderRadius: 4,
            backgroundColor: colors.bg.dangerSubtle, color: colors.text.danger,
            fontSize: 11, fontWeight: 600, fontFamily: ff,
          }}>
            Over limit
          </span>
        )}
      </div>

      {res.na ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 64, color: colors.text.tertiary, fontSize: 13, fontFamily: ff }}>
          N/A — GPU not allocated
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>Usage</span>
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 28, fontWeight: 600, color: colors.text.primary, fontFamily: ff, lineHeight: 1 }}>
                    {Math.round(pct)}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
                    %
                  </span>
                </span>
                <span style={{ fontSize: 11, color: colors.text.tertiary, fontFamily: ff }}>
                  ({res.usage} {res.unit})
                </span>
              </span>
            </div>
            <div style={{ position: "relative", height: 8, borderRadius: 9999, backgroundColor: colors.bg.neutral, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${pct}%`, backgroundColor: barColor, borderRadius: 9999, transition: "width 0.6s ease" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontFamily: ff, paddingTop: 12, borderTop: `1px solid ${colors.border.tertiary}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colors.text.secondary }}>Request</span>
              <span style={{ color: colors.text.primary, fontWeight: 500 }}>{res.request} {res.unit}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colors.text.secondary }}>Limit</span>
              <span style={{ color: colors.text.primary, fontWeight: 500 }}>{res.limit} {res.unit}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pods table (with sort by usage/limit)
// ═══════════════════════════════════════════════════════════════════════════════
type SortKey =
  | "name" | "status"
  | "cpuUsage" | "cpuLimit"
  | "memUsage" | "memLimit"
  | "diskUsage" | "diskLimit"
  | "gpuUsage" | "gpuLimit";
type SortDir = "asc" | "desc";

const STATUS_LABEL: Record<PodRow["status"], { state: "success" | "info" | "pending" | "stopped" | "error"; label: string }> = {
  running: { state: "success", label: "Running" },
  pending: { state: "pending", label: "Pending" },
  failed:  { state: "error",   label: "Failed" },
  stopped: { state: "stopped", label: "Stopped" },
};

function PodsTable({
  pods, query, selectedPod, onSelectPod,
}: {
  pods: PodRow[]; query: string;
  selectedPod: string | null; onSelectPod?: (name: string) => void;
}) {
  const { colors } = useTheme();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let arr = pods.filter((p) => p.name.toLowerCase().includes(q));
    arr.sort((a, b) => {
      const get = (p: PodRow): number | string => {
        switch (sort.key) {
          case "name":      return p.name;
          case "status":    return p.status;
          case "cpuUsage":  return p.cpu.usage;
          case "cpuLimit":  return p.cpu.limit;
          case "memUsage":  return p.memory.usage;
          case "memLimit":  return p.memory.limit;
          case "diskUsage": return p.disk.usage;
          case "diskLimit": return p.disk.limit;
          case "gpuUsage":  return p.gpu?.usage ?? -1;
          case "gpuLimit":  return p.gpu?.limit ?? -1;
        }
      };
      const va = get(a); const vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [pods, query, sort]);

  const headerBase: React.CSSProperties = {
    padding: "10px 12px", fontSize: 12, fontWeight: 600,
    color: colors.text.secondary, backgroundColor: colors.bg.tertiary,
    fontFamily: ff, textAlign: "left", whiteSpace: "nowrap",
    borderBottom: `1px solid ${colors.border.tertiary}`,
  };
  const cellBase: React.CSSProperties = {
    padding: "12px", fontSize: 13, color: colors.text.primary, fontFamily: ff, whiteSpace: "nowrap",
  };

  const SortHeader = ({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" }) => {
    const active = sort.key === k;
    return (
      <th
        onClick={() => setSort({ key: k, dir: active && sort.dir === "asc" ? "desc" : "asc" })}
        style={{ ...headerBase, cursor: "pointer", textAlign: align, userSelect: "none" }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}
          <span style={{ opacity: active ? 1 : 0.3, fontSize: 10 }}>
            {active && sort.dir === "desc" ? "▼" : "▲"}
          </span>
        </span>
      </th>
    );
  };

  return (
    <div style={{ border: `1px solid ${colors.border.tertiary}`, borderRadius: 12, overflow: "auto", backgroundColor: colors.bg.primary }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1200 }}>
        <thead>
          <tr>
            <SortHeader k="name"      label="Pod" />
            <SortHeader k="status"    label="Status" />
            <SortHeader k="cpuUsage"  label="CPU usage"   align="right" />
            <SortHeader k="cpuLimit"  label="CPU limit"   align="right" />
            <SortHeader k="memUsage"  label="Mem usage"   align="right" />
            <SortHeader k="memLimit"  label="Mem limit"   align="right" />
            <SortHeader k="diskUsage" label="Disk usage"  align="right" />
            <SortHeader k="diskLimit" label="Disk limit"  align="right" />
            <SortHeader k="gpuUsage"  label="GPU usage"   align="right" />
            <SortHeader k="gpuLimit"  label="GPU limit"   align="right" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const st = STATUS_LABEL[p.status];
            const overCpu = p.cpu.usage >= p.cpu.limit && p.cpu.limit > 0;
            const overMem = p.memory.usage >= p.memory.limit && p.memory.limit > 0;
            const overDisk = p.disk.usage >= p.disk.limit && p.disk.limit > 0;
            const overGpu = !!p.gpu && p.gpu.usage >= p.gpu.limit && p.gpu.limit > 0;
            const isSelected = selectedPod === p.name;
            return (
              <tr
                key={p.name}
                onClick={onSelectPod ? () => onSelectPod(p.name) : undefined}
                style={{
                  cursor: onSelectPod ? "pointer" : "default",
                  backgroundColor: onSelectPod && isSelected ? colors.bg.interactive.runwaySelected : "transparent",
                  borderTop: `1px solid ${colors.border.tertiary}`,
                }}
              >
                <td style={{ ...cellBase, fontWeight: 500, color: colors.text.interactive.runwayPrimary }}>{p.name}</td>
                <td style={cellBase}><StatusChip state={st.state} size="sm" label={st.label} /></td>
                <UsageCell value={p.cpu.usage}     unit="Cores" over={overCpu} />
                <td style={{ ...cellBase, textAlign: "right", color: colors.text.secondary }}>{p.cpu.limit} Cores</td>
                <UsageCell value={p.memory.usage}  unit="GiB"   over={overMem} />
                <td style={{ ...cellBase, textAlign: "right", color: colors.text.secondary }}>{p.memory.limit} GiB</td>
                <UsageCell value={p.disk.usage}    unit="GiB"   over={overDisk} />
                <td style={{ ...cellBase, textAlign: "right", color: colors.text.secondary }}>{p.disk.limit} GiB</td>
                {p.gpu ? (
                  <>
                    <UsageCell value={p.gpu.usage} unit="GPUs" over={overGpu} />
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.secondary }}>{p.gpu.limit} GPUs</td>
                  </>
                ) : (
                  <>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                    <td style={{ ...cellBase, textAlign: "right", color: colors.text.tertiary, fontStyle: "italic" }}>N/A</td>
                  </>
                )}
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={10} style={{ ...cellBase, textAlign: "center", color: colors.text.tertiary, padding: "32px 12px" }}>
                일치하는 파드가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${colors.border.tertiary}`, fontSize: 12, color: colors.text.tertiary, fontFamily: ff, backgroundColor: colors.bg.secondary }}>
        {filtered.length} pod(s)
      </div>
    </div>
  );
}

function UsageCell({ value, unit, over }: { value: number; unit: string; over: boolean }) {
  const { colors } = useTheme();
  return (
    <td style={{
      padding: "12px", fontSize: 13, fontFamily: ff, whiteSpace: "nowrap", textAlign: "right",
      color: over ? colors.text.danger : colors.text.primary,
      fontWeight: over ? 600 : 400,
    }}>
      {value} {unit} {over && <Icon name="warning-stroke" size={14} color={colors.icon.danger} style={{ verticalAlign: "middle", marginLeft: 4 }} />}
    </td>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pod-level trend chart (CPU/Memory/Disk/GPU each: request, limit, usage)
// ═══════════════════════════════════════════════════════════════════════════════
function makePodSeries(seed: number, request: number, limit: number, usagePeak: number, n = 24) {
  return Array.from({ length: n }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin(seed * 13.7 + i * 1.93 + k * 7.31) * 1000;
      return x - Math.floor(x);
    };
    const usage = round2(usagePeak * (0.4 + r(1) * 0.7));
    return {
      t: `${String(i).padStart(2, "0")}:00`,
      request,
      limit,
      usage,
    };
  });
}

function PodTrendChart({ title, unit, request, limit, peak, seed }: {
  title: string; unit: string; request: number; limit: number; peak: number; seed: number;
}) {
  const { colors, isDark } = useTheme();
  const data = useMemo(() => makePodSeries(seed, request, limit, peak), [seed, request, limit, peak]);
  const palette = {
    request: isDark ? "#9ca3af" : "#6b7280",
    limit:   "#a855f7",
    usage:   "#3b82f6",
    usageFill: "rgba(59,130,246,0.18)",
  };
  return (
    <div style={{
      backgroundColor: colors.bg.secondary,
      border: `1px solid ${colors.border.tertiary}`,
      borderRadius: 12, padding: 20,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{title}</span>
        <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>({unit})</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12, fontFamily: ff, color: colors.text.secondary }}>
        <Legend color={palette.request} label="Request" dashed />
        <Legend color={palette.limit}   label="Limit" dashed />
        <Legend color={palette.usage}   label="Usage" />
      </div>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id={`pod-fill-${seed}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={palette.usage} stopOpacity={0.25} />
                <stop offset="100%" stopColor={palette.usage} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={colors.border.tertiary} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: colors.text.tertiary, fontFamily: ff }} tickLine={false} axisLine={{ stroke: colors.border.tertiary }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: colors.text.tertiary, fontFamily: ff }} tickLine={false} axisLine={false} width={40} />
            <ReTooltip
              contentStyle={{
                backgroundColor: colors.bg.primary, border: `1px solid ${colors.border.secondary}`,
                borderRadius: 8, fontFamily: ff, fontSize: 12, padding: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: colors.text.tertiary, fontSize: 11 }}
              itemStyle={{ color: colors.text.primary }}
            />
            <Area type="monotone" dataKey="usage"   stroke={palette.usage}   strokeWidth={1.5} fill={`url(#pod-fill-${seed})`} dot={false} isAnimationActive={false} name="Usage" />
            <Line type="monotone" dataKey="limit"   stroke={palette.limit}   strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} name="Limit" />
            <Line type="monotone" dataKey="request" stroke={palette.request} strokeWidth={1.5} strokeDasharray="2 4" dot={false} isAnimationActive={false} name="Request" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 14, height: 0, borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ── Multi-select dropdown for pods ──────────────────────────────────────────
function MultiPodSelect({ pods, selected, onChange }: {
  pods: PodRow[]; selected: string[]; onChange: (next: string[]) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
  };
  const allSelected = selected.length === pods.length && pods.length > 0;
  const toggleAll = () => onChange(allSelected ? [] : pods.map((p) => p.name));

  const triggerLabel = selected.length === 0
    ? "파드 선택..."
    : selected.length === 1
      ? selected[0]
      : `${selected.length} pods selected`;

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 240 }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, width: "100%", height: 32, padding: "0 10px",
          borderRadius: 6,
          border: `1px solid ${open ? colors.border.interactive.runwayPrimary : hover ? colors.border.primary : colors.border.secondary}`,
          backgroundColor: colors.bg.primary,
          fontSize: 13, fontFamily: ff, color: colors.text.primary,
          cursor: "pointer", textAlign: "left",
          transition: "border-color 0.15s",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
          {triggerLabel}
        </span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.icon.secondary} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
            maxHeight: 320, overflow: "auto",
            backgroundColor: colors.bg.primary,
            border: `1px solid ${colors.border.secondary}`,
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 4,
          }}
        >
          <button
            onClick={toggleAll}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
              border: "none", borderRadius: 4, background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: colors.text.secondary, fontFamily: ff,
              textAlign: "left", borderBottom: `1px solid ${colors.border.tertiary}`,
            }}
          >
            <Checkbox checked={allSelected ? true : selected.length > 0 ? "indeterminate" : false} />
            <span>{allSelected ? "전체 해제" : "전체 선택"} ({selected.length}/{pods.length})</span>
          </button>
          {pods.map((p) => {
            const isSel = selected.includes(p.name);
            return (
              <button
                key={p.name}
                onClick={() => toggle(p.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
                  border: "none", borderRadius: 4, background: "transparent", cursor: "pointer",
                  fontSize: 13, color: colors.text.primary, fontFamily: ff, textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg.secondary)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Checkbox checked={isSel} />
                <span style={{ flex: 1 }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Multi-pod trend chart (multiple pods 비교 — usage 라인만 표시) ─────────
const POD_PALETTE = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#8b5cf6"];

function MultiPodTrendChart({ title, unit, pods, metric, seedBase }: {
  title: string; unit: string;
  pods: PodRow[];
  metric: "cpu" | "memory" | "disk" | "gpu";
  seedBase: number;
}) {
  const { colors } = useTheme();
  const podSeries = useMemo(() => {
    return pods.map((p, idx) => {
      const m = p[metric];
      if (!m) return { name: p.name, data: [] as ReturnType<typeof makePodSeries> };
      const data = makePodSeries(seedBase + idx * 17, m.req, m.limit, m.limit * 0.85);
      return { name: p.name, data };
    });
  }, [pods, metric, seedBase]);

  // merge series into single dataset by timestamp index
  const merged = useMemo(() => {
    const len = podSeries[0]?.data.length ?? 0;
    return Array.from({ length: len }, (_, i) => {
      const row: Record<string, number | string> = { t: podSeries[0]?.data[i]?.t ?? `${i}` };
      podSeries.forEach((p) => { row[p.name] = p.data[i]?.usage ?? 0; });
      return row;
    });
  }, [podSeries]);

  return (
    <div style={{
      backgroundColor: colors.bg.secondary,
      border: `1px solid ${colors.border.tertiary}`,
      borderRadius: 12, padding: 20,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{title}</span>
        <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff }}>({unit})</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, fontFamily: ff, color: colors.text.secondary }}>
        {pods.map((p, i) => (
          <Legend key={p.name} color={POD_PALETTE[i % POD_PALETTE.length]} label={p.name} />
        ))}
      </div>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={colors.border.tertiary} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: colors.text.tertiary, fontFamily: ff }} tickLine={false} axisLine={{ stroke: colors.border.tertiary }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: colors.text.tertiary, fontFamily: ff }} tickLine={false} axisLine={false} width={40} />
            <ReTooltip
              contentStyle={{
                backgroundColor: colors.bg.primary, border: `1px solid ${colors.border.secondary}`,
                borderRadius: 8, fontFamily: ff, fontSize: 12, padding: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: colors.text.tertiary, fontSize: 11 }}
              itemStyle={{ color: colors.text.primary }}
            />
            {pods.map((p, i) => (
              <Line key={p.name} type="monotone" dataKey={p.name}
                stroke={POD_PALETTE[i % POD_PALETTE.length]}
                strokeWidth={1.5} dot={false} isAnimationActive={false} name={p.name} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Monitoring tab content
// ═══════════════════════════════════════════════════════════════════════════════
interface ApplicationMonitoringTabProps {
  appName: string;
  /** 상단 scope selector (e.g. 모델 디플로이먼트 선택) */
  scopeSelector?: {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (v: string) => void;
  };
  /** Pod count to display (matches the corresponding workload's podCount). When omitted, shows full SAMPLE_PODS. */
  podCount?: number;
}

export function ApplicationMonitoringTab({ appName, scopeSelector, podCount }: ApplicationMonitoringTabProps) {
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>("1H");
  const [customFrom, setCustomFrom] = useState(() => isoLocalNow(-1));
  const [customTo, setCustomTo] = useState(() => isoLocalNow(0));
  const [podQuery, setPodQuery] = useState("");
  const pods = useMemo(
    () => podCount !== undefined ? SAMPLE_PODS.slice(0, Math.max(0, podCount)) : SAMPLE_PODS,
    [podCount]
  );
  // Trend chart scope — "all" = aggregate sum, or a pod name for single-pod view.
  const [trendScope, setTrendScope] = useState<string>("all");

  // If pod set changes (deep-link to different workload), reset trend scope.
  useEffect(() => {
    setTrendScope("all");
  }, [pods]);

  const aggregates = useMemo(() => aggregate(pods), [pods]);
  const focusPod = pods.find((p) => p.name === trendScope);
  const isAggregate = trendScope === "all";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Scope selector (e.g. Model deployment 선택) */}
      {scopeSelector && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: 16,
          borderRadius: 12,
          backgroundColor: colors.bg.secondary,
          border: `1px solid ${colors.border.tertiary}`,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.secondary, fontFamily: ff, whiteSpace: "nowrap" }}>
            {scopeSelector.label}
          </span>
          <div style={{ minWidth: 280, maxWidth: 400, flex: 1 }}>
            <Select
              options={scopeSelector.options}
              value={scopeSelector.value}
              onChange={scopeSelector.onChange}
              aria-label={scopeSelector.label}
            />
          </div>
        </div>
      )}

      {/* 자원 합산 현황 */}
      <div>
        <SectionTitle
          title="자원 합산 현황"
          hint={`${appName} 워크로드의 모든 파드를 합산한 자원 사용 현황입니다.\n• Request: 파드들이 요청한 자원 총합\n• Limit: 파드들의 최대 사용 가능 자원 총합\n• Usage: 현재 사용량 합계`}
        />
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {aggregates.map((r) => <AggregateCard key={r.key} res={r} />)}
        </div>
      </div>

      {/* 자원 추세 그래프 */}
      <div>
        <SectionTitle
          title="자원 추세"
          adjacent={
            <div style={{ minWidth: 200 }}>
              <Select
                options={[
                  { value: "all", label: "전체" },
                  ...pods.map((p) => ({ value: p.name, label: p.name })),
                ]}
                value={trendScope}
                onChange={setTrendScope}
                aria-label="추세 범위"
              />
            </div>
          }
          right={
            <TimeRangeRow
              value={timeRange} onChange={setTimeRange}
              customFrom={customFrom} customTo={customTo}
              onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo}
              onApplyCustom={() => {}}
            />
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
          {isAggregate ? (
            <>
              <PodTrendChart title="CPU"    unit="Cores" request={aggregates[0].request} limit={aggregates[0].limit} peak={aggregates[0].limit * 0.85} seed={11} />
              <PodTrendChart title="Memory" unit="GiB"   request={aggregates[1].request} limit={aggregates[1].limit} peak={aggregates[1].limit * 0.7}  seed={22} />
              <PodTrendChart title="Disk"   unit="GiB"   request={aggregates[2].request} limit={aggregates[2].limit} peak={aggregates[2].limit * 0.4}  seed={33} />
              {!aggregates[3].na && (
                <PodTrendChart title="GPU"  unit="GPUs"  request={aggregates[3].request} limit={aggregates[3].limit} peak={aggregates[3].limit * 0.6}  seed={44} />
              )}
            </>
          ) : (
            focusPod && (
              <>
                <PodTrendChart title="CPU"    unit="Cores" request={focusPod.cpu.req}    limit={focusPod.cpu.limit}    peak={focusPod.cpu.limit * 0.95}    seed={101} />
                <PodTrendChart title="Memory" unit="GiB"   request={focusPod.memory.req} limit={focusPod.memory.limit} peak={focusPod.memory.limit * 0.8} seed={102} />
                <PodTrendChart title="Disk"   unit="GiB"   request={focusPod.disk.req}   limit={focusPod.disk.limit}   peak={focusPod.disk.limit * 0.4}   seed={103} />
                {focusPod.gpu && (
                  <PodTrendChart title="GPU"  unit="GPUs"  request={focusPod.gpu.req}    limit={focusPod.gpu.limit}    peak={focusPod.gpu.limit * 0.6}    seed={104} />
                )}
              </>
            )
          )}
        </div>
      </div>

      {/* Pods table */}
      <div>
        <SectionTitle title="파드별 자원 현황" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <div style={{ maxWidth: 280, flex: 1 }}>
            <TextField
              value={podQuery}
              onChange={(e) => setPodQuery(e.target.value)}
              placeholder="Pod 이름 검색..."
              leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
            />
          </div>
        </div>
        <PodsTable
          pods={pods}
          query={podQuery}
          selectedPod={null}
        />
      </div>
    </div>
  );
}

export default ApplicationMonitoringTab;
