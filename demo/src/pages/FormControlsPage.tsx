import React, { useState } from "react";
import { Button } from "@ds/components/Button";
import { IconButton } from "@ds/components/IconButton";
import { TextField } from "@ds/components/TextField";
import { TextArea } from "@ds/components/TextArea";
import { Select } from "@ds/components/Select";
import { Checkbox } from "@ds/components/Checkbox";
import { Radio } from "@ds/components/Radio";
import { Switch } from "@ds/components/Switch";
import { Label } from "@ds/components/Label";
import { Icon } from "@ds/components/Icon";
import { colorText, colorBg, colorBorder } from "@ds/tokens/colors";
import { fontFamily, fontWeight } from "@ds/tokens/typography";
import { useTheme } from "../theme";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <section style={{
      backgroundColor: colors.bg.primary,
      border: `1px solid ${colors.border.secondary}`,
      borderRadius: 12, padding: 32, marginBottom: 24,
    }}>
      <h3 style={{ fontFamily: fontFamily.heading, fontSize: 16, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: 20 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
      <div style={{ width: 120, flexShrink: 0, fontSize: 13, fontWeight: fontWeight.medium, color: colors.text.tertiary, fontFamily: fontFamily.body, paddingTop: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

export function FormControlsPage() {
  const { colors } = useTheme();
  const [checked, setChecked] = useState(false);
  const [radioVal, setRadioVal] = useState("a");
  const [switchOn, setSwitchOn] = useState(false);
  const [textVal, setTextVal] = useState("");
  const [selectVal, setSelectVal] = useState("");

  return (
    <div style={{ height: "100%", overflow: "auto", backgroundColor: colors.bg.secondary, padding: "32px 40px", maxWidth: 900 }}>
      {/* Buttons */}
      <Section title="Button">
        <Row label="Filled">
          <Button buttonType="Primary" buttonStyle="filled" size="lg">Large</Button>
          <Button buttonType="Primary" buttonStyle="filled" size="md">Medium</Button>
        </Row>
        <Row label="Outlined">
          <Button buttonType="Primary" buttonStyle="outlined" size="lg">Large</Button>
          <Button buttonType="Primary" buttonStyle="outlined" size="md">Medium</Button>
        </Row>
        <Row label="Transparent">
          <Button buttonType="Primary" buttonStyle="transparent" size="md">Transparent</Button>
          <Button buttonType="Destructive" buttonStyle="transparent" size="md">Destructive</Button>
        </Row>
        <Row label="Destructive">
          <Button buttonType="Destructive" buttonStyle="filled" size="md">Delete</Button>
          <Button buttonType="Destructive" buttonStyle="outlined" size="md">Remove</Button>
        </Row>
        <Row label="Disabled">
          <Button buttonType="Primary" size="md" disabled>Disabled</Button>
          <Button buttonType="Primary" buttonStyle="outlined" size="md" disabled>Disabled</Button>
        </Row>
        <Row label="With Icon">
          <Button buttonType="Primary" size="md" leadingIcon={<Icon name="create" size={16} color="#fff" />}>Create</Button>
          <Button buttonType="Primary" buttonStyle="outlined" size="md" leadingIcon={<Icon name="edit" size={16} />}>Edit</Button>
        </Row>
        <Row label="Icon Button">
          <IconButton icon={<Icon name="edit" size={20} />} aria-label="Edit" />
          <IconButton icon={<Icon name="delete" size={20} />} aria-label="Delete" />
          <IconButton icon={<Icon name="search" size={20} />} aria-label="Search" />
        </Row>
      </Section>

      {/* Text Fields */}
      <Section title="TextField">
        <Row label="Default">
          <TextField placeholder="Enter text..." value={textVal} onChange={(e) => setTextVal(e.target.value)} style={{ width: 280 }} />
        </Row>
        <Row label="With Label">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Label>Email address</Label>
            <TextField placeholder="user@example.com" style={{ width: 280 }} />
          </div>
        </Row>
        <Row label="Error">
          <TextField placeholder="Error state" state="error" helpMessage="This field is required" style={{ width: 280 }} />
        </Row>
        <Row label="Disabled">
          <TextField placeholder="Disabled" disabled style={{ width: 280 }} />
        </Row>
      </Section>

      {/* TextArea */}
      <Section title="TextArea">
        <Row label="Default">
          <TextArea placeholder="Enter description..." style={{ width: 400 }} />
        </Row>
        <Row label="Error">
          <TextArea placeholder="Error state" state="error" helpMessage="Too short" style={{ width: 400 }} />
        </Row>
      </Section>

      {/* Select */}
      <Section title="Select">
        <Row label="Default">
          <Select
            placeholder="Choose option..."
            options={[
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
              { value: "svelte", label: "Svelte" },
              { value: "angular", label: "Angular" },
            ]}
            value={selectVal}
            onChange={setSelectVal}
            style={{ width: 280 }}
          />
        </Row>
        <Row label="Disabled">
          <Select placeholder="Disabled" options={[]} disabled style={{ width: 280 }} />
        </Row>
      </Section>

      {/* Checkbox / Radio / Switch */}
      <Section title="Checkbox / Radio / Switch">
        <Row label="Checkbox">
          <Checkbox checked={checked} onChange={setChecked} label="Accept terms" />
          <Checkbox checked={true} onChange={() => {}} label="Checked" />
          <Checkbox checked={false} disabled label="Disabled" />
        </Row>
        <Row label="Radio">
          <Radio checked={radioVal === "a"} onChange={() => setRadioVal("a")} label="Option A" />
          <Radio checked={radioVal === "b"} onChange={() => setRadioVal("b")} label="Option B" />
          <Radio checked={false} disabled label="Disabled" />
        </Row>
        <Row label="Switch">
          <Switch checked={switchOn} onChange={setSwitchOn} />
          <Switch checked={true} onChange={() => {}} />
          <Switch checked={false} disabled />
        </Row>
      </Section>
    </div>
  );
}
