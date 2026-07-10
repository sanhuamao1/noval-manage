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

function SlidingDrawer({ open, onClose, width = 680, title, onCreate, onUpdate, rightHandler, children }: SlidingDrawerProps) {
  const bookmarkBtnClass =
    "w-8 h-8 flex items-center justify-center rounded-l-lg shadow-md transition-opacity"

  return (
    <div className="relative flex-shrink-0 border-l">
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
          "overflow-hidden transition-[width,opacity] duration-300 ease-out",
          open ? "opacity-100" : "w-0 opacity-0 ",
        )}
        style={{ width: open ? width : 0 }}
      >
        <div
          className="h-full overflow-auto p-6"
          style={{ width }}
        >
          {open ? (
            <div className="space-y-6">
              {(title || rightHandler) && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">{title}</div>
                  {rightHandler && <div className="flex items-center gap-2 flex-shrink-0">{rightHandler}</div>}
                </div>
              )}
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

SlidingDrawer.displayName = "SlidingDrawer"

export { SlidingDrawer }
export type { SlidingDrawerProps }
