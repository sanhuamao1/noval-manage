"use client";

import { useState } from "react";
import { ChapterListPanel } from "./components/ChapterListPanel";
import { ChapterEditorPanel } from "./components/ChapterEditorPanel";
import { ToolPanel } from "./components/ToolPanel";
import { OutlineEventsOverlay } from "./components/OutlineEventsOverlay";

export default function ChaptersPage() {
  // 唯一从 Page 级管理的数据：当前选中的章节 ID
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [outlineEventOpen, setOutlineEventOpen] = useState(false);

  return (
    <div className="flex h-full flex-1">
      <ChapterListPanel
        selectedChapterId={selectedChapterId}
        outlineEventOpen={outlineEventOpen}
        onSelectChapter={setSelectedChapterId}
        onToggleOutlineEvent={() => setOutlineEventOpen((v) => !v)}
      />
      <div className="relative flex-1">
        <ChapterEditorPanel selectedChapterId={selectedChapterId} />
        <OutlineEventsOverlay
          open={outlineEventOpen}
          onClose={() => setOutlineEventOpen(false)}
        />
      </div>
      <ToolPanel />
    </div>
  );
}
