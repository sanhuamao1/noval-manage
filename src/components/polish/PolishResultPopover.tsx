"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X, Check } from "lucide-react"
import { usePolishContext } from "./PolishContext"

export function PolishResultPopover() {
  const {
    showResultPopover,
    polishResult,
    setPolishResult,
    selectedRuleId,
    rules,
    cancelPolish,
    confirmPolish,
  } = usePolishContext()

  const ruleName = selectedRuleId && rules.find((r) => r.id === selectedRuleId)?.name

  if (!showResultPopover || !polishResult) return null

  return (
    <div
      className="fixed z-50 bg-background border rounded-lg shadow-lg p-4"
      style={{
        left: 0,
        right: 0,
        margin: "0 auto",
        maxWidth: "min(calc(100vw - 600px), 800px)",
        top: 100,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          润色结果{ruleName ? `（${ruleName}）` : ""}
        </span>
        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={cancelPolish}>
          <X className="w-3 h-3" />
        </Button>
      </div>
      <Textarea
        value={polishResult}
        onChange={(e) => setPolishResult(e.target.value)}
        className="w-full min-h-[120px] text-sm border rounded-md p-2 resize-y focus-visible:ring-1"
        placeholder="润色结果..."
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={cancelPolish}>
          取消
        </Button>
        <Button size="sm" onClick={confirmPolish} className="gap-1">
          <Check className="w-4 h-4" />
          确认
        </Button>
      </div>
    </div>
  )
}