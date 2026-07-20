"use client";

import { AddButton } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { PageLayout } from "@/components/ui/page-layout";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { EditorForm } from "@/components/ui/editor-form";
import { SimpleTabs } from "@/components/ui/tabs";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import {  EyeOff } from "lucide-react";
import type { PolishRuleConfig } from "@/types";

const TABS = [
  { key: ConfigEntity.POLISH_RULE, label: "润色规则" },
  { key: ConfigEntity.POLISH_SAMPLE, label: "风格样本" },
];

export default function PolishPage() {
  const {
    items,
    mode,
    editingId,
    fieldsMap,
    sections,
    defaults,
    currentEntity,
    editorRef,
    openEdit,
    openAdd,
    createItem,
    updateItem,
    deleteItem,
    close,
    switchEntity,
  } = useEntityCrud(ConfigEntity.POLISH_RULE);

  const isRule = currentEntity === ConfigEntity.POLISH_RULE;

  return (
    <PageLayout
      title="润色设置"
      handler={<AddButton onClick={openAdd} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={close}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}
        >
          <EditorForm
            ref={editorRef}
            key={String(currentEntity)}
            sections={sections}
            defaults={defaults}
          />
        </SlidingDrawer>
      }
    >
      <div className="mb-6">
        <SimpleTabs
          tabs={TABS}
          value={currentEntity}
          onChange={(key) => switchEntity(key as ConfigEntity)}
        />
      </div>

      {isRule ? (
        <CardList emptyText="还没有润色规则，请先创建">
          {items.map((rule) => (
            <SimpleCard
              key={rule.id}
              title={rule.name}
              description={rule.description}
              selected={editingId === rule.id}
              onClick={() => openEdit(rule)}
              onDelete={() => deleteItem(rule.id)}
            >
              <ConfigBadges<PolishRuleConfig>
                config={rule}
                items={[
                  ["情绪/氛围", "mood"],
                  ["叙事手法", "narrative"],
                  ["五感", "senses"],
                  ["人物描写", "character"],
                  ["环境描写", "environment"],
                ]}
              />
              {rule.useCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  已使用 {rule.useCount} 次
                </span>
              )}
            </SimpleCard>
          ))}
        </CardList>
      ) : (
        <CardList emptyText="还没有风格样本，请先创建">
          {items.map((sample) => {
            const isNegative = !!sample.isNegative;
            return (
              <SimpleCard
                key={sample.id}
                title={sample.name}
                description={sample.prompt || null}
                selected={editingId === sample.id}
                onClick={() => openEdit(sample)}
                onDelete={() => deleteItem(sample.id)}
              >
                <div className="mt-1 flex items-center gap-2">
                  {renderOptions(fieldsMap["sceneType"]?.options, sample.sceneType)}
                  {isNegative && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive">
                      <EyeOff className="h-2.5 w-2.5" />
                      反例
                    </span>
                  )}
                  {sample.useCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      已使用 {sample.useCount} 次
                    </span>
                  )}
                </div>
              </SimpleCard>
            );
          })}
        </CardList>
      )}
    </PageLayout>
  );
}
