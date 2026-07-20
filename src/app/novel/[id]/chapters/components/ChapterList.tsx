"use client";

import { Trash2 } from "lucide-react";
import {
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownZA,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from "lucide-react";
import { Button, AddButton } from "@/components/ui/button";
import { SimpleTabs } from "@/components/ui/tabs";
import type { ChapterSummary } from "@/types";
import type { FilterTab, SortState } from "../hooks/useChapters";
import { filterTabs } from "../hooks/useChapters";

interface ChapterListProps {
  chapters: ChapterSummary[];
  sortedChapters: ChapterSummary[];
  selectedChapterId: string | null;
  filter: FilterTab;
  nameSort: SortState;
  timeSort: SortState;
  onSelectChapter: (chapter: ChapterSummary) => void;
  onDeleteChapter: (id: string) => void;
  onFilterChange: (filter: FilterTab) => void;
  onCreateChapter: () => void;
  onNameSort: () => void;
  onTimeSort: () => void;
}

const sortIcons = {
  none: { name: ArrowUpDown, time: ArrowUpDown },
  asc: { name: ArrowUpAZ, time: ArrowUpNarrowWide },
  desc: { name: ArrowDownZA, time: ArrowDownWideNarrow },
} as const;

export function ChapterList({
  chapters,
  sortedChapters,
  selectedChapterId,
  filter,
  nameSort,
  timeSort,
  onSelectChapter,
  onDeleteChapter,
  onFilterChange,
  onCreateChapter,
  onNameSort,
  onTimeSort,
}: ChapterListProps) {
  const NameIcon = sortIcons[nameSort].name;
  const TimeIcon = sortIcons[timeSort].time;

  return (
    <div className="w-72 flex-shrink-0 overflow-auto border-r p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">章节列表</h2>
        <AddButton onClick={onCreateChapter} />
      </div>

      <SimpleTabs
        tabs={filterTabs}
        value={filter}
        onChange={(k) => onFilterChange(k as FilterTab)}
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
          onClick={onNameSort}
        >
          <NameIcon className="h-3 w-3" />
          名称
        </Button>

        <Button
          variant="outline"
          isActive={timeSort !== "none"}
          size="sm"
          onClick={onTimeSort}
        >
          <TimeIcon className="h-3 w-3" />
          时间
        </Button>
      </div>

      <div className="space-y-1">
        {sortedChapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              selectedChapterId === chapter.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-primary/10"
            }`}
            onClick={() => onSelectChapter(chapter)}
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
                onDeleteChapter(chapter.id);
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
        {sortedChapters.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {filter === "all" ? "还没有章节，点击上方按钮创建" : "没有符合条件的章节"}
          </p>
        )}
      </div>
    </div>
  );
}
