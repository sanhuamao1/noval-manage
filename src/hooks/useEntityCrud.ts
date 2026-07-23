"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

import { api } from "@/lib/api";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { getCrudMeta } from "@/lib/configs/crud-config";
import { fillConfig } from "@/lib/configs/config-utils";
import { useEntitySWR } from "@/hooks/useEntitySWR";
import type { EditorFormHandle } from "@/components/ui/editor-form";

/**
 * 通用实体 CRUD 钩子
 *
 * 接管一个实体列表页的 drawer 状态（create/edit/close）和 C/R/U/D 操作。
 * 使用 SWR 管理数据缓存，无需手动版本管理。
 */
export function useEntityCrud(
  entity: ConfigEntity,
) {
  const params = useParams();
  const novelId = params.id as string;

  // ── 当前实体（支持运行时切换）──
  const [currentEntity, setCurrentEntity] = useState<ConfigEntity>(entity as ConfigEntity);

  // ── 根据 currentEntity 派生配置 ──
  const meta = useMemo(() => getCrudMeta(currentEntity), [currentEntity]);
  const { storeKey, needsNovelId } = meta;
  const entry = useMemo(() => getEntry(currentEntity), [currentEntity]);
  const { fields, sections, defaults, fieldsMap } = entry;

  // ── SWR 数据（替代 useEntityStore / usePolishStore）──
  const swrNovelId = needsNovelId ? novelId : undefined;
  const { data: items = [], mutate } = useEntitySWR<any[]>(storeKey, swrNovelId);

  // ── 编辑状态（模式 + 当前编辑 ID）──
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── 编辑器 ref ──
  const editorRef = useRef<EditorFormHandle>(null);

  function switchEntity(next: ConfigEntity) {
    if (next === currentEntity) return;
    setMode(null);
    setEditingId(null);
    setCurrentEntity(next);
  }

  const openEdit = useCallback(
    (item: { id: string; name: string; [k: string]: any }) => {
      setMode("edit");
      setEditingId(item.id);
      queueMicrotask(() => {
        editorRef.current?.setData(
          fillConfig(item, defaults, fields as readonly { key: string; type: string }[]),
        );
      });
    },
    [defaults, fields],
  );

  const openAdd = useCallback(() => {
    if (mode) return; // 已打开状态不做任何事
    setMode("create");
    setEditingId(null);
    queueMicrotask(() => {
      editorRef.current?.reset();
    });
  }, [mode]);

  function close() {
    setMode(null);
    setEditingId(null);
  }

  const apiPath = meta.apiPath ?? `/api/${storeKey}`;

  async function createItem() {
    const data = editorRef.current?.getData();
    if (!data) return;
    const name = String(data.name ?? "").trim();
    if (!name) return;
    await api({
      url: apiPath,
      method: "POST",
      data: needsNovelId ? { novelId, name, ...data } : { name, ...data },
    });
    mutate(); // SWR 重新验证
    close();
  }

  async function updateItem() {
    if (!editingId) return;
    const data = editorRef.current?.getData();
    if (!data) return;
    const name = String(data.name ?? "").trim();
    if (!name) return;
    await api({
      url: apiPath,
      method: "PUT",
      data: needsNovelId ? { id: editingId, novelId, ...data } : { id: editingId, ...data },
    });
    mutate(); // SWR 重新验证
    close();
  }

  async function deleteItem(itemId: string) {
    const { deleteLabel } = getCrudMeta(currentEntity);
    if (!confirm(`确定要删除这个${deleteLabel}吗？`)) return;
    const query = needsNovelId
      ? `?id=${itemId}&novelId=${novelId}`
      : `?id=${itemId}`;
    await api({
      url: `${apiPath}${query}`,
      method: "DELETE",
    });
    mutate(); // SWR 重新验证
    if (editingId === itemId) close();
  }

  return {
    currentEntity,
    switchEntity,
    mode,
    editingId,
    items,
    editorRef,
    sections,
    defaults,
    fieldsMap,
    openEdit,
    openAdd,
    createItem,
    updateItem,
    deleteItem,
    close,
  } as const;
}
