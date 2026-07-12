"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AddButton, SlidingDrawer, PageLayout, CardList, SimpleCard } from "@/components/ui";
import { renderSections } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
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
  const { fields, sections, defaults } = getEntry(ConfigEntity.CHARACTER);
  const [editorConfig, setEditorConfig] = useState<CharacterConfig>(defaults);

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
    setEditorConfig(fillConfig(char, defaults, fields));
  }

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setEditorConfig(defaults as CharacterConfig);
  }

  async function saveCharacter() {
    const name = String(editorConfig.name ?? "").trim();
    if (!name) return;

    const { id, novelId, createdAt, updatedAt, ...config } = editorConfig as any;

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
            {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
          </div>
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有人物，点击上方按钮添加">
        {characters.map((char) => {
          const cfg = fillConfig(char, defaults, fields);
          return (
            <SimpleCard
              key={char.id}
              title={char.name}
              selected={editingId === char.id}
              onClick={() => openForEdit(char)}
              onDelete={() => deleteCharacter(char.id)}
            >
              <ConfigBadges
                config={cfg}
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
