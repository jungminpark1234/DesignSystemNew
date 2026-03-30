import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { PROJECT_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import logoAirflow from "@ds/icons/catalog/airflow.svg";

interface AirflowDetailPageProps {
  onBack: () => void;
  onNavigate?: (key: string) => void;
}

const README_CONTENT = `
![Apache Airflow](https://camo.githubusercontent.com/2b989991eae97380cf5e2c1d10882c2b9e25bfda6e266fa6327ae52d763a4de5/68747470733a2f2f6170616368652e6f72672f696d672f6173662d657374642d313939392d6c6f676f2e6a7067)

# Apache Airflow

Apache Airflow (or simply Airflow) is a platform to programmatically author, schedule, and monitor workflows.

When workflows are defined as code, they become more maintainable, versionable, testable, and collaborative.

Use Airflow to author workflows as Directed Acyclic Graphs (DAGs) of tasks. The Airflow scheduler executes your tasks on an array of workers while following the specified dependencies. Rich command line utilities make performing complex surgeries on DAGs a snap. The rich user interface makes it easy to visualize pipelines running in production, monitor progress, and troubleshoot issues when needed.

## Key Concepts

### Dynamic

Airflow pipelines are configuration as code (Python), allowing for dynamic pipeline generation. This allows for writing code that instantiates pipelines dynamically.

### Extensible

Easily define your own operators, executors and extend the library so that it fits the level of abstraction that suits your environment.

### Flexible

Workflow parameterization is built-in leveraging the [Jinja](https://jinja.palletsprojects.com) templating engine.

## Requirements

Apache Airflow is tested with:

| Category        | Supported                                         |
|-----------------|---------------------------------------------------|
| Python          | 3.9, 3.10, 3.11, 3.12                            |
| Databases       | PostgreSQL: 12, 13, 14, 15, 16, 17               |
|                 | MySQL: 8.0, Innovation                            |
|                 | SQLite: 3.15.0+                                   |
| Kubernetes      | 1.28, 1.29, 1.30, 1.31, 1.32                     |

## Getting started

Visit the official Airflow website documentation (latest **stable** release) for help with
[installing Airflow](https://airflow.apache.org/docs/apache-airflow/stable/installation/),
[getting started](https://airflow.apache.org/docs/apache-airflow/stable/start.html), or walking
through a more complete [tutorial](https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html).

## Installing from PyPI

We publish Apache Airflow as \`apache-airflow\` package in PyPI. Installing it however might be tricky sometimes
because Airflow is a bit of both a library and application. Libraries usually keep their dependencies open, whereas
applications usually pin them, but we should do neither and both at the same time.

\`\`\`bash
pip install apache-airflow
\`\`\`

## Official source code

Apache Airflow is an [Apache Software Foundation](https://www.apache.org) (ASF) project,
and our official source code releases:

- Follow the [ASF Release Policy](https://www.apache.org/legal/release-policy.html)
- Can be downloaded from [the ASF Distribution Directory](https://downloads.apache.org/airflow)
- Are cryptographically signed by the release manager
- Are officially voted on by the PMC members during the
  [Release Approval Process](https://www.apache.org/legal/release-policy.html#release-approval)

## Contributing

Want to help build Apache Airflow? Check out our [contributing documentation](https://github.com/apache/airflow/blob/main/contributing-docs/README.rst).

## Who uses Apache Airflow?

More than 500 organizations are using Apache Airflow
[in the wild](https://github.com/apache/airflow/blob/main/INTHEWILD.md).
`;

// ── Sidebar header (shared pattern) ──────────────────────────────────────────
function SidebarHeader() {
  const { colors } = useTheme();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: colors.bg.warning, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.inverse, lineHeight: 1 }}>D</span>
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: "'Pretendard', sans-serif" }}>
          Data studio
        </span>
        <Icon name="sidebar" size={20} color={colors.icon.secondary} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 8px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 5.3, backgroundColor: colors.bg.warningSubtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="folder-fill" size={18} color={colors.icon.warning} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: colors.text.tertiary, lineHeight: "14px", fontFamily: "'Pretendard', sans-serif" }}>Projects</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.primary, lineHeight: "16px", fontFamily: "'Pretendard', sans-serif" }}>NLP Models</div>
        </div>
      </div>
    </>
  );
}

// ── Create button ─────────────────────────────────────────────────────────────
function CreateButton() {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 40, padding: "8px 16px", borderRadius: 4, border: "none",
        backgroundColor: hov ? "#1447e6" : "#155dfc",
        color: "#fff", fontFamily: "'Pretendard', sans-serif",
        fontSize: 14, fontWeight: 600, lineHeight: "16px",
        cursor: "pointer", transition: "background-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="create" size={24} color="#fff" />
      Create
    </button>
  );
}

// ── More button (⋮) ───────────────────────────────────────────────────────────
function MoreButton() {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 24, border: "none",
        backgroundColor: hov ? `var(--ds-bg-tertiary, ${colors.bg.tertiary})` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "background-color 0.15s",
      }}
    >
      <Icon name="more-vertical" size={20} color={colors.icon.secondary} />
    </button>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.tertiary, fontFamily: "'Pretendard', sans-serif", lineHeight: "16px" }}>
        {label}
      </span>
      <div style={{ fontSize: 14, color: colors.text.primary, fontFamily: "'Pretendard', sans-serif", lineHeight: "20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function AirflowDetailPage({ onBack, onNavigate }: AirflowDetailPageProps) {
  const { colors, isDark } = useTheme();
  const [selectedNav, setSelectedNav] = useState("catalog");

  const handleNavSelect = (key: string) => {
    setSelectedNav(key);
    onNavigate?.(key);
  };

  const borderColor = `var(--ds-border-secondary, ${colors.border.secondary})`;
  const ff = "'Pretendard', sans-serif";

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* LNB */}
      <Sidebar
        items={PROJECT_NAV}
        selectedKey={selectedNav}
        onSelect={handleNavSelect}
        width={220}
        header={<SidebarHeader />}
        footer={
          <span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>
            Runway v1.5.0
          </span>
        }
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* GNB */}
        <AppGnb
          breadcrumbs={[
            { label: "Catalog", icon: <Icon name="catalog" size={20} color={colors.icon.secondary} /> },
            { label: "Airflow" },
          ]}
        />

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 24 }}>

            {/* detail/header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={onBack}
                  style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "2px 5px" }}
                >
                  <Icon name="prev-arrow" size={20} color={colors.icon.secondary} />
                </button>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
                  Airflow
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CreateButton />
                <MoreButton />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: borderColor, margin: "-16px 0" }} />

            {/* Body: Readme + 기본정보 */}
            <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

            {/* Left: Readme */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
                Readme
              </h2>
              <div style={{
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                padding: 24,
                backgroundColor: `var(--ds-bg-primary, ${colors.bg.primary})`,
              }}>
                <div style={{
                  color: colors.text.primary,
                  fontFamily: ff,
                  fontSize: 14,
                  lineHeight: "24px",
                }}>
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 12, color: colors.text.primary, fontFamily: ff }}>{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 10, color: colors.text.primary, fontFamily: ff, borderBottom: `1px solid ${borderColor}`, paddingBottom: 6 }}>{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8, color: colors.text.primary, fontFamily: ff }}>{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p style={{ margin: "0 0 12px", color: colors.text.primary, fontFamily: ff, lineHeight: "24px" }}>{children}</p>
                      ),
                      code: ({ inline, children }: any) => inline ? (
                        <code style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", borderRadius: 4, padding: "1px 5px", fontSize: 13, fontFamily: "monospace", color: colors.text.primary }}>{children}</code>
                      ) : (
                        <pre style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius: 8, padding: "12px 16px", overflow: "auto", margin: "0 0 16px" }}>
                          <code style={{ fontFamily: "monospace", fontSize: 13, color: colors.text.primary }}>{children}</code>
                        </pre>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ paddingLeft: 20, margin: "0 0 12px", color: colors.text.primary, fontFamily: ff }}>{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: 4, lineHeight: "24px" }}>{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600, color: colors.text.primary }}>{children}</strong>
                      ),
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>{children}</a>
                      ),
                      table: ({ children }) => (
                        <div style={{ overflowX: "auto", marginBottom: 16 }}>
                          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: ff }}>{children}</table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th style={{ border: `1px solid ${borderColor}`, padding: "6px 12px", textAlign: "left", fontWeight: 600, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", color: colors.text.primary }}>{children}</th>
                      ),
                      td: ({ children }) => (
                        <td style={{ border: `1px solid ${borderColor}`, padding: "6px 12px", color: colors.text.primary }}>{children}</td>
                      ),
                      img: ({ src, alt }) => (
                        <img src={src} alt={alt} style={{ maxWidth: "100%", height: "auto", borderRadius: 8, marginBottom: 16, display: "block" }} />
                      ),
                    }}
                  >
                    {README_CONTENT}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Right: 기본정보 */}
            <div style={{ width: 480, flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, fontFamily: ff, margin: 0, lineHeight: "32px" }}>
                기본정보
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <InfoRow label="Description">
                  Data workflow orchestration dashboard for programmatically authoring, scheduling, and monitoring workflows
                </InfoRow>
                <InfoRow label="ID">
                  <span style={{ fontFamily: "monospace", fontSize: 13 }}>runway-airflow</span>
                </InfoRow>
                <InfoRow label="Created at">
                  2025-10-18
                </InfoRow>
                <InfoRow label="Created by">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      backgroundColor: "#e11d48",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: ff,
                    }}>
                      JP
                    </div>
                    <span>Jungmin Park</span>
                  </div>
                </InfoRow>
              </div>
            </div>

            </div>  {/* end body flex row */}
          </div>  {/* end flex col gap-32 */}
        </div>  {/* end overflow auto */}
      </div>  {/* end main */}
    </div>
  );
}
