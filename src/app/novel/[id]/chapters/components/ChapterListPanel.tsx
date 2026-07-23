"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useEntitySWR } from "@/hooks/useEntitySWR";
import { buildEntityKey } from "@/lib/swr-fetcher";
import { api } from "@/lib/api";
import { mutate } from "swr";
import { ChapterList } from "./ChapterList";
import type { ChapterSummary } from "@/types";
import type { FilterTab, SortState } from "../hooks/types";
import { filterTabs } from "../hooks/types";

function cycleSort(current: SortState): SortState {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}

interface ChapterListPanelProps {
  selectedChapterId: string | null;
  onSelectChapter: (id: string | null) => void;
}

export function ChapterListPanel({ selectedChapterId, onSelectChapter }: ChapterListPanelProps) {
  const params = useParams();
  const novelId = params.id as string;
  const { data: chapters = [] } = useEntitySWR<ChapterSummary[]>("chapters", novelId);

  // filter / sort 完全内部管理
  const [filter, setFilter] = useState<FilterTab>("all");
  const [nameSort, setNameSort] = useState<SortState>("none");
  const [timeSort, setTimeSort] = useState<SortState>("none");

  // ── 派生数据 ──
  const filteredChapters = useMemo(
    () => chapters.filter((ch) => (filter === "all" ? true : ch.status === filter)),
    [chapters, filter],
  );

  const sortedChapters = useMemo(() => {
    return [...filteredChapters].sort((a, b) => {
      if (nameSort !== "none") {
        const cmp = a.title.localeCompare(b.title);
        return nameSort === "asc" ? cmp : -cmp;
      }
      if (timeSort !== "none") {
        const cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return timeSort === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [filteredChapters, nameSort, timeSort]);

  const refresh = useCallback(() => {
    mutate(buildEntityKey("chapters", novelId));
  }, [novelId]);

  // ── CRUD ──
  const handleCreate = useCallback(async () => {
    const created = await api<ChapterSummary>({
      url: "/api/chapters",
      method: "POST",
      data: { novelId, title: "未命名章节", content: "" },
    });
    refresh();
    onSelectChapter(created.id); // 通知父级选中新章节
  }, [novelId, refresh, onSelectChapter]);

  const handleDelete = useCallback(
    async (chapterId: string) => {
      if (!confirm("确定要删除这个章节吗？")) return;
      await api({ url: `/api/chapters?id=${chapterId}`, method: "DELETE" });
      refresh();
      if (selectedChapterId === chapterId) {
        onSelectChapter(null);
      }
    },
    [novelId, refresh, selectedChapterId, onSelectChapter],
  );

  const handleSelect = useCallback(
    (chapter: ChapterSummary) => {
      onSelectChapter(chapter.id);
    },
    [onSelectChapter],
  );

  const handleNameSort = useCallback(() => {
    setTimeSort("none");
    setNameSort(cycleSort(nameSort));
  }, [nameSort]);

  const handleTimeSort = useCallback(() => {
    setNameSort("none");
    setTimeSort(cycleSort(timeSort));
  }, [timeSort]);

  return (
    <ChapterList
      chapters={chapters}
      sortedChapters={sortedChapters}
      selectedChapterId={selectedChapterId}
      filter={filter}
      nameSort={nameSort}
      timeSort={timeSort}
      onSelectChapter={handleSelect}
      onDeleteChapter={handleDelete}
      onFilterChange={setFilter}
      onCreateChapter={handleCreate}
      onNameSort={handleNameSort}
      onTimeSort={handleTimeSort}
    />
  );
}
