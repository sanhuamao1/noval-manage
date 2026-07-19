import { NextRequest } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const DATA_DIR = resolve(process.cwd(), "data", "novels");

export async function POST(req: NextRequest) {
  try {
    const { novelId, content } = (await req.json()) as {
      novelId: string;
      content: string;
    };

    if (!novelId || content === undefined) {
      return Response.json({ error: "请提供 novelId 和 content" }, { status: 400 });
    }

    const dir = resolve(DATA_DIR, novelId);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const outPath = resolve(dir, "outline.md");
    writeFileSync(outPath, content, "utf-8");

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
