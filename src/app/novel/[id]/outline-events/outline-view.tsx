"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useEntitySWR } from "@/hooks/useEntitySWR";
import { buildEntityKey } from "@/lib/swr-fetcher";
import { api } from "@/lib/api";
import { mutate } from "swr";
import type { OutlineData } from "@/types/data";
import { Trash2, Plus } from "lucide-react";

// ── 从 parentId 构建有序链 ──
function buildChain(outlines: OutlineData[]): OutlineData[] {
  const chain: OutlineData[] = [];

  // 找到所有根节点（无 parentId），按创建时间排序
  const roots = outlines
    .filter((o) => !o.parentId)
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

  for (const root of roots) {
    let current: OutlineData | undefined = root;
    while (current) {
      chain.push(current);
      current = outlines.find((o) => o.parentId === current!.id);
    }
  }

  return chain;
}

// ── 状态标签颜色 ──
const STATUS_STYLE: Record<string, string> = {
  "已规划": "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  "进行中": "bg-primary/10 text-primary border-primary/20",
  "已完成": "bg-success/10 text-success border-success/20",
};

// ── 内联编辑的标题组件 ──
function InlineTitle({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  }, [draft, value, onSave]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="flex-1 bg-transparent px-0 py-0 text-sm font-medium text-fg-primary outline-none border-b border-amber-500/50"
      />
    );
  }

  return (
    <span
      className="flex-1 text-sm font-medium text-fg-primary truncate cursor-pointer hover:text-amber-400 transition-colors"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="双击编辑名称"
    >
      {value}
    </span>
  );
}

// ── Props ──
interface OutlineViewProps {
  onEditOutline: (outline: OutlineData) => void;
}

// ── 主组件 ──
export default function OutlineView({ onEditOutline }: OutlineViewProps) {
  const params = useParams();
  const novelId = params.id as string;
  const { data: outlines = [] } = useEntitySWR<OutlineData[]>("outlines", novelId);
  const refreshOutlines = useCallback(() => {
    mutate(buildEntityKey("outlines", novelId));
  }, [novelId]);

  // 构建链
  const chain = useMemo(() => buildChain(outlines), [outlines]);

  // 查找某个节点是否有子节点
  const hasChild = useCallback(
    (id: string) => outlines.some((o) => o.parentId === id),
    [outlines]
  );

  // ── 双击空白区域创建（追加到链表末尾） ──
  const handlePaneDoubleClick = useCallback(async () => {
    const last = chain[chain.length - 1];
    const name = `新大纲 ${chain.length + 1}`;
    await api({
      url: "/api/outlines",
      method: "POST",
      data: { novelId, name, parentId: last?.id ?? null },
    });
    refreshOutlines();
  }, [novelId, chain, refreshOutlines]);

  // ── 点击 [+] 创建子节点 ──
  const handleAddChild = useCallback(
    async (parentId: string) => {
      if (hasChild(parentId)) return;
      const name = `新大纲 ${chain.length + 1}`;
      await api({
        url: "/api/outlines",
        method: "POST",
        data: { novelId, name, parentId },
      });
      refreshOutlines();
    },
    [novelId, chain.length, hasChild, refreshOutlines]
  );

  // ── 保存标题（双击内联编辑） ──
  const handleSaveTitle = useCallback(
    async (id: string, name: string) => {
      await api({
        url: "/api/outlines",
        method: "PUT",
        data: { id, novelId, name },
      });
      refreshOutlines();
    },
    [novelId, refreshOutlines]
  );

  // ── 右键删除（带确认 + 重链子节点） ──
  const handleDelete = useCallback(
    async (item: OutlineData) => {
      if (!confirm(`确定要删除「${item.name}」吗？\n其子节点将自动连接到上一级。`)) return;

      const children = outlines.filter((o) => o.parentId === item.id);
      const newParentId = item.parentId ?? null;

      // 先重链子节点
      for (const child of children) {
        await api({
          url: "/api/outlines",
          method: "PUT",
          data: { id: child.id, novelId, parentId: newParentId },
        });
      }

      // 再删除节点
      await api({
        url: `/api/outlines?id=${item.id}&novelId=${novelId}`,
        method: "DELETE",
      });
      refreshOutlines();
    },
    [novelId, outlines, refreshOutlines]
  );

  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-node-card]")) return;
        handlePaneDoubleClick();
      }}
    >
      {chain.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            双击空白区域创建第一个大纲节点
          </p>
        </div>
      )}

      <div className="mx-auto max-w-xl space-0">
        {chain.map((node, index) => (
          <div key={node.id} className="flex flex-col items-center">
            {index > 0 && <div className="h-6 w-px bg-border-subtle" />}

            <div
              data-node-card
              className="group relative w-full rounded-lg border border-border-subtle bg-bg-800/60 p-4 transition-all hover:border-amber-500/30 hover:bg-bg-800/80 cursor-pointer"
              onClick={() => onEditOutline(node)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleDelete(node);
              }}
            >
              {/* 删除按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node);
                }}
                className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center h-5 w-5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                title="删除"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              {/* 状态 + 标题 */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    STATUS_STYLE[node.status ?? ""] ?? STATUS_STYLE["已规划"]
                  }`}
                >
                  {node.status ?? "已规划"}
                </span>
                <InlineTitle
                  value={node.name}
                  onSave={(v) => handleSaveTitle(node.id, v)}
                />
              </div>

              {/* 概要 */}
              {node.contentBrief && (
                <p className="text-xs text-muted-foreground/70 line-clamp-2 mb-2">
                  {node.contentBrief}
                </p>
              )}

              {/* 基调 */}
              {node.tone && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {node.tone}
                </span>
              )}

              {/* [+] 按钮 */}
              <div className="flex justify-center mt-2">
                {!hasChild(node.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddChild(node.id);
                    }}
                    className="flex items-center justify-center h-6 w-6 rounded-full border border-dashed border-border-subtle text-muted-foreground hover:border-amber-500 hover:text-amber-400 transition-colors"
                    title="添加子大纲"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
