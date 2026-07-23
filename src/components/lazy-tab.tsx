"use client";

import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

/**
 * 创建一个懒加载的 tab 内容块。
 * 仅当被渲染时才触发 import（基于 React.lazy），
 * 包一层 Suspense 以显示 fallback。
 *
 * 用法：
 * ```tsx
 * const TAB_CONTENT = {
 *   "tab-a": lazyTab(() => import("./TabA"), <Skeleton />),
 *   "tab-b": lazyTab(() => import("./TabB"), <Skeleton />),
 * };
 *
 * <div>{TAB_CONTENT[activeTab]}</div>
 * ```
 */
export function lazyTab(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: ReactNode,
): ReactNode {
  const LazyComp = lazy(importFn);
  return (
    <Suspense fallback={fallback ?? null}>
      <LazyComp />
    </Suspense>
  );
}
