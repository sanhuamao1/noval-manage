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

export default function OutlinesPage() {
  const {
    items: outlines,
    mode,
    editingId,
    fieldsMap,
    defaults,
    sections,
    editorRef,
    openEdit,
    openAdd,
    createItem,
    updateItem,
    deleteItem,
    close,
  } = useEntityCrud(ConfigEntity.OUTLINE);

  return (
    <PageLayout
      title="章节大纲"
      handler={<AddButton onClick={openAdd} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={close}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}
        >
          <EditorForm ref={editorRef} sections={sections} defaults={defaults} />
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有大纲，点击上方按钮创建">
        {outlines.map((o) => (
          <SimpleCard
            key={o.id}
            title={o.name}
            selected={editingId === o.id}
            onClick={() => openEdit(o)}
            onDelete={() => deleteItem(o.id)}
          >
            <div className="space-x-1">
              {renderOptions(fieldsMap["status"]?.options, o.status)}
              {renderOptions(fieldsMap["tone"]?.options, o.tone)}
            </div>
            <ConfigBadges
              config={o}
              items={[["时间", "timeline"]]}
            />
          </SimpleCard>
        ))}
      </CardList>
    </PageLayout>
  );
}
