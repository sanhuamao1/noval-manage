"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface ListSubField {
  placeholder: string
  width?: string
}

interface ListFieldProps {
  label: string
  subFields: ListSubField[]
  values: string[]
  onChange: (values: string[]) => void
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

export function ListField({ label, subFields, values, onChange }: ListFieldProps) {
  function removeItem(index: number) {
    onChange(safeValues.filter((_, i) => i !== index))
  }

  function updateItem(index: number, fieldIndex: number, val: string) {
    const parts = splitSubFields(safeValues[index], subFields.length)
    parts[fieldIndex] = val
    const updated = [...values]
    updated[index] = joinSubFields(parts)
    onChange(updated)
  }

  // 防御：过滤掉非字符串值（旧数据迁移后可能残留对象）
  const safeValues = values.filter((v): v is string => typeof v === 'string')
  const isEmpty = safeValues.length === 0 || safeValues.every((v) => !v.trim())

  if (isEmpty) return null

  return (
    <div className="space-y-2 pt-1">
      {safeValues.map((item, index) => {
        const parts = splitSubFields(item, subFields.length)
        return (
          <div key={index} className="flex items-center gap-2">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-xs font-semibold text-amber-400">
              {index + 1}
            </span>
            {subFields.map((sf, fi) => (
              <Input
                key={fi}
                className={sf.width ?? "flex-1"}
                value={parts[fi]}
                onChange={(e) => updateItem(index, fi, e.target.value)}
                placeholder={sf.placeholder}
              />
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-fg-tertiary hover:bg-danger/10 hover:text-danger-light"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
