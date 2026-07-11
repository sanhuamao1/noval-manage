"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { AddButton } from "@/components/ui/button";
import { SlidingDrawer } from "@/components/ui/drawer";
import { PageLayout } from "@/components/PageLayout";
import { CardList } from "@/components/CardList";
import { SimpleCard } from "@/components/ui/card";
import { CharacterEditor, type CharacterEditorHandle } from "@/components/character/CharacterEditor";
import { parseConfig } from "@/lib/configs/config-utils";
import { ConfigBadges, buildConfigTags } from "@/lib/configs/render-utils";
import { DEFAULT_CHARACTER_CONFIG } from "@/lib/configs/character-defs";

interface Character {
  id: string;
  name: string;
  config: string | null;
}

export default function CharactersPage() {
  const params = useParams();
  const id = params.id as string;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editorRef = useRef<CharacterEditorHandle>(null);

  useEffect(() => {
    fetchCharacters();
  }, [id]);

  async function fetchCharacters() {
    const res = await fetch(`/api/characters?novelId=${id}`);
    const data = await res.json();
    setCharacters(data);
  }

  function openForEdit(char: Character) {
    setMode("edit");
    setEditingId(char.id);
  }

  function startCreate() {
    setMode("create");
    setEditingId(null);
  }

  async function saveCharacter() {
    if (!editorRef.current) return;
    const { name, config } = editorRef.current.getData();
    if (!name.trim()) return;

    if (mode === "create") {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId: id, name: name.trim(), config: JSON.stringify(config) }),
      });
      if (!res.ok) return;
      fetchCharacters();
    } else if (mode === "edit" && editingId) {
      const res = await fetch("/api/characters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, config: JSON.stringify(config) }),
      });
      if (!res.ok) return;
      fetchCharacters();
    }
    setMode(null);
    setEditingId(null);
  }

  async function deleteCharacter(charId: string) {
    if (!confirm("确定要删除这个人物吗？")) return;
    await fetch(`/api/characters?id=${charId}`, { method: "DELETE" });
    if (editingId === charId) {
      setMode(null);
      setEditingId(null);
    }
    fetchCharacters();
  }

  const editingChar = editingId ? characters.find((c) => c.id === editingId) ?? null : null;

  return (
    <PageLayout
      title="人物列表"
      handler={<AddButton onClick={startCreate} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={() => { setMode(null); setEditingId(null); }}
          width={890}
          onCreate={mode === "create" ? saveCharacter : undefined}
          onUpdate={mode === "edit" ? saveCharacter : undefined}
        >
          <CharacterEditor
            key={editingId ?? "create"}
            ref={editorRef}
            initialName={editingChar?.name ?? ""}
            initialConfig={parseConfig(editingChar?.config, DEFAULT_CHARACTER_CONFIG)}
          />
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有人物，点击上方按钮添加">
        {characters.map((char) => {
          const cfg = parseConfig(char.config, DEFAULT_CHARACTER_CONFIG);
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
