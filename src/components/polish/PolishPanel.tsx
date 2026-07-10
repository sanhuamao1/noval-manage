"use client"

import { Sparkles } from "lucide-react"
import { SimpleCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SlidingDrawer } from "@/components/ui/drawer"
import { usePolishContext } from "./PolishContext"
import { DEFAULT_POLISH_CONFIG } from "@/lib/configs/polish-defs"
import { parseConfig } from "@/lib/configs/config-utils"

/** 生成简短的配置摘要 */
function ConfigSummary(raw: string | null | undefined) {
  const cfg = parseConfig(raw, DEFAULT_POLISH_CONFIG)
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
      <SlidingDrawer
        open={panelOpen}
        width={288}
        title={<span className="font-semibold text-sm">润色规则</span>}
      >
        {selectedText && (
          <div className="p-3 bg-muted/50 rounded-lg border">
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
                  <div key={rule.id} className={polishing ? "opacity-60 pointer-events-none" : ""}>
                    <SimpleCard
                      title={rule.name}
                      description={rule.description}
                      selected={selectedRuleId === rule.id && !polishing}
                      onClick={polishing ? undefined : () => executePolish(rule.id)}
                    >
                      {ConfigSummary(rule.config)}
                    </SimpleCard>
                  </div>
                ))
              )}
            </div>

            {polishing && (
              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                <Sparkles className="w-4 h-4 inline-block mr-1 animate-pulse" />
                润色中...
              </div>
            )}

            {polishError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {polishError}
              </div>
            )}
          </>
        )}
      </SlidingDrawer>
    </div>
  )
}
