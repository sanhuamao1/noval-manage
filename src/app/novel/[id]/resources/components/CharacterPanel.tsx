"use client";

import { useState, useEffect } from "react";
import { AddButton } from "@/components/ui/button";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { EditorForm } from "@/components/ui/editor-form";
import { SimpleTabs } from "@/components/ui/tabs";
import { ConfigBadges } from "@/components/ui/config-badges";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { List, GitBranch } from "lucide-react";
import type { CharacterData } from "@/types";
import RelationCanvas from "../relation-canvas";

type ViewMode = "list" | "canvas";

const VIEW_MODES = [
  { key: "list", label: "列表视图", icon: <List className="h-3 w-3" /> },
  { key: "canvas", label: "画布视图", icon: <GitBranch className="h-3 w-3" /> },
];

export function CharacterPanel() {
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
  } = useEntityCrud(ConfigEntity.CHARACTER);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const showCanvas = viewMode === "canvas";

  // mode 变化时同步到全局 drawer store
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
            key={ConfigEntity.CHARACTER}
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
      <div className="mb-4 flex items-center justify-between">
        <SimpleTabs
          tabs={VIEW_MODES}
          value={viewMode}
          onChange={(k) => setViewMode(k as ViewMode)}
          variant="segment"
        />
        {!showCanvas && <AddButton onClick={openAdd} />}
      </div>

      {viewMode === "canvas" ? (
        <RelationCanvas onEditCharacter={openEdit} />
      ) : (
        <CardList emptyText="还没有人物，点击上方按钮添加">
          {items.map((char) => (
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
              <ConfigBadges<CharacterData>
                config={char}
                items={[
                  ["身份", "identity"],
                  ["叙事功能", "narrativeFunction"],
                  ["内在动机", "innerMotivation"],
                ]}
              />
            </SimpleCard>
          ))}
        </CardList>
      )}
    </>
  );
}
