"use client";

import { useState } from "react";
import { ChapterListPanel } from "./components/ChapterListPanel";
import { ChapterEditorPanel } from "./components/ChapterEditorPanel";
import { ToolPanel } from "./components/ToolPanel";

export default function ChaptersPage() {
  // 唯一从 Page 级管理的数据：当前选中的章节 ID
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-1">
      <ChapterListPanel
        selectedChapterId={selectedChapterId}
        onSelectChapter={setSelectedChapterId}
      />
      <ChapterEditorPanel selectedChapterId={selectedChapterId} />
      <ToolPanel />
    </div>
  );
}
