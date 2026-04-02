import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { Checkbox } from "@ds/components/Checkbox";
import { StatusChip } from "@ds/components/StatusChip";
import { useTheme } from "../theme";
import { CONNECTIONS } from "../data/connections";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { ActionMenu } from "../components/ActionMenu";
import { CreateDrawer } from "../components/CreateDrawer";

/* ── Table header cell ── */
function ThCell({ children, sortable }: { children: React.ReactNode; sortable?: boolean }) {
  const { colors } = useTheme();
  return (
    <th
      style={{
        padding: "10px 12px",
        textAlign: "left",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: "16px",
        color: colors.text.tertiary,
        borderBottom: `1px solid ${colors.border.secondary}`,
        background: colors.bg.secondary,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {children}
        {sortable && <Icon name="sort" size={14} color={colors.border.secondary} />}
      </div>
    </th>
  );
}

/* ── Table row ── */
function TableRow({
  row,
  isSelected,
  isLast,
  menuOpen,
  onToggle,
  onMenuToggle,
}: {
  row: (typeof CONNECTIONS)[number];
  isSelected: boolean;
  isLast: boolean;
  menuOpen: boolean;
  onToggle: (v: boolean) => void;
  onMenuToggle: (id: string) => void;
}) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  const bg = isSelected ? colors.bg.interactive.runwaySelected : hov ? colors.bg.secondary : colors.bg.primary;
  const borderColor = isLast ? "transparent" : colors.border.tertiary;

  const tdBase: React.CSSProperties = {
    padding: "12px 12px",
    verticalAlign: "middle",
    borderBottom: `1px solid ${borderColor}`,
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 14,
    lineHeight: "16px",
  };

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: bg, transition: "background 0.1s" }}>
      <td style={{ padding: "0 12px", verticalAlign: "middle", borderBottom: `1px solid ${borderColor}`, width: 44, height: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", height: "100%" }}>
          <Checkbox checked={isSelected} onChange={onToggle} />
        </div>
      </td>
      <td style={{ ...tdBase, fontWeight: 500, color: colors.text.primary }}>{row.name}</td>
      <td style={{ ...tdBase, color: colors.text.secondary, fontWeight: 400 }}>{row.connId}</td>
      <td style={{ ...tdBase, color: colors.text.secondary, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 0 }}>
        {row.host}
      </td>
      <td style={{ ...tdBase }}>
        <StatusChip state={row.connected ? "success" : "neutral"} size="sm" label={row.connected ? "Connected" : "Disconnected"} />
      </td>
      <td style={{ padding: "8px", verticalAlign: "middle", borderBottom: `1px solid ${borderColor}`, width: 44 }}>
        <ActionMenu open={menuOpen} rowId={row.name} onMenuToggle={onMenuToggle} rowHovered={hov} />
      </td>
    </tr>
  );
}

/* ── Pagination ── */
function PaginationBar({ current, totalPages, onChange }: { current: number; totalPages: number; onChange: (p: number) => void }) {
  const { colors } = useTheme();

  const getPages = (): (number | string)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, "…", totalPages - 1, totalPages];
    if (current >= totalPages - 2) return [1, 2, "…", totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", current - 1, current, current + 1, "…", totalPages];
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <button
        onClick={() => current > 1 && onChange(current - 1)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 24, height: 24, border: "none", background: "transparent",
          cursor: current === 1 ? "not-allowed" : "pointer", borderRadius: 9999, padding: 0,
        }}
      >
        <Icon name="arrow2-left" size={16} color={current === 1 ? colors.border.secondary : colors.text.secondary} />
      </button>
      {getPages().map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} style={{ width: 24, textAlign: "center", fontSize: 13, color: colors.text.tertiary, lineHeight: "24px" }}>
            ···
          </span>
        ) : (
          <PagNumBtn key={`page-${p}`} num={p as number} selected={p === current} onClick={() => onChange(p as number)} />
        )
      )}
      <button
        onClick={() => current < totalPages && onChange(current + 1)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 24, height: 24, border: "none", background: "transparent",
          cursor: current === totalPages ? "not-allowed" : "pointer", borderRadius: 9999, padding: 0,
        }}
      >
        <Icon name="arrow2_right" size={16} color={current === totalPages ? colors.border.secondary : colors.text.secondary} />
      </button>
    </div>
  );
}

function PagNumBtn({ num, selected, onClick }: { num: number; selected: boolean; onClick: () => void }) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minWidth: 24, height: 24, padding: "4px 6px",
        border: "none", borderRadius: 9999, cursor: "pointer",
        fontSize: 13, fontWeight: selected ? 600 : 400, lineHeight: "16px",
        color: colors.text.secondary,
        background: selected ? colors.bg.neutral : hov ? colors.bg.tertiary : "transparent",
        fontFamily: "'Pretendard', sans-serif", transition: "background 0.1s",
      }}
    >
      {num}
    </button>
  );
}

/* ── Page ── */
interface DataConnectionsPageProps {
  onNavigate?: (key: string) => void;
  projectName?: string;
}

export function DataConnectionsPage({ onNavigate, projectName = "NLP Models" }: DataConnectionsPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("data-connection");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set(["Athena Query"]));
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const totalItems = CONNECTIONS.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const allSel = selectedRows.size === CONNECTIONS.length;
  const someSel = selectedRows.size > 0 && !allSel;

  const toggleAll = (v: boolean) => setSelectedRows(v ? new Set(CONNECTIONS.map((c) => c.name)) : new Set());
  const toggleRow = (name: string, v: boolean) =>
    setSelectedRows((prev) => {
      const s = new Set(prev);
      v ? s.add(name) : s.delete(name);
      return s;
    });
  const toggleMenu = (id: string) => setOpenMenu((p) => (p === id ? null : id));

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }} onClick={() => setOpenMenu(null)}>
      <Sidebar
        items={PROJECT_NAV}
        selectedKey={selectedNav}
        onSelect={(key) => { setSelectedNav(key); onNavigate?.(key); }}
        width={220}
        header={
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 5.3,
                  backgroundColor: "#bf6a40",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.inverse, lineHeight: 1 }}>D</span>
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: "'Pretendard', sans-serif" }}>
                Data studio
              </span>
              <Icon name="sidebar" size={20} color={colors.icon.secondary} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 8px" }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 5.3,
                  backgroundColor: colors.bg.warningSubtle,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <Icon name="folder-fill" size={18} color={colors.icon.warning} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: "'Pretendard', sans-serif" }}>Projects</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: "'Pretendard', sans-serif" }}>{projectName}</div>
              </div>
            </div>
          </>
        }
        footer={
          <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: "'Pretendard', sans-serif" }}>
            Runway v1.5.0
          </span>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppGnb
          breadcrumbs={[
            { label: projectName, icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> },
            { label: "Setting", icon: <Icon name="setting" size={20} color={colors.icon.secondary} /> },
            { label: "Data connections" },
          ]}
        />

        <main style={{ flex: 1, overflow: "auto", padding: "32px 32px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1
                style={{
                  fontSize: 24, fontWeight: 600, lineHeight: "32px",
                  color: colors.text.primary, marginBottom: 6,
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                Data connections
              </h1>
              <p
                style={{
                  fontSize: 14, fontWeight: 400, lineHeight: "16px",
                  color: colors.text.secondary,
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                Manage reusable connections scoped to this project for DataFlow Builder (Airflow) and Platform Apps (Jupyter IDE).
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", height: 36,
                background: colors.bg.interactive.runwayPrimary,
                color: colors.text.inverse, border: "none", borderRadius: 6,
                fontSize: 14, fontWeight: 500, lineHeight: "16px", cursor: "pointer",
                fontFamily: "'Pretendard', sans-serif", transition: "background 0.12s",
                flexShrink: 0,
              }}
            >
              <Icon name="create" size={14} color={colors.text.inverse} />
              Create
            </button>
          </div>

          <div
            style={{
              border: `1px solid ${colors.border.secondary}`,
              borderRadius: 8, overflow: "hidden", background: colors.bg.primary,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 600 }}>
              <colgroup>
                <col style={{ width: 44 }} />
                <col style={{ minWidth: 120 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 260 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 44 }} />
              </colgroup>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "0 12px", width: 44,
                      verticalAlign: "middle",
                      textAlign: "left",
                      borderBottom: `1px solid ${colors.border.secondary}`,
                      background: colors.bg.secondary,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", height: "100%" }}>
                      <Checkbox
                        checked={allSel ? true : someSel ? "indeterminate" : false}
                        onChange={toggleAll}
                      />
                    </div>
                  </th>
                  <ThCell sortable>Name</ThCell>
                  <ThCell sortable>Connection ID</ThCell>
                  <ThCell sortable>Host / Endpoint</ThCell>
                  <ThCell>Status</ThCell>
                  <th style={{ borderBottom: `1px solid ${colors.border.secondary}`, background: colors.bg.secondary }} />
                </tr>
              </thead>
              <tbody>
                {CONNECTIONS.map((row, idx) => (
                  <TableRow
                    key={row.name}
                    row={row}
                    isSelected={selectedRows.has(row.name)}
                    isLast={idx === CONNECTIONS.length - 1}
                    menuOpen={openMenu === row.name}
                    onToggle={(v) => toggleRow(row.name, v)}
                    onMenuToggle={toggleMenu}
                  />
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderTop: `1px solid ${colors.border.secondary}`,
                background: colors.bg.secondary,
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              {/* Total count */}
              <span style={{ fontSize: 13, color: colors.text.tertiary, whiteSpace: "nowrap" }}>
                Total {totalItems}
              </span>

              {/* Pagination */}
              <PaginationBar current={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

              {/* Show per page */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: colors.text.tertiary, whiteSpace: "nowrap" }}>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{
                    height: 28, padding: "2px 8px", borderRadius: 6,
                    border: `1px solid ${colors.border.secondary}`,
                    background: colors.bg.primary, color: colors.text.secondary,
                    fontSize: 13, fontFamily: "'Pretendard', sans-serif",
                    cursor: "pointer", outline: "none",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span style={{ fontSize: 13, color: colors.text.tertiary, whiteSpace: "nowrap" }}>per page</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} existingIds={CONNECTIONS.map((c) => c.connId)} />
    </div>
  );
}
