import { useState, useCallback } from "react";
import { Sparkles, Check } from "lucide-react";
import { SimpleCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimpleTabs } from "@/components/ui/tabs";
import { SlidingDrawer } from "@/components/ui/drawer";
import { ConfigBadges } from "@/components/ui/config-badges";
import { usePolishStore } from "@/stores/usePolishStore";
import { usePanelStore } from "@/stores/usePanelStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { fillConfig } from "@/lib/configs/config-utils";
import { ConfigEntity, getEntry } from "@/lib/configs/config-registry";
import { api } from "@/lib/api";
import type { PolishRuleConfig } from "@/types";

const TABS = [{ id: "polish", label: "润色", icon: Sparkles }];

export function PolishPanel() {
  const panelOpen = usePanelStore((s) => s.panelOpen);
  const setPanelOpen = usePanelStore((s) => s.setPanelOpen);
  const selectedRuleId = usePolishStore((s) => s.selectedRuleId);
  const setSelectedRuleId = usePolishStore((s) => s.setSelectedRuleId);
  const selectedSampleIds = usePolishStore((s) => s.selectedSampleIds);
  const toggleSampleId = usePolishStore((s) => s.toggleSampleId);
  const refreshPolishData = usePolishStore((s) => s.refreshPolishData);
  const selectedText = useMenuStore((s) => s.selectedText);
  const rules = usePolishStore((s) => s.polishRules);
  const samples = usePolishStore((s) => s.polishSamples);

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [itemTab, setItemTab] = useState<"rules" | "samples">("rules");
  const [polishing, setPolishing] = useState(false);
  const [polishError, setPolishError] = useState("");

  const executePolish = useCallback(
    async (ruleId: string) => {
      if (!selectedText.trim()) return;

      usePolishStore.setState({ selectedRuleId: ruleId });
      setPolishing(true);
      setPolishError("");

      const body: Record<string, unknown> = { text: selectedText };

      if (ruleId) {
        body.type = "rule";
        body.ruleId = ruleId;
      } else if (selectedSampleIds.length > 0) {
        body.type = "sample";
        body.sampleIds = selectedSampleIds;
      }

      try {
        const data = await api<{ error?: string; polishedText?: string }>({
          url: "/api/polish",
          method: "POST",
          data: body,
        });
        if (data.error) {
          setPolishError(data.error);
        } else {
          usePolishStore.setState({
            polishResult: data.polishedText ?? "",
            showResultPopover: true,
          });
          refreshPolishData();
        }
      } catch (err: any) {
        setPolishError(err.message || "润色失败");
      } finally {
        setPolishing(false);
      }
    },
    [selectedText, selectedSampleIds, refreshPolishData],
  );

  const reset = useCallback(() => {
    useMenuStore.getState().resetMenu();
    usePolishStore.setState({
      selectedRuleId: "",
      selectedSampleIds: [],
      polishResult: "",
      showResultPopover: false,
    });
    setPolishing(false);
    setPolishError("");
  }, []);

  const ITEM_TABS = [
    { key: "rules", label: "规则" },
    { key: "samples", label: "样本" },
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
      <SlidingDrawer open={panelOpen} width={360} className="ml-0">
        {/* 选中文本预览 */}
        {selectedText && (
          <div className="mb-3 rounded-lg border bg-muted/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">选中文本：</p>
            <p className="line-clamp-3 text-sm">{selectedText}</p>
          </div>
        )}

        {/* 规则/样本 切换 */}
        <div className="mb-3">
          <SimpleTabs
            tabs={ITEM_TABS}
            value={itemTab}
            onChange={(k) => setItemTab(k as "rules" | "samples")}
          />
        </div>

        {itemTab === "rules" && (
          <div className="space-y-2">
            {rules.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无润色规则</p>
            ) : (
              rules.map((rule) => {
                const { fields, defaults } = getEntry(ConfigEntity.POLISH_RULE);
                const cfg = fillConfig(rule, defaults, fields);
                return (
                  <div key={rule.id} className={polishing ? "pointer-events-none opacity-60" : ""}>
                    <SimpleCard
                      title={rule.name}
                      description={rule.description}
                      selected={selectedRuleId === rule.id && !polishing}
                      onClick={polishing ? undefined : () => setSelectedRuleId(rule.id)}
                    >
                      <ConfigBadges<PolishRuleConfig>
                        config={cfg}
                        items={[
                          ["情绪/氛围", "mood"],
                          ["叙事手法", "narrative"],
                          ["五感", "senses"],
                          ["人物描写", "character"],
                          ["环境描写", "environment"],
                        ]}
                      />
                    </SimpleCard>
                  </div>
                );
              })
            )}
            {!polishing && selectedRuleId && (
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => executePolish(selectedRuleId)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                用规则润色
              </Button>
            )}
          </div>
        )}

        {itemTab === "samples" && (
          <div className="space-y-2">
            {samples.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无风格样本</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  选择 1-3 个样本作为风格参考
                  {selectedSampleIds.length > 0 ? `（已选 ${selectedSampleIds.length} 个）` : ""}
                </p>
                {samples.map((sample) => {
                  const { fields, defaults } = getEntry(ConfigEntity.POLISH_SAMPLE);
                  const cfg = fillConfig(sample, defaults, fields);
                  const isSelected = selectedSampleIds.includes(sample.id);
                  const isNegative = !!cfg.isNegative;
                  const sceneType = cfg.sceneType || "";
                  return (
                    <div
                      key={sample.id}
                      className={polishing ? "pointer-events-none opacity-60" : ""}
                    >
                      <SimpleCard
                        title={sample.name}
                        selected={isSelected}
                        onClick={polishing ? undefined : () => toggleSampleId(sample.id)}
                      >
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            {isNegative && (
                              <span className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
                                反例
                              </span>
                            )}
                            {sceneType && (
                              <span className="truncate text-[10px] text-muted-foreground">
                                {sceneType}
                              </span>
                            )}
                          </div>
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                        {sample.prompt && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            提示：{sample.prompt}
                          </p>
                        )}
                      </SimpleCard>
                    </div>
                  );
                })}
                {!polishing && selectedSampleIds.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => executePolish("")}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    用样本润色
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {polishing && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            <Sparkles className="mr-1 inline-block h-4 w-4 animate-pulse" />
            润色中...
          </div>
        )}

        {polishError && (
          <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {polishError}
          </div>
        )}
      </SlidingDrawer>
    </div>
  );
}
