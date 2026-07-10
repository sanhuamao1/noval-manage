"use client"

import type { ComponentType } from "react"

export interface RadioOption {
  value: string
  label?: string
  description?: string
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
  /** 可选：限制最多可选数量 */
  max?: number
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
  return `${extraClasses} rounded-md flex items-center justify-center text-xs transition-all duration-200 ${
    isSelected ? SELECTED_CLASSES : UNSELECTED_CLASSES
  }`
}

function getIconClassName(isSelected: boolean, baseSize: string) {
  return `${baseSize} ${isSelected ? SELECTED_ICON_COLOR : UNSELECTED_ICON_COLOR}`
}

function OptionButton({
  option,
  isSelected,
  onClick,
  iconSize = "w-4 h-4",
  wrapperClasses = "",
  showLabel = true,
  disabled,
}: {
  option: RadioOption
  isSelected: boolean
  onClick: (value: string) => void
  iconSize?: string
  wrapperClasses?: string
  showLabel?: boolean
  disabled?: boolean
}) {
  const IconComponent = option.icon
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(option.value)}
      className={`${getButtonClasses(isSelected, wrapperClasses)} ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
      title={option.description}
    >
      {IconComponent && <IconComponent className={getIconClassName(isSelected, iconSize)} />}
      {showLabel && <span className="whitespace-nowrap">{option.label || option.value}</span>}
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
          <OptionButton
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onClick={onChange}
            iconSize="w-4 h-4"
            wrapperClasses="aspect-square flex-col gap-2"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onClick={onChange}
          iconSize="w-4 h-4"
          wrapperClasses="flex-1 gap-2 py-1 px-3.5"
        />
      ))}
    </div>
  )
}

export function MultiRadioGroup({ options, selectedValues, onChange, max }: MultiRadioGroupProps) {
  function handleToggle(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      if (max && selectedValues.length >= max) return
      onChange([...selectedValues, value])
    }
  }

  return (
    <>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value)
        const isDisabled = max ? selectedValues.length >= max && !isSelected : false
        return (
          <OptionButton
            key={option.value}
            option={option}
            isSelected={isSelected}
            onClick={handleToggle}
            disabled={isDisabled}
            iconSize="w-4 h-4"
            wrapperClasses="flex-col gap-1 py-1 px-3.5"
          />
        )
      })}
    </>
  )
}
