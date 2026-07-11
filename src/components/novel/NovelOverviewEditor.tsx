"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FormItem } from "@/components/form-item";
import {
  type NovelConfig,
  NOVEL_CONFIG_SECTIONS,
} from "@/lib/configs/novel-defs";
import { flattenFields } from "@/lib/configs/config-utils";
import { renderSections, renderField } from "@/lib/configs/render-utils";

export interface NovelOverviewEditorHandle {
  getData: () => { title: string; description: string; config: NovelConfig };
}

interface NovelOverviewEditorProps {
  initialTitle: string;
  initialDescription: string;
  initialConfig: NovelConfig;
}

export const NovelOverviewEditor = forwardRef<NovelOverviewEditorHandle, NovelOverviewEditorProps>(
  function NovelOverviewEditor({ initialTitle, initialDescription, initialConfig }, ref) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [config, setConfig] = useState<NovelConfig>(initialConfig);

    const statusField = flattenFields(NOVEL_CONFIG_SECTIONS).find(
      (f) => f.key === "status",
    );

    useImperativeHandle(ref, () => ({
      getData: () => ({ title, description, config }),
    }), [title, description, config]);

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader icon={BookOpen} title="基本信息" />
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormItem label="作品名称">
                <input
                  className="border-border-subtle w-full rounded-lg border bg-bg-850 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="作品名称"
                />
              </FormItem>
              {statusField && renderField(statusField, config, setConfig)}
            </div>

            <FormItem label="简介 / 梗概">
              <textarea
                className="border-border-subtle w-full resize-none rounded-lg border bg-bg-850 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="用一段话描述你的作品..."
                rows={4}
              />
            </FormItem>
          </CardContent>
        </Card>

        {renderSections(NOVEL_CONFIG_SECTIONS, config, setConfig, ["status"])}
      </div>
    );
  },
);
