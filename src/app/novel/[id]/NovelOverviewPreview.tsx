"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Hash, Tags, Clock } from "lucide-react";
import { renderOptions } from "@/lib/configs/render-utils";
import { formatDateStr, formatWordCount } from "@/lib/utils";
import { useNovelStore } from "@/stores/useNovelStore";
import { ConfigEntity, getEntry } from "@/lib/configs/config-registry";

export function NovelOverviewPreview() {
  const novel = useNovelStore((s) => s.novel);
  const { fieldsMap } = getEntry(ConfigEntity.NOVEL);

  if (novel === null) {
    return <NovelOverviewSkeleton />;
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex">
          <div className="flex w-40 flex-shrink-0 items-center justify-center bg-muted/50">
            <div className="text-center">
              <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">封面 120×160</p>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold">{novel?.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    {formatWordCount(novel.wordCount || 0)}字
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    创建于 {formatDateStr(novel.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    更新于 {formatDateStr(novel.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {renderOptions(fieldsMap["status"]?.options, novel.status ?? undefined)}
              {renderOptions(fieldsMap["genre"]?.options, novel.genre)}
              {renderOptions(fieldsMap["primaryTone"]?.options, novel.primaryTone ?? undefined)}
              {renderOptions(fieldsMap["secondaryTone"]?.options, novel.secondaryTones)}
            </div>
            {novel.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {novel.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

function NovelOverviewSkeleton() {
  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex">
          <div className="flex w-40 flex-shrink-0 items-center justify-center bg-muted/50">
            <div className="h-24 w-20 animate-pulse rounded-lg bg-muted/60" />
          </div>

          <div className="flex-1 p-6">
            <div className="mb-4">
              <div className="mb-2 h-8 w-64 animate-pulse rounded-md bg-muted/60" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-28 animate-pulse rounded bg-muted/60" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted/60" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted/60" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader icon={Tags} title="核心标签" />
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted/60" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
              <div className="h-6 w-14 animate-pulse rounded-full bg-muted/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader icon={Calendar} title="创作日志" />
          <CardContent className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
