"use client"

import { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { usePolishContext } from "@/components/polish/PolishContext"

interface ChapterEditorProps {
  editContent: string
  setEditContent: (val: string) => void
  editorRef: React.RefObject<HTMLTextAreaElement>
}

export function ChapterEditor({ editContent, setEditContent, editorRef }: ChapterEditorProps) {
  const { handleTextSelection, handleTextareaMouseUp } = usePolishContext()

  return (
    <Textarea
      ref={editorRef}
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      onMouseUp={handleTextareaMouseUp}
      onKeyUp={handleTextSelection}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          const textarea = e.currentTarget
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newValue = editContent.substring(0, start) + "\t" + editContent.substring(end)
          setEditContent(newValue)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1
          })
        }
      }}
      className="min-h-full border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-transparent focus:outline-none text-base leading-relaxed text-foreground/85 font-serif mx-auto max-w-[800px] [tab-size:4] [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none" } as React.CSSProperties}
      placeholder="开始写作..."
    />
  )
}