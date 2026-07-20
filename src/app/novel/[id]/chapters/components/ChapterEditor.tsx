"use client"

import { Textarea } from "@/components/ui/textarea"
import { useMenuStore } from "@/stores/useMenuStore"

interface ChapterEditorProps {
  editContent: string
  setEditContent: (val: string) => void
  editorRef: React.RefObject<HTMLTextAreaElement>
}

export function ChapterEditor({ editContent, setEditContent, editorRef }: ChapterEditorProps) {
  const handleTextSelection = useMenuStore((s) => s.handleTextSelection);
  const handleTextareaMouseUp = useMenuStore((s) => s.handleTextareaMouseUp);

  return (
    <Textarea
      ref={editorRef}
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      onMouseUp={(e) => handleTextareaMouseUp(e, editContent, editorRef)}
      onKeyUp={() => handleTextSelection(editContent, editorRef)}
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
      className="min-h-full border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-transparent focus:outline-none text-base leading-relaxed text-foreground/85 font-serif mx-auto max-w-[800px] [tab-size:4]"
      placeholder="开始写作..."
    />
  )
}