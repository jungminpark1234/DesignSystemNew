import React from "react";
import { ProjectCard } from "@ds/components/ProjectCard";
import { registerDoc } from "./index";

registerDoc({
  slug: "project-card",
  name: "ProjectCard",
  description: "A card component for displaying project entries with title, description, favorite toggle, and menu button.",
  category: "components",
  importCode: `import { ProjectCard } from "@ds/components/ProjectCard";`,
  whenToUse: [
    "프로젝트 목록을 카드 형태로 표시할 때",
    "폴더 스타일의 카드 UI가 필요할 때",
  ],
  examples: [
    {
      title: "Default",
      description: "Basic project card.",
      code: `<ProjectCard title="My Project" desc="A sample project description." />`,
      render: () => <ProjectCard title="My Project" desc="A sample project description." />,
    },
    {
      title: "Favorited",
      description: "Project card with favorite toggled on.",
      code: `<ProjectCard title="Starred Project" desc="This project is favorited." favorite />`,
      render: () => <ProjectCard title="Starred Project" desc="This project is favorited." favorite />,
    },
  ],
  props: [
    { name: "title", type: "string", required: true, description: "Card title." },
    { name: "desc", type: "string", description: "Optional description text." },
    { name: "favorite", type: "boolean", default: "false", description: "Whether the project is favorited." },
    { name: "onFavoriteChange", type: "(next: boolean) => void", description: "Called when the favorite star is toggled." },
    { name: "onClick", type: "() => void", description: "Called when the card is clicked." },
    { name: "onMenuClick", type: "(e: MouseEvent) => void", description: "Called when the more-menu button is clicked." },
    { name: "footerLeft", type: "ReactNode", description: "Footer left content (e.g. avatar + date)." },
    { name: "width", type: "number | string", default: "317", description: "Card width." },
  ],
});
