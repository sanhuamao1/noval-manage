"use client"

import { useRef, useEffect } from "react"
import { Textarea, Button } from "@/components/ui"
import { X, Check } from "lucide-react"
import { usePolishContext } from "./PolishContext"

export function PolishResultPopover() {
  const {
    showResultPopover,
    polishResult,
    setPolishResult,
    selectedRuleId,
    rules,
    selectedText,
    cancelPolish,
    confirmPolish,
  } = usePolishContext()

  const ruleName = selectedRuleId && rules.find((r) => r.id === selectedRuleId)?.name
  const resultRef = useRef<HTMLTextAreaElement>(null)

  /** 自动撑高 textarea 以匹配内容 */
  useEffect(() => {
    const el = resultRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = el.scrollHeight + "px"
    }
  }, [polishResult])

  if (!showResultPopover || !polishResult) return null

  const scrollbarStyle = {
    scrollbarWidth: "thin" as const,
    scrollbarColor: "hsl(var(--muted-foreground)) transparent",
  }

  return (
    <div
      className="fixed z-50 bg-bg-800 border rounded-lg shadow-lg p-4"
      style={{
        left: 0,
        right: 0,
        margin: "0 auto",
        maxWidth: "min(calc(100vw - 600px), 900px)",
        top: 100,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          润色结果{ruleName ? `（${ruleName}）` : ""}
        </span>
        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={cancelPolish}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex gap-4">
        {/* 左侧：原文 */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">原文</div>
          <div
            className="rounded-md border p-3 text-sm text-foreground/85 max-h-[50vh] overflow-auto [tab-size:4]"
            style={scrollbarStyle}
          >
            <div className="whitespace-pre-wrap break-words font-serif">{selectedText}</div>
          </div>
        </div>

        {/* 右侧：润色结果 */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">润色结果</div>
          <div
            className="rounded-md border p-3 text-sm leading-8 text-foreground/85 max-h-[50vh] overflow-auto [tab-size:4]"
            style={scrollbarStyle}
          >
            <Textarea
              ref={resultRef}
              value={polishResult}
              onChange={(e) => setPolishResult(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const ta = e.currentTarget;
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const next = polishResult.substring(0, start) + "\t" + polishResult.substring(end);
                  setPolishResult(next);
                  requestAnimationFrame(() => {
                    ta.selectionStart = ta.selectionEnd = start + 1;
                  });
                }
              }}
              className="w-full border-none resize-none font-serif focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-transparent focus:outline-none p-0 bg-transparent text-inherit min-h-0 rounded-none block"
              placeholder="润色结果..."
            />
          </div>
        </div>
      </div>

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