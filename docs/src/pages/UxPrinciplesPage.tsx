import React from "react";
import { useTheme } from "../theme";

const ff = "'Pretendard', sans-serif";

function Principle({ number, title, desc, guidelines }: { number: string; title: string; desc: string; guidelines: string[] }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", gap: 20, padding: "24px 0", borderBottom: `1px solid ${colors.border.secondary}` }}>
      <span style={{ fontSize: 32, fontWeight: 700, color: "#9BDF06", fontFamily: ff, flexShrink: 0, width: 40 }}>{number}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0 }}>{title}</h3>
        <p style={{ fontSize: 14, lineHeight: "22px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>{desc}</p>
        <ul style={{ fontSize: 14, lineHeight: "22px", color: colors.text.secondary, fontFamily: ff, margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {guidelines.map((g, i) => <li key={i}>{g}</li>)}
        </ul>
      </div>
    </div>
  );
}

export function UxPrinciplesPage() {
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, fontFamily: ff, margin: 0 }}>UX Principles</h1>
        <p style={{ fontSize: 15, lineHeight: "26px", color: colors.text.secondary, fontFamily: ff, margin: 0 }}>
          MakinaRocks 제품 전반에 걸쳐 일관된 사용자 경험을 만들기 위한 핵심 원칙들입니다.
        </p>
      </div>

      <div style={{ height: 1, backgroundColor: colors.border.secondary }} />

      <Principle
        number="01"
        title="Clarity over Cleverness"
        desc="사용자가 즉시 이해할 수 있는 명확한 인터페이스를 만듭니다. 복잡한 AI/ML 워크플로우를 단순하고 직관적인 단계로 분해합니다."
        guidelines={[
          "레이블과 메시지는 전문 용어를 최소화하고 명확하게 작성합니다",
          "액션 버튼의 텍스트는 결과를 예측할 수 있어야 합니다 (예: 'Delete project' > 'OK')",
          "상태 변화는 시각적 피드백으로 즉시 전달합니다",
        ]}
      />

      <Principle
        number="02"
        title="Progressive Disclosure"
        desc="정보와 기능을 단계적으로 공개하여 인지 부하를 줄입니다. 가장 중요한 정보를 먼저 보여주고, 세부사항은 필요할 때 접근할 수 있게 합니다."
        guidelines={[
          "기본 뷰는 핵심 정보만 표시하고, 상세는 Drawer나 확장 패널로 제공합니다",
          "고급 설정은 기본 폼과 분리하여 별도 섹션에 배치합니다",
          "Tooltip과 Help icon으로 추가 컨텍스트를 제공합니다",
        ]}
      />

      <Principle
        number="03"
        title="Consistent Patterns"
        desc="동일한 문제에는 동일한 솔루션을 적용합니다. 사용자가 한번 학습한 패턴을 다른 곳에서도 동일하게 적용할 수 있어야 합니다."
        guidelines={[
          "CRUD 작업은 항상 같은 패턴을 따릅니다 (Create → Drawer, Edit → Drawer, Delete → Modal)",
          "테이블, 카드, 리스트의 인터랙션(호버, 선택, 정렬)은 전체 앱에서 동일합니다",
          "에러 상태와 빈 상태는 통일된 컴포넌트로 표현합니다",
        ]}
      />

      <Principle
        number="04"
        title="Feedback & Responsiveness"
        desc="모든 사용자 액션에 즉각적이고 의미 있는 피드백을 제공합니다."
        guidelines={[
          "버튼 클릭 시 hover → pressed → loading 상태 전환을 즉시 보여줍니다",
          "비동기 작업은 Spinner나 ProgressBar로 진행 상태를 표시합니다",
          "성공/실패는 Toast나 Alert로 명확히 전달합니다",
          "Skeleton UI로 로딩 중에도 레이아웃 안정성을 유지합니다",
        ]}
      />

      <Principle
        number="05"
        title="Accessible by Default"
        desc="접근성은 선택이 아닌 기본값입니다. 모든 사용자가 동등하게 제품을 이용할 수 있어야 합니다."
        guidelines={[
          "모든 색상 조합은 WCAG 2.1 AA 대비율(4.5:1)을 충족합니다",
          "키보드만으로 모든 기능에 접근 가능합니다",
          "스크린 리더를 위한 ARIA 레이블과 role을 제공합니다",
          "포커스 표시(Focus ring)가 항상 명확히 보입니다",
        ]}
      />

      <Principle
        number="06"
        title="Data-Driven Design"
        desc="AI/ML 플랫폼의 특성을 반영하여 데이터 중심의 인터페이스를 설계합니다."
        guidelines={[
          "테이블과 차트는 대량의 데이터를 효율적으로 표시합니다",
          "필터링, 검색, 정렬은 모든 데이터 뷰에서 일관되게 제공합니다",
          "숫자와 상태 정보는 시각적 인디케이터(Badge, StatusChip)로 빠르게 파악할 수 있게 합니다",
        ]}
      />
    </div>
  );
}
