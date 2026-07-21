"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useEntityStore } from "@/stores/useEntityStore";
import {
  Star, Clock, MapPin, Users, ChevronDown, ChevronRight,
  Search, Expand, Shrink,
} from "lucide-react";
import { getEventTypeStyle, getEventStatusStyle } from "@/lib/event-utils";
import type { EventNodeData } from "@/types/event-data";
import type { OutlineData } from "@/types/data";

interface TimelineViewProps {
  onEventDoubleClick?: (event: any) => void;
}

type DisplayMode = "brief" | "detail";

export default function TimelineView({ onEventDoubleClick }: TimelineViewProps) {
  const params = useParams();
  const novelId = params.id as string;

  const outlines = useEntityStore((s) => s.outlines) as OutlineData[];
  const events = useEntityStore((s) => s.eventNodes) as EventNodeData[];
  const outlineEvents = useEntityStore((s) => s.outlineEvents) as {
    id: string;
    outlineId: string;
    eventId: string;
    sortOrder: number;
  }[];
  const characters = useEntityStore((s) => s.characters) as {
    id: string;
    name: string;
  }[];
  const locations = useEntityStore((s) => s.locations) as {
    id: string;
    name: string;
  }[];

  const [displayMode, setDisplayMode] = useState<DisplayMode>("brief");
  const [expandedAll, setExpandedAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const charMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of characters) m[c.id] = c.name;
    return m;
  }, [characters]);

  const locMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const l of locations) m[l.id] = l.name;
    return m;
  }, [locations]);

  // Build outline → events mapping
  // Build outline → events mapping
  const outlineEventMap = useMemo(() => {
    const map: Record<string, EventNodeData[]> = {};
    const processed = new Set<string>();

    // Events without outline
    const unlinked: EventNodeData[] = [];

    for (const oe of outlineEvents) {
      if (!map[oe.outlineId]) map[oe.outlineId] = [];
      const event = events.find((e) => e.id === oe.eventId);
      if (event) {
        (event as any)._sortOrder = oe.sortOrder;
        map[oe.outlineId].push(event);
        processed.add(oe.eventId);
      }
    }

    for (const event of events) {
      if (!processed.has(event.id)) {
        unlinked.push(event);
      }
    }

    // Sort events within each outline
    for (const key of Object.keys(map)) {
      map[key].sort((a: any, b: any) => (a._sortOrder ?? 0) - (b._sortOrder ?? 0));
    }

    return { map, unlinked };
  }, [outlineEvents, events]);

  // Filter outlines by search
  const sortedOutlines = useMemo(() => {
    const sorted = [...outlines].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (!searchQuery) return sorted;
    return sorted.filter(
      (o: OutlineData) =>
        (o.name && o.name.includes(searchQuery)) ||
        (o.contentBrief && o.contentBrief.includes(searchQuery)),
    );
  }, [outlines, searchQuery]);

  const filteredUnlinked = useMemo(() => {
    if (!searchQuery) return outlineEventMap.unlinked;
    return outlineEventMap.unlinked.filter(
      (e: EventNodeData) =>
        (e.title && e.title.includes(searchQuery)) ||
        (e.description && e.description.includes(searchQuery)),
    );
  }, [outlineEventMap.unlinked, searchQuery]);

  const handleNodeClick = (event: EventNodeData) => {
    onEventDoubleClick?.(event);
  };

  return (
    <div className="h-full overflow-auto pr-4">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索事件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-bg-800 pl-9 pr-3 py-1.5 text-sm text-fg-primary outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpandedAll(!expandedAll)}
            className="flex items-center gap-1 rounded-md border border-border-subtle px-2.5 py-1.5 text-xs text-fg-secondary hover:bg-bg-700"
            title={expandedAll ? "全部折叠" : "全部展开"}
          >
            {expandedAll ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            {expandedAll ? "全部折叠" : "全部展开"}
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode(displayMode === "brief" ? "detail" : "brief")}
            className="rounded-md border border-border-subtle px-2.5 py-1.5 text-xs text-fg-secondary hover:bg-bg-700"
          >
            {displayMode === "brief" ? "详细模式" : "简要模式"}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {/* Grouped by outline */}
        {sortedOutlines.map((outline: OutlineData) => {
          const outlineEventsList = outlineEventMap.map[outline.id] ?? [];
          if (!searchQuery && outlineEventsList.length === 0) return null;

          return (
            <OutlineGroup
              key={outline.id}
              outline={outline}
              events={outlineEventsList}
              defaultExpanded={expandedAll}
              displayMode={displayMode}
              charMap={charMap}
              locMap={locMap}
              onEventClick={handleNodeClick}
            />
          );
        })}

        {/* Unlinked events */}
        {filteredUnlinked.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-fg-tertiary">
              <span className="h-px flex-1 bg-border-subtle" />
              <span>未关联大纲的事件</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </h3>
            <div className="space-y-2 pl-4">
              {filteredUnlinked.map((event) => (
                <EventNode
                  key={event.id}
                  event={event}
                  displayMode={displayMode}
                  charMap={charMap}
                  locMap={locMap}
                  onClick={handleNodeClick}
                />
              ))}
            </div>
          </div>
        )}

        {sortedOutlines.length === 0 && filteredUnlinked.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-fg-tertiary">
            暂无事件数据，点击右上角添加
          </div>
        )}
      </div>
    </div>
  );
}

// ── Outline Group ──

function OutlineGroup({
  outline,
  events,
  defaultExpanded,
  displayMode,
  charMap,
  locMap,
  onEventClick,
}: {
  outline: OutlineData;
  events: EventNodeData[];
  defaultExpanded: boolean;
  displayMode: DisplayMode;
  charMap: Record<string, string>;
  locMap: Record<string, string>;
  onEventClick: (event: EventNodeData) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border-subtle" />

      {/* Outline header */}
      <div className="relative mb-3 flex items-start gap-3">
        <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/50 bg-amber-400/10">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        </div>
        <div className="flex-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-base font-semibold text-fg-primary hover:text-amber-400"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {outline.name || "未命名大纲"}
          </button>
          {outline.contentBrief && (
            <p className="mt-0.5 text-xs text-fg-tertiary">{outline.contentBrief}</p>
          )}
          <div className="mt-1 flex items-center gap-3 text-xs text-fg-tertiary">
            {outline.status && (
              <span className="rounded bg-bg-700 px-1.5 py-0.5">{outline.status}</span>
            )}
            {outline.timeline && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {outline.timeline}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Events */}
      {expanded && (
        <div className="space-y-2 pl-8">
          {events.map((event) => (
            <EventNode
              key={event.id}
              event={event}
              displayMode={displayMode}
              charMap={charMap}
              locMap={locMap}
              onClick={onEventClick}
            />
          ))}
          {events.length === 0 && (
            <p className="py-2 text-xs text-fg-tertiary">暂无关联事件</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Event Node ──

function EventNode({
  event,
  displayMode,
  charMap,
  locMap,
  onClick,
}: {
  event: EventNodeData & { _sortOrder?: number };
  displayMode: DisplayMode;
  charMap: Record<string, string>;
  locMap: Record<string, string>;
  onClick: (event: EventNodeData) => void;
}) {
  const typeStyle = getEventTypeStyle(event.eventType);
  const importance = event.importance ?? 1;

  // Resolve character/location names
  const charIds: string[] = event.characterIds ?? [];
  const locIds: string[] = event.locationIds ?? [];
  const relatedChars = charIds.map((id) => charMap[id]).filter(Boolean);
  const relatedLocs = locIds.map((id) => locMap[id]).filter(Boolean);

  return (
    <div
      className="group relative cursor-pointer rounded-lg border border-border-subtle bg-bg-800/50 p-3 transition-all hover:border-amber-400/30 hover:bg-bg-800 hover:shadow-sm"
      onDoubleClick={() => onClick(event)}
    >
      <div className="flex items-start gap-3">
        {/* Event type icon */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${typeStyle.bg} ${typeStyle.color}`}
        >
          <div className="text-lg font-bold leading-none">
            {event.eventType ? event.eventType.charAt(0) : "?"}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + type */}
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg-primary">
              {event.title || "未命名事件"}
            </span>
            {event.eventType && (
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${typeStyle.bg} ${typeStyle.color}`}>
                {event.eventType}
              </span>
            )}
            {/* Importance stars */}
            <span className="ml-auto flex shrink-0 items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= importance
                      ? "fill-amber-400 text-amber-400"
                      : "fill-none text-gray-600"
                  }`}
                />
              ))}
            </span>
          </div>

          {/* Description */}
          {displayMode === "detail" && event.description && (
            <p className="mt-0.5 text-xs text-fg-tertiary line-clamp-2">{event.description}</p>
          )}

          {/* Meta info columns: Characters | Time | Location */}
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[11px] text-fg-tertiary">
            {relatedChars.length > 0 && (
              <span className="flex items-center gap-1" title="角色">
                <Users className="w-3 h-3" />
                {relatedChars.slice(0, 3).join("、")}
                {relatedChars.length > 3 && ` +${relatedChars.length - 3}`}
              </span>
            )}
            {event.storyTime && (
              <span className="flex items-center gap-1" title="时间">
                <Clock className="w-3 h-3" />
                {event.storyTime}
              </span>
            )}
            {relatedLocs.length > 0 && (
              <span className="flex items-center gap-1" title="地点">
                <MapPin className="w-3 h-3" />
                {relatedLocs.slice(0, 2).join("、")}
                {relatedLocs.length > 2 && ` +${relatedLocs.length - 2}`}
              </span>
            )}
            {event.status && (
              <span className="rounded bg-bg-700 px-1.5 py-0.5">{event.status}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
