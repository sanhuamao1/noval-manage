"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AddButton, SlidingDrawer, PageLayout, CardList, SimpleCard } from "@/components/ui";
import { renderSections } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { CharacterConfig, CharacterData } from "@/types";

export default function CharactersPage() {
  const params = useParams();
  const id = params.id as string;
  const characters = useAppStore((s) => s.characters);
  const mutate = useAppStore((s) => s.mutate);

  const { fields, sections, defaults } = getEntry(ConfigEntity.CHARACTER);
  const [editorConfig, setEditorConfig] = useState<CharacterConfig>(defaults);

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function openForEdit(char: CharacterData) {
    setMode("edit");
    setEditingId(char.id);
    setEditorConfig(fillConfig<CharacterData, CharacterConfig>(char, defaults, fields));
  }

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setEditorConfig(defaults);
  }

  async function saveCharacter() {
    const name = String(editorConfig.name ?? "").trim();
    if (!name) return;

    if (mode === "create") {
      await mutate(id, "characters", async () => {
        await api({
          url: "/api/characters",
          method: "POST",
          data: { novelId: id, name, ...editorConfig },
        });
      });
    } else if (mode === "edit" && editingId) {
      await mutate(id, "characters", async () => {
        await api({
          url: "/api/characters",
          method: "PUT",
          data: { id: editingId, novelId: id, ...editorConfig },
        });
      });
    }
    setMode(null);
    setEditingId(null);
  }

  async function deleteCharacter(charId: string) {
    if (!confirm("确定要删除这个人物吗？")) return;
    await mutate(id, "characters", async () => {
      await api({ url: `/api/characters?id=${charId}&novelId=${id}`, method: "DELETE" });
    });
    if (editingId === charId) {
      setMode(null);
      setEditingId(null);
    }
  }

  return (
    <PageLayout
      title="人物列表"
      handler={<AddButton onClick={startCreate} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={() => {
            setMode(null);
            setEditingId(null);
          }}
          width={890}
          onCreate={mode === "create" ? saveCharacter : undefined}
          onUpdate={mode === "edit" ? saveCharacter : undefined}
        >
          <div className="space-y-4">
            {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
          </div>
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
              onClick={() => openForEdit(char)}
              onDelete={() => deleteCharacter(char.id)}
            >
              <ConfigBadges
                config={char}
                items={[
                  ["性别", "gender"],
                  ["年龄", "age"],
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
