"use client";

import { PolishPanel } from "./PolishPanel";

// ── 后续可在此扩展：大纲面板、事件面板 ──
// import { OutlinePanel } from "./OutlinePanel";
// import { EventPanel } from "./EventPanel";

const TOOLS = [
  { key: "polish", component: PolishPanel },
  // { key: "outline", component: OutlinePanel },
  // { key: "event", component: EventPanel },
] as const;

/**
 * 工具面板容器
 *
 * 组合润色/大纲/事件等面板。
 * 每个面板独立获取数据（SWR），互不干扰。
 * 后续新增面板只需在 TOOLS 数组中注册即可。
 */
export function ToolPanel() {
  return (
    <>
      {TOOLS.map((tool) => {
        const Component = tool.component;
        return <Component key={tool.key} />;
      })}
    </>
  );
}
