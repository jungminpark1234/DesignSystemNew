import React from "react";
import { useTheme } from "../theme";
import logoSvg from "../assets/logo-makinarocks.svg";

const ff = "'Pretendard', sans-serif";

interface DocsHeaderProps {
  onLogoClick?: () => void;
  borderless?: boolean;
}

export function DocsHeader({ onLogoClick, borderless = false }: DocsHeaderProps) {
  const { isDark, toggle, colors } = useTheme();

  return (
    <header
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, padding: "0 clamp(24px, 1vw, 183px)", flexShrink: 0,
        backgroundColor: colors.bg.primary,
        borderBottom: borderless ? "none" : `1px solid ${colors.border.secondary}`,
      }}
    >
      <img
        src={logoSvg}
        alt="MakinaRocks"
        onClick={onLogoClick}
        style={{
          height: 22,
          cursor: onLogoClick ? "pointer" : "default",
        }}
      />
      <button
        onClick={toggle}
        style={{
          padding: "6px 12px", borderRadius: 6,
          border: `1px solid ${colors.border.secondary}`,
          backgroundColor: colors.bg.primary,
          fontSize: 12, fontWeight: 500, color: colors.text.secondary,
          cursor: "pointer", fontFamily: ff,
        }}
      >
        {isDark ? "Light" : "Dark"}
      </button>
    </header>
  );
}
