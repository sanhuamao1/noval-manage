"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  /** 页面标题 */
  title?: string;
  /** 标题下方的描述文字 */
  description?: string;
  /** 标题右侧操作区（如编辑/添加按钮） */
  handler?: ReactNode;
  header?: ReactNode;
  /** 页面主内容区 */
  children?: ReactNode;
  /** 滑动抽屉 */
  drawer?: ReactNode;
}

export function PageLayout({
  title,
  header,
  description,
  handler,
  children,
  drawer,
}: PageLayoutProps) {
  return (
    <div className="relative h-full flex flex-1">
      <div className="flex flex-1 flex-col mx-auto h-full max-w-[900px]">
        <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col p-8">
          {(title || handler) && (
            <div className="mb-8 flex shrink-0 items-center justify-between">
              <div>
                {title && <h1 className="text-3xl font-bold">{title}</h1>}
                {description && <p className="mt-1 text-muted-foreground">{description}</p>}
              </div>
              {handler}
            </div>
          )}

          {header && <div className="mb-8 shrink-0">{header}</div>}

          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
      {drawer}
    </div>
  );
}
