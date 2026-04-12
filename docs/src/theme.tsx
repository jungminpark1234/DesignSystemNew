import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { colorText, colorIcon, colorBg, colorBorder } from "@ds/tokens/colors";
import { colorTextDark, colorIconDark, colorBgDark, colorBorderDark } from "@ds/tokens/colorsDark";

interface ThemeColors {
  text: typeof colorText;
  icon: typeof colorIcon;
  bg: typeof colorBg;
  border: typeof colorBorder;
}

interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggle: () => {},
  colors: { text: colorText, icon: colorIcon, bg: colorBg, border: colorBorder },
});

export const useTheme = () => useContext(ThemeContext);

function setCssVars(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty("--ds-bg-primary", colors.bg.primary);
  root.style.setProperty("--ds-bg-secondary", colors.bg.secondary);
  root.style.setProperty("--ds-bg-tertiary", colors.bg.tertiary);
  root.style.setProperty("--ds-bg-interactive-runway-selected", colors.bg.interactive.runwaySelected);
  root.style.setProperty("--ds-text-primary", colors.text.primary);
  root.style.setProperty("--ds-text-secondary", colors.text.secondary);
  root.style.setProperty("--ds-text-tertiary", colors.text.tertiary);
  root.style.setProperty("--ds-text-disabled", colors.text.disabled);
  root.style.setProperty("--ds-text-inverse", colors.text.inverse);
  root.style.setProperty("--ds-text-interactive-runway-primary", colors.text.interactive.runwayPrimary);
  root.style.setProperty("--ds-text-interactive-secondary", colors.text.interactive.secondary);
  root.style.setProperty("--ds-icon-primary", colors.icon.primary);
  root.style.setProperty("--ds-icon-secondary", colors.icon.secondary);
  root.style.setProperty("--ds-icon-disabled", colors.icon.disabled);
  root.style.setProperty("--ds-bg-disabled", colors.bg.disabled);
  root.style.setProperty("--ds-text-danger", colors.text.danger);
  root.style.setProperty("--ds-text-success", colors.text.success);
  root.style.setProperty("--ds-text-warning", colors.text.warning);
  root.style.setProperty("--ds-text-info", colors.text.info);
  root.style.setProperty("--ds-border-primary", colors.border.primary);
  root.style.setProperty("--ds-border-secondary", colors.border.secondary);
  root.style.setProperty("--ds-border-tertiary", colors.border.tertiary);
  root.style.setProperty("--ds-border-disabled", colors.border.disabled);
  root.style.setProperty("--ds-border-danger", colors.border.danger);
  root.style.setProperty("--ds-border-interactive-secondary", colors.border.interactive.secondary);
  root.style.setProperty("--ds-border-interactive-secondary-hovered", colors.border.interactive.secondaryHovered);
  root.style.setProperty("--ds-border-interactive-runway-primary", colors.border.interactive.runwayPrimary);
  root.style.setProperty("--ds-border-interactive-runway-primary-hovered", colors.border.interactive.runwayPrimaryHovered);
  root.style.setProperty("--ds-border-interactive-runway-primary-pressed", colors.border.interactive.runwayPrimaryPressed);
  root.style.setProperty("--ds-bg-interactive-secondary", colors.bg.interactive.secondary);
  root.style.setProperty("--ds-bg-interactive-secondary-hovered", colors.bg.interactive.secondaryHovered);
  root.style.setProperty("--ds-bg-interactive-secondary-pressed", colors.bg.interactive.secondaryPressed);
  root.style.setProperty("--ds-bg-interactive-runway-primary", colors.bg.interactive.runwayPrimary);
  root.style.setProperty("--ds-bg-interactive-runway-primary-hovered", colors.bg.interactive.runwayPrimaryHovered);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggle = useCallback(() => setIsDark((d) => !d), []);

  const colors: ThemeColors = isDark
    ? { text: colorTextDark as any, icon: colorIconDark as any, bg: colorBgDark as any, border: colorBorderDark as any }
    : { text: colorText, icon: colorIcon, bg: colorBg, border: colorBorder };

  useEffect(() => {
    setCssVars(colors);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    document.body.style.backgroundColor = colors.bg.primary;
    document.body.style.color = colors.text.primary;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
