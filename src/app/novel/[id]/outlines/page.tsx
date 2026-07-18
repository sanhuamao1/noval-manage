"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { AddButton, SlidingDrawer, PageLayout, CardList, SimpleCard, EditorForm } from "@/components/ui";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { useAppStore } from "@/stores/useAppStore";
import type { OutlineData } from "@/types/data";
import { api } from "@/lib/api";

export default function OutlinesPage() {
  const params = useParams();
  const novelId = params.id as string;
  const setOutlines = useAppStore((s) => s.setOutlines);

  // ── 初始加载 outlines（store.init 不包含 outlines）──
  useEffect(() => {
    api<OutlineData[]>({ url: `/api/outlines?novelId=${novelId}` }).then(setOutlines);
  }, [novelId, setOutlines]);

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
