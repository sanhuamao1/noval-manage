"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { AddButton, SlidingDrawer, PageLayout, Tag } from "@/components/ui";
import { OutlineEditor, type OutlineEditorHandle } from "@/components/outline/OutlineEditor";
import { findOptionInConfig } from "@/lib/configs/generated";
import { resolveIcon } from "@/lib/configs/render-utils";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { useAppStore } from "@/stores/useAppStore";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export default function OutlinesPage() {
  const params = useParams();
  const novelId = params.id as string;
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<OutlineEditorHandle>(null);

  const { fields, defaults } = getEntry(ConfigEntity.OUTLINE);

  const outlines = useAppStore((s) => s.outlines);
  const setOutlines = useAppStore((s) => s.setOutlines);

  async function fetchOutlines() {
    setLoading(true);
    try {
      const data = await api<Record<string, unknown>[]>({
        url: `/api/outlines?novelId=${novelId}`,
      });
      setOutlines(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOutlines();
  }, [novelId]);

  function startCreate() {
    setMode("create");
    setEditingId(null);
  }

  function openForEdit(outline: Record<string, unknown>) {
    setMode("edit");
    setEditingId(outline.id as string);
  }

  async function saveOutline() {
    if (!editorRef.current) return;
    const config = editorRef.current.getData().config;
    const title = String(config.title ?? "").trim();
    if (!title) return;

    if (mode === "create") {
      await api({
        url: "/api/outlines",
        method: "POST",
        data: { novelId, title },
      });
    } else if (mode === "edit" && editingId) {
      // 直接发送整个 config 对象（含所有顶层字段）
      const { id, novelId: _, createdAt, updatedAt, ...rest } = config as any;
      await api({
        url: "/api/outlines",
        method: "PUT",
        data: { id: editingId, novelId, ...rest },
      });
    }

    fetchOutlines();
    setMode(null);
    setEditingId(null);
  }

  async function deleteOutline(outlineId: string) {
    if (!confirm("确定要删除这个大纲吗？")) return;
    await api({ url: `/api/outlines?id=${outlineId}&novelId=${novelId}`, method: "DELETE" });
    fetchOutlines();
  }

  const editingOutline = editingId ? (outlines.find((o) => o.id === editingId) ?? null) : null;
  const fieldIcons = Object.fromEntries(fields.map((f) => [f.key, f.icon]));

  return (
    <PageLayout
      title="章节大纲"
      handler={<AddButton onClick={startCreate} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={() => {
            setMode(null);
            setEditingId(null);
          }}
          width={890}
          onCreate={mode === "create" ? saveOutline : undefined}
          onUpdate={mode === "edit" ? saveOutline : undefined}
        >
          <OutlineEditor
            key={editingId ?? "create"}
            ref={editorRef}
            novelId={novelId}
            outlineId={editingId}
            initialConfig={
              editingOutline
                ? fillConfig(editingOutline, defaults, fields)
                : defaults
            }
          />
        </SlidingDrawer>
      }
    >
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">加载中...</p>
      ) : outlines.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          还没有大纲，点击上方按钮创建
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outlines.map((o) => {
            const status = (o.status as string) || "planned";
            const statusOpt = findOptionInConfig(ConfigEntity.OUTLINE, status);
            const statusLabel = statusOpt?.label ?? status;
            const statusColor = statusOpt?.color ?? "neutral";
            const timeline = o.timeline as string;
            const tone = o.tone as string;
            return (
              <div
                key={o.id as string}
                onClick={() => openForEdit(o)}
                className="border-border-subtle group cursor-pointer rounded-lg border bg-bg-800 p-4 transition-colors hover:border-amber-500/50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="flex-1 truncate text-sm font-medium">{o.title as string}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOutline(o.id as string);
                    }}
                    className="ml-2 text-destructive opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Tag variant="sharp" color={statusColor}>
                    {statusLabel}
                  </Tag>
                  {timeline && (
                    <Tag variant="sharp" icon={resolveIcon(fieldIcons["timeline"])}>
                      {timeline}
                    </Tag>
                  )}
                  {tone && (
                    <Tag
                      variant="sharp"
                      icon={resolveIcon(findOptionInConfig(ConfigEntity.OUTLINE, tone)?.icon)}
                    >
                      {tone}
                    </Tag>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
