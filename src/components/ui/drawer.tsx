"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, SavePlus, SaveCheck } from "lucide-react"

interface SlidingDrawerProps {
  open: boolean
  onClose?: () => void
  width?: number
  title?: React.ReactNode
  /** 传入则显示「创建」按钮（SavePlus 图标） */
  onCreate?: () => void
  /** 传入则显示「更新」按钮（SaveCheck 图标） */
  onUpdate?: () => void
  /** 标题栏右侧扩展内容 */
  rightHandler?: React.ReactNode
  children?: React.ReactNode
}

function SlidingDrawer({ open, onClose, width = 620, title, onCreate, onUpdate, rightHandler, children }: SlidingDrawerProps) {
  const bookmarkBtnClass =
    "w-8 h-8 flex items-center justify-center rounded-l-lg shadow-md transition-opacity"

  return (
    <div className={cn("relative flex-shrink-0 h-full border-l border-border-subtle bg-bg-800/50", open && "ml-8")}>
      {/* 书签式按钮组 */}
      {open && (onClose || onCreate || onUpdate) && (
        <div className="absolute -left-4 top-8 -translate-x-1/2 z-10 flex flex-col gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`${bookmarkBtnClass} bg-muted text-muted-foreground hover:bg-muted/80`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className={`${bookmarkBtnClass} bg-primary text-primary-foreground hover:opacity-90`}
            >
              <SavePlus className="w-4 h-4" />
            </button>
          )}
          {onUpdate && (
            <button
              type="button"
              onClick={onUpdate}
              className={`${bookmarkBtnClass} bg-primary text-primary-foreground hover:opacity-90`}
            >
              <SaveCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          "overflow-hidden transition-[width,opacity] duration-300 ease-out h-full",
          open ? "opacity-100" : "w-0 opacity-0 ",
        )}
        style={{ width: open ? width : 0 }}
      >
        <div
          className="h-full flex flex-col mt-6"
          style={{ width }}
        >
          {open ? (
            <>
              {(title || rightHandler) && (
                <div className="flex items-center justify-between gap-4 flex-shrink-0 mb-2 px-6">
                  <div className="flex items-center gap-2 text-lg font-semibold">{title}</div>
                  {rightHandler && <div className="flex items-center gap-2 flex-shrink-0">{rightHandler}</div>}
                </div>
              )}
              <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden space-y-6 px-6">
                {children}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

SlidingDrawer.displayName = "SlidingDrawer"

export { SlidingDrawer }
export type { SlidingDrawerProps }
