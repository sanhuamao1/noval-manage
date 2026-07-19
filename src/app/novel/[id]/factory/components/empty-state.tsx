"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export interface EmptyStateProps {
  children: ReactNode;
}

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-muted-foreground">
          点击右上角
          <Sparkles className="mx-1 inline h-3.5 w-3.5" />
          {children}
        </p>
      </div>
    </div>
  );
}
