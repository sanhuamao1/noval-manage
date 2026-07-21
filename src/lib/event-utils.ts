/**
 * 事件工具函数 — 类型图标/颜色映射
 */

export const EVENT_TYPE_COLORS: Record<string, string> = {
  "关键剧情": "#ef4444",
  "日常": "#eab308",
  "转折": "#8b5cf6",
  "战斗": "#dc2626",
  "感情": "#ec4899",
  "伏笔揭示": "#14b8a6",
};

export const EVENT_TYPE_STYLES: Record<string, { icon: string; color: string; bg: string; hex: string }> = {
  "关键剧情": { icon: "Star", color: "text-red-500", bg: "bg-red-500/10", hex: "#ef4444" },
  "日常": { icon: "Sun", color: "text-yellow-500", bg: "bg-yellow-500/10", hex: "#eab308" },
  "转折": { icon: "GitFork", color: "text-violet-500", bg: "bg-violet-500/10", hex: "#8b5cf6" },
  "战斗": { icon: "Swords", color: "text-red-600", bg: "bg-red-600/10", hex: "#dc2626" },
  "感情": { icon: "Heart", color: "text-pink-500", bg: "bg-pink-500/10", hex: "#ec4899" },
  "伏笔揭示": { icon: "Lightbulb", color: "text-teal-500", bg: "bg-teal-500/10", hex: "#14b8a6" },
};

export const EVENT_STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "已规划": { color: "text-gray-500", bg: "bg-gray-500/10" },
  "进行中": { color: "text-blue-500", bg: "bg-blue-500/10" },
  "已完成": { color: "text-green-500", bg: "bg-green-500/10" },
  "已弃用": { color: "text-red-500", bg: "bg-red-500/10" },
};

export const CONNECTION_TYPE_STYLES: Record<string, { color: string; label: string }> = {
  "导致": { color: "#3b82f6", label: "导致" },
  "铺垫揭示": { color: "#8b5cf6", label: "铺垫揭示" },
  "平行对照": { color: "#10b981", label: "平行对照" },
  "对比": { color: "#f97316", label: "对比" },
};

export function getEventTypeStyle(type: string | null | undefined) {
  if (!type) return { icon: "Circle", color: "text-gray-400", bg: "bg-gray-500/5", hex: "#9ca3af" };
  return EVENT_TYPE_STYLES[type] ?? { icon: "Circle", color: "text-gray-400", bg: "bg-gray-500/5", hex: "#9ca3af" };
}

export function getEventStatusStyle(status: string | null | undefined) {
  if (!status) return { color: "text-gray-500", bg: "bg-gray-500/10" };
  return EVENT_STATUS_STYLES[status] ?? { color: "text-gray-500", bg: "bg-gray-500/10" };
}

export function getConnectionTypeStyle(type: string | null | undefined) {
  if (!type) return { color: "#6b7280", label: "关联" };
  return CONNECTION_TYPE_STYLES[type] ?? { color: "#6b7280", label: type };
}
