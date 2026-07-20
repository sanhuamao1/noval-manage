"use client";

import { Save, CheckCircle2, Circle, Indent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoBorderInput } from "@/components/ui/no-border-input";
import type { Chapter } from "@/types";
import type { ChapterSummary } from "@/types";

interface ChapterToolbarProps {
  selectedChapter: Chapter;
  editTitle: string;
  wordCount: number;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onToggleStatus: (chapter: ChapterSummary) => void;
  onFormatContent: () => void;
  titleInputRef: React.RefObject<HTMLInputElement>;
}

export function ChapterToolbar({
  selectedChapter,
  editTitle,
  wordCount,
  saving,
  onTitleChange,
  onSave,
  onToggleStatus,
  onFormatContent,
  titleInputRef,
}: ChapterToolbarProps) {
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        <NoBorderInput
          ref={titleInputRef}
          value={editTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-lg"
          placeholder="章节标题"
        />
        <div className="flex flex-shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="mx-1 text-muted-foreground/30">|</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(selectedChapter)}
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
          <span>{wordCount} 字</span>
          <Button variant="ghost" size="sm" onClick={onFormatContent} title="格式化缩进">
            <Indent className="mr-1 h-4 w-4" />
            格式化
          </Button>
          <Button variant="ghost" size="sm" onClick={onSave} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
