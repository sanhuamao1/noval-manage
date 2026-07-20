"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout } from "@/components/ui/page-layout";
import { SimpleTabs } from "@/components/ui/tabs";
import { EditorSkeleton } from "@/components/skeleton";
import { Sparkles, Loader2 } from "lucide-react";
import { useFactory } from "@/stores/useFactoryStore";
import { useEntityStore } from "@/stores/useEntityStore";

const EnrichSettings = lazy(() => import("./enrich-settings"));
const GenOutline = lazy(() => import("./gen-outline"));

/** 各 tab 的组件映射（Suspense 包裹实现按需加载） */
const TAB_COMPONENTS: Record<string, React.ReactNode> = {
  "enrich-settings": (
    <Suspense fallback={<EditorSkeleton />}>
      <EnrichSettings />
    </Suspense>
  ),
  "gen-outline": (
    <Suspense fallback={<EditorSkeleton />}>
      <GenOutline />
    </Suspense>
  ),
};

export default function FactoryPage() {
  const params = useParams();
  const novelId = params?.id as string;
  const { prompt, setPrompt, loading, activeTab, tabs, handleGenerate, changeTab } = useFactory();
  const frameworks = useEntityStore((s) => s.frameworks);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [selectedFramework, setSelectedFramework] = useState(frameworks[0]?.name ?? "");

  const handleOpenPopover = () => {
    setDraftPrompt(prompt);
    setPopoverOpen(true);
  };

  const handleConfirm = () => {
    setPrompt(draftPrompt);
    setPopoverOpen(false);
    const body: Record<string, unknown> = { novelId, prompt: draftPrompt };
    // 大纲 tab 需要传 framework 参数
    if (activeTab === "gen-outline") {
      body.framework = selectedFramework;
      const fw = frameworks.find((f) => f.name === selectedFramework);
      if (fw?.content) body.frameworkContent = fw.content;
    }
    handleGenerate(body);
  };

  const isOutlineTab = activeTab === "gen-outline";

  return (
    <PageLayout title="梦工厂">
      <div className="flex items-center justify-between">
        <SimpleTabs tabs={tabs} value={activeTab} onChange={changeTab} variant="segment" />

        <div className="flex items-center gap-2">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm" onClick={handleOpenPopover} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {loading ? "生成中" : "设置"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                {/* 大纲 tab：框架选择器 */}
                {isOutlineTab && (
                  <div>
                    <p className="mb-2 text-sm font-medium">选择大纲框架</p>
                    <div className="grid grid-cols-2 gap-2">
                      {frameworks.map((fw) => (
                        <Button
                          key={fw.id}
                          variant={selectedFramework === fw.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFramework(fw.name)}
                          className="justify-start text-xs"
                        >
                          {fw.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Textarea
                  placeholder="额外要求（可选）"
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={handleConfirm}
                  disabled={loading || (isOutlineTab && !selectedFramework)}
                >
                  确定
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-4">{TAB_COMPONENTS[activeTab]}</div>
    </PageLayout>
  );
}
