import React from "react";
import { useTheme } from "../theme";
import { heading, body, fontFamily } from "@ds/tokens/typography";

const ff = fontFamily.heading; // Pretendard

// Hero image from Figma
const INTRO_IMG = "https://www.figma.com/api/mcp/asset/05c0b7c4-3f41-4f8a-805c-e3f2e8df3bc6";

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <h2
      id={id}
      style={{
        fontFamily: ff,
        fontSize: heading.sm.fontSize,       // 20px
        fontWeight: heading.sm.fontWeight,    // 600 (SemiBold)
        lineHeight: heading.sm.lineHeight,    // 24px
        letterSpacing: heading.sm.letterSpacing,
        color: colors.text.primary,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

function BodyText({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { colors } = useTheme();
  return (
    <p
      style={{
        fontFamily: fontFamily.body,
        fontSize: body.lg.regular.fontSize,       // 14px
        fontWeight: body.lg.regular.fontWeight,    // 400
        lineHeight: body.lg.regular.lineHeight,    // 16px
        letterSpacing: body.lg.regular.letterSpacing,
        color: colors.text.secondary,
        margin: 0,
        ...s,
      }}
    >
      {children}
    </p>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        backgroundColor: "#f4f4f1",
        border: `1px solid ${colors.border.interactive.secondary}`,
        borderRadius: 8,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontFamily: fontFamily.body,
          fontSize: body.lg.medium.fontSize,       // 14px
          fontWeight: body.lg.medium.fontWeight,    // 500 (Medium)
          lineHeight: body.lg.medium.lineHeight,    // 16px
          color: colors.text.primary,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: fontFamily.body,
          fontSize: body.md.regular.fontSize,       // 12px
          fontWeight: body.md.regular.fontWeight,    // 400
          lineHeight: body.md.regular.lineHeight,    // 16px
          color: colors.text.secondary,
        }}
      >
        {desc}
      </span>
    </div>
  );
}

export function IntroPage() {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
        <h1
          style={{
            fontFamily: ff,
            fontSize: 28,
            fontWeight: 700,
            lineHeight: "normal",
            color: colors.text.primary,
            margin: 0,
          }}
        >
          MakinaRocks Design System
        </h1>
        <BodyText>
          A comprehensive design system for building consistent, accessible, and beautiful enterprise AI/ML interfaces.
        </BodyText>
      </div>

      {/* Hero Image */}
      <div style={{ width: "100%", aspectRatio: "1643 / 957", borderRadius: 12, overflow: "hidden", backgroundColor: "#0a0a0a" }}>
        <img
          src={INTRO_IMG}
          alt="MakinaRocks Design System"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Overview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        <SectionTitle id="overview">Overview</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <BodyText>MakinaRocks Design System은 AI/ML 플랫폼을 위한 통합 UI 컴포넌트 라이브러리입니다.</BodyText>
          <BodyText>45개 이상의 프로덕션 레디 컴포넌트와 디자인 토큰을 제공하며, 라이트/다크 모드를 완벽히 지원합니다.</BodyText>
        </div>
      </div>

      {/* Design Philosophy */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        <SectionTitle id="philosophy">Design Philosophy</SectionTitle>
        <Card title="Consistency" desc="모든 컴포넌트는 동일한 디자인 토큰(색상, 타이포그래피, 간격)을 공유하여 시각적 일관성을 보장합니다." />
        <Card title="Accessibility" desc="WCAG 2.1 AA 기준을 충족하는 컬러 대비, 키보드 내비게이션, ARIA 레이블을 기본 제공합니다." />
        <Card title="Flexibility" desc="모든 컴포넌트는 props를 통해 다양한 변형을 지원하며, 스타일 오버라이드가 가능합니다." />
        <Card title="Dark Mode First" desc="CSS Custom Properties 기반으로 라이트/다크 모드 전환이 실시간으로 반영됩니다." />
      </div>

      {/* Structure */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        <SectionTitle id="structure">Structure</SectionTitle>
        <BodyText>디자인 시스템은 세 레이어로 구성됩니다:</BodyText>
        <div
          style={{
            fontFamily: fontFamily.body,
            fontSize: body.md.regular.fontSize,       // 12px
            fontWeight: body.md.regular.fontWeight,
            lineHeight: body.md.regular.lineHeight,    // 16px
            color: colors.text.secondary,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <p style={{ margin: 0 }}>• Foundation — 색상, 타이포그래피, 간격, 그리드 등 기본 디자인 토큰</p>
          <p style={{ margin: 0 }}>• Components — Button, TextField, Table 등 재사용 가능한 UI 컴포넌트</p>
          <p style={{ margin: 0 }}>• Patterns — 페이지 레이아웃, 폼 패턴 등 컴포넌트 조합 가이드</p>
        </div>
      </div>
    </div>
  );
}
