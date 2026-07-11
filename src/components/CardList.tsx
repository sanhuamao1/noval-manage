import type { ReactNode } from "react";

interface CardListProps {
  emptyText: string;
  children: ReactNode;
  className?: string;
}

export function CardList({ emptyText, children, className }: CardListProps) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div className={className ?? "flex max-w-md flex-col gap-2"}>
      {isEmpty ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        children
      )}
    </div>
  );
}
