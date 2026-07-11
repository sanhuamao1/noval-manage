"use client";

import { useState, useCallback } from "react";

interface UseDrawerReturn {
  open: boolean;
  setOpen: (v: boolean) => void;
  close: () => void;
}

export function useDrawer(initial = false): UseDrawerReturn {
  const [open, setOpen] = useState(initial);
  const close = useCallback(() => setOpen(false), []);
  return { open, setOpen, close };
}
