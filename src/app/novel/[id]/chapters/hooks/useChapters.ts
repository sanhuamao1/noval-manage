"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useNovelStore } from "@/stores/useNovelStore";
import { useEntityStore } from "@/stores/useEntityStore";
import { api } from "@/lib/api";
import { wordCount } from "@/lib/utils";
import type { Chapter, ChapterSummary } from "@/types";

export type FilterTab = "all" | "published" | "draft";
export type SortState = "none" | "asc" | "desc";

export const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "published", label: "定稿" },
  { key: "draft", label: "草稿" },
];

function cycleSort(current: SortState): SortState {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}

export interface UseChaptersReturn {
  // Data
  chapters: ChapterSummary[];
  selectedChapter: Chapter | null;
  editTitle: string;
  editContent: string;
  saving: boolean;
  filter: FilterTab;
  justCreated: boolean;
  nameSort: SortState;
  timeSort: SortState;
  filteredChapters: ChapterSummary[];
  sortedChapters: ChapterSummary[];
  wordCount: number;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  titleInputRef: React.RefObject<HTMLInputElement>;

  // Actions
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setFilter: (filter: FilterTab) => void;
  saveChapter: () => Promise<void>;
  createChapter: () => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  toggleStatus: (chapter: ChapterSummary) => Promise<void>;
  formatContent: () => void;
  selectChapter: (chapter: ChapterSummary) => Promise<void>;
  handleNameSort: () => void;
  handleTimeSort: () => void;
}

export function useChapters(): UseChaptersReturn {
  const params = useParams();
  const id = params.id as string;
  const chapters = useEntityStore((s) => s.chapters);
  const mutate = useNovelStore((s) => s.mutate);

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [justCreated, setJustCreated] = useState(false);
  const [nameSort, setNameSort] = useState<SortState>("none");
  const [timeSort, setTimeSort] = useState<SortState>("none");

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ── API 操作 ──────────────────────────────────────────

  const createChapter = useCallback(async () => {
    const newChapter = await mutate(id, "chapters", async () => {
      return await api<Chapter>({
        url: "/api/chapters",
        method: "POST",
        data: { novelId: id, title: "未命名章节", content: "" },
      });
    });
    setSelectedChapter(newChapter);
    setEditTitle(newChapter.title);
    setEditContent("");
    setJustCreated(true);
  }, [id, mutate]);

  const deleteChapter = useCallback(async (chapterId: string) => {
    if (!confirm("确定要删除这个章节吗？")) return;
    if (selectedChapter?.id === chapterId) setSelectedChapter(null);
    await mutate(id, "chapters", async () => {
      await api({ url: `/api/chapters?id=${chapterId}`, method: "DELETE" });
    });
  }, [id, mutate, selectedChapter?.id]);

  const toggleStatus = useCallback(async (chapter: ChapterSummary) => {
    const newStatus = chapter.status === "published" ? "draft" : "published";
    await mutate(id, "chapters", async () => {
      await api({
        url: "/api/chapters",
        method: "PUT",
        data: { id: chapter.id, novelId: id, status: newStatus },
      });
    });
    if (selectedChapter?.id === chapter.id) {
      setSelectedChapter((prev) => prev ? { ...prev, status: newStatus } : prev);
    }
  }, [id, mutate, selectedChapter?.id]);

  const formatContent = useCallback(() => {
    const lines = editContent.split("\n");
    const formatted = lines
      .map((l) => {
        const trimmed = l.replace(/\t/g, "    ").trimEnd();
        return trimmed && !/^\s/.test(trimmed) ? "    " + trimmed : trimmed;
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    setEditContent(formatted);
  }, [editContent]);

  const saveChapter = useCallback(async () => {
    if (!selectedChapter) return;
    setSaving(true);
    await mutate(id, "chapters", async () => {
      await api({
        url: "/api/chapters",
        method: "PUT",
        data: {
          id: selectedChapter.id,
          novelId: id,
          title: editTitle,
          content: editContent,
        },
      });
    });
    setSaving(false);
  }, [selectedChapter, editTitle, editContent, id, mutate]);

  const selectChapter = useCallback(async (chapter: ChapterSummary) => {
    const full = await api<Chapter>({ url: `/api/chapters?id=${chapter.id}&novelId=${id}` });
    setSelectedChapter(full);
    setEditTitle(full.title);
    setEditContent(full.content);
  }, [id]);

  // ── 排序 ──────────────────────────────────────────────

  const handleNameSort = useCallback(() => {
    setTimeSort("none");
    setNameSort(cycleSort(nameSort));
  }, [nameSort]);

  const handleTimeSort = useCallback(() => {
    setNameSort("none");
    setTimeSort(cycleSort(timeSort));
  }, [timeSort]);

  // ── 派生数据 ──────────────────────────────────────────

  const filteredChapters = chapters.filter((ch) => {
    if (filter === "all") return true;
    return ch.status === filter;
  });

  const sortedChapters = [...filteredChapters].sort((a, b) => {
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

  // ── 副作用 ────────────────────────────────────────────

  // 自动保存（3s 无操作后）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        selectedChapter &&
        (editTitle !== selectedChapter.title || editContent !== selectedChapter.content)
      ) {
        saveChapter();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [editTitle, editContent, saveChapter, selectedChapter]);

  // 新建章节后自动选中标题文本
  useEffect(() => {
    if (justCreated && titleInputRef.current) {
      titleInputRef.current.select();
      setJustCreated(false);
    }
  }, [justCreated]);

  return {
    chapters,
    selectedChapter,
    editTitle,
    editContent,
    saving,
    filter,
    justCreated,
    nameSort,
    timeSort,
    filteredChapters,
    sortedChapters,
    wordCount: wordCount(editContent),
    editorRef,
    titleInputRef,
    setEditTitle,
    setEditContent,
    setFilter,
    saveChapter,
    createChapter,
    deleteChapter,
    toggleStatus,
    formatContent,
    selectChapter,
    handleNameSort,
    handleTimeSort,
  };
}
