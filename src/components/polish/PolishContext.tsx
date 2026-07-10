"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
  config: string | null
}

interface SelectionRange {
  start: number
  end: number
}

interface PolishContextType {
  showSelectionMenu: boolean
  selectionMenuPos: { x: number; y: number }
  selectedText: string

  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  activeTab: string | null
  setActiveTab: (tab: string | null) => void

  rules: PolishRule[]
  selectedRuleId: string
  polishing: boolean
  polishError: string

  polishResult: string
  setPolishResult: (val: string) => void
  showResultPopover: boolean

  handleTextSelection: () => void
  handleTextareaMouseUp: (e: React.MouseEvent<HTMLTextAreaElement>) => void
  handlePolishClick: () => void
  executePolish: (ruleId: string) => Promise<void>
  confirmPolish: () => void
  cancelPolish: () => void
  reset: () => void
}

const PolishContext = createContext<PolishContextType | null>(null)

export function usePolishContext() {
  const ctx = useContext(PolishContext)
  if (!ctx) throw new Error("usePolishContext must be used within PolishProvider")
  return ctx
}

interface PolishProviderProps {
  children: React.ReactNode
  editContent: string
  setEditContent: (val: string) => void
  editorRef: React.RefObject<HTMLTextAreaElement>
}

export function PolishProvider({ children, editContent, setEditContent, editorRef }: PolishProviderProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [rules, setRules] = useState<PolishRule[]>([])
  const [selectedRuleId, setSelectedRuleId] = useState("")
  const [polishing, setPolishing] = useState(false)
  const [polishResult, setPolishResult] = useState("")
  const [polishError, setPolishError] = useState("")
  const [showResultPopover, setShowResultPopover] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null)
  const [showSelectionMenu, setShowSelectionMenu] = useState(false)
  const [selectionMenuPos, setSelectionMenuPos] = useState({ x: 0, y: 0 })

  const resultRef = useRef<HTMLDivElement>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    fetchRules()
  }, [])

  // 监听全局选中状态变化：选中消失时隐藏菜单，但不清空选中文本（防止点击面板时丢失）
  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        if (showSelectionMenu) {
          setShowSelectionMenu(false)
        }
      }
    }
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [showSelectionMenu])

  async function fetchRules() {
    try {
      const res = await fetch("/api/polish/rules")
      const data = await res.json()
      setRules(data)
    } catch {}
  }

  const handleTextSelection = useCallback(() => {
    const textarea = editorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end || start === null || end === null) {
      setShowSelectionMenu(false)
      setSelectedText("")
      setSelectionRange(null)
      return
    }

    const text = editContent.substring(start, end)
    if (!text.trim()) {
      setShowSelectionMenu(false)
      setSelectedText("")
      setSelectionRange(null)
      return
    }

    setSelectedText(text)
    setSelectionRange({ start, end })
    setSelectionMenuPos(mousePosRef.current)
    setShowSelectionMenu(true)
  }, [editContent, editorRef])

  const handleTextareaMouseUp = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY }
    handleTextSelection()
  }, [handleTextSelection])

  function handlePolishClick() {
    setShowSelectionMenu(false)
    setPanelOpen(true)
    setActiveTab("polish")
    setShowResultPopover(false)
    setPolishResult("")
    setSelectedRuleId("")
    setPolishError("")
  }

  async function executePolish(ruleId: string) {
    if (!selectedText.trim()) return

    setSelectedRuleId(ruleId)
    setPolishing(true)
    setPolishError("")
    setPolishResult("")

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, text: selectedText }),
      })
      const data = await res.json()
      if (data.error) {
        setPolishError(data.error)
      } else {
        setPolishResult(data.polishedText)
        setShowResultPopover(true)
      }
    } catch (err: any) {
      setPolishError(err.message || "润色失败")
    } finally {
      setPolishing(false)
    }
  }

  function confirmPolish() {
    if (selectionRange && polishResult) {
      const newContent =
        editContent.substring(0, selectionRange.start) +
        polishResult +
        editContent.substring(selectionRange.end)
      setEditContent(newContent)
    }
    setShowResultPopover(false)
    setSelectionRange(null)
    setSelectedText("")
  }

  function cancelPolish() {
    setShowResultPopover(false)
  }

  function reset() {
    setPanelOpen(false)
    setShowResultPopover(false)
    setShowSelectionMenu(false)
    setSelectionRange(null)
    setSelectedText("")
    setPolishResult("")
    setSelectedRuleId("")
    setPolishError("")
  }

  return (
    <PolishContext.Provider
      value={{
        showSelectionMenu,
        selectionMenuPos,
        selectedText,
        panelOpen,
        setPanelOpen,
        activeTab,
        setActiveTab,
        rules,
        selectedRuleId,
        polishing,
        polishError,
        polishResult,
        showResultPopover,
        setPolishResult,
        handleTextSelection,
        handleTextareaMouseUp,
        handlePolishClick,
        executePolish,
        confirmPolish,
        cancelPolish,
        reset,
      }}
    >
      {children}
    </PolishContext.Provider>
  )
}