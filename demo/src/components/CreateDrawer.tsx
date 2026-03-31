import React, { useState } from "react";
import { Icon } from "@ds/components/Icon";
import { useTheme } from "../theme";
import { slugify, validateName, validateConnId } from "../data/connections";
import { DrawerShell, SecondaryButton, PrimaryButton } from "./DrawerShell";

const ff = "'Pretendard', sans-serif";

interface DrawerFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
  error?: string | null;
  type?: string;
}

function DrawerField({ label, value, onChange, onBlur, maxLength, placeholder = "Placeholder", error, type = "text" }: DrawerFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const borderColor = error
    ? colors.text.interactive.dangerDefault
    : focused
      ? colors.bg.interactive.runwayPrimary
      : hovered
        ? colors.border.interactive.secondaryHovered
        : colors.border.secondary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.interactive.secondary, fontFamily: ff }}>
          {label}
        </span>
        {maxLength !== undefined && (
          <span style={{ fontSize: 12, color: value.length >= maxLength ? colors.text.interactive.dangerDefault : colors.text.tertiary, fontFamily: ff }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", height: 32, padding: "4px 12px", boxSizing: "border-box",
          border: `1px solid ${borderColor}`, borderRadius: 8, outline: "none",
          fontSize: 14, fontFamily: ff, color: colors.text.primary,
          background: colors.bg.primary, transition: "border-color 0.15s",
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

interface DrawerTextAreaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}

function DrawerTextArea({ label, value, onChange, maxLength, placeholder = "Placeholder" }: DrawerTextAreaProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const borderColor = focused
    ? colors.bg.interactive.runwayPrimary
    : hovered
      ? colors.border.interactive.secondaryHovered
      : colors.border.secondary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: colors.text.interactive.secondary, fontFamily: ff }}>
          {label}
        </span>
        {maxLength !== undefined && (
          <span style={{ fontSize: 12, color: value.length >= maxLength ? colors.text.interactive.dangerDefault : colors.text.tertiary, fontFamily: ff }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={5}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  existingIds: string[];
}

export function CreateDrawer({ open, onClose, existingIds }: CreateDrawerProps) {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [connId, setConnId] = useState("");
  const [connIdManual, setConnIdManual] = useState(false);
  const [desc, setDesc] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [connIdTouched, setConnIdTouched] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!connIdManual) setConnId(slugify(v).slice(0, 63).replace(/-+$/, ""));
  };
  const handleConnIdChange = (v: string) => {
    setConnId(v);
    setConnIdManual(true);
  };

  const nameErr = nameTouched || submitted ? validateName(name) : null;
  const connIdErr = connIdTouched || submitted ? validateConnId(connId, existingIds) : null;

  const reset = () => {
    setName(""); setConnId(""); setConnIdManual(false);
    setDesc(""); setHost(""); setPort(""); setDatabase(""); setUsername(""); setPassword("");
    setSubmitted(false); setNameTouched(false); setConnIdTouched(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (validateName(name) || validateConnId(connId, existingIds)) return;
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
      title="Create Data connection"
      footer={
        <>
          <SecondaryButton label="Cancel" onClick={handleClose} />
          <PrimaryButton label="Create" onClick={handleSubmit} />
        </>
      }
    >
      {/* Basic Information */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>
            Basic Information
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DrawerField label="Name" value={name} onChange={handleNameChange} onBlur={() => setNameTouched(true)} maxLength={128} placeholder="e.g. Production Aurora DB" error={nameErr} />
          <DrawerField label="ID" value={connId} onChange={handleConnIdChange} onBlur={() => setConnIdTouched(true)} maxLength={63} placeholder="production-aurora-db" error={connIdErr} />
          <DrawerTextArea label="Description (Optional)" value={desc} onChange={setDesc} maxLength={512} placeholder="Describe what this connection is used for" />
        </div>
      </div>

      {/* Connection type */}
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: colors.text.primary, fontFamily: ff }}>
            Connection type
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DrawerField label="Host" value={host} onChange={setHost} placeholder="db.example.com" />
          <DrawerField label="Port" value={port} onChange={setPort} placeholder="5432" />
          <DrawerField label="Database / Schema" value={database} onChange={setDatabase} placeholder="my_database.public" />
          <DrawerField label="User name" value={username} onChange={setUsername} placeholder="db_user" />
          <DrawerField label="Password" value={password} onChange={setPassword} placeholder="Enter password" type="password" />
        </div>
      </div>
    </DrawerShell>
  );
}
