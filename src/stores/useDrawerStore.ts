import { create } from "zustand";
import type { ReactNode } from "react";

export interface DrawerConfig {
  content: ReactNode;
  title?: ReactNode;
  onCreate?: () => void;
  onUpdate?: () => void;
}

interface DrawerStore {
  isOpen: boolean;
  config: DrawerConfig | null;
  /** 面板侧的 close 回调，用于同步内部状态（如重置 mode） */
  _onClose: (() => void) | null;

  open: (config: DrawerConfig, onClose?: () => void) => void;
  close: () => void;
}

let closeTimer: ReturnType<typeof setTimeout> | null = null;

export const useDrawerStore = create<DrawerStore>((set, get) => ({
  isOpen: false,
  config: null,
  _onClose: null,

  open: (config, onClose) => {
    if (closeTimer) clearTimeout(closeTimer);
    set({ isOpen: true, config, _onClose: onClose ?? null });
  },

  close: () => {
    get()._onClose?.();
    set({ isOpen: false, _onClose: null });
    // 延迟清除 config，保留内容供关闭动画播放
    closeTimer = setTimeout(() => {
      set({ config: null });
    }, 300);
  },
}));
