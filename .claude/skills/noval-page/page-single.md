# 单数据页面

适合一个页面对应**一条记录**的场景（如小说概览页）。数据来自全局 `useAppStore`。

## 模板（仅供参考

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button, SlidingDrawer, PageLayout } from "@/components/ui";
import { Edit3 } from "lucide-react";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import type { NovelConfig } from "@/lib/configs/generated";
import { renderSections } from "@/lib/configs/render-utils";
import { useDrawer } from "@/hooks/useDrawer";
import { useAppStore } from "@/stores/useAppStore";

export default function SomeOverview() {
  const params = useParams();
  const id = params.id as string;
  const data = useAppStore((s) => s.someData);
  const updateAction = useAppStore((s) => s.updateAction);

  const { fields, sections, defaults } = getEntry(ConfigEntity.SOME_ENTITY);
  const [editorConfig, setEditorConfig] = useState<SomeConfig>(defaults);
  const drawer = useDrawer();

  useEffect(() => {
    if (data) {
      setEditorConfig(fillConfig(data, defaults, fields));
    }
  }, [data]);

  async function handleSave() {
    const title = String(editorConfig.title ?? "").trim();
    if (!title) return;
    await updateAction(id, editorConfig);
    drawer.close();
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <PageLayout
      title="页面标题"
      handler={
        <Button variant="link" size="sm" onClick={() => drawer.setOpen(true)}>
          <Edit3 className="mr-1.5 h-4 w-4" />编辑
        </Button>
      }
      drawer={
        <SlidingDrawer open={drawer.open} onClose={drawer.close} onUpdate={handleSave}>
          <div className="space-y-4">
            {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
          </div>
        </SlidingDrawer>
      }
    >
      {/* 预览组件 */}
      <PreviewComponent data={data} config={editorConfig} />
    </PageLayout>
  );
}
```

## 关键点

1. **`getEntry` 在组件顶层调用**，不在循环/条件中重复获取
2. 使用 `useDrawer()` hook 管理抽屉开关状态
3. 用 `fillConfig(data, defaults, fields)` 将 API 数据合并到默认值
4. 编辑区通过 `renderSections(sections, editorConfig, setEditorConfig)` 动态生成


## 参考文件

- 完整实现：[src/app/novel/[id]/page.tsx](../../../src/app/novel/%5Bid%5D/page.tsx)