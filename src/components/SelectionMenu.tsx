"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useMenuStore } from "@/stores/useMenuStore"
import { usePolishStore } from "@/stores/usePolishStore"

export function SelectionMenu() {
  const showSelectionMenu = useMenuStore((s) => s.showSelectionMenu);
  const selectionMenuPos = useMenuStore((s) => s.selectionMenuPos);
  const selectedText = useMenuStore((s) => s.selectedText);
  const handlePolishClick = usePolishStore((s) => s.handlePolishClick);

  if (!showSelectionMenu || !selectedText) return null

  return (
    <div
      className="fixed z-50 bg-background border rounded-lg shadow-lg p-1 mb-2"
      style={{
        left: selectionMenuPos.x,
        top: selectionMenuPos.y - 20
      }}
    >
      <Button variant="secondary" size="sm" className="gap-2 group" onClick={handlePolishClick}>
        <Sparkles className="w-4 h-4" />
        润色
      </Button>
    </div>
  )
}