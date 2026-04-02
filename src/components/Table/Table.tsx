import React, { useState, useCallback } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { borderRadius } from "../../tokens/spacing";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

const v = (name: string, fb: string) => `var(${name}, ${fb})`;

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type SortDirection = "asc" | "desc" | "none";
export type ColumnImportance = "primary" | "secondary" | "unauthorized";

export interface TableColumn<T = Record<string, unknown>> {
  /** Unique column key — maps to a field in the row data */
  key: string;
  /** Header display label */
  label: string;
  /** Column importance for visual style */
  importance?: ColumnImportance;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Min width in px */
  minWidth?: number;
  /** Flex grow factor */
  flex?: number;
  /** Custom cell renderer */
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
}

export interface TableAction<T = Record<string, unknown>> {
  /** Action label */
  label: string;
  /** Icon to show (ReactNode) */
  icon?: React.ReactNode;
  /** Called when action button is clicked */
  onClick: (row: T, rowIndex: number) => void;
  /** Whether to show as destructive style */
  destructive?: boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Row data */
  rows: T[];
  /** Unique key field in row data */
  rowKey?: string;
  /** Show row checkboxes */
  selectable?: boolean;
  /** Controlled selection (set of keys) */
  selectedKeys?: Set<string | number>;
  /** Called when selection changes */
  onSelectionChange?: (keys: Set<string | number>) => void;
  /** Row action buttons (shown in an Actions column) */
  actions?: TableAction<T>[];
  /** Show overflow menu button */
  showMenu?: boolean;
  /** Called on menu button click */
  onMenuClick?: (row: T, rowIndex: number) => void;
  /** Called when a sort header is clicked */
  onSort?: (key: string, direction: SortDirection) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether rows are clickable */
  onRowClick?: (row: T, rowIndex: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sort icon
// ──────────────────────────────────────────────────────────────────────────────
function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 15l5 5 5-5"
        stroke={direction === "desc" ? colorBg.interactive.runwayPrimary : colorText.disabled}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9l5-5 5 5"
        stroke={direction === "asc" ? colorBg.interactive.runwayPrimary : colorText.disabled}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Checkbox cell
// ──────────────────────────────────────────────────────────────────────────────
function CheckboxCell({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <td style={{ width: 48, padding: 16, textAlign: "center", verticalAlign: "middle" }}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, cursor: "pointer", accentColor: colorBg.interactive.runwayPrimary }}
        aria-label={indeterminate ? "Select all (partial)" : checked ? "Deselect" : "Select"}
      />
    </td>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styling helpers
// ──────────────────────────────────────────────────────────────────────────────
const importanceTextColor: Record<ColumnImportance, string> = {
  primary:      `var(--ds-text-primary, ${colorText.primary})`,
  secondary:    `var(--ds-text-secondary, ${colorText.secondary})`,
  unauthorized: `var(--ds-text-disabled, ${colorText.disabled})`,
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey = "id",
  selectable = false,
  selectedKeys: controlledKeys,
  onSelectionChange,
  actions,
  showMenu = false,
  onMenuClick,
  onSort,
  loading = false,
  emptyMessage = "No data",
  onRowClick,
  className,
  style,
}: TableProps<T>) {
  // ── Selection state ──
  const isControlled = controlledKeys !== undefined;
  const [internalKeys, setInternalKeys] = useState<Set<string | number>>(new Set());
  const selectedKeys = isControlled ? controlledKeys : internalKeys;

  const setSelected = useCallback(
    (keys: Set<string | number>) => {
      if (!isControlled) setInternalKeys(keys);
      onSelectionChange?.(keys);
    },
    [isControlled, onSelectionChange]
  );

  const allKeys = rows.map((r) => r[rowKey] as string | number);
  const allSelected  = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
  const someSelected = allKeys.some((k) => selectedKeys.has(k));

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(allKeys) : new Set());
  };
  const toggleRow = (key: string | number, checked: boolean) => {
    const next = new Set(selectedKeys);
    checked ? next.add(key) : next.delete(key);
    setSelected(next);
  };

  // ── Sort state ──
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("none");

  const handleSort = (key: string) => {
    const next: SortDirection =
      sortKey !== key ? "asc" : sortDir === "asc" ? "desc" : sortDir === "desc" ? "none" : "asc";
    setSortKey(key);
    setSortDir(next);
    onSort?.(key, next);
  };

  // ── Row hover ──
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const hasActions = actions && actions.length > 0;

  // ── Styles ──
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: fontFamily.body,
    fontSize: 14,
    ...style,
  };

  const headerCellStyle = (col: TableColumn<T>): React.CSSProperties => ({
    padding: 16,
    textAlign: "left",
    fontWeight: fontWeight.medium,
    fontSize: 14,
    lineHeight: "16px",
    color: v("--ds-text-primary", colorText.primary),
    backgroundColor: v("--ds-bg-tertiary", colorBg.tertiary),
    borderBottom: `1px solid ${v("--ds-border-tertiary", colorBorder.tertiary)}`,
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: col.sortable ? "pointer" : "default",
    minWidth: col.minWidth,
  });

  const bodyCellStyle = (importance: ColumnImportance = "primary", isSelected: boolean, isHovered: boolean): React.CSSProperties => ({
    padding: 16,
    height: 48,
    color: importanceTextColor[importance],
    fontWeight: importance === "primary" ? fontWeight.medium : fontWeight.regular,
    fontSize: 14,
    lineHeight: "16px",
    borderBottom: `1px solid ${v("--ds-border-tertiary", colorBorder.tertiary)}`,
    verticalAlign: "middle",
    backgroundColor: isSelected
      ? v("--ds-bg-interactive-runway-selected", colorBg.interactive.runwaySelected)
      : isHovered
        ? v("--ds-bg-interactive-secondary-hovered", colorBg.interactive.secondaryHovered)
        : v("--ds-bg-primary", colorBg.primary),
    transition: "background-color 0.1s ease",
  });

  const actionCellStyle: React.CSSProperties = {
    padding: "0 16px",
    height: 48,
    verticalAlign: "middle",
    borderBottom: `1px solid ${v("--ds-border-tertiary", colorBorder.tertiary)}`,
    whiteSpace: "nowrap",
  };

  return (
    <div
      className={className}
      style={{ overflowX: "auto", overflow: "clip", borderRadius: borderRadius.xl, border: `1px solid ${v("--ds-border-secondary", colorBorder.secondary)}` }}
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            {/* Checkbox header */}
            {selectable && (
              <th style={{ width: 48, padding: 16, backgroundColor: v("--ds-bg-tertiary", colorBg.tertiary), borderBottom: `1px solid ${v("--ds-border-tertiary", colorBorder.tertiary)}` }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: colorBg.interactive.runwayPrimary }}
                  aria-label="Select all"
                />
              </th>
            )}

            {/* Data columns */}
            {columns.map((col) => (
              <th
                key={col.key}
                style={headerCellStyle(col)}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {col.label}
                  {col.sortable && (
                    <SortIcon direction={sortKey === col.key ? sortDir : "none"} />
                  )}
                </span>
              </th>
            ))}

            {/* Actions header */}
            {hasActions && (
              <th style={{ ...headerCellStyle(columns[0]), minWidth: undefined }}>
                Actions
              </th>
            )}

            {/* Menu header */}
            {showMenu && (
              <th style={{ width: 80, padding: "16px 24px", backgroundColor: v("--ds-bg-tertiary", colorBg.tertiary), borderBottom: `1px solid ${v("--ds-border-tertiary", colorBorder.tertiary)}` }} />
            )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0) + (showMenu ? 1 : 0)}
                style={{ textAlign: "center", padding: 32, color: v("--ds-text-tertiary", colorText.tertiary) }}
              >
                <span>Loading…</span>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0) + (showMenu ? 1 : 0)}
                style={{ textAlign: "center", padding: 32, color: v("--ds-text-disabled", colorText.disabled) }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const key = row[rowKey] as string | number ?? rowIndex;
              const isSelected = selectedKeys.has(key);
              const isHovered  = hoveredRow === rowIndex;

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                  aria-selected={isSelected}
                >
                  {/* Checkbox */}
                  {selectable && (
                    <CheckboxCell
                      checked={isSelected}
                      onChange={(checked) => toggleRow(key, checked)}
                    />
                  )}

                  {/* Data cells */}
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td
                        key={col.key}
                        style={bodyCellStyle(col.importance, isSelected, isHovered)}
                      >
                        {col.render
                          ? col.render(value, row, rowIndex)
                          : value !== undefined && value !== null
                          ? String(value)
                          : "—"}
                      </td>
                    );
                  })}

                  {/* Actions */}
                  {hasActions && (
                    <td style={{ ...actionCellStyle, backgroundColor: isSelected ? v("--ds-bg-interactive-runway-selected", colorBg.interactive.runwaySelected) : isHovered ? v("--ds-bg-interactive-secondary-hovered", colorBg.interactive.secondaryHovered) : v("--ds-bg-primary", colorBg.primary) }}>
                      <span style={{ display: "inline-flex", gap: 4 }}>
                        {actions!.map((action, ai) => (
                          <button
                            key={ai}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); action.onClick(row, rowIndex); }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 8px",
                              height: 28,
                              borderRadius: 6,
                              border: `1px solid ${v("--ds-border-secondary", colorBorder.secondary)}`,
                              backgroundColor: v("--ds-bg-primary", colorBg.primary),
                              color: action.destructive ? v("--ds-text-danger", colorText.danger) : v("--ds-text-secondary", colorText.secondary),
                              fontFamily: fontFamily.body,
                              fontSize: 12,
                              fontWeight: fontWeight.medium,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {action.icon && <span style={{ display: "flex" }}>{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </span>
                    </td>
                  )}

                  {/* Menu — only visible on hover */}
                  {showMenu && (
                    <td style={{ ...actionCellStyle, width: 80, textAlign: "center", padding: "0 24px", backgroundColor: isSelected ? v("--ds-bg-interactive-runway-selected", colorBg.interactive.runwaySelected) : isHovered ? v("--ds-bg-interactive-secondary-hovered", colorBg.interactive.secondaryHovered) : v("--ds-bg-primary", colorBg.primary) }}>
                      {isHovered && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onMenuClick?.(row, rowIndex); }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: borderRadius["3xl"],
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            color: v("--ds-text-tertiary", colorText.tertiary),
                          }}
                          aria-label="More options"
                        >
                          <Icon name="more-vertical" size={24} color={v("--ds-text-tertiary", colorText.tertiary)} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = "Table";
export default Table;
