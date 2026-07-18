"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button, SlidingDrawer, PageLayout } from "@/components/ui";
import { Edit3 } from "lucide-react";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import type { NovelConfig, NovelData } from "@/types";
import { renderSections } from "@/lib/configs/render-utils";
import { useDrawer } from "@/hooks/useDrawer";
import { NovelOverviewPreview } from "./NovelOverviewPreview";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/api";

export default function NovelOverview() {
  const params = useParams();
  const id = params.id as string;
  const novel = useAppStore((s) => s.novel);
  const mutate = useAppStore((s) => s.mutate);
  const { fields, sections, defaults } = getEntry(ConfigEntity.NOVEL);
  const [editorConfig, setEditorConfig] = useState<NovelConfig>(defaults);

  const drawer = useDrawer();

  useEffect(() => {
    if (novel) {
      setEditorConfig(fillConfig<NovelData, NovelConfig>(novel, defaults, fields));
    }
  }, [novel]);

  async function handleSave() {
    const title = String(editorConfig.title ?? "").trim();
    if (!title) return;

    await mutate(id, "novel", () =>
      api({
        url: `/api/novels/${id}`,
        method: "PATCH",
        data: editorConfig as Record<string, unknown>,
      }),
    );
    drawer.close();
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
        <Button variant="link" size="sm" onClick={() => drawer.setOpen(true)}>
          <Edit3 className="mr-1.5 h-4 w-4" />
          编辑
        </Button>
      }
      drawer={
        <SlidingDrawer open={drawer.open} onClose={drawer.close} onUpdate={handleSave}>
          <div className="space-y-4">
            {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
          </div>
        </SlidingDrawer>
      }
    >
      <NovelOverviewPreview />
    </PageLayout>
  );
}
