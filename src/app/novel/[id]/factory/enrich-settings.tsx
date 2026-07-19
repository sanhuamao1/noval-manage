"use client";

import { useState } from "react";
import { Button, CardSlider, Input } from "@/components/ui";
import { Sparkles, Check, Ban, Play, Loader2, X, Send } from "lucide-react";
import { useFactory } from "@/stores/useFactoryStore";
import { ErrorState } from "./components/error-state";
import { EmptyState } from "./components/empty-state";

/** 操作类型颜色方案 */
const TYPE_STYLES: Record<string, { border: string; badge: string; label: string }> = {
  add: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    label: "新增",
  },
  update: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    label: "更新",
  },
  delete: {
    border: "border-l-red-500",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "删除",
  },
};

export default function EnrichSettings() {
  const {
    error,
    result,
    applied,
    applying,
    applyErrors,
    opsCount,
    appliedCount,
    loading,
    drawerIndex,
    editedParams,
    setEditedParams,
    handleGenerate,
    handleApply,
    handleDiscard,
  } = useFactory();

  const [followUpPrompt, setFollowUpPrompt] = useState("");

  const handleFollowUp = () => {
    if (!followUpPrompt.trim() || loading) return;
    handleGenerate({ prompt: followUpPrompt });
    setFollowUpPrompt("");
  };

  /** CardSlider 底部操作栏 */
  const renderHandler = () => {
    if (drawerIndex === null) return <div>未选择</div>;

    return (
      <div className="flex items-center justify-between gap-3">
        {/* 左侧：追加 Prompt */}
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="追加提示词..."
            value={followUpPrompt}
            onChange={(e) => setFollowUpPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFollowUp();
            }}
            disabled={loading}
            className="h-8 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleFollowUp}
            disabled={loading || !followUpPrompt.trim()}
            className="shrink-0 gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            追加
          </Button>
        </div>

        {/* 右侧：舍弃 / 应用 */}
        <div className="flex shrink-0 items-center gap-3">
          {!applied.has(drawerIndex) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDiscard(drawerIndex)}
              disabled={applying.size > 0}
              className="gap-1 text-muted-foreground hover:text-destructive"
            >
              <Ban className="h-3.5 w-3.5" />
              舍弃
            </Button>
          )}
          {applied.has(drawerIndex) ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              已应用
            </span>
          ) : applying.has(drawerIndex) ? (
            <Button variant="default" size="sm" disabled className="gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              应用中...
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleApply(drawerIndex)}
              disabled={applying.size > 0}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              应用
            </Button>
          )}
        </div>
      </div>
    );
  };

  // 构建页面内容
  const renderContent = () => {
    // Error state
    if (error && !result) {
      return <ErrorState error={error} onRetry={() => handleGenerate()} />;
    }

    // Empty state
    if (!loading && !error && !result) {
      return (
        <EmptyState>
          按钮，让 AI 帮你完善故事设定
        </EmptyState>
      );
    }

    // Results
    if (!result || opsCount === 0) return null;

    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-lg font-semibold">完善建议</h2>
          <span className="text-sm text-muted-foreground">
            {opsCount} 条操作
            {appliedCount > 0 && ` · 已应用 ${appliedCount}`}
          </span>
        </div>

        {result.analysis && (
          <div className="mb-4 shrink-0 rounded-lg border border-border/60 bg-bg-800/50 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{result.analysis}</p>
          </div>
        )}

        <CardSlider
          renderCard={(index) => {
            const op = result.operations[index];
            if (!op) return null;
            const style = TYPE_STYLES[op.changeType] ?? TYPE_STYLES.update;
            const isApplied = applied.has(index);
            const errText = applyErrors.get(index);
            const currentParams = editedParams.get(index) ?? op.params;
            const paramsJson = JSON.stringify(currentParams, null, 2);

            return (
              <div
                className={`min-h-[420px] rounded-xl border-2 border-l-4 bg-bg-800 p-6 transition-colors ${
                  style.border
                } ${isApplied ? "border-border/40 opacity-50" : "border-border/60"}`}
              >
                {/* 标题行 */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <h3 className="truncate text-base font-semibold">{op.summary}</h3>
                  </div>
                  {isApplied && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      已应用
                    </span>
                  )}
                </div>

                {/* 详情内容 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-xs font-medium text-muted-foreground">更改理由</h4>
                    <p className="text-sm leading-relaxed">{op.reason}</p>
                  </div>

                  <div>
                    <h4 className="mb-1 text-xs font-medium text-muted-foreground">接口</h4>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-bg-700 px-2 py-1 font-mono text-sm text-muted-foreground">
                        {op.method}
                      </code>
                      <code className="rounded bg-bg-700 px-2 py-1 font-mono text-sm text-blue-400">
                        {op.api}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-1 text-xs font-medium text-muted-foreground">参数</h4>
                    <textarea
                      className={`w-full resize-y rounded border bg-bg-900 p-3 font-mono text-xs leading-relaxed outline-none transition-colors ${
                        isApplied
                          ? "cursor-default border-transparent text-muted-foreground"
                          : "border-border/40 text-fg-primary focus:border-primary/50"
                      }`}
                      rows={8}
                      value={paramsJson}
                      readOnly={isApplied}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setEditedParams(index, parsed);
                        } catch {
                          // 用户正在编辑中，暂不更新
                        }
                      }}
                    />
                  </div>

                  {errText && (
                    <div className="flex items-center gap-1.5 rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                      <X className="h-3.5 w-3.5 shrink-0" />
                      {errText}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
          handler={renderHandler()}
        />
      </div>
    );
  };

  return <div>{renderContent()}</div>;
}
