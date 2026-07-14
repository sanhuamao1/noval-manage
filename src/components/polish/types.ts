import type { ReactNode } from "react";

export interface DrawerProps {
  title: string;
  onCreate?: () => Promise<void>;
  onUpdate?: () => Promise<void>;
  children: ReactNode;
  onClose: () => void;
}