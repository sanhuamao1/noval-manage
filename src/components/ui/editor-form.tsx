"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { renderSections } from "@/lib/configs/render-utils";
import type { ConfigSection } from "@/types";

/**
 * 暴露给父组件的操作接口
 */
export interface EditorFormHandle {
  /** 获取当前表单完整数据 */
  getData: () => Record<string, any>;
  /** 外部写入数据（编辑时填充已有记录） */
  setData: (data: Record<string, any>) => void;
  /** 重置为初始默认值 */
  reset: () => void;
}

interface EditorFormProps {
  sections: ConfigSection[];
  defaults: Record<string, any>;
  /** 可选：供 tagselect 等字段查询关联实体数据 */
  novelId?: string;
}

/**
 * 编辑器表单 — 内部自管状态，父组件通过 ref 读写
 */
export const EditorForm = forwardRef<EditorFormHandle, EditorFormProps>(
  function EditorForm({ sections, defaults, novelId }, ref) {
    const [config, setConfig] = useState<Record<string, any>>(defaults);

    useImperativeHandle(ref, () => ({
      getData: () => config,
      setData: (data) => setConfig(data),
      reset: () => setConfig(defaults),
    }));

    return (
      <div className="space-y-4">
        {renderSections(sections, config, (c) => setConfig(c as Record<string, any>), novelId)}
      </div>
    );
  },
);
