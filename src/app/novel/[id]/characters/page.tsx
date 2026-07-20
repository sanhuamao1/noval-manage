"use client";

import { AddButton } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { PageLayout } from "@/components/ui/page-layout";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { EditorForm } from "@/components/ui/editor-form";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";

export default function CharactersPage() {
  const {
    items: characters,
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
  } = useEntityCrud(ConfigEntity.CHARACTER);

  return (
    <PageLayout
      title="人物列表"
      handler={<AddButton onClick={openAdd} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={close}
          width={890}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}
        >
          <EditorForm ref={editorRef} key={String(currentEntity)} sections={sections} defaults={defaults} />
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有人物，点击上方按钮添加">
        {characters.map((char) => {
          return (
            <SimpleCard
              key={char.id}
              title={char.name}
              selected={editingId === char.id}
              onClick={() => openEdit(char)}
              onDelete={() => deleteItem(char.id)}
            >
              <div className="space-x-1">
                {renderOptions(fieldsMap["role"]?.options, char.role)}
              </div>
              <ConfigBadges
                config={char}
                items={[
                  ["身份", "identity"],
                  ["叙事功能", "narrativeFunction"],
                  ["内在动机", "innerMotivation"],
                ]}
              />
            </SimpleCard>
          );
        })}
      </CardList>
    </PageLayout>
  );
}
