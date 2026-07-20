import type { CSSProperties } from "react"

/** 基础骨架块 */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[hsl(30_10%_18%)] ${className}`}
      style={style}
    />
  )
}

/** 文本行骨架 */
export function TextSkeleton({
  lines = 3,
  className = "",
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  )
}

/** 卡片骨架 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  )
}

/** 卡片列表骨架 */
export function CardListSkeleton({
  count = 6,
  className = "",
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/** 编辑器骨架 */
export function EditorSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton
              className="h-4 flex-1"
              style={{ opacity: 1 - i * 0.08, width: `${95 - i * 8}%` } as CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/** 列表页骨架（侧边栏 + 内容区） */
export function PageSkeleton() {
  return (
    <div className="flex h-full flex-1">
      {/* 侧边栏骨架 */}
      <div className="w-64 shrink-0 border-r border-border p-4">
        <div className="mb-4 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-md p-2.5">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3.5 flex-1" />
            </div>
          ))}
        </div>
      </div>
      {/* 内容区骨架 */}
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-7 w-1/4" />
        <CardListSkeleton count={4} />
      </div>
    </div>
  )
}

export default Skeleton
