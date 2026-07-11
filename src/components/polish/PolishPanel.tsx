import { useState } from "react";
import { Sparkles } from "lucide-react";
import { resolveIcon } from "@/lib/configs/render-utils";
import { SimpleCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimpleTabs } from "@/components/tabs";
import { SlidingDrawer } from "@/components/ui/drawer";
import { usePolishContext } from "./PolishContext";
import { DEFAULT_POLISH_CONFIG } from "@/lib/configs/polish-defs";
import { parseConfig } from "@/lib/configs/config-utils";
import { PRESET_STYLES } from "@/lib/configs/preset-styles";

/** 生成简短的配置摘要 */
function ConfigSummary(raw: string | null | undefined) {
  const cfg = parseConfig(raw, DEFAULT_POLISH_CONFIG) as typeof DEFAULT_POLISH_CONFIG &
    Record<string, unknown>;
  const parts: string[] = [];

  if (cfg.pace) parts.push(`节奏：${cfg.pace}`);
  const moodArr = (cfg.mood ?? []) as string[];
  if (moodArr.length > 0) parts.push(`氛围：${moodArr.join("/")}`);
  const sensesArr = (cfg.senses ?? []) as string[];
  if (sensesArr.length > 0) parts.push(sensesArr.join("/"));
  const charArr = (cfg.character ?? []) as string[];
  if (charArr.length > 0) parts.push(charArr.join("/"));
  if (cfg.rhetoric) parts.push(cfg.rhetoric as string);

  if (parts.length === 0) return null;

  return (
    <div className="mt-1 line-clamp-1 text-[10px] text-muted-foreground/70">
      {parts.join(" | ")}
    </div>
  );
}

const TABS = [{ id: "polish", label: "润色", icon: Sparkles }];

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
  } = usePolishContext();

  const [mode, setMode] = useState<"custom" | "preset">("custom");

  const MODE_TABS = [
    { key: "custom", label: "自定义" },
    { key: "preset", label: "预设文风" },
  ];

  function handleTabClick(tabId: string) {
    if (activeTab === tabId) {
      setActiveTab(null);
      setPanelOpen(false);
      reset();
    } else {
      setActiveTab(tabId);
      setPanelOpen(true);
    }
  }

  return (
    <div className="relative">
      <div className="absolute -left-10 top-20 z-50 flex flex-col gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-lg ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
      <SlidingDrawer open={panelOpen} width={360} title="润色规则">
        {/* 模式切换：自定义 / 预设 */}
        <div className="mb-3">
          <SimpleTabs
            tabs={MODE_TABS}
            value={mode}
            onChange={(k) => setMode(k as "custom" | "preset")}
          />
        </div>

        {selectedText && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">选中文本：</p>
            <p className="line-clamp-3 text-sm">{selectedText}</p>
          </div>
        )}

        {selectedText && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">选中文本：</p>
            <p className="line-clamp-3 text-sm">{selectedText}</p>
          </div>
        )}

        {mode === "preset" && (
          <div className="space-y-2">
            {PRESET_STYLES.map((style) => {
              const Icon = resolveIcon(style.icon);
              return (
                <SimpleCard
                  key={style.id}
                  title={style.name}
                  icon={Icon}
                  description={style.description}
                />
              );
            })}
          </div>
        )}

        {mode === "custom" && (
          <>
            <div className="space-y-2">
              {rules.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无润色规则</p>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className={polishing ? "pointer-events-none opacity-60" : ""}>
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
              <div className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                <Sparkles className="mr-1 inline-block h-4 w-4 animate-pulse" />
                润色中...
              </div>
            )}

            {polishError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {polishError}
              </div>
            )}
          </>
        )}
      </SlidingDrawer>
    </div>
  );
}
