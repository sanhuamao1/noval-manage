"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AddButton, SlidingDrawer, PageLayout, CardList, SimpleCard } from "@/components/ui";
import { renderSections, ConfigBadges, buildConfigTags } from "@/lib/configs/render-utils";
import { getEntry, fillConfig, ConfigEntity } from "@/lib/configs/config-registry";
import type { CharacterConfig } from "@/lib/configs/generated";
import { api } from "@/lib/api";

interface Character {
  id: string;
  name: string;
  [key: string]: unknown;
}

export default function CharactersPage() {
  const params = useParams();
  const id = params.id as string;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { sections: charSections, defaults: charDefaults } = getEntry(ConfigEntity.CHARACTER);
  const [editorConfig, setEditorConfig] = useState<CharacterConfig>(charDefaults);

  useEffect(() => {
    fetchCharacters();
  }, [id]);

  async function fetchCharacters() {
    const data = await api<Character[]>({ url: `/api/characters?novelId=${id}` });
    setCharacters(data);
  }

  function openForEdit(char: Character) {
    setMode("edit");
    setEditingId(char.id);
    setEditorConfig(fillConfig(ConfigEntity.CHARACTER, char as Record<string, unknown>));
  }

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setEditorConfig(charDefaults as CharacterConfig);
  }

  async function saveCharacter() {
    const name = String(editorConfig.name ?? "").trim();
    if (!name) return;

    const { id: _, novelId: __, createdAt: ___, updatedAt: ____, ...config } = editorConfig as any;

    if (mode === "create") {
      await api({
        url: "/api/characters",
        method: "POST",
        data: { novelId: id, name, ...config },
      });
      fetchCharacters();
    } else if (mode === "edit" && editingId) {
      await api({
        url: "/api/characters",
        method: "PUT",
        data: { id: editingId, novelId: id, ...config },
      });
      fetchCharacters();
    }
    setMode(null);
    setEditingId(null);
  }

  async function deleteCharacter(charId: string) {
    if (!confirm("确定要删除这个人物吗？")) return;
    await api({ url: `/api/characters?id=${charId}&novelId=${id}`, method: "DELETE" });
    if (editingId === charId) {
      setMode(null);
      setEditingId(null);
    }
    fetchCharacters();
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
            {renderSections(charSections, editorConfig, (c) => setEditorConfig(c))}
          </div>
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有人物，点击上方按钮添加">
        {characters.map((char) => {
          const cfg = fillConfig(ConfigEntity.CHARACTER, char as Record<string, unknown>);
          return (
            <SimpleCard
              key={char.id}
              title={char.name}
              selected={editingId === char.id}
              onClick={() => openForEdit(char)}
              onDelete={() => deleteCharacter(char.id)}
            >
              <ConfigBadges
                tags={buildConfigTags(cfg, [
                  ["性别", "gender"],
                  ["年龄", "age"],
                  ["身份", "identity"],
                  ["叙事功能", "narrativeFunction"],
                  ["内在动机", "innerMotivation"],
                ])}
              />
            </SimpleCard>
          );
        })}
      </CardList>
    </PageLayout>
  );
}
