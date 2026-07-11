"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FormInput } from "@/components/form-input";
import { PenTool, AlertTriangle } from "lucide-react";
import { SAMPLE_CONFIG_SECTIONS, type SampleConfig } from "@/lib/configs/polish-defs";
import { renderSections } from "@/lib/configs/render-utils";

export interface SampleForm {
  name: string;
  prompt: string;
  config: SampleConfig;
}

export interface SampleEditorHandle {
  getData: () => SampleForm;
}

interface SampleEditorProps {
  initialName: string;
  initialPrompt: string;
  initialConfig: SampleConfig;
}

export const SampleEditor = forwardRef<SampleEditorHandle, SampleEditorProps>(function SampleEditor(
  { initialName, initialPrompt, initialConfig },
  ref,
) {
  const [name, setName] = useState(initialName);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [config, setConfig] = useState<SampleConfig>(initialConfig);

  useImperativeHandle(
    ref,
    () => ({
      getData: () => ({ name, prompt, config }),
    }),
    [name, prompt, config],
  );

  return (
    <>
      <div className="space-y-4">
          <FormInput
            label="样本标题"
            icon={PenTool}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：Boss 战节奏范本"
          />

          <FormInput
            label="提示/注释"
            icon={AlertTriangle}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="对样本的写作要点说明，如：注重短句和动作衔接"
          />
        {renderSections(
          SAMPLE_CONFIG_SECTIONS,
          config as unknown as Record<string, unknown>,
          (cfg) => setConfig({ ...config, ...(cfg as unknown as Partial<SampleConfig>) }),
        )}
      </div>
    </>
  );
});
