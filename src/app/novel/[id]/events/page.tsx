"use client";

import { useCallback } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { SimpleTabs } from "@/components/ui/tabs";
import { AddButton } from "@/components/ui/button";
import { Timeline, GitBranch, Plus } from "lucide-react";
import { SlidingDrawer } from "@/components/ui/drawer";
import { EditorForm } from "@/components/ui/editor-form";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { ConfigEntity } from "@/lib/configs/config-registry";
import TimelineView from "./components/timeline-view";
import GraphView from "./components/graph-view";

type ViewMode = "timeline" | "graph";

const VIEW_TABS = [
  { key: "timeline", label: "时间线", icon: <Timeline className="h-3.5 w-3.5" /> },
  { key: "graph", label: "关系图", icon: <GitBranch className="h-3.5 w-3.5" /> },
];

export default function EventsPage() {
  const params = useParams();
  const novelId = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const view = (searchParams.get("view") ?? "timeline") as ViewMode;

  const setView = useCallback(
    (v: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (v === "timeline") p.delete("view");
      else p.set("view", v);
      router.push(`${pathname}?${p.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const {
    mode,
    sections,
    defaults,
    editorRef,
    currentEntity,
    openAdd,
    openEdit,
    createItem,
    updateItem,
    close,
    items: events,
  } = useEntityCrud(ConfigEntity.EVENT_NODE);

  const handleNodeDoubleClick = useCallback(
    (event: any) => {
      openEdit(event);
    },
    [openEdit],
  );

  return (
    <PageLayout
      header={
        <div className="mb-4 flex items-center justify-between">
          <SimpleTabs tabs={VIEW_TABS} value={view} onChange={setView} variant="segment" />
          <AddButton onClick={openAdd} />
        </div>
      }
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={close}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}
        >
          <EditorForm
            ref={editorRef}
            key={String(currentEntity)}
            sections={sections}
            defaults={defaults}
          />
        </SlidingDrawer>
      }
    >
      {view === "timeline" ? (
        <TimelineView onEventDoubleClick={handleNodeDoubleClick} />
      ) : (
        <GraphView onEventDoubleClick={handleNodeDoubleClick} onAddEvent={openAdd} />
      )}
    </PageLayout>
  );
}
