"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormInput } from "@/components/form-input";
import { type PolishConfig, CONFIG_SECTIONS } from "@/lib/configs/polish-defs";
import { renderSections } from "@/lib/configs/render-utils";
import { PenTool, FileText } from "lucide-react";

export interface PolishRuleForm {
  name: string;
  description: string;
  prompt: string;
  config: PolishConfig;
}

export interface PolishRuleEditorHandle {
  getData: () => PolishRuleForm;
}

interface PolishRuleEditorProps {
  initialName: string;
  initialDescription: string;
  initialPrompt: string;
  initialConfig: PolishConfig;
}

export const PolishRuleEditor = forwardRef<PolishRuleEditorHandle, PolishRuleEditorProps>(
  function PolishRuleEditor({ initialName, initialDescription, initialPrompt, initialConfig }, ref) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [config, setConfig] = useState<PolishConfig>(initialConfig);

    useImperativeHandle(ref, () => ({
      getData: () => ({ name, description, prompt, config }),
    }), [name, description, prompt, config]);

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="规则名称"
            icon={PenTool}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：口语化→书面化"
          />
          <FormInput
            label="规则描述"
            icon={FileText}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简单描述这个规则的作用"
          />
        </div>

        <div className="space-y-1.5">
          <Label>自定义补充说明</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="可在此补充额外的润色要求..."
            rows={2}
          />
        </div>

        <div className="border-t pt-4">
          <div className="space-y-4">
            {renderSections(CONFIG_SECTIONS, config, (cfg) => setConfig({ ...config, ...cfg }))}
          </div>
        </div>
      </>
    );
  },
);
