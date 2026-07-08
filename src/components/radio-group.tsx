"use client"

import type { ComponentType } from "react"

export interface RadioOption {
  value: string
  label?: string
  icon: ComponentType<{ className?: string }>
}

interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
}

export function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex gap-3">
      {options.map((option) => {
        const isSelected = value === option.value
        const IconComponent = option.icon
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
              isSelected
                ? "bg-bg-700 border border-amber-500 text-amber-400"
                : "bg-bg-900 border border-transparent text-fg-tertiary hover:text-fg-secondary"
            }`}
          >
            <IconComponent className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-fg-tertiary"}`} />
            <span>{option.label || option.value}</span>
          </button>
        )
      })}
    </div>
  )
}
