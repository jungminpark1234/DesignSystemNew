import React from "react";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

/** Layout type for ButtonStack */
export type ButtonStackLayout =
  | "stack"     // Vertical column, full-width buttons
  | "justify"   // Horizontal, space-between (each button stretches equally)
  | "start"     // Horizontal, left-aligned
  | "center"    // Horizontal, centered
  | "end";      // Horizontal, right-aligned

export interface ButtonStackProps {
  /** Layout arrangement */
  layout?: ButtonStackLayout;
  /** Button elements to render */
  children: React.ReactNode;
  /** Gap between buttons in pixels */
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export const ButtonStack: React.FC<ButtonStackProps> = ({
  layout = "start",
  children,
  gap = 12,
  className,
  style,
}) => {
  const isStack = layout === "stack";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isStack ? "column" : "row",
    gap,
    alignItems: isStack ? "stretch" : "center",
    ...(layout === "justify" && { justifyContent: "space-between" }),
    ...(layout === "start" && { justifyContent: "flex-start" }),
    ...(layout === "center" && { justifyContent: "center" }),
    ...(layout === "end" && { justifyContent: "flex-end" }),
    ...(isStack && { width: "100%" }),
    ...style,
  };

  // For "stack" and "justify", each button should fill available width
  const shouldStretch = isStack || layout === "justify";

  return (
    <div className={className} style={containerStyle}>
      {shouldStretch
        ? React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: {
                ...(child.props as { style?: React.CSSProperties }).style,
                ...(isStack ? { width: "100%" } : { flex: "1 0 0" }),
              },
            });
          })
        : children}
    </div>
  );
};

ButtonStack.displayName = "ButtonStack";
export default ButtonStack;
