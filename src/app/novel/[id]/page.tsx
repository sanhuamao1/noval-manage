"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { Edit3 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DEFAULT_NOVEL_CONFIG } from "@/lib/configs/novel-defs";
import { parseConfig } from "@/lib/configs/config-utils";
import { useDrawer } from "@/hooks/useDrawer";
import {
  NovelOverviewEditor,
  type NovelOverviewEditorHandle,
} from "@/components/novel/NovelOverviewEditor";
import { NovelOverviewPreview } from "@/components/novel/NovelOverviewPreview";

interface NovelData {
  id: string;
  title: string;
  description: string | null;
  config: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function NovelOverview() {
  const params = useParams();
  const id = params.id as string;
  const [novel, setNovel] = useState<NovelData | null>(null);
  const editorRef = useRef<NovelOverviewEditorHandle>(null);

  const drawer = useDrawer();

  const fetchNovel = useCallback(async () => {
    const res = await fetch(`/api/novels?id=${id}`);
    const data = await res.json();
    setNovel(data);
  }, [id]);

  useEffect(() => {
    fetchNovel();
  }, [fetchNovel]);

  async function handleSave() {
    if (!editorRef.current) return;
    const { title, description, config } = editorRef.current.getData();
    if (!title.trim()) return;
    const res = await fetch(`/api/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        config: JSON.stringify(config),
      }),
    });
    if (res.ok) {
      drawer.close();
      fetchNovel();
    }
  }

  if (!novel) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  const config = parseConfig(novel.config, DEFAULT_NOVEL_CONFIG);

  console.log(config)

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
        <SlidingDrawer
          open={drawer.open}
          onClose={drawer.close}
          onUpdate={handleSave}
        >
          <NovelOverviewEditor
            ref={editorRef}
            initialTitle={novel.title}
            initialDescription={novel.description || ""}
            initialConfig={config}
          />
        </SlidingDrawer>
      }
    >
      <NovelOverviewPreview novel={novel} config={config} />
    </PageLayout>
  );
}
