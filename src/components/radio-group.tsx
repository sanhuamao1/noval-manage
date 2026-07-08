"use client"

import type { ComponentType } from "react"

export interface RadioOption {
  value: string
  label?: string
  icon?: ComponentType<{ className?: string }>
}

interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  variant?: "horizontal" | "box"
  columns?: number
}

interface MultiRadioGroupProps {
  options: RadioOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  variant?: "horizontal" | "box"
  columns?: number
}

// 选中状态的样式
const SELECTED_CLASSES = "bg-bg-600 border border-amber-500 text-amber-400"
// 未选中状态的样式
const UNSELECTED_CLASSES = "bg-bg-900 border border-transparent text-fg-tertiary hover:text-fg-secondary"
// 图标选中时的颜色
const SELECTED_ICON_COLOR = "text-amber-400"
// 图标未选中时的颜色
const UNSELECTED_ICON_COLOR = "text-fg-tertiary"

function getButtonClasses(isSelected: boolean, extraClasses: string) {
  return `${extraClasses} transition-all duration-200 ${
    isSelected ? SELECTED_CLASSES : UNSELECTED_CLASSES
  }`
}

function getIconClassName(isSelected: boolean, baseSize: string) {
  return `${baseSize} ${isSelected ? SELECTED_ICON_COLOR : UNSELECTED_ICON_COLOR}`
}

function RadioOptionButton({
  option,
  isSelected,
  onChange,
  iconSize = "w-4 h-4",
  wrapperClasses = "",
  showLabel = true,
}: {
  option: RadioOption
  isSelected: boolean
  onChange: (value: string) => void
  iconSize?: string
  wrapperClasses?: string
  showLabel?: boolean
}) {
  const IconComponent = option.icon
  return (
    <button
      type="button"
      onClick={() => onChange(option.value)}
      className={getButtonClasses(isSelected, wrapperClasses)}
    >
      {IconComponent && <IconComponent className={getIconClassName(isSelected, iconSize)} />}
      {showLabel && <span>{option.label || option.value}</span>}
    </button>
  )
}

function MultiRadioOptionButton({
  option,
  isSelected,
  onToggle,
  iconSize = "w-4 h-4",
  wrapperClasses = "",
  showLabel = true,
}: {
  option: RadioOption
  isSelected: boolean
  onToggle: (value: string) => void
  iconSize?: string
  wrapperClasses?: string
  showLabel?: boolean
}) {
  const IconComponent = option.icon
  return (
    <button
      type="button"
      onClick={() => onToggle(option.value)}
      className={getButtonClasses(isSelected, wrapperClasses)}
    >
      {IconComponent && <IconComponent className={getIconClassName(isSelected, iconSize)} />}
      {showLabel && <span>{option.label || option.value}</span>}
    </button>
  )
}

export function RadioGroup({ options, value, onChange, variant = "horizontal", columns = 2 }: RadioGroupProps) {
  // 使用映射避免动态类名问题
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const
  if (variant === "box") {
    return (
      <div className={`grid ${colClass[columns as keyof typeof colClass] || "grid-cols-3"} gap-3`}>
        {options.map((option) => (
          <RadioOptionButton
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onChange={onChange}
            iconSize="w-6 h-6"
            wrapperClasses="aspect-square rounded-lg flex flex-col items-center justify-center gap-2"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <RadioOptionButton
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onChange={onChange}
          iconSize="w-4 h-4"
          wrapperClasses="flex-1 h-9 rounded-lg flex items-center justify-center gap-2"
        />
      ))}
    </div>
  )
}

export function MultiRadioGroup({ options, selectedValues, onChange, variant = "box", columns = 3 }: MultiRadioGroupProps) {
  // 使用映射避免动态类名问题
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const
  function handleToggle(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  if (variant === "box") {
    return (
      <div className={`grid ${colClass[columns as keyof typeof colClass] || "grid-cols-3"} gap-3`}>
        {options.map((option) => (
          <MultiRadioOptionButton
            key={option.value}
            option={option}
            isSelected={selectedValues.includes(option.value)}
            onToggle={handleToggle}
            iconSize="w-6 h-6"
            wrapperClasses="aspect-square rounded-lg flex flex-col items-center justify-center gap-2"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <MultiRadioOptionButton
          key={option.value}
          option={option}
          isSelected={selectedValues.includes(option.value)}
          onToggle={handleToggle}
          iconSize="w-4 h-4"
          wrapperClasses="flex-1 h-9 rounded-lg flex items-center justify-center gap-2"
        />
      ))}
    </div>
  )
}
