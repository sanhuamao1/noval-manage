"use client";

import { useEffect } from "react";
import { AddButton } from "@/components/ui/button";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { EditorForm } from "@/components/ui/editor-form";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { useDrawerStore } from "@/stores/useDrawerStore";

export function LocationPanel() {
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
  } = useEntityCrud(ConfigEntity.LOCATION);

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
            key={ConfigEntity.LOCATION}
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

      <CardList emptyText="还没有地点，点击上方按钮添加">
        {items.map((loc) => (
          <SimpleCard
            key={loc.id}
            title={loc.name}
            selected={editingId === loc.id}
            onClick={() => openEdit(loc)}
            onDelete={() => deleteItem(loc.id)}
          >
            <div className="space-x-2">
              {renderOptions(
                fieldsMap["locationType"]?.options,
                loc.locationType ? loc.locationType : [],
              )}
            </div>
          </SimpleCard>
        ))}
      </CardList>
    </>
  );
}
