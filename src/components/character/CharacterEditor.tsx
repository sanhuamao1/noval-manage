"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { renderSections } from "@/lib/configs/render-utils";
import { CHARACTER_CONFIG_SECTIONS, type CharacterConfig } from "@/lib/configs/character-defs";

export interface CharacterEditorHandle {
  getData: () => { name: string; config: Omit<CharacterConfig, "name" | "prompt"> };
}

interface CharacterEditorProps {
  initialName: string;
  initialConfig: CharacterConfig;
}

export const CharacterEditor = forwardRef<CharacterEditorHandle, CharacterEditorProps>(
  function CharacterEditor({ initialName, initialConfig }, ref) {
    const [config, setConfig] = useState<CharacterConfig>(() => ({
      ...initialConfig,
      name: initialName,
    }));

    useImperativeHandle(
      ref,
      (): CharacterEditorHandle => ({
        getData: () => {
          const { name, ...configData } = config;
          return { name: name ?? "", config: configData };
        },
      }),
      [config],
    );

    return (
      <>
        {renderSections(
          CHARACTER_CONFIG_SECTIONS,
          config as unknown as Record<string, unknown>,
          (c) => setConfig(c as unknown as CharacterConfig),
        )}
      </>
    );
  },
);
