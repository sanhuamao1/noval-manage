"use client";

import { Card, CardHeader, CardContent, Tag } from "@/components/ui";
import { BookOpen, Calendar, Hash, Tags, Clock } from "lucide-react";
import type { NovelConfig } from "@/lib/configs/generated";
import { ConfigEntity, findOptionInConfig } from "@/lib/configs/generated";
import { resolveIcon } from "@/lib/configs/render-utils";
import { formatDateStr, formatWordCount } from "@/lib/utils";
import type { NovelData } from "@/types/novel";

interface NovelOverviewPreviewProps {
  novel: NovelData;
  config: NovelConfig;
}

export function NovelOverviewPreview({ novel, config }: NovelOverviewPreviewProps) {
  const genreList: string[] = Array.isArray(config.genre) ? config.genre : [];
  const statusVal: string = (config.status as string) || "";
  const primaryToneVal: string = (config.primaryTone as string) || "";
  const secondaryTonesList: string[] = Array.isArray(config.secondaryTones)
    ? config.secondaryTones
    : [];

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
                <h2 className="mb-2 text-3xl font-bold">{novel.title}</h2>
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
              {statusVal &&
                (() => {
                  const statusOpt = findOptionInConfig(ConfigEntity.NOVEL, statusVal);
                  return (
                    <Tag
                      color={statusOpt?.color || "default"}
                      icon={statusOpt?.icon ? resolveIcon(statusOpt.icon) : undefined}
                    >
                      {statusVal}
                    </Tag>
                  );
                })()}
              {genreList.map((g: string) => {
                const opt = findOptionInConfig(ConfigEntity.NOVEL, g);
                return (
                  <Tag
                    key={g}
                    color={opt?.color || "default"}
                    icon={opt?.icon ? resolveIcon(opt.icon) : undefined}
                  >
                    {g}
                  </Tag>
                );
              })}
              {primaryToneVal &&
                (() => {
                  const toneOpt = findOptionInConfig(ConfigEntity.NOVEL, primaryToneVal);
                  return (
                    <Tag
                      color={toneOpt?.color || "default"}
                      icon={toneOpt?.icon ? resolveIcon(toneOpt.icon) : undefined}
                    >
                      {primaryToneVal}
                    </Tag>
                  );
                })()}
              {secondaryTonesList.map((t: string) => {
                const opt = findOptionInConfig(ConfigEntity.NOVEL, t);
                return (
                  <Tag
                    key={t}
                    color={opt?.color || "default"}
                    icon={opt?.icon ? resolveIcon(opt.icon) : undefined}
                  >
                    {t}
                  </Tag>
                );
              })}
            </div>

            {novel.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {novel.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader icon={Tags} title="核心标签" />
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <Tag color="default" icon={undefined}>
                主角无敌
              </Tag>
              <Tag color="default" icon={undefined}>
                群像
              </Tag>
              <Tag color="default" icon={undefined}>
                系统
              </Tag>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader icon={Calendar} title="创作日志" />
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span>10-12</span> 更新了第120章
            </div>
            <div className="text-sm text-muted-foreground">
              <span>10-10</span> 修改了大纲设定
            </div>
            <div className="text-sm text-muted-foreground">
              <span>08-01</span> 创建了项目
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
