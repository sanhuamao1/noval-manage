/** API 返回的事件节点数据 */
export interface EventNodeData {
  id: string;
  novelId: string;
  title: string;
  description?: string | null;
  content?: string | null;
  storyTime?: string | null;
  eventType?: string | null;
  status?: string | null;
  importance?: number | null;
  characterIds?: string[];
  locationIds?: string[];
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的事件连接数据 */
export interface EventConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  strength: number;
  createdAt?: string;
}

/** API 返回的大纲-事件关联数据 */
export interface OutlineEventData {
  id: string;
  outlineId: string;
  eventId: string;
  sortOrder: number;
}
