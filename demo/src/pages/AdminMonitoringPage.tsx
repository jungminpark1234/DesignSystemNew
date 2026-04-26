import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { Tabs } from "@ds/components/Tabs";
import { TextField } from "@ds/components/TextField";
import { useTheme } from "../theme";
import { WORKSPACE_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { SecondaryButton, PrimaryButton } from "../components/DrawerShell";
import { ResourceGuideModal } from "../components/ResourceGuideModal";
import { WorkloadsTable, SAMPLE_WORKLOADS } from "./ProjectMonitoringPage";

const ff = "'Pretendard', sans-serif";

// ═══════════════════════════════════════════════════════════════════════════════
// Sidebar header (matches AdminGeneralPage style)
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarHeader() {
  const { colors } = useTheme();
  return (
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
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mock data
// ═══════════════════════════════════════════════════════════════════════════════
export type Metric = {
  key: "cpu" | "memory" | "storage" | "gpu";
  label: string;
  unit: string;
  iconName: "cpu" | "memory" | "storage" | "gpu";
  allocated: number;
  capacity: number;
  allocatable: number;
  /** subtle = under 80%, warning 80–90%, danger > 90% */
};

export const METRICS: Metric[] = [
  { key: "cpu",     label: "CPU",     unit: "Cores", iconName: "cpu",     allocated: 210,   capacity: 256,   allocatable: 46   },
  { key: "memory",  label: "Memory",  unit: "GB",    iconName: "memory",  allocated: 850,   capacity: 1024,  allocatable: 174  },
  { key: "storage", label: "Storage", unit: "GB",    iconName: "storage", allocated: 48000, capacity: 50000, allocatable: 2000 },
  { key: "gpu",     label: "GPU",     unit: "GPUs",  iconName: "gpu",     allocated: 4,     capacity: 16,    allocatable: 12   },
];

// 시계열 — 12개월치 mock (실제로는 API 호출). 타임 레인지 탭에 따라 바꿔도 시각적으로 동일하게 동작.
const TIME_LABELS = [
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
];

function makeSeries(seed: number, capacity: number, allocatedRange: [number, number], usedRange: [number, number]) {
  const rand = (i: number) => {
    const x = Math.sin(seed * 1000 + i * 7.13) * 10000;
    return x - Math.floor(x);
  };
  return TIME_LABELS.map((t, i) => {
    const allocated = allocatedRange[0] + (allocatedRange[1] - allocatedRange[0]) * (0.4 + rand(i) * 0.6);
    const used = usedRange[0] + (usedRange[1] - usedRange[0]) * rand(i + 100);
    return {
      t,
      capacity,
      allocated: Math.round(allocated * 100) / 100,
      used: Math.round(used * 100) / 100,
    };
  });
}

const SERIES: Record<Metric["key"], { data: ReturnType<typeof makeSeries>; unit: string; label: string }> = {
  cpu:     { data: makeSeries(1, 16, [4, 14], [3, 12]),  unit: "cores", label: "CPU" },
  memory:  { data: makeSeries(2, 16, [4, 14], [4, 13]),  unit: "GiB",   label: "Memory" },
  storage: { data: makeSeries(3, 16, [4, 13], [3, 12]),  unit: "GiB",   label: "Storage" },
  gpu:     { data: makeSeries(4, 16, [4, 13], [4, 13]),  unit: "GPUs",  label: "GPU" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Card primitives
// ═══════════════════════════════════════════════════════════════════════════════
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{title}</span>
        {hint && (
          <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ display: "inline-flex", alignItems: "center", cursor: "help", position: "relative" }}
          >
            <Icon name="info-circle-stroke" size={16} color={colors.icon.secondary} />
            {hover && (
              <div
                role="tooltip"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: -8,
                  zIndex: 50,
                  width: 320,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.bg.primary,
                  border: `1px solid ${colors.border.secondary}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  fontSize: 12,
                  lineHeight: "18px",
                  color: colors.text.secondary,
                  fontFamily: ff,
                  whiteSpace: "pre-line",
                }}
              >
                {hint}
              </div>
            )}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Allocation card (KPI tile with progress bar)
// ═══════════════════════════════════════════════════════════════════════════════
export function AllocationCard({ metric, onViewDetails }: { metric: Metric; onViewDetails?: () => void }) {
  const { colors } = useTheme();
  const pct = Math.min(100, (metric.allocated / metric.capacity) * 100);
  // 70%↑ 노랑, 90%↑ 빨강, 그 외 초록
  const barColor =
    pct >= 90 ? colors.bg.danger :
    pct >= 70 ? colors.bg.warning :
    colors.bg.success;
  // 0 → pct 애니메이션
  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    setAnimPct(0);
    const t = window.setTimeout(() => setAnimPct(pct), 60);
    return () => window.clearTimeout(t);
  }, [pct]);

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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>
            Allocation rate
          </span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: colors.text.primary, fontFamily: ff, lineHeight: 1 }}>
              {Math.round(animPct)}
            </span>
            <span style={{ fontSize: 20, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>%</span>
          </span>
        </div>
        {/* Progress bar (custom — colored by % bucket, animated 0→pct) */}
        <div style={{ position: "relative", height: 8, borderRadius: 9999, backgroundColor: colors.bg.neutral, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute", inset: 0, width: `${animPct}%`,
              backgroundColor: barColor,
              borderRadius: 9999,
              transition: "width 0.9s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: ff }}>
          <span style={{ color: colors.text.secondary }}>
            Allocated <span style={{ color: colors.text.primary, fontWeight: 500 }}>{metric.allocated.toLocaleString()} {metric.unit}</span>
          </span>
          <span style={{ color: colors.text.secondary }}>
            Capacity <span style={{ color: colors.text.primary, fontWeight: 500 }}>{metric.capacity.toLocaleString()} {metric.unit}</span>
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${colors.border.tertiary}` }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>Allocatable</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.text.interactive.runwayPrimary, fontFamily: ff }}>
          {metric.allocatable.toLocaleString()} {metric.unit}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Semicircle gauge (Quota assignment)
// ═══════════════════════════════════════════════════════════════════════════════
function SemicircleGauge({ value, color, empty = false, animate = true }: { value: number; color: string; empty?: boolean; animate?: boolean }) {
  const { colors } = useTheme();
  // viewBox 좌표 — 컨테이너 너비에 맞춰 반응형 스케일됨
  const W = 200;
  const stroke = 16;
  const r = (W - stroke) / 2;
  const cx = W / 2;
  const cy = W / 2; // bottom of arc baseline = cy
  const H = cy + stroke / 2;

  const safe = empty ? 0 : Math.max(0, Math.min(100, value));
  // 0 → safe 애니메이션 (가운데 숫자 카운트업도 같이 오게)
  const [animVal, setAnimVal] = useState(animate ? 0 : safe);
  useEffect(() => {
    if (!animate) {
      setAnimVal(safe);
      return;
    }
    setAnimVal(0);
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimVal(safe * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [safe, animate]);

  // 반원에서 fill 호는 항상 180° 이하 → large-arc-flag = 0, sweep-flag = 1 (시계방향)
  const arcPath = (pct: number) => {
    if (pct <= 0) return "";
    const clamped = Math.min(0.9999, pct);
    const a = Math.PI - Math.PI * clamped;
    const x = cx + r * Math.cos(a);
    const y = cy - r * Math.sin(a);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`;
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 220, aspectRatio: `${W} / ${H}`, margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <path
          d={arcPath(1)}
          stroke={colors.bg.neutral}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
        {!empty && animVal > 0 && (
          <path
            d={arcPath(animVal / 100)}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {/* 가운데 % 텍스트 — animVal 카운트업과 함께 변화 */}
        {!empty && (
          <g transform={`translate(${cx} ${cy - 6})`} pointerEvents="none">
            <text
              textAnchor="middle"
              dominantBaseline="alphabetic"
              fontFamily={ff}
              fontWeight={600}
              fontSize={28}
              fill={colors.text.primary}
            >
              {Math.round(animVal)}
              <tspan fontSize={20} fontWeight={500} fill={colors.text.secondary} dx={2}>
                %
              </tspan>
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Quota card (Projects scope — gauge style)
// ═══════════════════════════════════════════════════════════════════════════════
export function QuotaCard({ metric, sharedNote }: { metric: Metric; sharedNote?: string }) {
  const { colors } = useTheme();
  const pct = (metric.allocated / metric.capacity) * 100;
  const color =
    pct >= 90 ? colors.bg.danger :
    pct >= 70 ? colors.bg.warning :
    colors.bg.success;
  const isShared = !!sharedNote;
  return (
    <div
      style={{
        flex: 1, minWidth: 0,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        padding: 20,
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={metric.iconName} size={24} color={colors.icon.secondary} />
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{metric.label}</span>
      </div>

      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>
        Assignment rate
      </span>

      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <SemicircleGauge value={pct} color={color} empty={isShared} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, fontFamily: ff, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ color: colors.text.secondary }}>Assigned</span>
          <span style={{ color: colors.text.primary, fontWeight: 500 }}>
            {metric.allocated.toLocaleString()} {metric.unit}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end", minWidth: 0 }}>
          <span style={{ color: colors.text.secondary }}>Capacity</span>
          <span style={{ color: colors.text.primary, fontWeight: 500 }}>
            {metric.capacity.toLocaleString()} {metric.unit}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 12, borderTop: `1px solid ${colors.border.tertiary}` }}>
        {isShared ? (
          <span style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: ff, lineHeight: "16px" }}>{sharedNote}</span>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>Assignable</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.text.interactive.runwayPrimary, fontFamily: ff }}>
              {metric.allocatable.toLocaleString()} {metric.unit}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Projects table (grouped headers — custom because DS Table doesn't support grouping)
// ═══════════════════════════════════════════════════════════════════════════════
export type ProjectRow = {
  name: string;
  cpu:    { rate: string; util: string; assigned: string; allocated: string; used: string };
  memory: { rate: string; util: string; assigned: string; allocated: string; used: string };
  disk:   { rate: string; util: string; assigned: string; allocated: string; used: string };
};

// Project 이름은 ProjectsPage 의 SAMPLE_PROJECTS 와 일치
export const PROJECTS: ProjectRow[] = [
  { name: "Aurora DB",     cpu: r("36.4 %", "71.4 %", "24 cores", "24 cores",   "24 cores"), memory: r("36.4 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "Cassandra",     cpu: r("71.4 %", "71.4 %", "24 cores", "8.74 cores", "24 cores"), memory: r("71.4 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "Athena Query",  cpu: r("11.8 %", "11.8 %", "24 cores", "8.74 cores", "24 cores"), memory: r("11.8 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "BigQuery",      cpu: r("67.3 %", "67.3 %", "24 cores", "8.74 cores", "24 cores"), memory: r("67.3 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "DynamoDB",      cpu: r("27.6 %", "27.6 %", "24 cores", "8.74 cores", "24 cores"), memory: r("27.6 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "ElasticSearch", cpu: r("32.6 %", "32.6 %", "24 cores", "8.74 cores", "24 cores"), memory: r("32.6 %", "71.4 %", "24.0 GiB", "3.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "HBase",         cpu: r("54.6 %", "54.6 %", "24 cores", "8.74 cores", "24 cores"), memory: r("54.6 %", "71.4 %", "24.0 GiB", "2.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "Kafka",         cpu: r("48.2 %", "48.2 %", "24 cores", "8.74 cores", "24 cores"), memory: r("48.2 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "Kinesis",       cpu: r("19.5 %", "19.5 %", "24 cores", "8.74 cores", "24 cores"), memory: r("19.5 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
  { name: "MongoDB",       cpu: r("82.1 %", "82.1 %", "24 cores", "8.74 cores", "24 cores"), memory: r("82.1 %", "71.4 %", "24.0 GiB", "8.74 GiB", "24 GiB"), disk: r("36.4 %", "36.4 %", "8.74 GiB", "8.74 GiB", "8.74 GiB") },
];
function r(rate: string, util: string, assigned: string, allocated: string, used: string) {
  return { rate, util, assigned, allocated, used };
}

const SUB_COLS = [
  { key: "rate",       label: "Allocation rate" },
  { key: "util",       label: "Utilization" },
  { key: "assigned",   label: "Assigned" },
  { key: "allocated",  label: "Allocated" },
  { key: "used",       label: "Used" },
] as const;

export function ProjectsTable({ rows, query, onRowClick, leftHeader = "Project" }: { rows: ProjectRow[]; query: string; onRowClick?: (r: ProjectRow) => void; leftHeader?: string }) {
  const { colors } = useTheme();
  const filtered = rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  const cellBase: React.CSSProperties = {
    padding: "12px 12px",
    fontSize: 13,
    fontFamily: ff,
    color: colors.text.primary,
    whiteSpace: "nowrap",
  };
  const headerBase: React.CSSProperties = {
    ...cellBase,
    fontSize: 12,
    fontWeight: 600,
    color: colors.text.secondary,
    backgroundColor: colors.bg.tertiary,
    textAlign: "left",
  };
  // 그룹(CPU | Memory | Disk) 시각적 구분 — primary border
  const groupBorder = `2px solid ${colors.border.primary}`;

  return (
    <div
      style={{
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 12,
        overflow: "auto",
        backgroundColor: colors.bg.primary,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1200 }}>
        <thead>
          {/* Top header row — grouped */}
          <tr>
            <th rowSpan={2} style={{ ...headerBase, position: "sticky", left: 0, zIndex: 2, minWidth: 220, borderRight: groupBorder }}>
              {leftHeader}
            </th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderBottom: `1px solid ${colors.border.tertiary}`, borderRight: groupBorder }}>
              CPU
            </th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderBottom: `1px solid ${colors.border.tertiary}`, borderRight: groupBorder }}>
              Memory
            </th>
            <th colSpan={5} style={{ ...headerBase, textAlign: "center", borderBottom: `1px solid ${colors.border.tertiary}` }}>
              Disk
            </th>
          </tr>
          {/* Subheader */}
          <tr>
            {(["cpu","memory","disk"] as const).map((group, gi) => (
              SUB_COLS.map((c, ci) => (
                <th
                  key={`${group}-${c.key}`}
                  style={{
                    ...headerBase,
                    fontWeight: 500,
                    fontSize: 11,
                    borderRight: ci === SUB_COLS.length - 1 && gi < 2 ? `1px solid ${colors.border.tertiary}` : undefined,
                  }}
                >
                  {c.label}
                </th>
              ))
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, ri) => (
            <tr
              key={row.name}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? "pointer" : "default",
                borderTop: `1px solid ${colors.border.tertiary}`,
              }}
            >
              <td
                style={{
                  ...cellBase,
                  position: "sticky", left: 0, zIndex: 1,
                  backgroundColor: colors.bg.primary,
                  borderTop: ri === 0 ? undefined : `1px solid ${colors.border.tertiary}`,
                  borderRight: groupBorder,
                  fontWeight: 500,
                }}
              >
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onRowClick?.(row); }}
                  style={{
                    color: colors.text.interactive.runwayPrimary,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {row.name}
                </a>
              </td>
              {(["cpu","memory","disk"] as const).map((group, gi) => (
                SUB_COLS.map((c, ci) => (
                  <td
                    key={`${row.name}-${group}-${c.key}`}
                    style={{
                      ...cellBase,
                      borderTop: ri === 0 ? undefined : `1px solid ${colors.border.tertiary}`,
                      borderRight: ci === SUB_COLS.length - 1 && gi < 2 ? `1px solid ${colors.border.tertiary}` : undefined,
                    }}
                  >
                    {row[group][c.key as keyof ProjectRow["cpu"]]}
                  </td>
                ))
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          padding: "10px 16px",
          borderTop: `1px solid ${colors.border.tertiary}`,
          fontSize: 12,
          color: colors.text.tertiary,
          fontFamily: ff,
          backgroundColor: colors.bg.secondary,
        }}
      >
        {filtered.length} item(s)
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Trend chart (recharts)
// ═══════════════════════════════════════════════════════════════════════════════
export function TrendChart({ metricKey }: { metricKey: Metric["key"] }) {
  const { colors, isDark } = useTheme();
  const series = SERIES[metricKey];

  const palette = useMemo(() => ({
    capacity:  isDark ? "#9ca3af" : "#6b7280",
    allocated: "#a855f7",
    used:      "#3b82f6",
    usedFill:  "rgba(59, 130, 246, 0.18)",
  }), [isDark]);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, fontFamily: ff }}>{series.label}</span>
        <span style={{ fontSize: 12, fontWeight: 400, color: colors.text.tertiary, fontFamily: ff }}>({series.unit})</span>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12, fontFamily: ff, color: colors.text.secondary }}>
        <LegendItem color={palette.capacity}  label="Capacity"  dashed />
        <LegendItem color={palette.allocated} label="Allocated" />
        <LegendItem color={palette.used}      label="Used" />
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series.data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id={`fill-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.used} stopOpacity={0.25} />
                <stop offset="100%" stopColor={palette.used} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={colors.border.tertiary} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10, fill: colors.text.tertiary, fontFamily: ff }}
              tickLine={false}
              axisLine={{ stroke: colors.border.tertiary }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.text.tertiary, fontFamily: ff }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ReTooltip
              contentStyle={{
                backgroundColor: colors.bg.primary,
                border: `1px solid ${colors.border.secondary}`,
                borderRadius: 8,
                fontFamily: ff,
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                padding: 8,
              }}
              labelStyle={{ color: colors.text.tertiary, fontSize: 11, marginBottom: 4 }}
              itemStyle={{ color: colors.text.primary }}
              formatter={(value: number, name: string) => [`${value}`, name]}
            />
            <Area
              type="monotone"
              dataKey="used"
              stroke={palette.used}
              strokeWidth={1.5}
              fill={`url(#fill-${metricKey})`}
              dot={false}
              isAnimationActive={false}
              name="Used"
            />
            <Line
              type="monotone"
              dataKey="allocated"
              stroke={palette.allocated}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Allocated"
            />
            <Line
              type="monotone"
              dataKey="capacity"
              stroke={palette.capacity}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
              name="Capacity"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 14, height: 0, borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Time range tabs
// ═══════════════════════════════════════════════════════════════════════════════
export const TIME_RANGES = ["1H", "3H", "6H", "12H", "1D", "3D", "1W", "Custom"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

function TimeRangeTabs({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <Tabs
      items={TIME_RANGES.map((r) => ({ key: r, label: r }))}
      selectedKey={value}
      onChange={(k) => onChange(k as TimeRange)}
    />
  );
}

// ── DateTime input + TimeRange row (with Custom date pickers) ──────────────
export function DateTimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderColor = focused
    ? colors.border.interactive.runwayPrimary
    : hovered
      ? colors.border.primary
      : colors.border.secondary;
  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        height: 32, padding: "0 10px",
        borderRadius: 6, border: `1px solid ${borderColor}`,
        backgroundColor: colors.bg.primary,
        fontSize: 12, fontFamily: ff, color: colors.text.primary,
        cursor: "text", minWidth: 0,
        transition: "border-color 0.15s",
      }}
    >
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: "none", outline: "none", background: "transparent",
          fontFamily: ff, fontSize: 12, color: colors.text.primary,
          minWidth: 160, padding: 0,
        }}
      />
      <Icon name="calendar" size={16} color={colors.icon.secondary} />
    </label>
  );
}

export function TimeRangeRow({
  value, onChange, customFrom, customTo, onCustomFromChange, onCustomToChange, onApplyCustom,
}: {
  value: TimeRange; onChange: (v: TimeRange) => void;
  customFrom: string; customTo: string;
  onCustomFromChange: (v: string) => void; onCustomToChange: (v: string) => void;
  onApplyCustom: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <Tabs
        items={TIME_RANGES.map((r) => ({ key: r, label: r }))}
        selectedKey={value}
        onChange={(k) => onChange(k as TimeRange)}
      />
      {value === "Custom" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DateTimeInput value={customFrom} onChange={onCustomFromChange} />
          <span style={{ fontFamily: ff, fontSize: 12 }}>-</span>
          <DateTimeInput value={customTo} onChange={onCustomToChange} />
          <PrimaryButton label="Apply" onClick={onApplyCustom} style={{ height: 32, padding: "6px 16px", fontSize: 12 }} />
        </div>
      )}
    </div>
  );
}

export function isoLocalNow(daysOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
interface AdminMonitoringPageProps {
  onNavigate?: (key: string) => void;
  /** Projects 탭에서 행 클릭 시 호출 — 부모가 해당 프로젝트의 모니터링 페이지로 라우팅 */
  onSelectProject?: (projectName: string) => void;
}

export function AdminMonitoringPage({ onNavigate, onSelectProject }: AdminMonitoringPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("monitoring");
  const [scope, setScope] = useState<"workspace" | "projects">("workspace");
  const [timeRange, setTimeRange] = useState<TimeRange>("1W");
  const [lastRefreshed, setLastRefreshed] = useState(() => formatNow());
  const [scrolled, setScrolled] = useState(false);
  const [projectQuery, setProjectQuery] = useState("");
  const [workloadQuery, setWorkloadQuery] = useState("");
  const [nodeDetailsOpen, setNodeDetailsOpen] = useState(false);
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
        items={WORKSPACE_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={<SidebarHeader />}
        footer={
          <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>
            Runway v1.5.0
          </span>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppGnb
          breadcrumbs={[
            { label: "Workspace", icon: <Icon name="workspace" size={20} color={colors.icon.secondary} /> },
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

        {/* Scrollable content */}
        <div
          onScroll={(e) => setScrolled((e.target as HTMLDivElement).scrollTop > 0)}
          style={{ flex: 1, overflow: "auto", padding: "16px 24px 32px" }}
        >
          {/* Scope tabs (Workspace / Projects) */}
          <div style={{ marginBottom: 24 }}>
            <Tabs
              items={[
                { key: "workspace", label: "Workspace" },
                { key: "projects",  label: "Projects" },
              ]}
              selectedKey={scope}
              onChange={(k) => setScope(k as typeof scope)}
            />
          </div>

          {scope === "workspace" && (
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
                hint={"Shows how workspace resources are allocated to projects.\n• Capacity: Total resources allocated to the workspace\n• Allocation rate: Resource allocation rate relative to Capacity\n• Allocated: Resources allocated to projects\n• Allocatable: Resources available for additional allocation"}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <TrendChart metricKey="cpu" />
                <TrendChart metricKey="memory" />
                <TrendChart metricKey="storage" />
                <TrendChart metricKey="gpu" />
              </div>
            </>
          )}

          {scope === "projects" && (
            <>
              {/* Quota assignment */}
              <SectionTitle
                title="Quota assignment"
                hint={"Shows how workspace quotas are allocated to projects.\n• Capacity: Total quota available for project allocation\n• Assignment rate: Quota allocation rate relative to Capacity\n• Assigned: Quotas allocated to projects\n• Assignable: Quotas available for additional allocation"}
              />
              <div style={{ display: "grid", gap: 16, marginBottom: 32, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <QuotaCard metric={{ ...METRICS[0], allocated: 182, capacity: 256, allocatable: 74 }} />
                <QuotaCard metric={{ ...METRICS[1], allocated: 412, capacity: 1024, allocatable: 612 }} />
                <QuotaCard metric={{ ...METRICS[2], allocated: 46000, capacity: 50000, allocatable: 4000 }} />
                <QuotaCard metric={METRICS[3]} sharedNote="Shared across all projects in this workspace" />
              </div>

              {/* Projects list */}
              <SectionTitle title="Projects" />
              <div style={{ marginBottom: 16, maxWidth: 280 }}>
                <TextField
                  value={projectQuery}
                  onChange={(e) => setProjectQuery(e.target.value)}
                  placeholder="Search..."
                  leadingIcon={<Icon name="search" size={16} color={colors.icon.secondary} />}
                />
              </div>
              <ProjectsTable rows={PROJECTS} query={projectQuery} onRowClick={(row) => onSelectProject?.(row.name)} />

              {/* 워크로드별 자원 사용 현황 — 워크스페이스 단위 (어떤 프로젝트에 속한 워크로드인지 표시) */}
              <div style={{ marginTop: 32 }}>
                <SectionTitle
                  title="워크로드별 자원 사용 현황"
                  hint={"워크스페이스 내 모든 프로젝트의 워크로드 자원 할당/사용 현황입니다.\n• 할당됨 / 사용됨 컬럼 헤더 클릭으로 정렬\n• 할당 대비 사용률 10% 미만은 주황색 (자원 과다할당 식별)"}
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
                </div>
                <WorkloadsTable
                  workloads={SAMPLE_WORKLOADS.filter((w) => w.workspace === "Data studio")}
                  query={workloadQuery}
                  showProject
                  onRowClick={(w) => {
                    onSelectProject?.(w.project);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────
export function formatNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default AdminMonitoringPage;
