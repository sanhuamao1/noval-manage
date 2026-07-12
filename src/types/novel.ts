export interface NovelData {
  id: string;
  title: string;
  description: string | null;
  status?: string;
  genre?: string[];
  enablePreset?: boolean;
  presetStyle?: string;
  primaryTone?: string;
  secondaryTones?: string[];
  worldType?: string;
  worldShape?: string;
  wordCount?: number;
  _count?: { chapters: number; characters: number };
  createdAt: string;
  updatedAt: string;
}
