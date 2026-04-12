import React from "react";
import { Avatar } from "@ds/components/Avatar";
import { registerDoc } from "./index";

registerDoc({
  slug: "avatar",
  name: "Avatar",
  description: "Displays user initials or a photo in a colored circle. Supports 26 color palettes and two sizes.",
  category: "components",
  importCode: `import { Avatar } from "@ds/components/Avatar";`,
  whenToUse: [
    "사용자 프로필 이미지나 이니셜을 표시할 때",
    "댓글/멤버 목록에서 사용자를 식별할 때",
  ],
  examples: [
    {
      title: "Initials",
      description: "Avatars with different color palettes.",
      code: `<Avatar initial="A" color={1} />
<Avatar initial="B" color={5} />
<Avatar initial="C" color={11} />
<Avatar initial="D" color={16} />
<Avatar initial="?" color="deleted" />`,
      render: () => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Avatar initial="A" color={1} />
          <Avatar initial="B" color={5} />
          <Avatar initial="C" color={11} />
          <Avatar initial="D" color={16} />
          <Avatar initial="?" color="deleted" />
        </div>
      ),
    },
    {
      title: "Sizes",
      description: "Small (24px) and medium (32px) avatars.",
      code: `<Avatar initial="SM" size="sm" color={3} />
<Avatar initial="MD" size="md" color={3} />`,
      render: () => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Avatar initial="SM" size="sm" color={3} />
          <Avatar initial="MD" size="md" color={3} />
        </div>
      ),
    },
  ],
  props: [
    { name: "initial", type: "string", default: '"?"', description: "Initials to display (1-2 characters)." },
    { name: "src", type: "string", description: "Image source URL. When provided, renders a photo avatar." },
    { name: "color", type: "1-26 | \"deleted\"", default: "1", description: "Color palette index or deleted state." },
    { name: "size", type: '"sm" | "md"', default: '"md"', description: "Avatar size. sm = 24px, md = 32px." },
    { name: "alt", type: "string", description: "Alt text for photo avatars." },
  ],
});
