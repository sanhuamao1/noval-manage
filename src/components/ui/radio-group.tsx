"use client"

import type { ComponentType } from "react"
import { Tooltip } from "./tooltip"
import { RADIO_COLORS } from "@/lib/colors"
import type { OptionColor } from "@/types"

export interface RadioOption {
  value: string
  label?: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  color?: OptionColor
}

interface RadioGroupProps {
  options: RadioOption[]
  type?: "single" | "multi"
  value: string | string[]
  onChange: (value: string | string[]) => void
  variant?: "horizontal" | "box"
  max?: number
}

const COLOR_MAP = RADIO_COLORS

const DEFAULT_SELECTED = "bg-bg-600 border border-amber-500 text-amber-400"
const DEFAULT_ICON_COLOR = "text-amber-400"
const UNSELECTED_CLASSES = "bg-bg-900 border border-transparent text-fg-tertiary hover:text-fg-secondary"
const UNSELECTED_ICON_COLOR = "text-fg-tertiary"

const BOX_WRAPPER = "w-18 h-18 flex-col gap-1"
const HORIZONTAL_WRAPPER = "flex-1 gap-2 py-1 px-3.5"
const BOX_ICON_SIZE = "w-5 h-5"
const HORIZONTAL_ICON_SIZE = "w-4 h-4"

function getButtonClasses(isSelected: boolean, colorKey?: string, extraClasses?: string) {
  const base = `${extraClasses || ""} rounded-md flex items-center justify-center text-xs transition-all duration-200 `
  if (!isSelected) return base + UNSELECTED_CLASSES
  if (colorKey && COLOR_MAP[colorKey]) {
    const c = COLOR_MAP[colorKey]
    return `${base}${c.bg} border ${c.border} ${c.text}`
  }
  return base + DEFAULT_SELECTED
}

function getIconClassName(isSelected: boolean, baseSize: string, colorKey?: string) {
  if (!isSelected) return `${baseSize} ${UNSELECTED_ICON_COLOR}`
  if (colorKey && COLOR_MAP[colorKey]) return `${baseSize} ${COLOR_MAP[colorKey].icon}`
  return `${baseSize} ${DEFAULT_ICON_COLOR}`
}

function OptionButton({
  option,
  isSelected,
  onClick,
  iconSize = "w-4 h-4",
  wrapperClasses = "",
  showLabel = true,
  disabled,
  color,
}: {
  option: RadioOption
  isSelected: boolean
  onClick: (value: string) => void
  iconSize?: string
  wrapperClasses?: string
  showLabel?: boolean
  disabled?: boolean
  color?: string
}) {
  const IconComponent = option.icon
  const btn = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(option.value)}
      className={`${getButtonClasses(isSelected, color, wrapperClasses)} ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {IconComponent && <IconComponent className={getIconClassName(isSelected, iconSize, color)} />}
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
              color={option.color}
            />
          )
        })}
      </>
    )
  }

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
        color={option.color}
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
      color={option.color}
    />
  ))
}
