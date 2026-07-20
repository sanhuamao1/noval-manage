"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useNovelStore } from "@/stores/useNovelStore";
import { useEntityStore } from "@/stores/useEntityStore";
import { usePolishStore } from "@/stores/usePolishStore";
import { api } from "@/lib/api";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { getCrudMeta } from "@/lib/configs/crud-config";
import { fillConfig } from "@/lib/configs/config-utils";
import type { EditorFormHandle } from "@/components/ui/editor-form";

/**
 * 通用实体 CRUD 钩子
 *
 * 接管一个实体列表页的 drawer 状态（create/edit/close）和 C/R/U/D 操作。
 * 编辑区内部自管状态，父组件通过 editorRef 注入数据 / 取数据。
 *
 * @example 单实体页面（固定 entity）
 * ```tsx
 * const { items, mode, fieldsMap, sections, editorRef, defaults, currentEntity,
 *          openEdit, openAdd, createItem, updateItem, deleteItem, close } =
 *   useEntityCrud(ConfigEntity.CHARACTER);
 *
 * <SlidingDrawer ...>
 *   <EditorForm ref={editorRef} key={String(currentEntity)} sections={sections} defaults={defaults} />
 * </SlidingDrawer>
 * ```
 *
 * @example 多实体页面（运行时切换 entity）
 * ```tsx
 * const { ..., currentEntity, switchEntity } = useEntityCrud(ConfigEntity.CHARACTER);
 * // 切换到组织：switchEntity(ConfigEntity.ORGANIZATION) → 自动关闭 drawer + 重置表单
 * ```
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
  const { storeKey } = meta;
  const entry = useMemo(() => getEntry(currentEntity), [currentEntity]);
  const { fields, sections, defaults, fieldsMap } = entry;

  // ── 全局数据：根据 storeKey 从对应 store 读取 ──
  const isPolish = storeKey === "polishRules" || storeKey === "polishSamples";
  const items = (isPolish
    ? usePolishStore((s) => (s as any)[storeKey] ?? [])
    : useEntityStore((s) => (s as any)[storeKey] ?? [])
  ) as any[];
  const mutate = useNovelStore((s) => s.mutate);

  // ── 编辑状态（模式 + 当前编辑 ID）──
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── 编辑器 ref ──
  const editorRef = useRef<EditorFormHandle>(null);

  function switchEntity(next: ConfigEntity) {
    if(next === currentEntity) return;
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
    setMode("create");
    setEditingId(null);
    queueMicrotask(() => {
      editorRef.current?.reset();
    });
  }, []);

  function close() {
    setMode(null);
    setEditingId(null);
  }

  const apiPath = meta.apiPath ?? `/api/${storeKey}`;
  const needsNovelId = meta.needsNovelId !== false;

  async function createItem() {
    const data = editorRef.current?.getData();
    if (!data) return;
    const name = String(data.name ?? "").trim();
    if (!name) return;
    await mutate(novelId, storeKey as any, async () => {
      await api({
        url: apiPath,
        method: "POST",
        data: needsNovelId ? { novelId, name, ...data } : { name, ...data },
      });
    });
    close();
  }

  async function updateItem() {
    if (!editingId) return;
    const data = editorRef.current?.getData();
    if (!data) return;
    const name = String(data.name ?? "").trim();
    if (!name) return;
    await mutate(novelId, storeKey as any, async () => {
      await api({
        url: apiPath,
        method: "PUT",
        data: needsNovelId ? { id: editingId, novelId, ...data } : { id: editingId, ...data },
      });
    });
    close();
  }

  async function deleteItem(itemId: string) {
    const { deleteLabel } = getCrudMeta(currentEntity);
    if (!confirm(`确定要删除这个${deleteLabel}吗？`)) return;
    await mutate(novelId, storeKey as any, async () => {
      const query = needsNovelId
        ? `?id=${itemId}&novelId=${novelId}`
        : `?id=${itemId}`;
      await api({
        url: `${apiPath}${query}`,
        method: "DELETE",
      });
    });
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
