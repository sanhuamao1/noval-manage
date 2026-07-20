"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFactory } from "@/stores/useFactoryStore";
import { useNovelStore } from "@/stores/useNovelStore";
import { ErrorState } from "./components/error-state";
import { EmptyState } from "./components/empty-state";

export default function GenOutline() {
  const { error, loading, content, handleGenerate } = useFactory();
  const novelId = useNovelStore((s) => s.novel?.id);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingContent, setExistingContent] = useState("");
  const [loadedExisting, setLoadedExisting] = useState(false);

  // 加载已有大纲
  useEffect(() => {
    if (!novelId) return;
    setLoadedExisting(false);
    fetch(`/api/factory/gen-outline/load?novelId=${novelId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.content) {
          setExistingContent(d.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoadedExisting(true));
  }, [novelId]);

  const displayContent = content || existingContent;

  const handleSave = async () => {
    if (!novelId || saving || !displayContent) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/factory/gen-outline/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, content: displayContent }),
      });
      const data = await res.json();
      if (!data.error) {
        setSaved(true);
        setExistingContent(displayContent);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // 静默处理
    } finally {
      setSaving(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">AI 正在生成大纲...</p>
      </div>
    );
  }

  // 错误状态
  if (error && !displayContent) {
    return <ErrorState error={error} onRetry={handleGenerate} />;
  }

  // 空状态
  if (!loading && !error && !displayContent && loadedExisting) {
    return <EmptyState>点击设置按钮，选择大纲框架后让 AI 帮你生成小说大纲</EmptyState>;
  }

  // 未加载完成时暂不渲染
  if (!loadedExisting && !content) return null;

  return (
    <div className="flex h-full flex-col">
      {/* 顶部：标题栏 & 按钮 */}
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold">{content ? "大纲生成结果" : "已保存的大纲"}</h2>

        <div className="flex items-center gap-2">
          {/* 保存 */}
          {saved ? (
            <span className="inline-flex h-8 items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs text-emerald-400">
              已保存
            </span>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saving || !displayContent}
              className="h-8 gap-1 text-xs"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              保存
            </Button>
          )}
        </div>
      </div>

      {/* 大纲内容：可滚动容器 */}
      <div className="mt-3 h-[520px] overflow-y-auto rounded-xl border border-border/60 bg-bg-800 p-6">
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
