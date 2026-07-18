import type { ReactNode } from "react";
import { BookOpen } from 'lucide-react'

interface CardListProps {
  emptyText: string;
  children: ReactNode;
}

export function CardList({ emptyText, children }: CardListProps) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
   
      isEmpty ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">还没有内容</h2>
          <p className="text-muted-foreground mb-6">{emptyText}</p>
        </div>

      ) : (
         <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
        {children}
          </div>
      )
  
  );
}
