"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/api";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { getCrudMeta } from "@/lib/configs/crud-config";
import { fillConfig } from "@/lib/configs/config-utils";
import type { EntityConfigMap } from "@/types";
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
export function useEntityCrud<K extends keyof EntityConfigMap>(
  entity: K,
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

  // ── 全局数据 ──
  const items = useAppStore((s) => (s as any)[storeKey] ?? []) as any[];
  const mutate = useAppStore((s) => s.mutate);

  // ── 编辑状态（模式 + 当前编辑 ID）──
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── 编辑器 ref（表单内部自管状态，createItem / updateItem 时通过 ref 取数据）──
  const editorRef = useRef<EditorFormHandle>(null);

  /** 切换到另一个实体类型 */
  function switchEntity(next: ConfigEntity) {
    if(next === currentEntity) return;
    setMode(null);
    setEditingId(null);
    setCurrentEntity(next);
  }

  /** 点击卡片 → 打开编辑 */
  const openEdit = useCallback(
    (item: { id: string; name: string; [k: string]: any }) => {
      setMode("edit");
      setEditingId(item.id);
      // 把已有数据推入编辑器
      queueMicrotask(() => {
        editorRef.current?.setData(
          fillConfig(item, defaults, fields as readonly { key: string; type: string }[]),
        );
      });
    },
    [defaults, fields],
  );

  /** 新建按钮 → 打开创建 */
  const openAdd = useCallback(() => {
    setMode("create");
    setEditingId(null);
    // 重置编辑器到默认值
    queueMicrotask(() => {
      editorRef.current?.reset();
    });
  }, []);

  /** 关闭 drawer */
  function close() {
    setMode(null);
    setEditingId(null);
  }

  // ── API 路径派生 ──
  const apiPath = meta.apiPath ?? `/api/${storeKey}`;
  const needsNovelId = meta.needsNovelId !== false;

  /** 创建（POST）— 通过 ref 从编辑器取值 */
  async function createItem() {
    const data = editorRef.current?.getData();
    if (!data) return;

    const name = String(data.name ?? "").trim();
    if (!name) return;

    await mutate(novelId, storeKey, async () => {
      await api({
        url: apiPath,
        method: "POST",
        data: needsNovelId ? { novelId, name, ...data } : { name, ...data },
      });
    });
    close();
  }

  /** 更新（PUT）— 通过 ref 从编辑器取值 */
  async function updateItem() {
    if (!editingId) return;
    const data = editorRef.current?.getData();
    if (!data) return;

    const name = String(data.name ?? "").trim();
    if (!name) return;

    await mutate(novelId, storeKey, async () => {
      await api({
        url: apiPath,
        method: "PUT",
        data: needsNovelId ? { id: editingId, novelId, ...data } : { id: editingId, ...data },
      });
    });
    close();
  }

  /** 删除 */
  async function deleteItem(itemId: string) {
    const { deleteLabel } = getCrudMeta(currentEntity);
    if (!confirm(`确定要删除这个${deleteLabel}吗？`)) return;
    await mutate(novelId, storeKey, async () => {
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
    /** 当前选中的实体类型 */
    currentEntity,
    /** 切换到另一个实体类型（关闭 drawer、切换数据源、EditorForm 用 key 重挂载） */
    switchEntity,
    /** drawer 模式：create | edit | null（关闭） */
    mode,
    /** 当前编辑条目的 ID（仅 edit 模式有值） */
    editingId,
    /** 实体列表数据（来自 store） */
    items,
    /** 编辑器 ref — 页面需传给 <EditorForm ref={editorRef} /> */
    editorRef,
    /** section 分组定义 */
    sections,
    /** 字段默认值（EditorForm 初始化用） */
    defaults,
    /** 字段定义映射表（key → ConfigFieldDef） */
    fieldsMap,
    /** 打开编辑 drawer（需先调用 setData 填充已有数据） */
    openEdit,
    /** 打开创建 drawer（编辑器重置为默认值） */
    openAdd,
    /** 提交创建（POST） */
    createItem,
    /** 提交更新（PUT） */
    updateItem,
    /** 删除条目 */
    deleteItem,
    /** 关闭 drawer */
    close,
  } as const;
}

