"use client";

import { useState } from "react";
import { PageLayout, SlidingDrawer } from "@/components/ui";
import { Sparkles } from "lucide-react";
import { PolishRuleList } from "@/components/polish/PolishRuleList";
import { PolishSampleList } from "@/components/polish/PolishSampleList";
import type { DrawerProps } from "@/components/polish/types";

export default function PolishPage() {
  const [drawerProps, setDrawerProps] = useState<DrawerProps | null>(null);

  return (
    <PageLayout
      drawer={
        <SlidingDrawer
          open={!!drawerProps}
          onClose={() => drawerProps?.onClose()}
          title={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-lg font-semibold">{drawerProps?.title}</span>
            </span>
          }
          onCreate={drawerProps?.onCreate}
          onUpdate={drawerProps?.onUpdate}
        >
          {drawerProps?.children}
        </SlidingDrawer>
      }
    >
      <PolishRuleList onDrawerChange={setDrawerProps} />
      <PolishSampleList onDrawerChange={setDrawerProps} />
    </PageLayout>
  );
}