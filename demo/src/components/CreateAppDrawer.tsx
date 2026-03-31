import React, { useState, useEffect } from "react";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { slugify, validateName, validateConnId } from "../data/connections";
import { CatalogItemData } from "../data/catalogReadme";
import { DrawerShell, SecondaryButton, PrimaryButton } from "./DrawerShell";
import { TextArea } from "@ds/components/TextArea";
import { ResourceGuideModal } from "./ResourceGuideModal";

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
};

// ── Reusable form field ─────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}

function Field({ label, value, onChange, onBlur, maxLength, placeholder = "Placeholder", error, disabled }: FieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const borderColor = error
    ? colors.text.interactive.dangerDefault
    : focused
      ? colors.bg.interactive.runwayPrimary
      : hovered && !disabled
        ? colors.border.interactive.secondaryHovered
        : colors.border.secondary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.interactive.secondary, fontFamily: ff }}>{label}</span>
        {maxLength !== undefined && (
          <span style={{ fontSize: 12, color: value.length >= maxLength ? colors.text.interactive.dangerDefault : colors.text.tertiary, fontFamily: ff }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); onBlur?.(); }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", height: 32, padding: "4px 12px", boxSizing: "border-box",
          border: `1px solid ${borderColor}`, borderRadius: 8, outline: "none",
          fontSize: 14, fontFamily: ff, color: disabled ? colors.text.disabled : colors.text.primary,
          background: disabled ? colors.bg.tertiary : colors.bg.primary,
          transition: "border-color 0.15s", cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {error && (
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.text.interactive.dangerDefault, fontFamily: ff }}>
          <Icon name="error-circle-stroke" size={14} color={colors.text.interactive.dangerDefault} />
          {error}
        </span>
      )}
    </div>
  );
}

function DescTextArea({ label, value, onChange, maxLength, placeholder = "Placeholder" }: { label: string; value: string; onChange: (v: string) => void; maxLength?: number; placeholder?: string }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const borderColor = focused ? colors.bg.interactive.runwayPrimary : hovered ? colors.border.interactive.secondaryHovered : colors.border.secondary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.interactive.secondary, fontFamily: ff }}>{label}</span>
        {maxLength !== undefined && (
          <span style={{ fontSize: 12, color: value.length >= maxLength ? colors.text.interactive.dangerDefault : colors.text.tertiary, fontFamily: ff }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={5}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", padding: "8px 12px", boxSizing: "border-box",
          border: `1px solid ${borderColor}`, borderRadius: 8, outline: "none",
          resize: "vertical", fontSize: 14, fontFamily: ff, lineHeight: "20px",
          color: colors.text.primary, background: colors.bg.primary, transition: "border-color 0.15s",
        }}
      />
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
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", height: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>Name</span>
        </div>
        <input
          value={link.name} onChange={(e) => onChange({ ...link, name: e.target.value })} placeholder="Link name"
          style={{ width: "100%", height: 32, padding: "4px 12px", boxSizing: "border-box", border: `1px solid ${colors.border.secondary}`, borderRadius: 8, outline: "none", fontSize: 14, fontFamily: ff, color: colors.text.primary, background: colors.bg.primary }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", height: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.secondary, fontFamily: ff }}>URL</span>
        </div>
        <input
          value={link.url} onChange={(e) => onChange({ ...link, url: e.target.value })} placeholder="https://"
          style={{ width: "100%", height: 32, padding: "4px 12px", boxSizing: "border-box", border: `1px solid ${colors.border.secondary}`, borderRadius: 8, outline: "none", fontSize: 14, fontFamily: ff, color: colors.text.primary, background: colors.bg.primary }}
        />
      </div>
      <button
        onClick={onRemove}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ width: 32, height: 32, borderRadius: 4, border: "none", background: hov ? colors.bg.tertiary : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
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
}

export function CreateAppDrawer({ open, onClose, catalogItem }: CreateAppDrawerProps) {
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
      title="Create application"
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
          <Field label="Name" value={name} onChange={handleNameChange} onBlur={() => setNameTouched(true)} maxLength={128} placeholder="Placeholder" error={nameErr} />
          <Field label="ID" value={appId} onChange={handleIdChange} onBlur={() => setIdTouched(true)} maxLength={128} placeholder="my-image-classifier" error={idErr} />
          <DescTextArea label="Description (Optional)" value={desc} onChange={setDesc} maxLength={512} placeholder="Placeholder" />
        </div>
      </div>

      {/* Configuration (disabled) */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Configuration</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Helm repository URL" value={helmUrl} onChange={() => {}} disabled placeholder="" />
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: -8 }}>
            <Icon name="check-circle-stroke" size={16} color={colors.icon.success} />
            <span style={{ fontSize: 12, fontWeight: 500, color: colors.text.success, fontFamily: ff }}>TLS verify</span>
          </div>
          <Field label="Chart" value={chart} onChange={() => {}} disabled placeholder="" />
          <Field label="Chart version" value={chartVersion} onChange={() => {}} disabled placeholder="" />
        </div>
      </div>

      {/* Application open links */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Application open links</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map((link, i) => (
            <LinkRowInput key={i} link={link} onChange={(l) => updateLink(i, l)} onRemove={() => removeLink(i)} />
          ))}
          <button
            onClick={addLink}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              width: "100%", height: 40, border: `1px solid ${colors.border.secondary}`, borderRadius: 4,
              background: colors.bg.primary, cursor: "pointer", padding: "8px 16px",
              fontSize: 14, fontWeight: 600, color: colors.text.secondary, fontFamily: ff,
            }}
          >
            <Icon name="create" size={24} color={colors.icon.secondary} />
            Add Link
          </button>
        </div>
      </div>

      {/* Configuration - Helm chart */}
      <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 32 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>Herm chart</span>
          <SecondaryButton label="Resource Guide" onClick={() => setResourceGuideOpen(true)} style={{ height: 32, padding: "6px 12px", fontSize: 12 }} />
        </div>
        <TextArea
          label="values.yaml"
          value={valuesYaml}
          onChange={(e) => setValuesYaml(e.target.value)}
          height={480}
          placeholder=""
          style={{ whiteSpace: "pre" }}
        />
      </div>
    </DrawerShell>

    {/* Resource Guide Modal (positioned to the left of drawer) */}
    <ResourceGuideModal open={open && resourceGuideOpen} onClose={() => setResourceGuideOpen(false)} />
    </>
  );
}
