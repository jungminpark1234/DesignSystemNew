import React, { useState, useCallback } from "react";
import { colorBg, colorBorder, colorIcon } from "../../tokens/colors";
import Icon from "../Icon/Icon";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Button size (default 24) */
  size?: number;
  /** Inner icon size override. Defaults to ~67% of `size`. */
  iconSize?: number;
  /** Duration in ms to show the check icon after copying (default 1500) */
  feedbackDuration?: number;
  /** Custom icon color (default icon.secondary) */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 24,
  iconSize,
  feedbackDuration = 1500,
  color,
  className,
  style,
}) => {
  const innerSize = iconSize ?? Math.round(size * 0.667);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [usingMouse, setUsingMouse] = useState(false);
  const [copied, setCopied] = useState(false);

  const showFocusRing = focused && !usingMouse;

  const handleClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), feedbackDuration);
  }, [text, feedbackDuration]);

  const getBg = () => {
    if (copied || pressed) return `var(--ds-bg-interactive-secondary-pressed, ${colorBg.interactive.secondaryPressed})`;
    if (hovered) return `var(--ds-bg-interactive-secondary-hovered, ${colorBg.interactive.secondaryHovered})`;
    return "transparent";
  };

  const getIconColor = () => {
    if (hovered) return `var(--ds-icon-interactive-secondary-hovered, ${colorIcon.interactive.secondaryHovered})`;
    return color ?? `var(--ds-icon-interactive-secondary, ${colorIcon.interactive.secondary})`;
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { setPressed(true); setUsingMouse(true); }}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); setUsingMouse(false); }}
      aria-label="Copy to clipboard"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        padding: 2,
        border: "none",
        borderRadius: 4,
        backgroundColor: getBg(),
        cursor: "pointer",
        flexShrink: 0,
        outline: showFocusRing
          ? `2px solid var(--ds-border-runway-focusring, ${colorBorder.runwayFocusRing})`
          : "none",
        outlineOffset: 2,
        transition: "background-color 0.15s ease",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {copied ? (
        <svg width={innerSize} height={innerSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#00A63E"/>
          <path d="M8.66669 12L10.5774 13.9108C10.9029 14.2362 11.4305 14.2362 11.7559 13.9108L15.3334 10.3334" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <Icon name="copy" size={innerSize} color={getIconColor()} />
      )}
    </button>
  );
};

CopyButton.displayName = "CopyButton";
export default CopyButton;
