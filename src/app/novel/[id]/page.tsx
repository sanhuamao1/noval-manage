"use client";

import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { PageLayout } from "@/components/ui/page-layout";
import { EditorForm } from "@/components/ui/editor-form";
import type { EditorFormHandle } from "@/components/ui/editor-form";
import { Edit3 } from "lucide-react";
import { ConfigEntity, getEntry } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { NovelOverviewPreview } from "./NovelOverviewPreview";
import { useNovelStore } from "@/stores/useNovelStore";
import { api } from "@/lib/api";

export default function NovelOverview() {
  const params = useParams();
  const id = params.id as string;
  const novel = useNovelStore((s) => s.novel);
  const mutate = useNovelStore((s) => s.mutate);
  const { sections, defaults, fields } = getEntry(ConfigEntity.NOVEL);

  const [open, setOpen] = useState(false);
  const editorRef = useRef<EditorFormHandle>(null);

  const openEdit = useCallback(() => {
    setOpen(true);
    queueMicrotask(() => {
      if (novel) {
        editorRef.current?.setData(fillConfig(novel, defaults, fields));
      }
    });
  }, [novel, defaults, fields]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  async function handleSave() {
    const data = editorRef.current?.getData();
    if (!data) return;
    const title = String(data.title ?? "").trim();
    if (!title) return;

    await mutate(id, "novel", () =>
      api({
        url: `/api/novels/${id}`,
        method: "PATCH",
        data: data as Record<string, unknown>,
      }),
    );
    close();
  }

  if (!novel) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <PageLayout
      title="概览"
      handler={
        <Button variant="link" size="sm" onClick={openEdit}>
          <Edit3 className="mr-1.5 h-4 w-4" />
          编辑
        </Button>
      }
      drawer={
        <SlidingDrawer open={open} onClose={close} onUpdate={handleSave}>
          <EditorForm
            ref={editorRef}
            key={ConfigEntity.NOVEL}
            sections={sections}
            defaults={defaults}
          />
        </SlidingDrawer>
      }
    >
      <NovelOverviewPreview />
    </PageLayout>
  );
}
