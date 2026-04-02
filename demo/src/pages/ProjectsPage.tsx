import React, { useState } from "react";
import { Sidebar } from "@ds/components/Sidebar";
import { Icon } from "@ds/components/Icon";
import { Table } from "@ds/components/Table";
import { Avatar } from "@ds/components/Avatar";
import { TextField } from "@ds/components/TextField";
import { Select } from "@ds/components/Select";
import { ProjectCard } from "@ds/components/ProjectCard";
import { useTheme } from "../theme";
import { WORKSPACE_NAV } from "../data/navigation";
import { AppGnb } from "../components/AppGnb";
import { ListPage, PageTitle, PageDescription } from "../components/PageLayout";
import { CreateProjectDrawer, CreateProjectData } from "../components/CreateProjectDrawer";

const ff = "'Pretendard', sans-serif";

// ── Types ──────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  desc: string;
  membership: "Member" | "Non-member";
  creator: string;
  creatorInitial: string;
  createdAt: string;
  favorite: boolean;
}

// ── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_PROJECTS: Project[] = [
  { id: "1", name: "Aurora DB", desc: "Production Aurora database", membership: "Member", creator: "Eunji Park", creatorInitial: "EP", createdAt: "2024-11-05", favorite: false },
  { id: "2", name: "Cassandra", desc: "NoSQL distributed database", membership: "Non-member", creator: "Soyeon Kim", creatorInitial: "SK", createdAt: "2024-10-22", favorite: false },
  { id: "3", name: "Athena Query", desc: "Serverless SQL analytics", membership: "Non-member", creator: "Seojun Lee", creatorInitial: "SL", createdAt: "2024-09-18", favorite: false },
  { id: "4", name: "BigQuery", desc: "GCP analytics warehouse", membership: "Member", creator: "Hamin Choi", creatorInitial: "HC", createdAt: "2024-08-30", favorite: false },
  { id: "5", name: "DynamoDB", desc: "AWS key-value store", membership: "Member", creator: "Jieun Jeong", creatorInitial: "JJ", createdAt: "2024-08-15", favorite: false },
  { id: "6", name: "ElasticSearch", desc: "Full-text search engine", membership: "Member", creator: "Minjae Shin", creatorInitial: "MS", createdAt: "2024-07-20", favorite: false },
  { id: "7", name: "HBase", desc: "Hadoop database", membership: "Member", creator: "Yubin Song", creatorInitial: "YS", createdAt: "2024-07-10", favorite: false },
  { id: "8", name: "Kafka", desc: "Event streaming platform", membership: "Member", creator: "Sumin Kwon", creatorInitial: "SK", createdAt: "2024-06-25", favorite: false },
  { id: "9", name: "Kinesis", desc: "Real-time data streaming", membership: "Member", creator: "Jihun Im", creatorInitial: "JI", createdAt: "2024-06-01", favorite: false },
  { id: "10", name: "MongoDB", desc: "Document-oriented DB", membership: "Member", creator: "Hayoon Yu", creatorInitial: "HY", createdAt: "2024-05-15", favorite: false },
];

const AVATAR_COLORS: Record<string, number> = {
  EP: 5, SK: 1, SL: 11, HC: 1, JJ: 13, MS: 1, YS: 19, JI: 20, HY: 1,
};

// ── Create project button ──────────────────────────────────────────────────
function CreateProjectButton({ onClick }: { onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 40, padding: "8px 16px", borderRadius: 4, border: "none",
        backgroundColor: hov ? "#1447e6" : "#155dfc",
        color: "#fff", fontFamily: ff,
        fontSize: 14, fontWeight: 600, lineHeight: "16px",
        cursor: "pointer", transition: "background-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="create" size={24} color="#fff" />
      Create project
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  const { colors } = useTheme();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, height: 160, width: "100%", borderRadius: 12,
      border: `1px solid ${colors.border.tertiary}`, backgroundColor: colors.bg.secondary,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 8, backgroundColor: colors.bg.tertiary,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="folder_open" size={24} color={colors.icon.secondary} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>No Projects</span>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", color: colors.text.secondary, fontFamily: ff }}>Create your first project to get started</span>
      </div>
    </div>
  );
}

// ── Section heading ────────────────────────────────────────────────────────
function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 36 }}>
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>
        {children}
      </span>
      {count !== undefined && (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          height: 24, padding: "0 6px", borderRadius: 30,
          backgroundColor: colors.bg.tertiary,
          fontSize: 13, fontWeight: 500, color: colors.text.primary, fontFamily: ff,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── Membership filter options ───────────────────────────────────────────────
const MEMBERSHIP_OPTIONS = [
  { value: "", label: "All" },
  { value: "Member", label: "Member" },
  { value: "Non-member", label: "Non-member" },
];

// ── Page ────────────────────────────────────────────────────────────────────
interface ProjectsPageProps {
  onNavigate?: (key: string) => void;
  onSelectProject?: (projectName: string) => void;
}

export function ProjectsPage({ onNavigate, onSelectProject }: ProjectsPageProps) {
  const { colors } = useTheme();
  const [selectedNav, setSelectedNav] = useState("projects");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");

  const hasProjects = projects.length > 0;
  const recentProjects = projects.slice(0, 5);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMembership = !membershipFilter || p.membership === membershipFilter;
    return matchesSearch && matchesMembership;
  });

  const handleCreateProject = (data: CreateProjectData) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const initials = data.name.split(/\s+/).map(w => w[0]?.toUpperCase()).join("").slice(0, 2) || "PR";
    const newProject: Project = {
      id: data.id || String(Date.now()),
      name: data.name,
      desc: data.desc || "",
      membership: "Member",
      creator: "You",
      creatorInitial: initials,
      createdAt: dateStr,
      favorite: false,
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, favorite: !p.favorite } : p));
  };

  const TABLE_COLUMNS = [
    { key: "name", label: "Project", importance: "primary" as const, flex: 1 },
    {
      key: "membership", label: "Membership", importance: "secondary" as const, flex: 1,
      render: (value: unknown) => {
        const v = value as string;
        const isMember = v === "Member";
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name={isMember ? "user" : "pending"} size={16} color={isMember ? colors.text.success : colors.text.secondary} />
            <span style={{ color: isMember ? colors.text.success : colors.text.secondary }}>{v}</span>
          </span>
        );
      },
    },
    {
      key: "creator", label: "\uC0DD\uC131\uD55C \uC0AC\uB78C", importance: "secondary" as const, flex: 1,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Avatar initial={row.creatorInitial as string} size="sm" color={AVATAR_COLORS[row.creatorInitial as string] || 1} />
          <span>{row.creator as string}</span>
        </span>
      ),
    },
    { key: "createdAt", label: "Created at", importance: "secondary" as const, flex: 1 },
  ];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <CreateProjectDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={handleCreateProject}
        existingIds={projects.map(p => p.id)}
      />
      <Sidebar
        items={WORKSPACE_NAV}
        selectedKey={selectedNav}
        onSelect={(key) => { setSelectedNav(key); onNavigate?.(key); }}
        width={220}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 5.3, backgroundColor: "#bf6a40",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 }}>D</span>
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "16px", color: colors.text.primary, fontFamily: ff }}>
              Data studio
            </span>
            <Icon name="sidebar" size={20} color={colors.icon.secondary} />
          </div>
        }
        footer={<span style={{ fontSize: 11, color: colors.text.disabled, fontFamily: ff }}>Runway v1.5.0</span>}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AppGnb breadcrumbs={[{ label: "Projects", icon: <Icon name="folder_open" size={20} color={colors.icon.secondary} /> }]} />

        <ListPage
          title={<PageTitle>Projects</PageTitle>}
          description={<PageDescription>Create and manage AI/ML projects in your workspace</PageDescription>}
          actions={<CreateProjectButton onClick={() => setDrawerOpen(true)} />}
        >
          {!hasProjects ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* ── Recent projects ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SectionTitle>Recent projects</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(314px, 1fr))", gap: "32px 16px" }}>
                  {recentProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      title={p.name}
                      desc={p.desc}
                      width="100%"
                      favorite={p.favorite}
                      onFavoriteChange={() => toggleFavorite(p.id)}
                      onClick={() => onSelectProject?.(p.name)}
                      onMenuClick={() => {}}
                      footerLeft={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar initial={p.creatorInitial} size="sm" color={AVATAR_COLORS[p.creatorInitial] || 1} />
                          <span style={{ fontSize: 14, fontWeight: 400, color: colors.text.primary, fontFamily: ff }}>{p.createdAt}</span>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>

              {/* ── All projects ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SectionTitle count={filteredProjects.length}>All projects</SectionTitle>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <TextField
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leadingIcon={<Icon name="search" size={16} color={colors.icon.disabled} />}
                    style={{ width: 300 }}
                  />
                  <Select
                    options={MEMBERSHIP_OPTIONS}
                    value={membershipFilter}
                    onChange={setMembershipFilter}
                    placeholder="Membership"
                    style={{ width: 160 }}
                  />
                </div>
                <Table
                  columns={TABLE_COLUMNS}
                  rows={filteredProjects}
                  rowKey="id"
                  showMenu
                  onMenuClick={() => {}}
                  onRowClick={(row) => onSelectProject?.(row.name as string)}
                />
              </div>
            </div>
          )}
        </ListPage>
      </div>
    </div>
  );
}
