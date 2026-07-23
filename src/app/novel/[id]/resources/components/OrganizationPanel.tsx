"use client";

import { useEffect } from "react";
import { AddButton } from "@/components/ui/button";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { EditorForm } from "@/components/ui/editor-form";
import { ConfigBadges } from "@/components/ui/config-badges";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { useDrawerStore } from "@/stores/useDrawerStore";
import type { OrganizationData } from "@/types";

export function OrganizationPanel() {
  const {
    items,
    mode,
    editingId,
    fieldsMap,
    sections,
    defaults,
    editorRef,
    openEdit,
    openAdd,
    createItem,
    updateItem,
    deleteItem,
    close,
  } = useEntityCrud(ConfigEntity.ORGANIZATION);

  useEffect(() => {
    if (!mode) {
      useDrawerStore.getState().close();
      return;
    }
    useDrawerStore.getState().open(
      {
        content: (
          <EditorForm
            ref={editorRef}
            key={ConfigEntity.ORGANIZATION}
            sections={sections}
            defaults={defaults}
          />
        ),
        onCreate: mode === "create" ? createItem : undefined,
        onUpdate: mode === "edit" ? updateItem : undefined,
      },
      close,
    );
  }, [mode]);

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <AddButton onClick={openAdd} />
      </div>

      <CardList emptyText="还没有组织，点击上方按钮添加">
        {items.map((org) => (
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
            <ConfigBadges<OrganizationData>
              config={org}
              items={[
                ["创始人", "founder"],
                ["当前负责人", "currentLeader"],
              ]}
            />
          </SimpleCard>
        ))}
      </CardList>
    </>
  );
}
