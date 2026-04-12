import React from "react";
import { Table } from "@ds/components/Table";
import { registerDoc } from "./index";

const sampleColumns = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
];

const sampleRows = [
  { id: "1", name: "Alice Kim", role: "Engineer", status: "Active" },
  { id: "2", name: "Bob Lee", role: "Designer", status: "Active" },
  { id: "3", name: "Carol Park", role: "PM", status: "Inactive" },
];

registerDoc({
  slug: "table",
  name: "Table",
  description: "A data table with column definitions, sorting, row selection, and customizable cells.",
  category: "components",
  importCode: `import { Table } from "@ds/components/Table";`,
  whenToUse: [
    "구조화된 데이터를 행/열로 표시할 때",
    "정렬 체크박스 선택 메뉴 등 인터랙션이 필요할 때",
  ],
  examples: [
    {
      title: "Basic Table",
      description: "Simple 3-column table with sample data.",
      code: `const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
];

const rows = [
  { id: "1", name: "Alice Kim", role: "Engineer", status: "Active" },
  { id: "2", name: "Bob Lee", role: "Designer", status: "Active" },
  { id: "3", name: "Carol Park", role: "PM", status: "Inactive" },
];

<Table columns={columns} rows={rows} rowKey="id" />`,
      render: () => <Table columns={sampleColumns} rows={sampleRows} rowKey="id" />,
    },
  ],
  props: [
    { name: "columns", type: "TableColumn[]", required: true, description: "Column definitions with key, label, sortable, render, etc." },
    { name: "rows", type: "T[]", required: true, description: "Array of row data objects." },
    { name: "rowKey", type: "string", description: "Unique key field in row data." },
    { name: "selectable", type: "boolean", description: "Show row selection checkboxes." },
    { name: "showMenu", type: "boolean", description: "Show overflow menu button per row." },
    { name: "onSort", type: "(key: string, direction: SortDirection) => void", description: "Called when a sort header is clicked." },
    { name: "loading", type: "boolean", description: "Show loading state." },
    { name: "emptyMessage", type: "string", description: "Message displayed when rows is empty." },
    { name: "onRowClick", type: "(row: T, index: number) => void", description: "Called when a row is clicked." },
  ],
});
