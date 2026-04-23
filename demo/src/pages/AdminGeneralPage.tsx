import React, { useState, useRef, useCallback } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { Button } from "@ds/components/Button";
import { CopyButton } from "@ds/components/CopyButton";
import { Badge } from "@ds/components/Badge";
import { Table, TableColumn } from "@ds/components/Table";
import { useTheme } from "../theme";
import { ADMIN_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";

interface AdminGeneralPageProps {
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
          borderRadius: 6,
          backgroundColor: "#155dfc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1 }}>R</span>
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
        Runway 관리센터
      </span>
      <Icon name="sidebar" size={20} color={colors.icon.secondary} />
    </div>
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
              lineHeight: 1.5,
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

// ── Card container ──────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
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
      {children}
    </div>
  );
}

// ── Row: label + value ──────────────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, minHeight: 32 }}>
      <div style={{ width: 220, flexShrink: 0 }}>
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
          flex: 1,
          minWidth: 0,
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

// ── Quota card ───────────────────────────────────────────────────────────────
function QuotaCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
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
      <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
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
            fontSize: 14,
            fontWeight: 500,
            color: colors.text.secondary,
            fontFamily: ff,
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

// ── Sync state ───────────────────────────────────────────────────────────────
type SyncState = "never" | "idle" | "syncing" | "success" | "error";

type AlertStatus = "info" | "success" | "error" | "warning";
type AlertIcon = "info-circle-stroke" | "success-fill" | "error-fill" | "warning-stroke";

const SYNC_ALERT: Record<
  SyncState,
  {
    status: AlertStatus;
    iconName: AlertIcon;
    message: (ctx: { lastSyncedAt: string | null; errorMsg?: string }) => string;
  }
> = {
  never: {
    status: "warning",
    iconName: "warning-stroke",
    message: () =>
      "이 관리자는 아직 외부 시스템과 동기화되지 않았습니다. 하단의 동기화 버튼을 눌러 최초 동기화를 진행해주세요.",
  },
  idle: {
    status: "info",
    iconName: "info-circle-stroke",
    message: ({ lastSyncedAt }) =>
      `외부 시스템의 리소스를 매시간 폴링해서 반영합니다. 마지막 동기화: ${lastSyncedAt ?? "—"}`,
  },
  syncing: {
    status: "info",
    iconName: "info-circle-stroke",
    message: () => "외부 시스템에서 리소스를 가져오는 중입니다...",
  },
  success: {
    status: "success",
    iconName: "success-fill",
    message: ({ lastSyncedAt }) => `동기화 완료. 마지막 동기화: ${lastSyncedAt ?? "—"}`,
  },
  error: {
    status: "error",
    iconName: "error-fill",
    message: ({ errorMsg }) =>
      `동기화 실패: ${errorMsg ?? "외부 시스템에 연결할 수 없습니다."} 네트워크 상태를 확인하고 다시 시도해주세요.`,
  },
};

function SyncAlert({
  state,
  lastSyncedAt,
  errorMsg,
}: {
  state: SyncState;
  lastSyncedAt: string | null;
  errorMsg?: string;
}) {
  const { colors } = useTheme();
  const def = SYNC_ALERT[state];

  const tokenMap: Record<AlertStatus, { bg: string; iconColor: string; border: string }> = {
    info: {
      bg: `var(--ds-bg-info-subtle, ${colors.bg.infoSubtle})`,
      iconColor: colors.icon.info,
      border: colors.bg.infoSubtle,
    },
    success: {
      bg: `var(--ds-bg-success-subtle, ${colors.bg.successSubtle})`,
      iconColor: colors.icon.success,
      border: colors.bg.successSubtle,
    },
    error: {
      bg: `var(--ds-bg-danger-subtle, ${colors.bg.dangerSubtle})`,
      iconColor: colors.icon.danger,
      border: colors.bg.dangerSubtle,
    },
    warning: {
      bg: `var(--ds-bg-warning-subtle, ${colors.bg.warningSubtle})`,
      iconColor: colors.icon.warning,
      border: colors.bg.warningSubtle,
    },
  };
  const t = tokenMap[def.status];

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        backgroundColor: t.bg,
        border: `1px solid ${t.border}`,
      }}
    >
      <Icon name={def.iconName} size={24} color={t.iconColor} />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 400,
          color: colors.text.primary,
          fontFamily: ff,
          lineHeight: "16px",
        }}
      >
        {def.message({ lastSyncedAt, errorMsg })}
      </span>
    </div>
  );
}

// ── General content ─────────────────────────────────────────────────────────
function GeneralContent({ uid }: { uid: string }) {
  const { colors } = useTheme();
  return (
    <>
      <Section title="시스템 정보" desc="관리자 인스턴스의 기본 정보입니다.">
        <Card>
          <Row label="UID">
            <code
              style={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: 13,
                color: colors.text.primary,
              }}
            >
              {uid}
            </code>
            <CopyButton text={uid} size={24} style={{ marginLeft: 4 }} />
          </Row>
          <Row label="버전">
            <span>v1.5.0</span>
            <Badge type="text" status="success" label="Up-to-date" style={{ marginLeft: 8 }} />
          </Row>
          <Row label="호스트">admin.makinarocks.internal</Row>
        </Card>
      </Section>

      <Section
        title="라이선스 정보"
        desc="조직에 부여된 라이선스 정보입니다. 갱신이 필요하면 영업 담당자에게 문의하세요."
      >
        <Card>
          <Row label="라이선스 유형">
            <Badge type="text" status="info" label="enterprise" />
          </Row>
          <Row label="회사">makinarocks</Row>
          <Row label="만료일">
            <span>2026-12-12 15:38:00</span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 12,
                color: colors.text.tertiary,
                fontFamily: ff,
              }}
            >
              234일 남았습니다.
            </span>
          </Row>
          <Row label="발급일">2024-04-22 11:00:00</Row>
        </Card>
      </Section>

      <Section title="기능 및 할당량" desc="라이선스에 따른 리소스 상한입니다.">
        <div style={{ display: "flex", gap: 8 }}>
          <QuotaCard
            icon={<Icon name="workspace" size={24} color={colors.icon.secondary} />}
            label="최대 워크스페이스 수"
            value="1,000"
            unit="개"
          />
          <QuotaCard
            icon={<Icon name="folder_open" size={24} color={colors.icon.secondary} />}
            label="워크스페이스당 최대 프로젝트 수"
            value="100"
            unit="개"
          />
          <QuotaCard
            icon={<Icon name="user" size={24} color={colors.icon.secondary} />}
            label="최대 계정 수"
            value="10,000"
            unit="개"
          />
        </div>
      </Section>
    </>
  );
}

// ── Sync content ────────────────────────────────────────────────────────────
interface SyncHistoryRow extends Record<string, unknown> {
  id: string;
  syncedAt: string;
  source: string;
  result: "success" | "error";
  changes: number;
  duration: string;
}

function SyncContent({
  syncState,
  lastSyncedAt,
  errorMsg,
}: {
  syncState: SyncState;
  lastSyncedAt: string | null;
  errorMsg: string;
}) {
  const { colors } = useTheme();

  const historyColumns: TableColumn<SyncHistoryRow>[] = [
    { key: "syncedAt", label: "동기화 시각", minWidth: 180, flex: 1 },
    { key: "source", label: "외부 시스템", minWidth: 180, flex: 1.2 },
    { key: "resource", label: "리소스", minWidth: 140, flex: 1 },
    {
      key: "result",
      label: "결과",
      minWidth: 100,
      render: (v) =>
        v === "success" ? (
          <Badge type="text" status="success" label="성공" />
        ) : (
          <Badge type="text" status="error" label="실패" />
        ),
    },
    { key: "changes", label: "변경", minWidth: 80 },
    { key: "duration", label: "소요", minWidth: 80 },
  ];

  return (
    <>
      <SyncAlert state={syncState} lastSyncedAt={lastSyncedAt} errorMsg={errorMsg} />

      <Section
        title="동기화 설정"
        desc="이 관리자는 외부 시스템(플랫폼 애플리케이션, Keycloak 등)에서 리소스를 주기적으로 폴링하여 반영합니다. 폴링 주기를 기다리지 않고 즉시 반영하려면 상단의 동기화 버튼을 누르세요."
      >
        <Card>
          <Row label="동기화 대상">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>
                워크스페이스
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: colors.text.tertiary,
                    fontFamily: ff,
                  }}
                >
                  ← 플랫폼 애플리케이션 콘솔
                </span>
              </span>
              <span>
                사용자 · 그룹
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: colors.text.tertiary,
                    fontFamily: ff,
                  }}
                >
                  ← Keycloak
                </span>
              </span>
            </div>
          </Row>
          <Row label="마지막 동기화">
            {lastSyncedAt ? (
              <>
                <span>{lastSyncedAt}</span>
                {syncState === "success" && (
                  <Badge
                    type="text"
                    status="success"
                    label="방금 업데이트됨"
                    style={{ marginLeft: 8 }}
                  />
                )}
                {syncState === "error" && (
                  <Badge
                    type="text"
                    status="error"
                    label="실패"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </>
            ) : (
              <>
                <span style={{ color: colors.text.tertiary }}>—</span>
                <Badge
                  type="text"
                  status="warning"
                  label="미동기화"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </Row>
          <Row label="다음 자동 동기화">2026-04-22 11:12:04</Row>
          <Row label="자동 동기화 주기">매시간</Row>
        </Card>
      </Section>

      <Section title="동기화 이력" desc="최근 동기화 시도 이력입니다. (데이터는 향후 연동 예정)">
        <div
          style={{
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border.tertiary}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Table
            columns={historyColumns}
            rows={[]}
            rowKey="id"
            emptyMessage="아직 동기화 이력이 없습니다."
          />
        </div>
      </Section>
    </>
  );
}

// ── Security content (placeholder) ──────────────────────────────────────────
function SecurityContent() {
  const { colors } = useTheme();
  return (
    <Section title="보안 설정" desc="접근 제어, 인증, 감사 로그 등 보안 설정을 관리합니다.">
      <Card>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "40px 0",
          }}
        >
          <Icon name="lock" size={32} color={colors.icon.disabled} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: colors.text.secondary,
              fontFamily: ff,
            }}
          >
            보안 설정 화면은 곧 제공될 예정입니다.
          </span>
        </div>
      </Card>
    </Section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}


export function AdminGeneralPage({ onNavigate }: AdminGeneralPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState<string>("admin-general");
  const [syncState, setSyncState] = useState<SyncState>("never");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const uid = "c75a0f08-f944-489a-8970-86956e4c5e5c";
  const syncing = syncState === "syncing";

  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrolled(scrollRef.current.scrollTop > 20);
  }, []);

  const handleNavSelect = (key: string) => {
    setSelectedNav(key);
    onNavigate?.(key);
  };

  const runSync = (outcome: "success" | "error") => {
    if (syncing) return;
    setSyncState("syncing");
    setTimeout(() => {
      if (outcome === "error") {
        setErrorMsg("ECONNREFUSED platform-api:7823");
        setSyncState("error");
      } else {
        setLastSyncedAt(formatNow());
        setErrorMsg("");
        setSyncState("success");
      }
    }, 1200);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Sidebar
        items={ADMIN_NAV}
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
            Runway Admin v1.5.0
          </span>
        }
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {(() => {
          const isSync = selectedNav === "admin-sync";
          const isSecurity = selectedNav === "admin-security";
          const crumb = isSync ? "Sync" : isSecurity ? "Security" : "General";
          const pageTitle = crumb;
          const pageDesc = isSync
            ? "외부 시스템(플랫폼 애플리케이션 콘솔, Keycloak 등)의 워크스페이스·사용자를 폴링하여 관리자에 반영합니다."
            : isSecurity
            ? "접근 제어, 인증, 감사 로그 등 보안 설정을 관리합니다."
            : "시스템 정보, 라이선스, 할당량을 확인합니다.";

          return (
            <>
              <AppGnb
                breadcrumbs={[
                  {
                    label: "설정",
                    icon: <Icon name="setting" size={20} color={colors.icon.secondary} />,
                  },
                  { label: crumb },
                ]}
              />

              <div
                style={{
                  padding: "24px 24px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  flexShrink: 0,
                  borderBottom: scrolled
                    ? `1px solid ${colors.border.secondary}`
                    : "1px solid transparent",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
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
                    {pageTitle}
                  </h1>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: colors.text.secondary,
                      fontFamily: ff,
                      margin: 0,
                    }}
                  >
                    {pageDesc}
                  </p>
                </div>
                {isSync && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Button
                      buttonType="Primary"
                      buttonStyle="filled"
                      size="md"
                      loading={syncing}
                      onClick={() => runSync("success")}
                      leadingIcon={
                        syncing ? undefined : (
                          <Icon name="refresh" size={16} color={colors.text.inverse} />
                        )
                      }
                    >
                      {syncing ? "동기화 중" : "동기화 (성공)"}
                    </Button>
                    <Button
                      buttonType="Destructive"
                      buttonStyle="filled"
                      size="md"
                      loading={syncing}
                      onClick={() => runSync("error")}
                      leadingIcon={
                        syncing ? undefined : (
                          <Icon name="refresh" size={16} color={colors.text.inverse} />
                        )
                      }
                    >
                      {syncing ? "동기화 중" : "동기화 (실패)"}
                    </Button>
                  </div>
                )}
              </div>

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
                  {isSync ? (
                    <SyncContent
                      syncState={syncState}
                      lastSyncedAt={lastSyncedAt}
                      errorMsg={errorMsg}
                    />
                  ) : isSecurity ? (
                    <SecurityContent />
                  ) : (
                    <GeneralContent uid={uid} />
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
