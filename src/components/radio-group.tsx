"use client"

import type { ComponentType } from "react"
import { Tooltip } from "@/components/ui/tooltip"

export interface RadioOption {
  value: string
  label?: string
  description?: string
  icon?: ComponentType<{ className?: string }>
}

interface RadioGroupProps {
  options: RadioOption[]
  type?: "single" | "multi"
  value: string | string[]
  onChange: (value: string | string[]) => void
  variant?: "horizontal" | "box"
  /** multi 模式下可选：最多可选数量 */
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

// ── 变体样式常量 ──
const BOX_WRAPPER = "w-18 h-18 flex-col gap-1"
const HORIZONTAL_WRAPPER = "flex-1 gap-2 py-1 px-3.5"
const BOX_ICON_SIZE = "w-5 h-5"
const HORIZONTAL_ICON_SIZE = "w-4 h-4"

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
  const btn = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(option.value)}
      className={`${getButtonClasses(isSelected, wrapperClasses)} ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {IconComponent && <IconComponent className={getIconClassName(isSelected, iconSize)} />}
      {showLabel && <span className="whitespace-nowrap">{option.label || option.value}</span>}
    </button>
  )

  if (option.description) {
    return <Tooltip content={option.description}>{btn}</Tooltip>
  }

  return btn
}

export function RadioGroup({
  options,
  type = "single",
  value,
  onChange,
  variant = "horizontal",
  max,
}: RadioGroupProps) {
  if (type === "multi") {
    const selectedValues = value as string[]

    const handleToggle = (val: string) => {
      const current = value as string[]
      if (current.includes(val)) {
        onChange(current.filter((v) => v !== val))
      } else {
        if (max && current.length >= max) return
        onChange([...current, val])
      }
    }

    const wrapperClasses = variant === "box" ? BOX_WRAPPER : HORIZONTAL_WRAPPER

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
              iconSize={variant === "box" ? BOX_ICON_SIZE : HORIZONTAL_ICON_SIZE}
              wrapperClasses={wrapperClasses}
            />
          )
        })}
      </>
    )
  }

  // single
  const currentValue = value as string
  if (variant === "box") {
    return options.map((option) => (
      <OptionButton
        key={option.value}
        option={option}
        isSelected={currentValue === option.value}
        onClick={onChange as (v: string) => void}
        iconSize={BOX_ICON_SIZE}
        wrapperClasses={BOX_WRAPPER}
      />
    ))
  }

  return options.map((option) => (
    <OptionButton
      key={option.value}
      option={option}
      isSelected={currentValue === option.value}
      onClick={onChange as (v: string) => void}
      iconSize={HORIZONTAL_ICON_SIZE}
      wrapperClasses={HORIZONTAL_WRAPPER}
    />
  ))
}
