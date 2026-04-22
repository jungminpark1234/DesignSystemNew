import React, { useState, useEffect } from "react";
import { Icon } from "@ds/components/Icon";
import { Button } from "@ds/components/Button";
import { TextField } from "@ds/components/TextField";
import { TextArea } from "@ds/components/TextArea";
import { useTheme } from "../theme";
import { slugify, validateName, validateConnId } from "../data/connections";
import { CatalogItemData } from "../data/catalogReadme";
import { DrawerShell, SecondaryButton, PrimaryButton } from "./DrawerShell";
import { ResourceGuideModal } from "./ResourceGuideModal";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-yaml";

// Catalog logos for drawer title icon
import logoChroma from "@ds/icons/catalog/chroma.svg";
import logoCodeserver from "@ds/icons/catalog/codeserver.svg";
import logoJupyterlab from "@ds/icons/catalog/jupyterlab.svg";
import logoLangflow from "@ds/icons/catalog/langflow.svg";
import logoMilvus from "@ds/icons/catalog/milvus.svg";
import logoQdrant from "@ds/icons/catalog/Qdrant.svg";
import logoAirflow from "@ds/icons/catalog/airflow.svg";
import logoPostgresql from "@ds/icons/platform/postgre.svg";

const CATALOG_LOGO_MAP: Record<string, string> = {
  chroma: logoChroma,
  codeserver: logoCodeserver,
  jupyterlab: logoJupyterlab,
  langflow: logoLangflow,
  milvus: logoMilvus,
  qdrant: logoQdrant,
  airflow: logoAirflow,
  postgresql: logoPostgresql,
};

const ff = "'Pretendard', sans-serif";

// ── Values.yaml per catalog ─────────────────────────────────────────────────
const VALUES_YAML: Record<string, string> = {
  chroma: `# Default values for chroma
replicaCount: 1

image:
  repository: chromadb/chroma
  tag: "0.4.22"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000

persistence:
  enabled: true
  size: 10Gi

resources:
  limits:
    cpu: 2
    memory: 4Gi`,

  codeserver: `# Default values for code-server
replicaCount: 1

image:
  repository: codercom/code-server
  tag: "4.89.1"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8080

persistence:
  enabled: true
  size: 20Gi

resources:
  limits:
    cpu: 2
    memory: 4Gi`,

  jupyterlab: `# Default values for jupyterlab
replicaCount: 1

image:
  repository: jupyter/scipy-notebook
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8888

persistence:
  enabled: true
  size: 10Gi

resources:
  limits:
    cpu: 4
    memory: 8Gi`,

  langflow: `# Default values for langflow
replicaCount: 1

image:
  repository: langflowai/langflow
  tag: "1.7.1"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 7860

resources:
  limits:
    cpu: 2
    memory: 4Gi`,

  milvus: `# Default values for milvus
replicaCount: 1

image:
  repository: milvusdb/milvus
  tag: "v2.4.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 19530

persistence:
  enabled: true
  size: 50Gi

resources:
  limits:
    cpu: 4
    memory: 8Gi`,

  qdrant: `# Default values for qdrant
replicaCount: 1

image:
  repository: qdrant/qdrant
  tag: "v1.9.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 6333

persistence:
  enabled: true
  size: 30Gi

resources:
  limits:
    cpu: 2
    memory: 4Gi`,

  airflow: `# Default values for mlflow
replicaCount: 1

image:
  repository: python
  tag: "3.9-slim"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 5000

ingress:
  enabled: true
  className: "nginx"
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: mlflow-server.runway.dev
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 4
    memory: 8Gi`,

  postgresql: `# Default values for PostgreSQL (CNPG)
# CloudNativePG Operator-based deployment

cluster:
  instances: 1
  imageName: ghcr.io/cloudnative-pg/postgresql:16.2

  postgresql:
    parameters:
      max_connections: "100"
      shared_buffers: "256MB"

  bootstrap:
    initdb:
      database: postgres
      owner: postgres

  storage:
    size: 10Gi
    storageClass: standard

  resources:
    requests:
      cpu: 1
      memory: 2Gi
    limits:
      cpu: 2
      memory: 4Gi

  monitoring:
    enabled: true`,
};


// ── Code editor (DS TextArea look + syntax highlighting) ────────────────────
export function CodeEditor({ label, value, onChange, language, height = 300, readOnly = false }: {
  label?: string; value: string; onChange: (v: string) => void; language: string; height?: number; readOnly?: boolean;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const grammar = Prism.languages[language];

  const borderColor = focused
    ? colors.border.interactive.runwayPrimary
    : hovered
      ? colors.border.primary
      : colors.border.secondary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {label && (
        <label style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.interactive.secondary, fontFamily: ff }}>
          {label}
        </label>
      )}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: 8,
          backgroundColor: colors.bg.primary,
          overflow: "auto",
          height,
          transition: "border-color 0.15s ease",
        }}
      >
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) => grammar ? Prism.highlight(code, grammar, language) : code}
          padding={12}
          disabled={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            lineHeight: "20px",
            minHeight: "100%",
            color: colors.text.primary,
          }}
        />
      </div>
    </div>
  );
}

// ── Link row ────────────────────────────────────────────────────────────────
interface LinkRow { name: string; url: string }

function LinkRowInput({ link, onChange, onRemove }: { link: LinkRow; onChange: (l: LinkRow) => void; onRemove: () => void }) {
  const { colors } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <TextField
          label="Name"
          value={link.name}
          onChange={(e) => onChange({ ...link, name: e.target.value })}
          placeholder="Link name"
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <TextField
          label="URL"
          value={link.url}
          onChange={(e) => onChange({ ...link, url: e.target.value })}
          placeholder="https://"
        />
      </div>
      <button
        onClick={onRemove}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ width: 32, height: 32, borderRadius: 4, border: "none", background: hov ? colors.bg.tertiary : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 0 }}
      >
        <Icon name="minus" size={20} color={colors.icon.secondary} />
      </button>
    </div>
  );
}

// ── Section title ───────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>{children}</span>
    </div>
  );
}

// ── Main Drawer ─────────────────────────────────────────────────────────────
interface CreateAppDrawerProps {
  open: boolean;
  onClose: () => void;
  catalogItem: CatalogItemData;
  /** 생성 성공 시 호출 — 입력한 이름/ID를 넘겨줌 */
  onCreate?: (payload: { name: string; id: string }) => void;
}

export function CreateAppDrawer({ open, onClose, catalogItem, onCreate }: CreateAppDrawerProps) {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [appId, setAppId] = useState("");
  const [appIdManual, setAppIdManual] = useState(false);
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [idTouched, setIdTouched] = useState(false);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [valuesYaml, setValuesYaml] = useState(VALUES_YAML[catalogItem.id] ?? "");
  const [resourceGuideOpen, setResourceGuideOpen] = useState(false);

  useEffect(() => {
    setValuesYaml(VALUES_YAML[catalogItem.id] ?? "");
  }, [catalogItem.id]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!appIdManual) setAppId(slugify(v).slice(0, 63).replace(/-+$/, ""));
  };
  const handleIdChange = (v: string) => { setAppId(v); setAppIdManual(true); };

  const nameErr = nameTouched || submitted ? validateName(name) : null;
  const idErr = idTouched || submitted ? validateConnId(appId, []) : null;

  const reset = () => {
    setName(""); setAppId(""); setAppIdManual(false); setDesc("");
    setLinks([]); setValuesYaml(VALUES_YAML[catalogItem.id] ?? "");
    setSubmitted(false); setNameTouched(false); setIdTouched(false);
    setResourceGuideOpen(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (validateName(name) || validateConnId(appId, [])) return;
    onCreate?.({ name, id: appId });
    onClose(); reset();
  };
  const handleClose = () => { onClose(); reset(); };

  const addLink = () => setLinks([...links, { name: "", url: "" }]);
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, l: LinkRow) => setLinks(links.map((old, idx) => idx === i ? l : old));

  const helmUrl = `https://charts.gitlab.io`;
  const chart = `bitnami/${catalogItem.id}`;
  const chartVersion = "v.2.1.0";

  return (
    <>
    <DrawerShell
      open={open}
      onClose={handleClose}
      title={(() => {
        const logo = CATALOG_LOGO_MAP[catalogItem.id];
        const name = catalogItem.title || "Application";
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {logo && <img src={logo} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />}
            {name} 애플리케이션 생성
          </span>
        );
      })()}
      borderLeft={resourceGuideOpen ? `1px solid ${colors.border.secondary}` : undefined}
      footer={
        <>
          <SecondaryButton label="Cancel" onClick={handleClose} />
          <PrimaryButton label="Create" onClick={handleSubmit} />
        </>
      }
    >
      {/* Basic Information */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Basic Information</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="Name" value={name} onChange={(e) => handleNameChange(e.target.value)} onBlur={() => setNameTouched(true)} maxLength={128} placeholder="애플리케이션 이름 입력" state={nameErr ? "error" : "default"} helpMessage={nameErr || undefined} />
          <TextField label="ID" value={appId} onChange={(e) => handleIdChange(e.target.value)} onBlur={() => setIdTouched(true)} maxLength={128} placeholder="my-application" state={idErr ? "error" : "default"} helpMessage={idErr || undefined} />
          <TextArea label="Description (Optional)" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={512} placeholder="애플리케이션 설명 입력" />
        </div>
      </div>

      {/* Configuration (disabled) */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Configuration</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="Helm repository URL" value={helmUrl} state="disabled" placeholder="" />
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: -8 }}>
            <Icon name="check-circle-stroke" size={16} color={colors.icon.success} />
            <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.success, fontFamily: ff }}>TLS verify</span>
          </div>
          <TextField label="Chart" value={chart} state="disabled" placeholder="" />
          <TextField label="Chart version" value={chartVersion} state="disabled" placeholder="" />
        </div>
      </div>

      {/* Application open links */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Application open links</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map((link, i) => (
            <LinkRowInput key={i} link={link} onChange={(l) => updateLink(i, l)} onRemove={() => removeLink(i)} />
          ))}
          <SecondaryButton
            label="Add Link"
            onClick={addLink}
            icon={<Icon name="create" size={20} color="currentColor" />}
            style={{ width: "100%", justifyContent: "center" }}
          />
        </div>
      </div>

      {/* Configuration - Helm chart */}
      <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 32 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Helm chart</span>
          <SecondaryButton label="Resource Guide" onClick={() => setResourceGuideOpen(true)} style={{ height: 32, padding: "6px 12px", fontSize: 12 }} />
        </div>
        <CodeEditor
          label="values.yaml"
          value={valuesYaml}
          onChange={setValuesYaml}
          language="yaml"
          height={480}
        />
      </div>
    </DrawerShell>

    {/* Resource Guide Modal (positioned to the left of drawer) */}
    <ResourceGuideModal open={open && resourceGuideOpen} onClose={() => setResourceGuideOpen(false)} />
    </>
  );
}
