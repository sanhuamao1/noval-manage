"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFactory } from "@/stores/useFactoryStore";

export interface CardSliderProps {
  /** 渲染单张卡片内容，index 为原始 operations 数组索引 */
  renderCard: (index: number) => ReactNode;
  /** 卡片下方自定义内容（如操作按钮） */
  handler?: ReactNode;
}

export function CardSlider({ renderCard, handler }: CardSliderProps) {
  const { drawerIndex, setDrawerIndex, opsCount, applying, discarded } = useFactory();

  const prevIndexRef = useRef<number>(drawerIndex ?? 0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // 有效的（未被舍弃的）索引列表
  const validIndices = useMemo(
    () => Array.from({ length: opsCount }, (_, i) => i).filter((i) => !discarded.has(i)),
    [opsCount, discarded],
  );

  // 当前有效索引在 validIndices 中的位置
  const currentValidIndex = drawerIndex !== null ? validIndices.indexOf(drawerIndex) : -1;
  const visibleCount = validIndices.length;

  // 找到下一个有效索引
  const findNextValid = useCallback(
    (current: number, delta: 1 | -1): number | null => {
      const pos = validIndices.indexOf(current);
      if (pos === -1) return validIndices[0] ?? null;
      const nextPos = pos + delta;
      if (nextPos < 0 || nextPos >= validIndices.length) return null;
      return validIndices[nextPos];
    },
    [validIndices],
  );

  const goto = useCallback(
    (next: number) => {
      setDirection(next > (drawerIndex ?? 0) ? "right" : "left");
      prevIndexRef.current = drawerIndex ?? 0;
      setDrawerIndex(next);
    },
    [drawerIndex, setDrawerIndex],
  );

  const isApplying = applying.size > 0;
  const isFirst = currentValidIndex === 0 || visibleCount <= 1;
  const isLast = currentValidIndex === visibleCount - 1 || visibleCount <= 1;

  // 当前选中的卡片已被舍弃，先往后找下一个有效索引，没有则往前
  if (drawerIndex !== null && discarded.has(drawerIndex) && visibleCount > 0) {
    let next: number | undefined;
    for (let i = drawerIndex + 1; i < opsCount; i++) {
      if (!discarded.has(i)) { next = i; break; }
    }
    if (next === undefined) {
      for (let i = drawerIndex - 1; i >= 0; i--) {
        if (!discarded.has(i)) { next = i; break; }
      }
    }
    if (next !== undefined) {
      setDrawerIndex(next);
      return null;
    }
  }

  if (visibleCount === 0 || drawerIndex === null || !validIndices.includes(drawerIndex)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">没有可显示的操作建议</p>
      </div>
    );
  }

  const leftTarget = findNextValid(drawerIndex, -1);
  const rightTarget = findNextValid(drawerIndex, 1);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 卡片 + 箭头 */}
      <div className="flex w-full items-center gap-4">
        {/* 左箭头 */}
        <button
          type="button"
          disabled={isFirst || isApplying}
          onClick={() => leftTarget !== null && goto(leftTarget)}
          className="shrink-0 rounded-full border border-border/60 bg-bg-800 p-2 text-muted-foreground transition-colors hover:bg-bg-700 hover:text-fg-primary disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* 卡片容器 */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            key={drawerIndex}
            className="animate-[cardFadeSlide_300ms_cubic-bezier(0.4, 0, 0.2, 1)]"
            style={{
              animationFillMode: "both",
              "--slide-x": direction === "right" ? "24px" : "-24px",
            } as React.CSSProperties}
          >
            {renderCard(drawerIndex)}
          </div>
        </div>

        {/* 右箭头 */}
        <button
          type="button"
          disabled={isLast || isApplying}
          onClick={() => rightTarget !== null && goto(rightTarget)}
          className="shrink-0 rounded-full border border-border/60 bg-bg-800 p-2 text-muted-foreground transition-colors hover:bg-bg-700 hover:text-fg-primary disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 进度指示器 */}
      {visibleCount > 1 && (
        <div className="flex items-center gap-1.5">
          {validIndices.map((origIdx) => (
            <span
              key={origIdx}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                origIdx === drawerIndex ? "w-4 bg-primary" : "w-1.5 bg-border/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* 底部自定义 handler */}
      {handler && <div className="w-full">{handler}</div>}

      {/* 自定义 keyframes */}
      <style>{`
        @keyframes cardFadeSlide {
          from {
            opacity: 0;
            transform: translateX(var(--slide-x, 24px));
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
