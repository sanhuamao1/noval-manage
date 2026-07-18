"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  /** 页面标题 */
  title?: string;
  /** 标题下方的描述文字 */
  description?: string;
  /** 标题右侧操作区（如编辑/添加按钮） */
  handler?: ReactNode;
  /** 页面主内容区 */
  children?: ReactNode;
  /** 滑动抽屉 */
  drawer?: ReactNode;
}

export function PageLayout({ title, description, handler, children, drawer }: PageLayoutProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="mx-auto p-8 max-w-4xl w-full flex flex-col flex-1 min-h-0">
        {(title || handler) && (
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div>
              {title && <h1 className="text-3xl font-bold">{title}</h1>}
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {handler}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {drawer}
    </div>
  );
}
