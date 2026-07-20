"use client";

import { FileText } from "lucide-react";
import { ChapterEditor } from "./components/ChapterEditor";
import { ChapterList } from "./components/ChapterList";
import { ChapterToolbar } from "./components/ChapterToolbar";
import { PolishPanel } from "./components/PolishPanel";
import { PolishResultPopover } from "./components/PolishResultPopover";
import { SelectionMenu } from "@/components/SelectionMenu";
import { useChapters } from "./hooks/useChapters";

export default function ChaptersPage() {
  const {
    chapters,
    selectedChapter,
    editTitle,
    editContent,
    saving,
    filter,
    nameSort,
    timeSort,
    sortedChapters,
    wordCount,
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
  } = useChapters();

  return (
    <div className="flex h-full flex-1">
      {/* 章节列表 */}
      <ChapterList
        chapters={chapters}
        sortedChapters={sortedChapters}
        selectedChapterId={selectedChapter?.id ?? null}
        filter={filter}
        nameSort={nameSort}
        timeSort={timeSort}
        onSelectChapter={selectChapter}
        onDeleteChapter={deleteChapter}
        onFilterChange={setFilter}
        onCreateChapter={createChapter}
        onNameSort={handleNameSort}
        onTimeSort={handleTimeSort}
      />

      {/* 编辑器区域 */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {selectedChapter ? (
          <>
            <ChapterToolbar
              selectedChapter={selectedChapter}
              editTitle={editTitle}
              wordCount={wordCount}
              saving={saving}
              onTitleChange={setEditTitle}
              onSave={saveChapter}
              onToggleStatus={toggleStatus}
              onFormatContent={formatContent}
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

      {/* 润色面板 */}
      <PolishPanel />
    </div>
  );
}
