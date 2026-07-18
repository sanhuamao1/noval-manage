"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button, AddButton, NoBorderInput, SimpleTabs } from "@/components/ui";
import {
  Trash2,
  Save,
  FileText,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownZA,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Indent,
} from "lucide-react";
import { wordCount } from "@/lib/utils";
import { api } from "@/lib/api";
import { ChapterEditor } from "@/app/novel/[id]/chapters/ChapterEditor";
import { SelectionMenu } from "@/components/SelectionMenu";
import { PolishResultPopover } from "@/app/novel/[id]/chapters/PolishResultPopover";
import { PolishPanel } from "@/app/novel/[id]/chapters/PolishPanel";
import { useAppStore } from "@/stores/useAppStore";
import type { Chapter, ChapterSummary } from "@/types";

type FilterTab = "all" | "published" | "draft";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "published", label: "定稿" },
  { key: "draft", label: "草稿" },
];

export default function ChaptersPage() {
  const params = useParams();
  const id = params.id as string;
  const chapters = useAppStore((s) => s.chapters);
  const mutate = useAppStore((s) => s.mutate);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [justCreated, setJustCreated] = useState(false);
  const [nameSort, setNameSort] = useState<"none" | "asc" | "desc">("none");
  const [timeSort, setTimeSort] = useState<"none" | "asc" | "desc">("none");

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  async function createChapter() {
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
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm("确定要删除这个章节吗？")) return;
    if (selectedChapter?.id === chapterId) setSelectedChapter(null);
    await mutate(id, "chapters", async () => {
      await api({ url: `/api/chapters?id=${chapterId}`, method: "DELETE" });
    });
  }

  async function toggleStatus(chapter: ChapterSummary) {
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
  }

  function formatContent() {
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
  }

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
      return;
    });
    setSaving(false);
  }, [selectedChapter, editTitle, editContent, id, mutate]);

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

  /** 新建章节后自动选中标题文本 */
  useEffect(() => {
    if (justCreated && titleInputRef.current) {
      titleInputRef.current.select();
      setJustCreated(false);
    }
  }, [justCreated]);


  async function selectChapter(chapter: ChapterSummary) {
    const full = await api<Chapter>({ url: `/api/chapters?id=${chapter.id}&novelId=${id}` });
    setSelectedChapter(full);
    setEditTitle(full.title);
    setEditContent(full.content);
  }

  const filteredChapters = chapters.filter((ch) => {
    if (filter === "all") return true;
    return ch.status === filter;
  });

  function cycleSort(current: "none" | "asc" | "desc"): "none" | "asc" | "desc" {
    if (current === "none") return "asc";
    if (current === "asc") return "desc";
    return "none";
  }

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

  return (
    <>
      <div className="flex h-full flex-1">
        {/* 章节列表 */}
        <div className="w-72 flex-shrink-0 overflow-auto border-r p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">章节列表</h2>
            <AddButton onClick={createChapter} />
          </div>

          <SimpleTabs
            tabs={filterTabs}
            value={filter}
            onChange={(k) => setFilter(k as FilterTab)}
            counts={{
              published: chapters.filter((ch) => ch.status === "published").length,
              draft: chapters.filter((ch) => ch.status === "draft").length,
            }}
            className="mb-3"
          />

          {/* 排序栏 */}
          <div className="mb-2 flex items-center px-1 text-xs text-muted-foreground">
            <Button
              variant="outline"
              size="sm"
              isActive={nameSort !== "none"}
              onClick={() => {
                setTimeSort("none");
                setNameSort(cycleSort(nameSort));
              }}
            >
              {nameSort === "none" ? (
                <ArrowUpDown className="h-3 w-3" />
              ) : nameSort === "asc" ? (
                <ArrowUpAZ className="h-3 w-3" />
              ) : (
                <ArrowDownZA className="h-3 w-3" />
              )}
              名称
            </Button>

            <Button
              variant="outline"
              isActive={timeSort !== "none"}
              size="sm"
              onClick={() => {
                setNameSort("none");
                setTimeSort(cycleSort(timeSort));
              }}
            >
              {timeSort === "none" ? (
                <ArrowUpDown className="h-3 w-3" />
              ) : timeSort === "asc" ? (
                <ArrowUpNarrowWide className="h-3 w-3" />
              ) : (
                <ArrowDownWideNarrow className="h-3 w-3" />
              )}
              时间
            </Button>
          </div>

          <div className="space-y-1">
            {sortedChapters.map((chapter: ChapterSummary, index) => (
              <div
                key={chapter.id}
                className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  selectedChapter?.id === chapter.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-primary/10"
                }`}
                onClick={() => selectChapter(chapter)}
              >
                <span
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    chapter.status === "published"
                      ? "bg-primary"
                      : "border-2 border-muted-foreground bg-transparent"
                  }`}
                />
                <span className="flex-1 truncate">
                  {chapter.title || `未命名章节 ${index + 1}`}
                </span>
                <Button
                  variant="destructive"
                  size="auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChapter(chapter.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
            {filteredChapters.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {filter === "all" ? "还没有章节，点击上方按钮创建" : "没有符合条件的章节"}
              </p>
            )}
          </div>
        </div>

        {/* 编辑器 */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {selectedChapter ? (
            <>
              <div className="border-b p-4">
                <div className="flex items-center gap-4">
                  <NoBorderInput
                    ref={titleInputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg"
                    placeholder="章节标题"
                  />
                  <div className="flex flex-shrink-0 items-center gap-2 text-sm text-muted-foreground">
                    <span className="mx-1 text-muted-foreground/30">|</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(selectedChapter)}
                      className={`${selectedChapter.status === "published" ? "text-green-500" : "text-amber-500"}`}
                    >
                      {selectedChapter.status === "published" ? (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          已定稿
                        </>
                      ) : (
                        <>
                          <Circle className="mr-1 h-3 w-3" />
                          草稿
                        </>
                      )}
                    </Button>
                    <span>{wordCount(editContent)} 字</span>
                    <Button variant="ghost" size="sm" onClick={formatContent} title="格式化缩进">
                      <Indent className="mr-1 h-4 w-4" />
                      格式化
                    </Button>
                    <Button variant="ghost" size="sm" onClick={saveChapter} disabled={saving}>
                      <Save className="mr-1 h-4 w-4" />
                      {saving ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative flex-1 p-4">
                <ChapterEditor
                  editContent={editContent}
                  setEditContent={setEditContent}
                  editorRef={editorRef}
                />
                <SelectionMenu />
                <PolishResultPopover editContent={editContent} setEditContent={setEditContent} />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
                  选择一个章节开始编辑
                </h3>
                <p className="text-sm text-muted-foreground">
                  从左侧列表中选择一个章节，或创建新章节
                </p>
              </div>
            </div>
          )}
        </div>
        <PolishPanel />
      </div>
    </>
  );
}
