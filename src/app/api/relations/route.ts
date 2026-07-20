import { type NextRequest, NextResponse } from "next/server";
import { getRelations, saveRelations, savePositions } from "@/lib/store";
import type { RelationRecord } from "@/lib/store";

/** GET /api/relations?novelId=xxx */
export async function GET(req: NextRequest) {
  const novelId = req.nextUrl.searchParams.get("novelId");
  if (!novelId) {
    return NextResponse.json({ error: "缺少 novelId 参数" }, { status: 400 });
  }
  const { links, positions } = await getRelations(novelId);
  return NextResponse.json({ links, positions });
}

/** POST /api/relations — 批量保存关系
 *
 * 支持两种入参格式：
 *   1. { novelId, relations: RelationRecord[] }
 *   2. { novelId, relations: { links: [...] } }  (AI enrich 场景)
 *
 * 字段兼容：from→source, to→target */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const novelId = body.novelId as string | undefined;
  const rawRelations = body.relations;

  if (!novelId || !rawRelations) {
    return NextResponse.json({ error: "缺少 novelId 或 relations 参数" }, { status: 400 });
  }

  // 归一化为 RelationRecord[]
  let links: unknown[];

  if (Array.isArray(rawRelations)) {
    // 格式 1：直接传了链接数组
    links = rawRelations;
  } else if (typeof rawRelations === "object" && rawRelations !== null && Array.isArray((rawRelations as Record<string, unknown>).links)) {
    // 格式 2：{ links: [...] }
    links = (rawRelations as Record<string, unknown>).links as unknown[];
  } else {
    return NextResponse.json({ error: "relations 格式错误：应为数组或 { links: [...] } 对象" }, { status: 400 });
  }

  // 字段兼容：将 from/to 映射为 source/target
  const normalized: RelationRecord[] = links.map((item: unknown) => {
    const obj = item as Record<string, unknown>;
    return {
      source: (obj.source || obj.from || "") as string,
      target: (obj.target || obj.to || "") as string,
      description: (obj.description || "") as string,
    };
  });

  await saveRelations(novelId, normalized);
  return NextResponse.json({ success: true });
}

/** PUT /api/relations — 保存节点位置 */
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { novelId, positions } = body as { novelId: string; positions: Record<string, { x: number; y: number }> };

  if (!novelId || !positions) {
    return NextResponse.json({ error: "缺少 novelId 或 positions 参数" }, { status: 400 });
  }

  await savePositions(novelId, positions);
  return NextResponse.json({ success: true });
}
