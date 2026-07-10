import { type ConfigFieldDef } from "@/lib/configs/config-utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, MultiRadioGroup } from "@/components/radio-group"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { CheckCheck } from "lucide-react"

/** 渲染单个配置字段 */
export function renderField<T extends Record<string, unknown>>(
  field: ConfigFieldDef,
  config: T,
  onChange: (c: T) => void,
) {
  function set(key: keyof T, value: T[keyof T]) {
    onChange({ ...config, [key]: value })
  }

  const value = (config as any)[field.key]

  if (field.type === "toggle") {
    return (
      <div key={field.key} className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Toggle
          key={field.key}
          value={value as boolean}
          onChange={(v) => set(field.key as keyof T, v as any)}
        />
      </div>

    )
  }

  if (field.type === "single") {
    return (
      <div key={field.key} className="space-y-1.5">
        <Label>{field.label}</Label>
        <RadioGroup
          options={field.options ?? []}
          value={value as string || ""}
          onChange={(v) => set(field.key as keyof T, v as any)}
        />
      </div>
    )
  }

  // multi
  const options = field.options ?? []
  const selected = value as string[]
  const isAllSelected = selected.length === options.length
  return (
    <div className="space-y-1.5" key={field.key}>
      <div className="flex items-center gap-1">
        <Label>{field.label}</Label>
        {
          field.max === undefined && <Button
            variant="radio"
            size="auto"
            isActive={isAllSelected}
            onClick={() =>
              set(field.key as keyof T, (isAllSelected ? [] : [...options.map(o => o.value)]) as any)
            }
          >
            <CheckCheck className="w-2.5 h-2.5" />
          </Button>
        }
      </div>
      <div className="flex flex-wrap gap-2">
        <MultiRadioGroup
          options={options}
          selectedValues={selected}
          onChange={(v) => set(field.key as keyof T, v as any)}
          max={field.max}
        />
      </div>
    </div>
  )
}
