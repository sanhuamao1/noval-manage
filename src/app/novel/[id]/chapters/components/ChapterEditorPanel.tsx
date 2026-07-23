"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { buildEntityKey } from "@/lib/swr-fetcher";
import { mutate } from "swr";
import { wordCount } from "@/lib/utils";
import { FileText } from "lucide-react";
import { ChapterToolbar } from "./ChapterToolbar";
import { ChapterEditor } from "./ChapterEditor";
import { SelectionMenu } from "@/components/SelectionMenu";
import { PolishResultPopover } from "./PolishResultPopover";
import type { Chapter } from "@/types";

interface ChapterEditorPanelProps {
  selectedChapterId: string | null;
}

export function ChapterEditorPanel({ selectedChapterId }: ChapterEditorPanelProps) {
  const params = useParams();
  const novelId = params.id as string;

  // ── 编辑器状态 ──
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    mutate(buildEntityKey("chapters", novelId));
  }, [novelId]);

  // ── 选中变化时，获取完整章节内容 ──
  useEffect(() => {
    if (!selectedChapterId) {
      setSelectedChapter(null);
      setEditTitle("");
      setEditContent("");
      return;
    }
    api<Chapter>({ url: `/api/chapters?id=${selectedChapterId}&novelId=${novelId}` }).then((full) => {
      setSelectedChapter(full);
      setEditTitle(full.title);
      setEditContent(full.content);
    });
  }, [selectedChapterId, novelId]);

  // ── 新建章节后自动选中标题文本 ──
  useEffect(() => {
    if (justCreated && titleInputRef.current) {
      titleInputRef.current.select();
      setJustCreated(false);
    }
  }, [justCreated]);

  // ── 自动保存（3s 无操作后） ──
  useEffect(() => {
    if (!selectedChapter) return;
    const timer = setTimeout(() => {
      if (editTitle !== selectedChapter.title || editContent !== selectedChapter.content) {
        saveChapter();
      }
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, editContent, selectedChapter]);

  // ── 操作 ──
  const saveChapter = useCallback(async () => {
    if (!selectedChapter) return;
    setSaving(true);
    await api({
      url: "/api/chapters",
      method: "PUT",
      data: { id: selectedChapter.id, novelId, title: editTitle, content: editContent },
    });
    refresh();
    setSaving(false);
  }, [selectedChapter, editTitle, editContent, novelId, refresh]);

  const handleToggleStatus = useCallback(async () => {
    if (!selectedChapter) return;
    const newStatus = selectedChapter.status === "published" ? "draft" : "published";
    await api({
      url: "/api/chapters",
      method: "PUT",
      data: { id: selectedChapter.id, novelId, status: newStatus },
    });
    refresh();
    setSelectedChapter((prev) => (prev ? { ...prev, status: newStatus as Chapter["status"] } : prev));
  }, [selectedChapter, novelId, refresh]);

  const handleFormatContent = useCallback(() => {
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

  if (!selectedChapterId || !selectedChapter) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
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
    );
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <ChapterToolbar
        selectedChapter={selectedChapter}
        editTitle={editTitle}
        wordCount={wordCount(editContent)}
        saving={saving}
        onTitleChange={setEditTitle}
        onSave={saveChapter}
        onToggleStatus={handleToggleStatus}
        onFormatContent={handleFormatContent}
        titleInputRef={titleInputRef}
      />
      <div className="relative flex-1 p-4">
        <ChapterEditor
          editContent={editContent}
          setEditContent={setEditContent}
          editorRef={editorRef}
        />
        <SelectionMenu />
        <PolishResultPopover editContent={editContent} setEditContent={setEditContent} />
      </div>
    </div>
  );
}
