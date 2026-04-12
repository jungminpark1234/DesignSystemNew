# MakinaRocks Design System

MakinaRocks 제품군(Runway, Drawx)을 위한 React 컴포넌트 라이브러리 및 디자인 토큰 시스템입니다.

## Quick Start

```bash
# 디자인 시스템 개발
cd DesignSystemNew
npm install

# 데모 앱 실행
cd demo
npm install
npm run dev
```

데모 앱이 `http://localhost:5173`에서 실행됩니다.

## 프로젝트 구조

```
DesignSystemNew/
├── src/
│   ├── components/       # React 컴포넌트
│   ├── tokens/           # 디자인 토큰 (색상, 타이포, 간격 등)
│   ├── icons/            # SVG 아이콘 카탈로그
│   └── styles/           # 글로벌 CSS
├── demo/                 # 데모 앱 (Vite + React)
│   └── src/pages/        # 컴포넌트 데모 페이지
├── docs/                 # 문서
├── design.md             # 디자인 규칙 명세 (AI 에이전트 참조용)
└── CLAUDE.md             # AI 에이전트 지침
```

## 컴포넌트 목록

### General
| 컴포넌트 | 설명 |
|----------|------|
| `Button` | Primary, Secondary, Destructive, Transparent 스타일 |
| `ButtonStack` | 버튼 그룹 레이아웃 |
| `IconButton` | 아이콘 전용 버튼 |
| `Link` | 텍스트 링크 |
| `Icon` | SVG 아이콘 렌더러 (100+ 아이콘) |
| `Spinner` | 로딩 스피너 |
| `Skeleton` | 로딩 플레이스홀더 |

### Form Controls
| 컴포넌트 | 설명 |
|----------|------|
| `TextField` | 텍스트 입력 (에러, 카운터, 아이콘 지원) |
| `TextArea` | 여러 줄 텍스트 입력 |
| `Select` | 드롭다운 선택 |
| `Checkbox` | 체크박스 (체크, 미결정 상태) |
| `Radio` | 라디오 버튼 |
| `Switch` | 토글 스위치 |
| `Label` | 폼 라벨 |
| `ControlGroup` | 폼 컨트롤 그룹 래퍼 |

### Data Display
| 컴포넌트 | 설명 |
|----------|------|
| `Badge` | Dot, Number, Text 타입 배지 |
| `StatusChip` | 상태 표시 칩 (pending, success, failed 등) |
| `Chip` | 선택 가능한 필터 칩 |
| `Table` | 데이터 테이블 |
| `Tabs` | 탭 네비게이션 (Pill 스타일) |
| `Pagination` | 페이지네이션 |
| `ProgressBar` | 진행률 바 |
| `Avatar` | 사용자 아바타 |
| `Tooltip` | 툴팁 |

### Layout & Navigation
| 컴포넌트 | 설명 |
|----------|------|
| `DefaultCard` | 카드 컨테이너 |
| `GridCard` | 그리드 레이아웃 카드 |
| `ProjectCard` | 프로젝트 전용 카드 |
| `Divider` | 구분선 (수평/수직) |
| `NavItem` | 사이드바 네비게이션 아이템 |
| `Sidebar` | 사이드바 레이아웃 |
| `GlobalNav` | 글로벌 상단 네비게이션 |

### Feedback & Overlay
| 컴포넌트 | 설명 |
|----------|------|
| `Alert` | 알림 메시지 (info, success, warning, error) |
| `Toast` | 토스트 알림 |
| `Modal` | 모달 다이얼로그 |
| `Drawer` | 슬라이드 패널 |
| `CopyButton` | 클립보드 복사 버튼 |

## 디자인 토큰

모든 시각적 결정은 `src/tokens/`에 정의된 토큰을 사용합니다.

| 파일 | 내용 |
|------|------|
| `colors.ts` | 기본 팔레트 + Light 모드 시맨틱 토큰 |
| `colorsDark.ts` | Dark 모드 시맨틱 토큰 (WCAG 대비비 포함) |
| `typography.ts` | 폰트 패밀리, 굵기, Heading/Body 스케일 |
| `spacing.ts` | 간격, 테두리 반경, 테두리 두께, 그림자 |
| `effects.ts` | 그림자 프리미티브, box-shadow, drop-shadow |
| `grid.ts` | 브레이크포인트, 그리드 설정, 컨테이너 헬퍼 |

### 사용 예시

```tsx
import { Button } from '../components/Button/Button';
import { TextField } from '../components/TextField/TextField';
import { colorText, colorBg } from '../tokens/colors';
import { heading, body } from '../tokens/typography';
import { spacing, borderRadius } from '../tokens/spacing';

// 컴포넌트 사용
<Button variant="runway" size="lg">시작하기</Button>
<TextField placeholder="검색어 입력" status="default" />

// 토큰 직접 사용
<div style={{
  color: colorText.primary,
  backgroundColor: colorBg.secondary,
  padding: spacing[24],
  borderRadius: borderRadius.xl,
  ...heading.sm,
}}>
  섹션 타이틀
</div>
```

## 기술 스택

- **React 18** — 함수형 컴포넌트 + Hooks
- **TypeScript** — 타입 안전한 Props 및 토큰
- **Vite** — 빌드 도구 및 개발 서버
- **Pretendard** — 한/영 최적화 서체
- **Source Code Pro** — 모노스페이스 서체
- **커스텀 빌드** — 외부 UI 라이브러리 없음 (shadcn, Radix, MUI 미사용)

## 디자인 명세

AI 에이전트가 이 디자인 시스템에 맞게 코드를 생성할 때 참조하는 문서:

- [`design.md`](./design.md) — 색상, 타이포, 컴포넌트, 레이아웃 전체 규칙
