import React, { useState, useRef, useCallback } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { DefaultCard } from "@ds/components/DefaultCard";
import { StatusChip } from "@ds/components/StatusChip";
import { Avatar, getAvatarColorFromInitial } from "@ds/components/Avatar";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";

interface ApplicationPageProps {
  onNavigate?: (key: string) => void;
}

const ff = "'Pretendard', sans-serif";

type AppStatus = "Launched" | "Terminated" | "Error";

const STATUS_MAP: Record<
  AppStatus,
  { label: string; state: "success" | "stopped" | "error" }
> = {
  Launched: { label: "Launched", state: "success" },
  Terminated: { label: "Terminated", state: "stopped" },
  Error: { label: "Error", state: "error" },
};

const APP_ITEMS: {
  id: string;
  title: string;
  desc: string;
  status: AppStatus;
  date: string;
  creator: string;
}[] = [
  {
    id: "app1",
    title: "두산에너빌리티 챗봇",
    desc: "자연어 처리 기반의 산업용 챗봇 서비스로 설비 매뉴얼 검색 및 고장 진단을 지원합니다",
    status: "Launched",
    date: "2024-11-05 09:30:12",
    creator: "JP",
  },
  {
    id: "app2",
    title: "이미지 분류 파이프라인",
    desc: "제조 라인 불량 검출을 위한 CNN 기반 이미지 분류 모델 학습 및 추론 파이프라인",
    status: "Launched",
    date: "2024-10-22 14:15:33",
    creator: "GH",
  },
  {
    id: "app3",
    title: "LLM Fine-tuning 서버",
    desc: "GPT 및 LLaMA 모델의 도메인 특화 파인튜닝을 위한 분산 학습 환경을 제공합니다",
    status: "Terminated",
    date: "2024-09-18 17:42:08",
    creator: "SY",
  },
  {
    id: "app4",
    title: "수요 예측 대시보드",
    desc: "시계열 데이터 분석을 통한 제품 수요 예측 및 실시간 모니터링 대시보드",
    status: "Error",
    date: "2024-12-01 11:05:47",
    creator: "MK",
  },
  {
    id: "app5",
    title: "음성 인식 API 서버",
    desc: "Whisper 기반 실시간 음성 텍스트 변환 API 서버로 다국어를 지원합니다",
    status: "Launched",
    date: "2025-01-10 08:20:55",
    creator: "HJ",
  },
  {
    id: "app6",
    title: "문서 요약 에이전트",
    desc: "RAG 파이프라인을 활용한 대규모 문서 자동 요약 및 Q&A 에이전트",
    status: "Launched",
    date: "2025-02-14 16:33:21",
    creator: "JP",
  },
  {
    id: "app7",
    title: "센서 이상 탐지 모델",
    desc: "IoT 센서 스트림 데이터의 실시간 이상 탐지를 위한 오토인코더 모델 서빙",
    status: "Terminated",
    date: "2024-08-30 10:12:44",
    creator: "DK",
  },
];

// ── Sidebar header ──────────────────────────────────────────────────────────
function SidebarHeader() {
  const { colors } = useTheme();
  return (
    <>
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
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "4px 12px 8px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 5.3,
            backgroundColor: colors.bg.warningSubtle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="folder-fill" size={18} color={colors.icon.warning} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: colors.text.tertiary,
              lineHeight: "14px",
              fontFamily: ff,
            }}
          >
            Projects
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: colors.text.primary,
              lineHeight: "16px",
              fontFamily: ff,
            }}
          >
            NLP Models
          </div>
        </div>
      </div>
    </>
  );
}

// ── Create button ────────────────────────────────────────────────────────────
function CreateButton() {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 40,
        padding: "8px 16px",
        borderRadius: 4,
        border: "none",
        backgroundColor: hov ? "#1447e6" : "#155dfc",
        color: "#fff",
        fontFamily: ff,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: "16px",
        cursor: "pointer",
        transition: "background-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="create" size={24} color="#fff" />
      Create
    </button>
  );
}

// ── Card footer (avatar + date) ─────────────────────────────────────────────
function CardFooter({ creator, date }: { creator: string; date: string }) {
  const { colors } = useTheme();
  return (
    <div
      style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}
    >
      <Avatar
        initial={creator}
        size="sm"
        color={getAvatarColorFromInitial(creator)}
      />
      <span
        style={{
          fontSize: 14,
          color: colors.text.primary,
          fontFamily: ff,
          lineHeight: "16px",
        }}
      >
        {date}
      </span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function ApplicationPage({ onNavigate }: ApplicationPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("application");
  const [searchQuery, setSearchQuery] = useState("");
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
        items={PROJECT_NAV}
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
              label: "NLP Models",
              icon: (
                <Icon
                  name="folder_open"
                  size={20}
                  color={colors.icon.secondary}
                />
              ),
            },
            {
              label: "Application",
              icon: (
                <Icon
                  name="application"
                  size={20}
                  color={colors.icon.secondary}
                />
              ),
            },
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
              Application
            </h1>
            <CreateButton />
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 400,
              lineHeight: "24px",
              color: colors.text.secondary,
              fontFamily: ff,
              margin: 0,
            }}
          >
            View and manage applications in the project.
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
              gap: 16,
              padding: 24,
            }}
          >
            {/* Search & Filter bar */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Search input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  width: 320,
                  height: 32,
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: `1px solid ${colors.border.secondary}`,
                  backgroundColor: colors.bg.primary,
                  boxSizing: "border-box",
                }}
              >
                <Icon name="search" size={24} color={colors.icon.disabled} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontFamily: ff,
                    fontSize: 14,
                    lineHeight: "16px",
                    color: colors.text.primary,
                  }}
                />
              </div>
              {/* Status filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  height: 32,
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: `1px solid ${colors.border.secondary}`,
                  backgroundColor: colors.bg.primary,
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: colors.text.tertiary,
                    fontFamily: ff,
                    opacity: 0.7,
                  }}
                >
                  Status
                </span>
                <Icon
                  name="arrow2_down"
                  size={16}
                  color={colors.icon.disabled}
                />
              </div>
            </div>

            {/* Card grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "32px 16px",
              }}
            >
              {APP_ITEMS.map((item) => (
                <DefaultCard
                  key={item.id}
                  title={item.title}
                  desc={item.desc}
                  chip={
                    <StatusChip
                      label={STATUS_MAP[item.status].label}
                      state={STATUS_MAP[item.status].state}
                      size="sm"
                    />
                  }
                  footer={
                    <CardFooter creator={item.creator} date={item.date} />
                  }
                  onClick={() => {}}
                  style={{ width: "auto", height: 256 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
