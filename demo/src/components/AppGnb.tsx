import React, { useState, useRef, useEffect } from "react";
import { GlobalNav } from "@ds/components/GlobalNav";
import { Icon } from "@ds/components/Icon";
import type { BreadcrumbItem } from "@ds/components/GlobalNav";
import { useTheme } from "../theme";
import { CURRENT_USER, getInitials } from "../data/connections";
import { ProfilePopover } from "./ProfilePopover";

interface AppGnbProps {
  breadcrumbs: BreadcrumbItem[];
}

export function AppGnb({ breadcrumbs }: AppGnbProps) {
  const { colors, isDark, toggle } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);
  const userInitial = getInitials(CURRENT_USER.email);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (e: MouseEvent) => {
      if (avatarWrapperRef.current && !avatarWrapperRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const t = setTimeout(() => document.addEventListener("click", close), 0);
    return () => { clearTimeout(t); document.removeEventListener("click", close); };
  }, [profileOpen]);

  return (
    <GlobalNav
      breadcrumbs={breadcrumbs}
      actions={[
        {
          key: "theme",
          icon: <Icon name={isDark ? "sun" : "moon"} size={20} color={colors.icon.secondary} />,
          label: isDark ? "Light mode" : "Dark mode",
          onClick: toggle,
        },
        {
          key: "help",
          icon: <Icon name="book" size={24} color={colors.icon.secondary} />,
          label: "Help",
        },
      ]}
      rightContent={
        <div ref={avatarWrapperRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, border: "none", background: "none",
              cursor: "pointer", padding: 0, flexShrink: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 24, height: 24, borderRadius: "50%",
                backgroundColor: "#dc2626",
                fontFamily: "'Pretendard', sans-serif",
                fontSize: 10, fontWeight: 600, lineHeight: 1,
                color: "#ffffff", letterSpacing: "0.02em", flexShrink: 0,
              }}
            >
              {userInitial}
            </span>
          </button>
          {profileOpen && (
            <ProfilePopover initial={userInitial} name={CURRENT_USER.name} email={CURRENT_USER.email} />
          )}
        </div>
      }
    />
  );
}
