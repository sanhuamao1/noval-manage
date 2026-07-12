import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import type { PolishRule, PolishSample } from "@/types/polish"
import { api } from "@/lib/api"

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

  // 风格样本
  samples: PolishSample[]
  selectedSampleIds: string[]
  toggleSampleId: (id: string) => void

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
  const [samples, setSamples] = useState<PolishSample[]>([])
  const [selectedRuleId, setSelectedRuleId] = useState("")
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([])
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
    fetchAllRules()
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

  async function fetchAllRules() {
    try {
      const [rulesData, samplesData] = await Promise.all([
        api<PolishRule[]>({ url: "/api/polish/rules" }),
        api<PolishSample[]>({ url: "/api/polish/samples" }),
      ])
      setRules(rulesData)
      setSamples(samplesData)
    } catch {}
  }

  const toggleSampleId = useCallback((id: string) => {
    setSelectedSampleIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }, [])

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
    setSelectedSampleIds([])
    setPolishError("")
  }

  async function executePolish(ruleId: string) {
    if (!selectedText.trim()) return

    setSelectedRuleId(ruleId)
    setPolishing(true)
    setPolishError("")
    setPolishResult("")

    const body: Record<string, unknown> = { text: selectedText }

    if (ruleId) {
      body.type = "rule"
      body.ruleId = ruleId
    } else if (selectedSampleIds.length > 0) {
      body.type = "sample"
      body.sampleIds = selectedSampleIds
    }

    try {
      const data = await api<{ error?: string; polishedText?: string }>({
        url: "/api/polish",
        method: "POST",
        data: body,
      })
      if (data.error) {
        setPolishError(data.error)
      } else {
        setPolishResult(data.polishedText ?? "")
        setShowResultPopover(true)
        // 刷新数据
        fetchAllRules()
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
    setSelectedSampleIds([])
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
        samples,
        selectedSampleIds,
        toggleSampleId,
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
