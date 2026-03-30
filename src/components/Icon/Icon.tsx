import React from "react";
import { iconSvgMap, IconName } from "../../icons";

export interface IconProps {
  /** Icon name (matches SVG filename without extension) */
  name: IconName;
  /** Size in pixels — applied to both width and height. Default: 24 */
  size?: number;
  /** CSS color applied via `color` (uses currentColor in SVG). Default: "currentColor" */
  color?: string;
  /** Additional class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  label?: string;
}

/**
 * Renders an inline SVG icon from the makinarocks design system icon set.
 *
 * @example
 * <Icon name="edit" size={20} color="#155dfc" />
 * <Icon name="search" label="Search" />
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 24, color = "currentColor", className, style, label }, ref) => {
    const svgString = iconSvgMap[name];

    if (!svgString) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Icon] Unknown icon: "${name}"`);
      }
      return null;
    }

    // Inject width/height/color into raw SVG string
    const sized = svgString
      .replace(/width="[^"]*"/, `width="${size}"`)
      .replace(/height="[^"]*"/, `height="${size}"`)
      // Rewrite literal fill colors (except "none") to currentColor
      .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
      .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');

    return (
      <span
        ref={ref}
        className={className}
        style={{ display: "inline-flex", alignItems: "center", color, ...style }}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        role={label ? "img" : undefined}
        dangerouslySetInnerHTML={{ __html: sized }}
      />
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
