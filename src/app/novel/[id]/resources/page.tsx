"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AddButton } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { EditorForm } from "@/components/ui/editor-form";
import { SimpleTabs } from "@/components/ui/tabs";
import { ConfigBadges } from "@/components/ui/config-badges";
import { PageLayout } from "@/components/ui/page-layout";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { Users, Building2, MapPin, List, GitBranch } from "lucide-react";
import type { CharacterData, OrganizationData } from "@/types";
import RelationCanvas from "./relation-canvas";

type ViewMode = "list" | "canvas";

const TABS = [
  { key: ConfigEntity.CHARACTER, label: "人物", icon: <Users className="h-3.5 w-3.5" /> },
  { key: ConfigEntity.ORGANIZATION, label: "组织", icon: <Building2 className="h-3.5 w-3.5" /> },
  { key: ConfigEntity.LOCATION, label: "地点", icon: <MapPin className="h-3.5 w-3.5" /> },
];

const VIEW_MODES = [
  { key: "list", label: "列表视图", icon: <List className="h-3 w-3" /> },
  { key: "canvas", label: "画布视图", icon: <GitBranch className="h-3 w-3" /> },
];

export default function ResourcesPage() {
  const params = useParams();
  const novelId = params.id as string;

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
  } = useEntityCrud(ConfigEntity.CHARACTER);

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const isCharacter = currentEntity === ConfigEntity.CHARACTER;
  const isOrganization = currentEntity === ConfigEntity.ORGANIZATION;
  const showCanvas = isCharacter && viewMode === "canvas";

  const handleSwitchEntity = useCallback(
    (key: ConfigEntity) => {
      switchEntity(key);
      if (key !== ConfigEntity.CHARACTER) setViewMode("list");
    },
    [switchEntity],
  );

  const handleViewChange = (key: string) => {
    setViewMode(key as ViewMode);
  };

  return (
    <PageLayout
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
      header={
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SimpleTabs
              tabs={TABS}
              value={currentEntity}
              onChange={(key) => handleSwitchEntity(key as ConfigEntity)}
            />

            {isCharacter && (
              <SimpleTabs
                tabs={VIEW_MODES}
                value={viewMode}
                onChange={handleViewChange}
                variant="segment"
              />
            )}
          </div>

          <AddButton onClick={openAdd} />
        </div>
      }
    >
      {showCanvas && <RelationCanvas onEditCharacter={openEdit} />}

      {isCharacter && !showCanvas && (
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

      {isOrganization && (
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
      )}

      {!isCharacter && !isOrganization && (
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
      )}
    </PageLayout>
  );
}
