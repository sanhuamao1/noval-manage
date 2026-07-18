import { create } from "zustand";
import { usePolishStore } from "./usePolishStore";

interface SelectionRange {
  start: number;
  end: number;
}

// 模块级变量，用于缓存鼠标位置（非 React ref）
let mousePos = { x: 0, y: 0 };

interface MenuStore {
  selectedText: string;
  selectionRange: SelectionRange | null;
  showSelectionMenu: boolean;
  selectionMenuPos: { x: number; y: number };

  handleTextSelection: (editContent: string, editorRef: React.RefObject<HTMLTextAreaElement | null>) => void;
  handleTextareaMouseUp: (
    e: React.MouseEvent<HTMLTextAreaElement>,
    editContent: string,
    editorRef: React.RefObject<HTMLTextAreaElement | null>,
  ) => void;
  hideMenu: () => void;
  resetMenu: () => void;
  /** 将当前选中范围替换为 replacement */
  replaceSelection: (editContent: string, replacement: string, setEditContent: (v: string) => void) => void;
  confirmPolish: (editContent: string, setEditContent: (v: string) => void) => void;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  selectedText: "",
  selectionRange: null,
  showSelectionMenu: false,
  selectionMenuPos: { x: 0, y: 0 },

  handleTextSelection: (editContent, editorRef) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end || start === null || end === null) {
      set({
        showSelectionMenu: false,
        selectedText: "",
        selectionRange: null,
      });
      return;
    }

    const text = editContent.substring(start, end);
    if (!text.trim()) {
      set({
        showSelectionMenu: false,
        selectedText: "",
        selectionRange: null,
      });
      return;
    }

    set({
      selectedText: text,
      selectionRange: { start, end },
      selectionMenuPos: mousePos,
      showSelectionMenu: true,
    });
  },

  handleTextareaMouseUp: (e, editContent, editorRef) => {
    mousePos = { x: e.clientX, y: e.clientY };
    get().handleTextSelection(editContent, editorRef);
  },

  hideMenu: () => {
    set({ showSelectionMenu: false });
  },
  resetMenu: () => {
    set({
      showSelectionMenu: false,
      selectedText: "",
      selectionRange: null,
    });
  },

  replaceSelection: (editContent, replacement, setEditContent) => {
    const { selectionRange } = get();
    if (selectionRange && replacement) {
      setEditContent(
        editContent.substring(0, selectionRange.start) +
        replacement +
        editContent.substring(selectionRange.end),
      );
    }
  },

  confirmPolish: (editContent, setEditContent) => {
    const { polishResult } = usePolishStore.getState();
    get().replaceSelection(editContent, polishResult, setEditContent);
    usePolishStore.setState({ showResultPopover: false });
    get().resetMenu();
  },
}));
