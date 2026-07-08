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
  const { handleTextSelection } = usePolishContext()

  return (
    <Textarea
      ref={editorRef}
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      onMouseUp={handleTextSelection}
      onKeyUp={handleTextSelection}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          const textarea = e.currentTarget
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newValue = editContent.substring(0, start) + "    " + editContent.substring(end)
          setEditContent(newValue)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 4
          })
        }
      }}
      className="min-h-full border-0 resize-none focus-visible:ring-0 text-base leading-relaxed mx-auto max-w-[800px]"
      placeholder="开始写作..."
    />
  )
}