"use client"

import { useState, useCallback } from "react"

interface SliderProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function Stepper({ value: controlledValue, onChange, min = 0, max = 10, step = 1 }: SliderProps) {
  const defaultVal = Math.round((min + max) / 2)
  const [internal, setInternal] = useState(defaultVal)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internal

  const pct = ((value - min) / (max - min)) * 100

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      onChange?.(v)
      if (!isControlled) setInternal(v)
    },
    [onChange, isControlled],
  )

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="relative flex-1 h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-bg-600" />
        <div
          className="absolute h-1.5 left-0 rounded-full bg-amber-500 transition-[width]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-bg-800 shadow transition-none pointer-events-none"
          style={{ left: `${pct}%`, transform: "translate(-50%, 0)" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
      <span className="text-fg-primary w-4">{value}</span>
    </div>
  )
}
