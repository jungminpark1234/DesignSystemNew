import React, { useState } from "react";
import { Icon } from "@ds/components/Icon";
import { Tooltip } from "@ds/components/Tooltip";
import { useTheme } from "../theme";
import { DrawerShell, SecondaryButton, PrimaryButton } from "./DrawerShell";

const ff = "'Pretendard', sans-serif";

/* ── Reusable form field ─────────────────────────────────────────────────── */

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
  error?: string | null;
  helpIcon?: boolean;
  helpTooltip?: string;
  disabled?: boolean;
}

function Field({ label, value, onChange, onBlur, maxLength, placeholder = "Placeholder", error, helpIcon, helpTooltip, disabled }: FieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const borderColor = disabled
    ? colors.border.disabled
    : error
      ? colors.text.interactive.dangerDefault
      : focused
        ? colors.bg.interactive.runwayPrimary
        : hovered
          ? colors.border.interactive.secondaryHovered
          : colors.border.secondary;

  const bg = disabled ? colors.bg.disabled : colors.bg.primary;

  const helpIconEl = helpIcon ? (
    helpTooltip ? (
      <Tooltip content={helpTooltip} direction="below-center" tooltipStyle="inverse" delay={100}>
        <span style={{ display: "inline-flex", cursor: "help" }}>
          <Icon name="help-circle-stroke" size={16} color={colors.icon.secondary} />
        </span>
      </Tooltip>
    ) : (
      <Icon name="help-circle-stroke" size={16} color={colors.icon.secondary} />
    )
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.interactive.secondary, fontFamily: ff }}>
            {label}
          </span>
          {helpIconEl}
        </div>
        {maxLength !== undefined && (
          <span style={{ fontSize: 12, color: value.length >= maxLength ? colors.text.interactive.dangerDefault : colors.text.tertiary, fontFamily: ff }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", height: 32, padding: "4px 12px", boxSizing: "border-box",
          border: `1px solid ${borderColor}`, borderRadius: 8, outline: "none",
          fontSize: 14, fontFamily: ff,
          color: disabled ? colors.text.disabled : colors.text.primary,
          background: bg, transition: "border-color 0.15s",
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

/* ── Textarea ────────────────────────────────────────────────────────────── */

function TextAreaField({ label, value, onChange, placeholder = "Placeholder" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const borderColor = focused
    ? colors.bg.interactive.runwayPrimary
    : hovered
      ? colors.border.interactive.secondaryHovered
      : colors.border.secondary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", color: colors.text.secondary, fontFamily: ff }}>
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={7}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", height: 180, padding: 12, boxSizing: "border-box",
          border: `1px solid ${borderColor}`, borderRadius: 8, outline: "none",
          resize: "vertical", fontSize: 14, fontFamily: ff, lineHeight: "16px",
          color: colors.text.primary, background: colors.bg.primary, transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

/* ── Section heading ─────────────────────────────────────────────────────── */

function SectionHeading({ children, helpIcon, helpTooltip }: { children: React.ReactNode; helpIcon?: boolean; helpTooltip?: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 24, marginBottom: 16 }}>
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>
        {children}
      </span>
      {helpIcon && (
        helpTooltip ? (
          <Tooltip content={helpTooltip} direction="below-center" tooltipStyle="inverse" delay={100}>
            <span style={{ display: "inline-flex", cursor: "help" }}>
              <Icon name="help-circle-stroke" size={20} color={colors.icon.secondary} />
            </span>
          </Tooltip>
        ) : (
          <Icon name="help-circle-stroke" size={20} color={colors.icon.secondary} />
        )
      )}
    </div>
  );
}

/* ── Validation helpers ──────────────────────────────────────────────────── */

function validateProjectName(v: string): string | null {
  if (!v.trim()) return "Project name is required";
  if (v.length < 2) return "Name must be at least 2 characters";
  return null;
}

function validateProjectId(v: string, existing: string[]): string | null {
  if (!v.trim()) return "Project ID is required";
  if (!/^[a-z0-9-]{3,8}$/.test(v)) return "Lowercase letters, numbers, and hyphens only (3\u20138 characters)";
  if (existing.includes(v)) return "This ID is already in use";
  return null;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 8);
}

/* ── Main drawer ─────────────────────────────────────────────────────────── */

export interface CreateProjectData {
  name: string;
  id: string;
  desc: string;
  cpu: string;
  memory: string;
  storage: string;
}

interface CreateProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (data: CreateProjectData) => void;
  existingIds?: string[];
}

export function CreateProjectDrawer({ open, onClose, onCreate, existingIds = [] }: CreateProjectDrawerProps) {
  const [name, setName] = useState("");
  const [projId, setProjId] = useState("");
  const [idManual, setIdManual] = useState(false);
  const [desc, setDesc] = useState("");
  const [cpu, setCpu] = useState("0");
  const [memory, setMemory] = useState("0");
  const [storage, setStorage] = useState("0");
  const gpu = "4"; // disabled, inherited from workspace

  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [idTouched, setIdTouched] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!idManual) setProjId(slugify(v));
  };
  const handleIdChange = (v: string) => {
    setProjId(v);
    setIdManual(true);
  };

  const nameErr = nameTouched || submitted ? validateProjectName(name) : null;
  const idErr = idTouched || submitted ? validateProjectId(projId, existingIds) : null;

  const reset = () => {
    setName(""); setProjId(""); setIdManual(false); setDesc("");
    setCpu("0"); setMemory("0"); setStorage("0");
    setSubmitted(false); setNameTouched(false); setIdTouched(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (validateProjectName(name) || validateProjectId(projId, existingIds)) return;
    onCreate?.({ name, id: projId, desc, cpu, memory, storage });
    onClose();
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <DrawerShell
      open={open}
      onClose={handleClose}
      title="Create project"
      footer={
        <>
          <SecondaryButton label="Cancel" onClick={handleClose} style={{ width: 140, height: 40 }} />
          <PrimaryButton label="Create" onClick={handleSubmit} style={{ width: 140, height: 40 }} />
        </>
      }
    >
      {/* General details */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeading>General details</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field
            label="Name"
            value={name}
            onChange={handleNameChange}
            onBlur={() => setNameTouched(true)}
            maxLength={128}
            placeholder="Placeholder"
            error={nameErr}
          />
          <Field
            label="ID"
            value={projId}
            onChange={handleIdChange}
            onBlur={() => setIdTouched(true)}
            maxLength={128}
            placeholder="Placeholder"
            error={idErr}
            helpIcon
            helpTooltip={"System resource identifier. Auto-generated from project name, but can be manually edited.\nLowercase letters, numbers, and hyphens only (3-8 characters).\nCannot be changed after creation."}
          />
          <TextAreaField
            label="Description (Optional)"
            value={desc}
            onChange={setDesc}
            placeholder="Placeholder"
          />
        </div>
      </div>

      {/* Resource Quotas */}
      <div>
        <SectionHeading helpIcon helpTooltip="Set the total resource limits across all workloads in this project. These quotas define the maximum combined amount of CPU, memory, and storage resources that can be used collectively by all workloads. Note: GPU resources are automatically inherited from the workspace quota and shared among all projects within the workspace.">Resource Quotas</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Field label="CPU (Core)" value={cpu} onChange={setCpu} maxLength={128} placeholder="0" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Memory (GiB)" value={memory} onChange={setMemory} maxLength={128} placeholder="0" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Field label="Storage (GiB)" value={storage} onChange={setStorage} maxLength={128} placeholder="0" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="GPU" value={gpu} onChange={() => {}} disabled helpIcon helpTooltip="GPU only accept integers." />
            </div>
          </div>
        </div>
      </div>
    </DrawerShell>
  );
}
