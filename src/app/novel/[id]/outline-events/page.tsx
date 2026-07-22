"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { SimpleTabs } from "@/components/ui/tabs";
import { AddButton } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { EditorForm } from "@/components/ui/editor-form";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { useNovelStore } from "@/stores/useNovelStore";
import { api } from "@/lib/api";
import type { OutlineData } from "@/types/data";
import type { EditorFormHandle } from "@/components/ui/editor-form";
import { ListOrdered, GitBranch } from "lucide-react";
import OutlineView from "./outline-view";
import GraphView from "./components/graph-view";

type ViewMode = "outline" | "event";

const VIEW_TABS = [
  { key: "outline", label: "大纲视图", icon: <ListOrdered className="h-3.5 w-3.5" /> },
  { key: "event", label: "事件视图", icon: <GitBranch className="h-3.5 w-3.5" /> },
];

export default function OutlineEventsPage() {
  const params = useParams();
  const novelId = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const mutate = useNovelStore((s) => s.mutate);

  const view = (searchParams.get("view") ?? "outline") as ViewMode;

  const setView = useCallback(
    (v: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (v === "outline") p.delete("view");
      else p.set("view", v);
      router.push(`${pathname}?${p.toString()}`);
    },
    [searchParams, router, pathname],
  );

  // ── 大纲 Drawer 状态 ──
  const outlineEntry = useMemo(() => getEntry(ConfigEntity.OUTLINE), []);
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
    await mutate(novelId, "outlines", () =>
      api({
        url: "/api/outlines",
        method: "PUT",
        data: { id: outlineDrawer.outline.id, novelId, ...data },
      })
    );
    setOutlineDrawer(null);
  }, [novelId, outlineDrawer, mutate]);

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
    items: events,
  } = useEntityCrud(ConfigEntity.EVENT_NODE);

  const handleNodeDoubleClick = useCallback(
    (event: any) => {
      openEdit(event);
    },
    [openEdit],
  );

  const isEventView = view === "event";

  // 当前活跃的 drawer: 大纲 or 事件
  const activeDrawer = isEventView
    ? { mode: eventMode, onClose: closeEvent, onCreate: eventMode === "create" ? createItem : undefined, onUpdate: eventMode === "edit" ? updateItem : undefined }
    : { mode: outlineDrawer?.mode ?? null, onClose: handleCloseOutline, onUpdate: outlineDrawer ? handleSaveOutline : undefined };

  const activeEditor = isEventView ? (
    <EditorForm
      ref={eventEditorRef}
      key={String(currentEntity)}
      sections={eventSections}
      defaults={eventDefaults}
    />
  ) : (
    <EditorForm
      ref={outlineEditorRef}
      key="outline-editor"
      sections={outlineEntry.sections}
      defaults={outlineEntry.defaults}
    />
  );

  return (
    <PageLayout
      header={
        <div className="mb-4 flex items-center justify-between px-6 pt-4">
          <SimpleTabs tabs={VIEW_TABS} value={view} onChange={setView} variant="segment" />
          {isEventView && <AddButton onClick={openAdd} />}
        </div>
      }
      drawer={
        <SlidingDrawer
          open={activeDrawer.mode !== null}
          onClose={activeDrawer.onClose}
          onCreate={activeDrawer.onCreate}
          onUpdate={activeDrawer.onUpdate}
        >
          {activeEditor}
        </SlidingDrawer>
      }
    >
      <div className="flex-1 flex">
        {view === "outline" ? (
          <OutlineView onEditOutline={handleEditOutline} />
        ) : (
          <GraphView onEventDoubleClick={handleNodeDoubleClick} onAddEvent={openAdd} />
        )}
      </div>
    </PageLayout>
  );
}
