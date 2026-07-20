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

export default function OrganizationsPage() {
  const {
    items: organizations,
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
  } = useEntityCrud(ConfigEntity.ORGANIZATION);

  return (
    <PageLayout
      title="组织列表"
      handler={<AddButton onClick={openAdd} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={close}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}
        >
          <EditorForm ref={editorRef} key={String(currentEntity)} sections={sections} defaults={defaults} />
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有组织，点击上方按钮添加">
        {organizations.map((org) => {
          return (
            <SimpleCard
              key={org.id}
              title={org.name}
              selected={editingId === org.id}
              onClick={() => openEdit(org)}
              onDelete={() => deleteItem(org.id)}
            >
              <div className="space-x-2">
                {renderOptions(fieldsMap["type"]?.options, org.type)}
                {renderOptions(fieldsMap["status"]?.options, org.status)}
              </div>
              <ConfigBadges
                config={org}
                items={[
                  ["创始人", "founder"],
                  ["当前负责人", "currentLeader"],
                ]}
              />
            </SimpleCard>
          );
        })}
      </CardList>
    </PageLayout>
  );
}
