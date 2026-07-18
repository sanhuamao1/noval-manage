"use client";

import { AddButton, SlidingDrawer, PageLayout, CardList, SimpleCard, EditorForm } from "@/components/ui";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";

export default function LocationsPage() {
  const {
    items: locations,
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
  } = useEntityCrud(ConfigEntity.LOCATION);

  return (
    <PageLayout
      title="地点列表"
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
      <CardList emptyText="还没有地点，点击上方按钮添加">
        {locations.map((loc) => {
          return (
            <SimpleCard
              key={loc.id}
              title={loc.name}
              selected={editingId === loc.id}
              onClick={() => openEdit(loc)}
              onDelete={() => deleteItem(loc.id)}
            >
              <div className="space-x-2">
                {renderOptions(fieldsMap["locationType"]?.options, loc.locationType ? [loc.locationType] : [])}
              </div>
            </SimpleCard>
          );
        })}
      </CardList>
    </PageLayout>
  );
}
