import React from "react";
import { Pagination } from "@ds/components/Pagination";
import { registerDoc } from "./index";

registerDoc({
  slug: "pagination",
  name: "Pagination",
  description: "Page navigation control with numbered buttons, ellipsis, and previous/next arrows.",
  category: "components",
  importCode: `import { Pagination } from "@ds/components/Pagination";`,
  whenToUse: [
    "테이블이나 리스트의 페이지 네비게이션이 필요할 때",
    "데이터가 여러 페이지에 걸쳐 있을 때",
  ],
  examples: [
    {
      title: "Default",
      description: "Pagination with 10 pages.",
      code: `<Pagination totalPages={10} />`,
      render: () => <Pagination totalPages={10} />,
    },
  ],
  props: [
    { name: "totalPages", type: "number", required: true, description: "Total number of pages." },
    { name: "currentPage", type: "number", description: "Controlled current page (1-based)." },
    { name: "onChange", type: "(page: number) => void", description: "Called when the page changes." },
    { name: "siblingCount", type: "number", default: "7", description: "Max page buttons to display." },
  ],
});
