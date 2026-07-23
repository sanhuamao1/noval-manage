"use client";

import { useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { X, ListOrdered, GitBranch } from "lucide-react";
import { SimpleTabs } from "@/components/ui/tabs";
import { SlidingDrawer } from "@/components/ui/drawer";
import { EditorForm } from "@/components/ui/editor-form";
import { AddButton } from "@/components/ui/button";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { api } from "@/lib/api";
import { mutate } from "swr";
import { buildEntityKey } from "@/lib/swr-fetcher";
import OutlineView from "../../outline-events/outline-view";
import GraphView from "../../outline-events/components/graph-view";
import type { OutlineData } from "@/types/data";
import type { EditorFormHandle } from "@/components/ui/editor-form";

const VIEW_TABS = [
  { key: "outline", label: "大纲视图", icon: <ListOrdered className="h-3.5 w-3.5" /> },
  { key: "event", label: "事件视图", icon: <GitBranch className="h-3.5 w-3.5" /> },
];

interface OutlineEventsOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function OutlineEventsOverlay({ open, onClose }: OutlineEventsOverlayProps) {
  const params = useParams();
  const novelId = params.id as string;
  const [view, setView] = useState("outline");

  // ── 大纲 CRUD ──
  const outlineEntry = getEntry(ConfigEntity.OUTLINE);
  const [outlineDrawer, setOutlineDrawer] = useState<{
    mode: "edit";
    outline: OutlineData;
  } | null>(null);
  const outlineEditorRef = useRef<EditorFormHandle>(null);

  const handleEditOutline = useCallback(
    (outline: OutlineData) => {
      setOutlineDrawer({ mode: "edit", outline });
      queueMicrotask(() => {
        outlineEditorRef.current?.setData(
          fillConfig(outline, outlineEntry.defaults, outlineEntry.fields),
        );
      });
    },
    [outlineEntry],
  );

  const handleSaveOutline = useCallback(async () => {
    if (!outlineDrawer) return;
    const data = outlineEditorRef.current?.getData();
    if (!data) return;
    await api({
      url: "/api/outlines",
      method: "PUT",
      data: { id: outlineDrawer.outline.id, novelId, ...data },
    });
    mutate(buildEntityKey("outlines", novelId));
    setOutlineDrawer(null);
  }, [novelId, outlineDrawer]);

  const handleCloseOutline = useCallback(() => {
    setOutlineDrawer(null);
  }, []);

  // ── 事件 CRUD ──
  const {
    mode: eventMode,
    sections: eventSections,
    defaults: eventDefaults,
    editorRef: eventEditorRef,
    currentEntity,
    openAdd,
    openEdit,
    createItem,
    updateItem,
    close: closeEvent,
  } = useEntityCrud(ConfigEntity.EVENT_NODE);

  const handleNodeDoubleClick = useCallback(
    (event: any) => {
      openEdit(event);
    },
    [openEdit],
  );

  const isEventView = view === "event";

  // 当前活跃的 drawer
  const activeDrawer = isEventView
    ? {
        mode: eventMode,
        onClose: closeEvent,
        onCreate: eventMode === "create" ? createItem : undefined,
        onUpdate: eventMode === "edit" ? updateItem : undefined,
      }
    : {
        mode: outlineDrawer?.mode ?? null,
        onClose: handleCloseOutline,
        onUpdate: outlineDrawer ? handleSaveOutline : undefined,
      };

  const activeEditor = isEventView ? (
    <EditorForm
      ref={eventEditorRef}
      key={String(currentEntity)}
      sections={eventSections}
      defaults={eventDefaults}
      novelId={novelId}
    />
  ) : (
    <EditorForm
      ref={outlineEditorRef}
      key="outline-editor"
      sections={outlineEntry.sections}
      defaults={outlineEntry.defaults}
      novelId={novelId}
    />
  );

  return (
    <div
      className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* 浮层面板 */}
      <div className="relative ml-auto flex h-full w-full max-w-[calc(100vw-20rem)] bg-bg-800 border-l border-border-subtle shadow-2xl animate-in slide-in-from-left-2">
        {/* 顶部栏：Tabs + 关闭 */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2 bg-bg-800/90 backdrop-blur-sm border-b border-border-subtle">
          <SimpleTabs tabs={VIEW_TABS} value={view} onChange={setView} variant="segment" />
          <div className="flex items-center gap-2">
            {isEventView && <AddButton onClick={openAdd} />}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden pt-12">
          {view === "outline" ? (
            <OutlineView onEditOutline={handleEditOutline} />
          ) : (
            <GraphView onEventDoubleClick={handleNodeDoubleClick} onAddEvent={openAdd} />
          )}
        </div>

        {/* 编辑 Drawer */}
        <SlidingDrawer
          open={activeDrawer.mode !== null}
          onClose={activeDrawer.onClose}
          onCreate={activeDrawer.onCreate}
          onUpdate={activeDrawer.onUpdate}
        >
          {activeEditor}
        </SlidingDrawer>
      </div>
    </div>
  );
}
