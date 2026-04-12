# MakinaRocks Design System — design.md

> A comprehensive design language reference for MakinaRocks' product interface system.
> Built as a custom React component library with token-driven inline styles, supporting full light/dark mode with WCAG 2.1 compliance.

---

## 1. Visual Theme & Atmosphere

MakinaRocks' design system is an **industrial-grade product interface** built for data scientists and ML engineers operating complex pipelines. The visual language is **clean, neutral, and tool-focused** — every element serves the workflow, not decoration.

The system uses a **pure white primary background (#ffffff)** with a carefully calibrated gray-scale hierarchy to create depth through surface layering. Unlike consumer-facing products that might warm their palette, MakinaRocks embraces a **cool, blue-gray tinted neutral system** — reflecting the precision and reliability expected from an ML operations platform.

**Pretendard** is the system typeface — a Korean-optimized sans-serif that provides excellent CJK/Latin harmony, critical for a Korean-founded enterprise product serving international teams. Its geometric clarity at small sizes (the body scale starts at 10px) ensures dense data interfaces remain readable.

The design system is **fully token-driven**: every color, spacing value, radius, and shadow is sourced from a structured token architecture (`src/tokens/`). No magic numbers. Components consume tokens via inline `React.CSSProperties`, with CSS custom properties (`var(--ds-*)`) enabling runtime dark mode switching.

**Key Characteristics:**

- Pure white background (#ffffff light) / near-black blue-tinted (#000005 dark) — clean, professional, no warm-cream or playful tones
- Pretendard typeface with CJK/Latin harmony — engineered for Korean enterprise products
- Dual brand colors: **Runway blue (#155dfc)** and **Drawx purple (#4f39f6)** — product-line differentiation within a unified system
- Token-driven architecture: all visual decisions trace back to `src/tokens/` files
- Inline React.CSSProperties styling with CSS variable fallbacks for dark mode
- Dual-layer shadow system: core (subtle, near-object) + cast (diffuse, spreading)
- Compact body scale (10px / 12px / 14px) optimized for data-dense interfaces
- WCAG 2.1 AAA contrast ratios documented for all primary text in dark mode

---

## 2. Color Palette & Roles

### Primitive Palette

| Scale     | 50       | 100      | 200      | 300      | 400      | 500      | 600      | 700      | 800      | 900      | 950      |
|-----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| **Gray**  | #f9fafb  | #f3f4f6  | #e5e7eb  | #d1d5dc  | #99a1af  | #6a7282  | #4a5565  | #364153  | #1e2939  | #101828  | #030712  |
| **Blue**  | #eff6ff  | #dbeafe  | #bedbff  | #8eb8fd  | #51a2ff  | #2b7fff  | #155dfc  | #1447e6  | #193cb8  | #1b398a  | #162456  |
| **Red**   | #fef2f2  | #ffe2e2  | #ffc9c9  | #ffa2a2  | #ff6467  | #fb2c36  | #e7000b  | #c10007  | #9f0712  | #82181a  | #460809  |
| **Green** | #f0fdf4  | #dcfce7  | #b9f8cf  | #7bf1a8  | #05df72  | #00c950  | #00a63e  | #008236  | #016630  | #0d542a  | #033015  |

Special stops: Gray 750 (#2d3748) for dark mode elevated panels, Blue 925 (#0b2641) for dark mode info subtle backgrounds, Green 925 (#0d3f1e) for dark mode success subtle backgrounds.

### Semantic Colors — Light Mode

#### Text
| Token               | Value     | Role                                    |
|---------------------|-----------|-----------------------------------------|
| primary             | #101828   | Headings, primary body text             |
| secondary           | #364153   | Descriptions, secondary content         |
| tertiary            | #6a7282   | Captions, placeholders, metadata        |
| disabled            | #99a1af   | Disabled labels (exempt from WCAG min)  |
| inverse             | #ffffff   | Text on dark/brand surfaces             |
| info                | #0084d1   | Informational messages                  |
| warning             | #d08b00   | Warning messages                        |
| success             | #00a63e   | Success messages                        |
| danger              | #e7000b   | Error messages, destructive actions     |
| interactive.runway  | #155dfc   | Links, interactive text (Runway brand)  |

#### Background
| Token               | Value     | Role                                    |
|---------------------|-----------|-----------------------------------------|
| primary             | #ffffff   | Page background, main canvas            |
| secondary           | #f9fafb   | Sidebar, secondary panels               |
| tertiary            | #f3f4f6   | Card surfaces, section backgrounds      |
| neutral             | #d1d5dc   | Neutral fills (e.g., pagination selected) |
| runway              | #155dfc   | Runway brand primary CTA                |
| drawx               | #4f39f6   | Drawx brand primary CTA                 |
| disabled            | #e5e7eb   | Disabled backgrounds                    |
| inverseBold         | #364153   | Dark surface fills                      |
| inverseBolder       | #1e2939   | Darker surface fills                    |

#### Status Backgrounds
| Status   | Subtle    | Bold      |
|----------|-----------|-----------|
| Info     | #f0f9ff   | #0084d1   |
| Warning  | #fef7e8   | #f0a000   |
| Success  | #f0fdf4   | #00a63e   |
| Danger   | #fef2f2   | #e7000b   |

#### Border
| Token               | Value     | Role                                    |
|---------------------|-----------|-----------------------------------------|
| primary             | #99a1af   | Strong visible borders                  |
| secondary           | #e5e7eb   | Subtle dividers, card borders           |
| tertiary            | #f3f4f6   | Hairline separators                     |
| disabled            | #d1d5dc   | Disabled element borders                |
| runwayFocusRing     | #155dfc   | Focus ring for Runway brand             |
| drawxFocusRing      | #4f39f6   | Focus ring for Drawx brand              |

#### Interactive States (Runway)
| State     | Background | Border    | Text      |
|-----------|------------|-----------|-----------|
| Default   | #155dfc    | #155dfc   | #155dfc   |
| Hovered   | #1447e6    | #1447e6   | #1447e6   |
| Pressed   | #193cb8    | #193cb8   | #193cb8   |
| Selected  | #eff6ff    | —         | #155dfc   |

### Semantic Colors — Dark Mode

Dark mode uses **blue-gray tinted blacks** (5–10% blue shift) rather than pure grays, creating a cohesive, deep-space aesthetic.

#### Text (Dark)
| Token     | Value     | Contrast  | WCAG      |
|-----------|-----------|-----------|-----------|
| primary   | #f9fafb   | 17.6:1    | AAA       |
| secondary | #d1d5dc   | 12.0:1    | AAA       |
| tertiary  | #99a1af   | 6.3:1     | AA        |
| disabled  | #4a5565   | 2.7:1     | Exempt    |

#### Background (Dark)
| Token     | Value     | Role                          |
|-----------|-----------|-------------------------------|
| primary   | #000005   | Main app background           |
| secondary | #080a10   | Sidebar, navigation panels    |
| tertiary  | #0f1219   | Cards, section panels         |
| neutral   | #161a22   | Neutral fills (switch off)    |

#### Border (Dark)
| Token     | Value     | Role                          |
|-----------|-----------|-------------------------------|
| primary   | #2a2f3a   | Visible border                |
| secondary | #161a22   | Subtle dividers               |
| tertiary  | #0f1219   | Near-invisible hairlines      |

---

## 3. Typography Rules

### Font Families

| Role    | Family                          | Usage                         |
|---------|---------------------------------|-------------------------------|
| Heading | `'Pretendard', sans-serif`      | All headings                  |
| Body    | `'Pretendard', sans-serif`      | All body text, UI labels      |
| Mono    | `'Source Code Pro', monospace`   | Code blocks, technical values |

### Font Weights

| Token    | Value | Usage                              |
|----------|-------|------------------------------------|
| regular  | 400   | Body text, descriptions, links     |
| medium   | 500   | Labels, emphasized body, nav items |
| semibold | 600   | Headings, strong emphasis          |

### Heading Scale

| Level | Size  | Line Height | Weight  | Usage                          |
|-------|-------|-------------|---------|--------------------------------|
| 4xl   | 64px  | 72px        | 600     | Hero headlines                 |
| 3xl   | 56px  | 64px        | 600     | Page titles                    |
| 2xl   | 48px  | 56px        | 600     | Section headers                |
| xl    | 36px  | 48px        | 600     | Sub-section headers            |
| lg    | 28px  | 32px        | 600     | Card titles, panel headers     |
| md    | 24px  | 32px        | 600     | Dialog titles                  |
| sm    | 20px  | 24px        | 600     | Component section titles       |
| xs    | 16px  | 24px        | 600     | Compact headings, labels       |

### Body Scale

| Level | Size  | Line Height | Weights Available      | Usage                          |
|-------|-------|-------------|------------------------|--------------------------------|
| lg    | 14px  | 16px        | regular, medium, semibold | Primary UI text, descriptions  |
| md    | 12px  | 16px        | regular, medium, semibold, mono | Secondary text, table cells, code |
| sm    | 10px  | 16px        | regular, medium, semibold | Captions, micro labels         |

### Typography Principles

- **Letter-spacing is always 0px** — Pretendard's built-in metrics handle spacing. No negative tracking, no expansion.
- **Three weights, clear roles**: 400 reads, 500 labels, 600 titles. Never use 700 or bold.
- **Compact body scale**: The largest body size is 14px. This is an information-dense product — not a marketing site.
- **Consistent 16px line-height** across all body sizes creates uniform vertical rhythm in dense layouts.
- **Mono for data**: `Source Code Pro` is used only for code snippets, metrics, and technical identifiers.

---

## 4. Component Stylings

### Buttons

#### Primary (Runway)
- Background: `#155dfc` → hover `#1447e6` → pressed `#193cb8`
- Text: `#ffffff`
- Padding: lg `8px 16px` / md `6px 12px`
- Height: lg `40px` / md `32px`
- Border radius: `9999px` (pill)
- Border: none
- Transition: `all 120ms ease`
- Disabled: `#e5e7eb` bg, `#99a1af` text, `not-allowed` cursor

#### Secondary (Outlined)
- Background: transparent → hover `#f9fafb` → pressed `#f3f4f6`
- Text: `#101828`
- Border: `1px solid #6a7282` → hover `#4a5565` → pressed `#364153`
- Radius/padding/height: same as primary
- Disabled: `1px solid #d1d5dc`, `#99a1af` text

#### Destructive
- Background: `#e7000b` → hover `#c10007` → pressed `#9f0712`
- Text: `#ffffff`
- Same sizing as primary

#### Transparent (Ghost)
- Background: transparent → hover `#f9fafb` → pressed `#f3f4f6`
- Text: `#101828`
- No border
- Same sizing as primary

### TextField (Input)

- Height: `32px`
- Background: `#ffffff` (light) / `#080a10` (dark)
- Border: `1px solid #e5e7eb` (default) → `#99a1af` (hover) → `#155dfc` (focus)
- Border radius: `8px` (lg)
- Padding: `4px 12px`
- Font: body.lg.regular (14px/16px)
- Placeholder: `#6a7282`
- Error border: `#e7000b`
- Focus ring: `2px solid #155dfc` with `-2px` offset
- Icon slots: leading/trailing, `16×16px`
- Character counter: `current/max` format

### Select (Dropdown)

- Trigger: same styling as TextField (32px, 8px radius, 1px border)
- Dropdown offset: `4px` below trigger
- Option padding: `4px 8px`
- Option height: `32px` minimum
- Hover: `#f3f4f6` background
- Selected: `#eff6ff` background
- Focus ring: `#155dfc`
- Z-index: `1000`

### Badge

| Type   | Size     | Shape            | Typography     |
|--------|----------|------------------|----------------|
| Dot    | 8×8px    | Circle (9999px)  | —              |
| Number | 20×20px  | Pill (9999px)    | body.sm.medium |
| Text   | h:20px   | Pill (9999px)    | body.sm.medium |

Status colors: `neutral` (#1e2939 bg), `info` (#0084d1), `warning` (#f0a000), `success` (#00a63e), `error` (#e7000b) — all with `#ffffff` text.

### Tabs

- Container: `40px` height, `4px` padding, `#f3f4f6` background, `9999px` radius (pill track)
- Tab button: `32px` height, `6px 16px` padding, `9999px` radius
- Gap: `4px` between tabs
- Active tab: `#ffffff` background (elevated out of track)
- Font: body.lg.medium (14px weight 500)
- Optional badge: `min-width 35px`, lime accent `#C3FA4B` when selected
- Transition: `150ms ease`

### Pagination

- Page button: `24px` height, `min-width 24px`, `4px 8px` padding, `9999px` radius
- Arrow button: `24×24px`, `4px` padding
- Selected: `#d1d5dc` background
- Hover: `#f9fafb` background
- Icon size: `16px`
- Gap: `4px`

### Chip

- Sizes: md `32px` / sm `24px` height
- Radius: `9999px` (pill)
- Border: `1px solid #e5e7eb` (default) / `1px solid #155dfc` (selected)
- Icon sizes: md `20px` / sm `16px`
- Close icon: md `16px` / sm `14px`

### Checkbox

- Box: `16×16px`
- Border radius: `4px` (md)
- Checkmark: white stroke SVG (10×8px)
- Checked fill: `#155dfc` (Runway)
- Transition: `150ms ease`

### Switch

- Track: `48×24px`, `9999px` radius
- Indicator: `16×16px` circle, white, `4px` inset padding
- On: `#155dfc` track / Off: `#d1d5dc` track
- Shadow: `0 1px 2px rgba(0,0,0,0.15)` on indicator
- Animation: `left 200ms ease`

### Card (DefaultCard)

- Dimensions: `320×256px` (fixed default)
- Padding: `24px`
- Border: `1px solid #e5e7eb` → darkens on hover/focus
- Border radius: `12px` (xl)
- Shadow: `boxShadow.8` on hover/focus
- Title: heading.xs (16px/24px semibold)
- Description: body.lg.regular (14px)
- Transition: `150ms ease` (bg, border), `200ms ease` (shadow)

### Alert

- Padding: `16px`
- Border radius: `16px` (2xl)
- Min width: `320px`
- Styles: subtle, filled, outlined, transparent
- Statuses: brand, neutral, info, success, warning, error
- Icon: `24px`
- Close button: `32×32px`, `24px` radius

### NavItem (Sidebar Navigation)

- Padding: `12px` + level-based left indent (level × 12px)
- Border radius: `8px` (lg)
- Font: body.lg.medium (14px weight 500)
- Icon: `24×24px`
- SubNavItem: `36px` height, left-indented `48px`
- Hover: `#f3f4f6` background
- Active: `#eff6ff` background, `#155dfc` text

### Divider

- Color: `#e5e7eb` (border.secondary)
- Orientation: horizontal (full width) or vertical (full height)
- Thickness: varies by size token

### Tooltip

- Directions: top, right, bottom, left
- Styles: light (`#ffffff` bg) / dark (`#1e2939` bg)
- Arrow indicator positioned by direction
- Z-index: high layer

---

## 5. Layout Principles

### Spacing System

| Token | Value | Usage                                   |
|-------|-------|-----------------------------------------|
| 0     | 0px   | Reset                                   |
| 1     | 1px   | Hairline borders                        |
| 2     | 2px   | Focus ring width, micro adjustments     |
| 4     | 4px   | Compact padding (select options, pills) |
| 8     | 8px   | Button padding, small gaps              |
| 12    | 12px  | Nav item padding, medium gaps           |
| 16    | 16px  | Card gaps, section padding              |
| 24    | 24px  | Card padding, column gutters            |
| 32    | 32px  | Section margins                         |
| 40    | 40px  | Large section gaps                      |
| 48    | 48px  | Panel spacing                           |
| 64    | 64px  | Page-level vertical rhythm              |

### Grid System

| Breakpoint     | Width Range     | Columns | Gutter | Margin | Alignment |
|----------------|-----------------|---------|--------|--------|-----------|
| Mobile         | 320–767px       | 4       | 16px   | 16px   | Stretch   |
| Tablet         | 768–1023px      | 8       | 24px   | 24px   | Stretch   |
| Laptop         | 1024–1415px     | 12      | 24px   | 24px   | Stretch   |
| Desktop Fluid  | 1416px+         | 12      | 24px   | 24px   | Stretch   |
| Desktop Fixed  | 1416px+         | 12      | 24px   | —      | Center    |

- **Desktop Fixed** uses 96px column width: `12 × 96 + 11 × 24 = 1416px` max container
- Mobile-first approach with `min-width` media queries

### Media Queries

```
mobile:  @media (min-width: 320px)
tablet:  @media (min-width: 768px)
laptop:  @media (min-width: 1024px)
desktop: @media (min-width: 1416px)
```

### Border Radius Scale

| Token   | Value   | Usage                                     |
|---------|---------|-------------------------------------------|
| sm      | 2px     | Minimal rounding                          |
| md      | 4px     | Checkboxes, small controls                |
| lg      | 8px     | Inputs, selects, nav items                |
| xl      | 12px    | Cards, image containers                   |
| 2xl     | 16px    | Alerts, large containers                  |
| 3xl     | 24px    | Close buttons, large rounded elements     |
| rounded | 9999px  | Pills: buttons, badges, chips, tabs, pagination |

---

## 6. Depth & Elevation

### Shadow System

The shadow system uses a **dual-layer approach**:
- **Core layer** (near-object): `rgba(0,0,0,0.12)` — subtle definition
- **Cast layer** (diffuse): `rgba(0,0,0,0.16)` — ambient depth

| Level | Core (subtle)                          | Cast (diffuse)                          | Usage                        |
|-------|----------------------------------------|-----------------------------------------|------------------------------|
| 2     | `0px 0px 1px rgba(0,0,0,0.12)`        | `0px 1px 2px rgba(0,0,0,0.16)`         | Resting state, tooltips      |
| 4     | `0px 0px 2px rgba(0,0,0,0.12)`        | `0px 2px 4px rgba(0,0,0,0.16)`         | Hover states                 |
| 8     | `0px 0px 4px rgba(0,0,0,0.12)`        | `0px 4px 8px rgba(0,0,0,0.16)`         | Cards on hover, dropdowns    |
| 16    | `0px 0px 8px rgba(0,0,0,0.12)`        | `0px 8px 16px rgba(0,0,0,0.16)`        | Modals, drawers              |

### Drop Shadow (for SVG/transparent elements)

Single cast layer only:
- `drop-shadow(0px 1px 2px rgba(0,0,0,0.16))` — Level 2
- `drop-shadow(0px 4px 8px rgba(0,0,0,0.16))` — Level 8

### Elevation Philosophy

MakinaRocks uses a **flat-first approach**: most surfaces sit at Level 0 (no shadow) with borders providing containment. Shadows appear **on interaction** (hover, focus) or for **overlay elements** (dropdowns, modals, drawers). This prevents visual noise in data-dense interfaces.

| Depth Level      | Treatment                      | Usage                             |
|------------------|--------------------------------|-----------------------------------|
| Flat (Level 0)   | No shadow, border containment  | Default cards, panels, sections   |
| Subtle (Level 2) | Core + cast small              | Tooltips, resting dropdowns       |
| Raised (Level 8) | Core + cast medium             | Hovered cards, open dropdowns     |
| Overlay (Level 16)| Core + cast large             | Modals, drawers, dialogs          |

---

## 7. Icon System

- **Format**: Inline SVG strings from icon catalog (`src/icons/`)
- **Default size**: 24px (icon prop `size` overrides)
- **Color**: `currentColor` inheritance with optional `color` prop
- **Rendering**: `dangerouslySetInnerHTML` with dynamic width/height rewriting
- **Catalog**: 100+ icons across categories:
  - Navigation: `chevron-left`, `chevron-right`, `arrow-up`, `sidebar`
  - Status: `check-circle-stroke`, `error-circle-stroke`, `info-circle-stroke`, `warning-circle-stroke`
  - Actions: `edit`, `delete`, `copy`, `download`, `upload`, `refresh`, `search`
  - UI: `bell`, `calendar`, `folder`, `lock`, `user`, `settings`

**Props interface:**
```typescript
{
  name: IconName;    // type-safe icon identifier
  size?: number;     // pixels, default 24
  color?: string;    // CSS color value
  label?: string;    // aria-label for accessibility
}
```

---

## 8. Interactive Patterns

### State Transitions

All interactive components follow a consistent state model:

| State     | Visual Change                               | Timing        |
|-----------|---------------------------------------------|---------------|
| Default   | Base token values                           | —             |
| Hovered   | Background/border shift one step darker     | `120–150ms ease` |
| Pressed   | Background/border shift two steps darker    | Immediate     |
| Focused   | `2px solid #155dfc` ring, `-2px` offset     | Immediate     |
| Disabled  | `#e5e7eb` bg, `#99a1af` text, `not-allowed` cursor | —     |
| Loading   | Spinner animation `360° / 0.8s`             | Continuous    |

### Keyboard Support

- **Enter / Space**: Activate buttons, toggle checkboxes/switches
- **Arrow keys**: Navigate within selects, tab groups, pagination
- **Escape**: Close dropdowns, dismiss overlays
- **Tab**: Standard focus traversal

### Accessibility

- WCAG 2.1 contrast ratios documented for all text tokens (AAA for primary, AA minimum for interactive)
- `aria-label`, `aria-hidden`, `aria-current`, `aria-expanded` used throughout
- Semantic HTML elements (`button`, `input`, `label`, `nav`)
- Focus ring visible only on `:focus-visible` (keyboard, not mouse)
- Disabled elements use `#99a1af` text — intentionally below contrast minimum (WCAG exempts disabled elements)

---

## 9. Dark Mode Architecture

Dark mode is not a filter — it's a **parallel semantic token set** (`src/tokens/colorsDark.ts`). Every semantic color has a hand-picked dark equivalent with documented contrast ratios.

### Key Dark Mode Decisions

| Decision                  | Implementation                               |
|---------------------------|----------------------------------------------|
| Background tint           | Blue-gray (5–10% blue) rather than pure gray  |
| Primary bg                | `#000005` — near-black with subtle blue warmth |
| Text primary contrast     | 17.6:1 (AAA) — exceeds requirements          |
| Interactive blue           | Shifted to `blue.400 (#51a2ff)` for contrast  |
| Focus ring                | `blue.400` instead of `blue.600`              |
| Borders                   | Blue-gray tinted (`#2a2f3a`, `#161a22`)       |
| Status colors             | Darkened bold variants, deeper subtle bgs     |

### CSS Variable Pattern

Components use `var(--ds-*, fallback)` for runtime theme switching:
```css
color: var(--ds-text-primary, #101828);
background: var(--ds-bg-primary, #ffffff);
border-color: var(--ds-border-secondary, #e5e7eb);
```

---

## 10. Do's and Don'ts

### Do

- Use `#ffffff` as the light mode page background — it's the foundation of the clean, professional aesthetic
- Source all colors from semantic tokens (`colorText`, `colorBg`, `colorBorder`) — never use primitive hex values directly in components
- Use the dual-layer shadow system (core + cast) — it creates natural-feeling depth
- Apply `9999px` radius for pills only (buttons, badges, chips, tabs, pagination)
- Keep body text at 14px maximum — this is a data-dense product interface
- Use `120ms ease` transitions for button states, `150ms ease` for tabs and cards
- Apply `2px solid #155dfc` focus ring with `-2px` offset for keyboard accessibility
- Use blue-gray tinted backgrounds in dark mode (`#000005`, `#080a10`, `#0f1219`)
- Document WCAG contrast ratios when adding new dark mode tokens

### Don't

- Don't use pure black (`#000000`) for text — the system uses `#101828` (gray-900)
- Don't use pure gray backgrounds in dark mode — always apply the blue-gray tint
- Don't introduce new font weights beyond 400/500/600 — three weights are intentional
- Don't use box-shadow for default card states — borders define boundaries; shadows appear on interaction
- Don't apply negative letter-spacing — Pretendard is designed for 0px tracking
- Don't mix Runway blue (`#155dfc`) and Drawx purple (`#4f39f6`) in the same interactive context — they represent distinct product lines
- Don't use `border-radius: 12px` or `8px` on buttons — buttons are always pills (`9999px`)
- Don't create new shadow levels — the 2/4/8/16 scale is complete
- Don't use opacity to derive grays — use the explicit gray scale (unlike Lovable's opacity-based approach)
- Don't bypass tokens with hardcoded hex values — the token architecture enables consistent dark mode support

---

## 11. Brand Colors & Product Lines

MakinaRocks maintains two product brand colors within a unified design system:

| Product | Primary   | Hovered   | Pressed   | Focus Ring | Role                      |
|---------|-----------|-----------|-----------|------------|---------------------------|
| Runway  | #155dfc   | #1447e6   | #193cb8   | #155dfc    | ML pipeline platform      |
| Drawx   | #4f39f6   | #432dd7   | #372aac   | #4f39f6    | Visual development tool   |

Both share the same neutral system, typography, spacing, shadows, and component architecture. Only the brand accent color changes.

---

## 12. Responsive Behavior

### Breakpoints

| Name    | Min Width | Columns | Key Changes                        |
|---------|-----------|---------|-------------------------------------|
| Mobile  | 320px     | 4       | Single column, 16px margins/gutters |
| Tablet  | 768px     | 8       | Two-column grids, 24px margins      |
| Laptop  | 1024px    | 12      | Full layout, sidebar visible        |
| Desktop | 1416px    | 12      | Max container width or fluid        |

### Collapsing Strategy

- **Navigation**: Sidebar collapses to icon-only or hamburger at tablet
- **Cards**: Grid reduces columns (3 → 2 → 1)
- **Tables**: Horizontal scroll or responsive stacking
- **Typography**: Heading sizes scale down proportionally
- **Spacing**: Section gaps reduce (64px → 32px on mobile)

### Touch Targets

- Minimum touch target: `32px` (md button height)
- Recommended: `40px` (lg button height)
- Pagination buttons: `24px` — compact but within acceptable range for tooling UIs

---

## 13. Token Architecture Reference

All tokens are sourced from `src/tokens/`:

| File             | Contents                                          |
|------------------|---------------------------------------------------|
| `colors.ts`      | Primitive palette + light mode semantic tokens     |
| `colorsDark.ts`  | Dark mode semantic tokens with WCAG annotations    |
| `typography.ts`  | Font families, weights, heading/body scales        |
| `spacing.ts`     | Spacing scale, border radius, border width, shadows|
| `effects.ts`     | Shadow primitives, box-shadow, drop-shadow, CSS vars|
| `grid.ts`        | Breakpoints, grid configs, container helpers       |

### Token Organization Pattern

```
Primitives (base values)
  └─ Semantic (role-based: text, icon, bg, border)
       └─ Interactive states (hover, pressed, active, disabled, selected)
            └─ Status variants (info, success, warning, danger)
```

---

## 14. Agent Prompt Guide

### Quick Color Reference

```
Primary CTA (Runway): #155dfc bg, #ffffff text
Secondary button:     transparent bg, 1px solid #6a7282 border, #101828 text
Page background:      #ffffff (light) / #000005 (dark)
Heading text:         #101828 (light) / #f9fafb (dark)
Body text:            #364153 (light) / #d1d5dc (dark)
Muted text:           #6a7282 (light) / #99a1af (dark)
Card border:          #e5e7eb (light) / #161a22 (dark)
Focus ring:           2px solid #155dfc
```

### Example Component Prompts

**Hero Section:**
"Create a hero section with #ffffff background. Headline at 64px Pretendard semibold (600), line-height 72px, letter-spacing 0px, color #101828. Subtitle at 14px weight 400, line-height 16px, color #364153. Primary CTA pill button (#155dfc bg, #ffffff text, 9999px radius, 8px 16px padding, 40px height). Secondary outlined pill button (transparent bg, 1px solid #6a7282, 9999px radius, #101828 text)."

**Data Card:**
"Design a card at 320×256px. Background #ffffff, border 1px solid #e5e7eb, radius 12px. No default shadow — add boxShadow 8 on hover. Title at 16px Pretendard semibold, line-height 24px, #101828. Description at 14px regular, #6a7282. Padding 24px. Transition 150ms ease for border, 200ms ease for shadow."

**Form Input:**
"Build a text input: 32px height, #ffffff background, 1px solid #e5e7eb border, 8px radius. Padding 4px 12px. Font 14px Pretendard regular. Placeholder #6a7282. Focus: 2px solid #155dfc ring. Error state: #e7000b border. 16px leading icon support."

**Sidebar Navigation:**
"Create a sidebar nav item: 12px padding, 8px left indent per nesting level. 8px border radius. 14px Pretendard medium (500), #101828 text. 24px icon left-aligned. Hover #f3f4f6 background. Active: #eff6ff background, #155dfc text."

**Pill Tabs:**
"Build a tab bar: 40px container height, 4px padding, #f3f4f6 background, 9999px radius. Tab buttons 32px height, 6px 16px padding, 9999px radius. Active tab #ffffff background. 4px gap. Font 14px medium. Transition 150ms ease."

### Iteration Guide

- Always start from `#ffffff` (light) or `#000005` (dark) as the page base
- Source all colors from semantic tokens — never hardcode primitive hex values
- Use `#e5e7eb` borders for containment, shadows only on interaction
- Letter-spacing is always 0px — Pretendard handles its own metrics
- Three weights only: 400 (read), 500 (label), 600 (title)
- Buttons are always pills (9999px) — no 8px or 12px radius on buttons
- The dual-layer shadow (core + cast) is the signature depth technique
- Transitions: 120ms for micro (buttons), 150ms for mid (tabs, cards), 200ms for shadow

---

## 15. Dependencies & Architecture

- **React 18.3.1** — hooks-based functional components
- **TypeScript** — type-safe props and token interfaces
- **Vite** — build tooling and dev server
- **No UI library** (no shadcn, no Radix, no MUI) — fully custom component library
- **Inline styles** — `React.CSSProperties` with token imports
- **CSS Variables** — `var(--ds-*, fallback)` for dark mode runtime switching
- **Pretendard** — loaded from CDN (`@import` in global CSS)
- **Source Code Pro** — monospace font for code contexts
