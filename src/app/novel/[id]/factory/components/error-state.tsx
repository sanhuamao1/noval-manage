"use client";

import { Button } from "@/components/ui";

export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="mb-1 font-medium text-destructive">生成失败</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          重试
        </Button>
      </div>
    </div>
  );
}
