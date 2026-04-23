import React, { useState, useRef, useCallback } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { WORKSPACE_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";

interface WorkspaceGeneralPageProps {
  onNavigate?: (key: string) => void;
}

const ff = "'Pretendard', sans-serif";

// ── Sidebar header ──────────────────────────────────────────────────────────
function SidebarHeader() {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 16px 12px",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 5.3,
          backgroundColor: "#bf6a40",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          D
        </span>
      </div>
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "16px",
          color: colors.text.primary,
          fontFamily: ff,
        }}
      >
        Data studio
      </span>
      <Icon name="sidebar" size={20} color={colors.icon.secondary} />
    </div>
  );
}

// ── Info field (label + value) ───────────────────────────────────────────────
function InfoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflow: "hidden",
        borderRadius: 4,
      }}
    >
      <div style={{ height: 20, display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: colors.text.secondary,
            fontFamily: ff,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          fontSize: 14,
          fontWeight: 400,
          color: colors.text.primary,
          fontFamily: ff,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Resource card ────────────────────────────────────────────────────────────
function ResourceCard({
  icon,
  label,
  value,
  unit,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  extra?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {icon}
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: colors.text.secondary,
            fontFamily: ff,
          }}
        >
          {label}
        </span>
        {extra}
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: colors.text.primary,
            fontFamily: ff,
            lineHeight: "24px",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.text.primary,
            fontFamily: ff,
            lineHeight: "24px",
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

// ── Seat card ────────────────────────────────────────────────────────────────
function SeatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {icon}
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: colors.text.secondary,
            fontFamily: ff,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: ff,
          lineHeight: "24px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Period card ──────────────────────────────────────────────────────────────
function PeriodCard({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.tertiary}`,
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 20, display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: colors.text.secondary,
            fontFamily: ff,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ height: 32, display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: colors.text.primary,
            fontFamily: ff,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Edit button ──────────────────────────────────────────────────────────────
function EditButton() {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "8px 12px",
        borderRadius: 4,
        border: `1px solid ${colors.border.secondary}`,
        backgroundColor: hov ? colors.bg.tertiary : colors.bg.primary,
        cursor: "pointer",
        transition: "background-color 0.15s",
      }}
    >
      <Icon name="edit" size={24} color={colors.icon.secondary} />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: colors.text.secondary,
          fontFamily: ff,
        }}
      >
        Edit
      </span>
    </button>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 32, display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: colors.text.primary,
              fontFamily: ff,
            }}
          >
            {title}
          </span>
        </div>
        {desc && (
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: colors.text.secondary,
              fontFamily: ff,
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            {desc}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function WorkspaceGeneralPage({
  onNavigate,
}: WorkspaceGeneralPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("general");
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolled(scrollRef.current.scrollTop > 20);
    }
  }, []);

  const handleNavSelect = (key: string) => {
    setSelectedNav(key);
    onNavigate?.(key);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar
        items={WORKSPACE_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={<SidebarHeader />}
        footer={
          <span
            style={{
              fontSize: 11,
              color: colors.text.disabled,
              fontFamily: ff,
            }}
          >
            Runway v1.5.0
          </span>
        }
      />

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* GNB */}
        <AppGnb
          breadcrumbs={[
            {
              label: "Settings",
              icon: (
                <Icon name="setting" size={20} color={colors.icon.secondary} />
              ),
            },
            { label: "General" },
          ]}
        />

        {/* Title section (fixed) */}
        <div
          style={{
            padding: "24px 24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flexShrink: 0,
            borderBottom: scrolled
              ? `1px solid ${colors.border.secondary}`
              : "1px solid transparent",
            transition: "border-color 0.2s ease",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: "32px",
              color: colors.text.primary,
              fontFamily: ff,
              margin: 0,
            }}
          >
            일반 설정
          </h1>
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              lineHeight: "16px",
              color: colors.text.secondary,
              fontFamily: ff,
              margin: 0,
            }}
          >
            워크스페이스 이름 및 기타 일반 설정을 관리합니다.
          </p>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflow: "auto" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
              padding: 24,
            }}
          >
            {/* Info alert */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: 16,
                borderRadius: 16,
                backgroundColor: `var(--ds-bg-info-subtle, ${colors.bg.infoSubtle})`,
                border: `1px solid var(--ds-border-info-subtle, ${colors.bg.infoSubtle})`,
              }}
            >
              <Icon
                name="info-circle-stroke"
                size={24}
                color={colors.icon.info}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: colors.text.primary,
                  fontFamily: ff,
                  lineHeight: "16px",
                }}
              >
                기간 연장 및 시트 수를 변경하려면 시스템 관리자에게 문의해주세요
              </span>
            </div>

            {/* 일반 Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 32,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontFamily: ff,
                  }}
                >
                  일반
                </span>
                <EditButton />
              </div>
              <div
                style={{
                  backgroundColor: colors.bg.secondary,
                  border: `1px solid ${colors.border.tertiary}`,
                  borderRadius: 16,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <InfoField label="이름">Data studio</InfoField>
                <InfoField label="ID">Data-studio</InfoField>
                <InfoField label="설명">-</InfoField>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <InfoField label="생성됨">2022-05-25 14:05:03</InfoField>
                  </div>
                  <div style={{ flex: 1 }}>
                    <InfoField label="생성자">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: "#dc2626",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#fff",
                            fontFamily: ff,
                          }}
                        >
                          GH
                        </div>
                        <span>Gildong Hong</span>
                      </div>
                    </InfoField>
                  </div>
                </div>
              </div>
            </div>

            {/* 리소스 할당량 Section */}
            <Section
              title="리소스 할당량"
              desc="워크스페이스의 리소스 쿼터를 정의합니다. 이 쿼터는 워크스페이스 내 모든 프로젝트 및 워크스페이스 수준 서비스가 사용할 수 있는 CPU, 메모리, 스토리지 및 GPU 리소스의 최대 합계를 설정합니다. 리소스 쿼터 변경이 필요한 경우 시스템 관리자에게 문의하세요."
            >
              <div style={{ display: "flex", gap: 8 }}>
                <ResourceCard
                  icon={
                    <Icon name="cpu" size={24} color={colors.icon.secondary} />
                  }
                  label="CPU"
                  value="4"
                  unit="Cores"
                />
                <ResourceCard
                  icon={
                    <Icon
                      name="memory"
                      size={24}
                      color={colors.icon.secondary}
                    />
                  }
                  label="Memory"
                  value="4"
                  unit="GiB"
                />
                <ResourceCard
                  icon={
                    <Icon name="disk" size={24} color={colors.icon.secondary} />
                  }
                  label="Storage"
                  value="20"
                  unit="GiB"
                />
                <ResourceCard
                  icon={
                    <Icon name="gpu" size={24} color={colors.icon.secondary} />
                  }
                  label="GPU"
                  value="0"
                  unit="GPUs"
                  extra={
                    <Icon
                      name="help-circle-stroke"
                      size={24}
                      color={colors.icon.disabled}
                    />
                  }
                />
              </div>
            </Section>

            {/* 사용자 시트 Section */}
            <Section
              title="사용자 시트"
              desc="이 워크스페이스에 추가할 수 있는 최대 사용자 수입니다."
            >
              <div style={{ display: "flex", gap: 16 }}>
                <SeatCard
                  icon={
                    <Icon name="user" size={24} color={colors.icon.secondary} />
                  }
                  label="전체 시트"
                  value="100"
                />
                <SeatCard
                  icon={
                    <Icon
                      name="check-circle-stroke"
                      size={24}
                      color={colors.icon.success}
                    />
                  }
                  label="할당된 시트"
                  value="15"
                />
                <SeatCard
                  icon={<Icon name="pending" size={24} color="#944AF2" />}
                  label="할당되지 않은 시트"
                  value="85"
                />
              </div>
            </Section>

            {/* 활성 기간 Section */}
            <Section
              title="활성 기간"
              desc="이 워크스페이스가 활성 상태이고 접근 가능한 기간입니다."
            >
              <div style={{ display: "flex", gap: 16 }}>
                <PeriodCard label="시작일" value="2023-01-02 14:27" />
                <PeriodCard label="만료일" value="2027-01-02 14:27" />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
