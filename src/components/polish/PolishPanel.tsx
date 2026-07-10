"use client"

import { Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePolishContext } from "./PolishContext"
import { parsePolishConfig } from "@/types/polish"

/** 生成简短的配置摘要 */
function ConfigSummary(raw: string | null | undefined) {
  const cfg = parsePolishConfig(raw)
  const parts: string[] = []

  if (cfg.pace) parts.push(`节奏：${cfg.pace}`)
  if (cfg.mood.length > 0) parts.push(`氛围：${cfg.mood.join("/")}`)
  if (cfg.senses.length > 0) parts.push(cfg.senses.join("/"))
  if (cfg.character.length > 0) parts.push(cfg.character.join("/"))
  if (cfg.rhetoric) parts.push(cfg.rhetoric)

  if (parts.length === 0) return null

  return (
    <div className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-1">
      {parts.join(" | ")}
    </div>
  )
}

const TABS = [
  { id: "polish", label: "润色", icon: Sparkles },
]

export function PolishPanel() {
  const {
    panelOpen,
    setPanelOpen,
    activeTab,
    setActiveTab,
    selectedText,
    rules,
    selectedRuleId,
    polishing,
    polishError,
    executePolish,
    reset,
  } = usePolishContext()

  function handleTabClick(tabId: string) {
    if (activeTab === tabId) {
      setActiveTab(null)
      setPanelOpen(false)
      reset()
    } else {
      setActiveTab(tabId)
      setPanelOpen(true)
    }
  }

  function handleBack() {
    setActiveTab(null)
    setPanelOpen(false)
    reset()
  }

  return (
    <div className="relative">
      <div className="absolute -left-10 top-20 flex flex-col gap-1 z-50">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              className={`w-9 h-9 rounded-lg ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          )
        })}
      </div>
      {panelOpen && (
        <>
          <div className="w-72 border-l bg-background flex flex-col flex-shrink-0 relative">
            <div className="flex items-center gap-2 p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg flex-shrink-0"
                onClick={handleBack}
                title="返回"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold text-sm">润色规则</h3>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              {selectedText && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">选中文本：</p>
                  <p className="text-sm line-clamp-3">{selectedText}</p>
                </div>
              )}

              {!selectedText ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  在编辑器中选中文本后，点击润色按钮使用此面板
                </p>
              ) : (
                <>
                  <div className="space-y-1">
                    {rules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">暂无润色规则</p>
                    ) : (
                      rules.map((rule) => (
                        <button
                          key={rule.id}
                          onClick={() => executePolish(rule.id)}
                          disabled={polishing}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors border ${selectedRuleId === rule.id && !polishing
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "hover:bg-accent border-transparent"
                            } ${polishing ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div className="font-medium">{rule.name}</div>
                          {rule.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {rule.description}
                            </div>
                          )}
                          {ConfigSummary(rule.config)}
                        </button>
                      ))
                    )}
                  </div>

                  {polishing && (
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                      <Sparkles className="w-4 h-4 inline-block mr-1 animate-pulse" />
                      润色中...
                    </div>
                  )}

                  {polishError && (
                    <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      {polishError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
