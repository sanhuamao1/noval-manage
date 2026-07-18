"use client";

import { PageLayout } from "@/components/ui";

export default function FactoryPage() {
  return (
    <PageLayout
      title="梦工厂"
      description="AI 创作工具"
    >
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">AI 工具即将上线...</p>
      </div>
    </PageLayout>
  );
}
