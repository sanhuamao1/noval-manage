"use client";

import { useCallback } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { X, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface ListSubField {
  placeholder: string
  width?: string
  type?: "text" | "select"
  optionsFrom?: string
}

interface ListFieldProps {
  subFields: ListSubField[]
  values: string[]
  onChange: (values: string[]) => void
  /** type="select" 子字段的选项映射：subFieldIndex → 选项值数组 */
  resolvedOptions?: Record<number, string[]>
}

/** 将子字段值数组拼接为单个字符串（用 ; 分隔） */
function joinSubFields(parts: string[]): string {
  return parts.join(";")
}

/** 将一个字符串拆解为子字段值数组 */
function splitSubFields(item: string, count: number): string[] {
  const parts = item.split(";")
  while (parts.length < count) parts.push("")
  return parts.slice(0, count)
}

/** 可排序的单行 */
function SortableItem({
  id,
  index,
  item,
  subFields,
  resolvedOptions,
  onUpdate,
  onRemove,
}: {
  id: string
  index: number
  item: string
  subFields: ListSubField[]
  resolvedOptions: Record<number, string[]>
  onUpdate: (index: number, fieldIndex: number, val: string) => void
  onRemove: (index: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const parts = splitSubFields(item, subFields.length)

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-1">
      <span
        {...attributes}
        {...listeners}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-xs font-semibold text-amber-400 cursor-grab active:cursor-grabbing group/drag hover:border-amber-400/50 hover:bg-amber-500/20 transition-colors"
      >
        <span className="group-hover/drag:hidden">{index + 1}</span>
        <GripVertical className="w-3.5 h-3.5 hidden group-hover/drag:block" />
      </span>
      {subFields.map((sf, fi) => {
        const options = resolvedOptions[fi];
        if (sf.type === "select" && options) {
          const currentVal = parts[fi];
          return (
            <Select
              key={fi}
              value={currentVal || undefined}
              onValueChange={(v) => onUpdate(index, fi, v)}
            >
              <SelectTrigger className={sf.width ?? "flex-1"}>
                <SelectValue placeholder={sf.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            key={fi}
            className={sf.width ?? "flex-1"}
            value={parts[fi]}
            onChange={(e) => onUpdate(index, fi, e.target.value)}
            placeholder={sf.placeholder}
          />
        );
      })}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0 text-fg-tertiary hover:bg-danger/10 hover:text-danger-light"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ListField({ subFields, values, onChange, resolvedOptions = {} }: ListFieldProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  function removeItem(index: number) {
    onChange(safeValues.filter((_, i) => i !== index))
  }

  const updateItem = useCallback(
    (index: number, fieldIndex: number, val: string) => {
      const parts = splitSubFields(safeValues[index], subFields.length)
      parts[fieldIndex] = val
      const updated = [...values]
      updated[index] = joinSubFields(parts)
      onChange(updated)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, subFields.length, onChange],
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = Number(active.id)
    const newIndex = Number(over.id)
    const updated = [...safeValues]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)
    onChange(updated)
  }

  // 防御：过滤掉非字符串值（旧数据迁移后可能残留对象）
  const safeValues = values.filter((v): v is string => typeof v === 'string')

  const itemIds = safeValues.map((_, i) => String(i))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {safeValues.map((item, index) => (
          <SortableItem
            key={String(index)}
            id={String(index)}
            index={index}
            item={item}
            subFields={subFields}
            resolvedOptions={resolvedOptions}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
