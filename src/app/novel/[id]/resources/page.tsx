"use client";

import {
  AddButton,
  SlidingDrawer,
  CardList,
  SimpleCard,
  EditorForm,
  SimpleTabs,
  ConfigBadges,
  PageLayout,
} from "@/components/ui";
import { renderOptions } from "@/lib/configs/render-utils";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { Users, Building2, MapPin } from "lucide-react";
import type { CharacterConfig, OrganizationConfig, PolishRuleConfig } from "@/types";

const TABS = [
  { key: ConfigEntity.CHARACTER, label: "人物", icon: <Users className="h-3.5 w-3.5" /> },
  { key: ConfigEntity.ORGANIZATION, label: "组织", icon: <Building2 className="h-3.5 w-3.5" /> },
  { key: ConfigEntity.LOCATION, label: "地点", icon: <MapPin className="h-3.5 w-3.5" /> },
];

export default function ResourcesPage() {
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

  const isCharacter = currentEntity === ConfigEntity.CHARACTER;
  const isOrganization = currentEntity === ConfigEntity.ORGANIZATION;

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
    >
      <div className="flex justify-between mb-4">
        <SimpleTabs
        tabs={TABS}
        value={currentEntity}
        onChange={(key) => switchEntity(key as ConfigEntity)}
      />
      <AddButton onClick={openAdd} />
      </div>
      {/* ── 人物 ── */}
      {isCharacter && (
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
              <ConfigBadges<CharacterConfig>
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

      {/* ── 组织 ── */}
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
              <ConfigBadges<OrganizationConfig>
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

      {/* ── 地点 ── */}
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
                  loc.locationType ? [loc.locationType] : [],
                )}
              </div>
            </SimpleCard>
          ))}
        </CardList>
      )}
    </PageLayout>
  );
}
