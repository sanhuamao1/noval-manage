import { type NextRequest, NextResponse } from "next/server";
import { appendRelationLink } from "@/lib/store";
import type { RelationRecord } from "@/lib/store";

/** POST /api/relations/link — 追加单条关系 link */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { novelId, link } = body as {
    novelId: string;
    link: RelationRecord;
  };

  if (!novelId || !link) {
    return NextResponse.json({ error: "缺少 novelId 或 link 参数" }, { status: 400 });
  }

  // 字段兼容：from→source, to→target
  const normalized: RelationRecord = {
    source: link.source,
    target: link.target,
    description: link.description,
  };

  appendRelationLink(novelId, normalized);
  return NextResponse.json({ success: true });
}
