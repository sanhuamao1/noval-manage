export type FilterTab = "all" | "published" | "draft";
export type SortState = "none" | "asc" | "desc";

export const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "published", label: "定稿" },
  { key: "draft", label: "草稿" },
];
