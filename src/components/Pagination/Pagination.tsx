import React, { useState } from "react";
import { colorText, colorBg, colorBorder } from "../../tokens/colors";
import { fontFamily, fontWeight } from "../../tokens/typography";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface PaginationProps {
  /** Total number of pages */
  totalPages: number;
  /** Controlled current page (1-based) */
  currentPage?: number;
  /** Default current page (1-based, uncontrolled) */
  defaultPage?: number;
  /** Called when page changes */
  onChange?: (page: number) => void;
  /** Max page buttons to show (excluding prev/next), default: 7 */
  siblingCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Ellipsis icon
// ──────────────────────────────────────────────────────────────────────────────
function Ellipsis() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 24,
        padding: "4px",
        color: colorText.disabled,
        fontFamily: fontFamily.body,
        fontSize: 14,
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      •••
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Page range calculation
// ──────────────────────────────────────────────────────────────────────────────
function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "start-ellipsis" | "end-ellipsis")[] {
  // How many page buttons to show total: 2 * siblingCount + 5 (first, last, current, 2 ellipsis)
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex  = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis  = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [
      ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
      "end-ellipsis",
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [
      1,
      "start-ellipsis",
      ...Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1),
    ];
  }

  return [
    1,
    "start-ellipsis",
    ...Array.from({ length: siblingCount * 2 + 1 }, (_, i) => leftSiblingIndex + i),
    "end-ellipsis",
    totalPages,
  ];
}

// ──────────────────────────────────────────────────────────────────────────────
// Arrow button
// ──────────────────────────────────────────────────────────────────────────────
function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous page" : "Next page"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        padding: 4,
        borderRadius: 9999,
        border: "none",
        backgroundColor: hovered && !disabled ? colorBg.secondary : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.1s ease",
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        name={direction === "left" ? "prev-arrow" : "next-arrow"}
        size={16}
        color={disabled ? colorBorder.disabled : colorText.secondary}
      />
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Page button
// ──────────────────────────────────────────────────────────────────────────────
function PageButton({
  page,
  isSelected,
  onClick,
}: {
  page: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Page ${page}`}
      aria-current={isSelected ? "page" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 24,
        height: 24,
        padding: "4px 8px",
        borderRadius: 9999,
        border: "none",
        backgroundColor: isSelected
          ? colorBg.neutral
          : hovered
          ? colorBg.secondary
          : "transparent",
        color: colorText.secondary,
        fontFamily: fontFamily.body,
        fontSize: 14,
        fontWeight: fontWeight.regular,
        lineHeight: "16px",
        cursor: "pointer",
        transition: "background-color 0.1s ease",
        boxSizing: "border-box",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {page}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Pagination Component
// ──────────────────────────────────────────────────────────────────────────────
export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage: controlledPage,
  defaultPage = 1,
  onChange,
  siblingCount = 1,
  className,
  style,
}) => {
  const isControlled = controlledPage !== undefined;
  const [internalPage, setInternalPage] = useState(Math.max(1, Math.min(defaultPage, totalPages)));
  const currentPage = isControlled ? controlledPage! : internalPage;

  const goTo = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    if (!isControlled) setInternalPage(clamped);
    onChange?.(clamped);
  };

  const pages = getPageRange(currentPage, totalPages, siblingCount);

  return (
    <nav
      aria-label="Pagination"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        ...style,
      }}
    >
      {/* Prev arrow */}
      <ArrowButton
        direction="left"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
      />

      {/* Page numbers */}
      {pages.map((page, i) => {
        if (page === "start-ellipsis" || page === "end-ellipsis") {
          return <Ellipsis key={`${page}-${i}`} />;
        }
        return (
          <PageButton
            key={page}
            page={page}
            isSelected={page === currentPage}
            onClick={() => goTo(page)}
          />
        );
      })}

      {/* Next arrow */}
      <ArrowButton
        direction="right"
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
      />
    </nav>
  );
};

Pagination.displayName = "Pagination";
export default Pagination;
