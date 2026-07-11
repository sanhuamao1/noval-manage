"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  /** 页面标题 */
  title: string;
  /** 标题右侧操作区（如编辑按钮） */
  handler?: ReactNode;
  /** 页面主内容区 */
  children?: ReactNode;
  /** 滑动抽屉 */
  drawer?: ReactNode;
}

export function PageLayout({ title, handler, children, drawer }: PageLayoutProps) {
  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 overflow-auto p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* 顶部标题行 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{title}</h1>
              {handler}
            </div>
          </div>

          {children}
        </div>
      </div>

      {drawer}
    </div>
  );
}
