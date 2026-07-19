import { NextRequest } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const DATA_DIR = resolve(process.cwd(), "data", "novels");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");

    if (!novelId) {
      return Response.json({ error: "请提供 novelId" }, { status: 400 });
    }

    const outPath = resolve(DATA_DIR, novelId, "outline.md");

    if (!existsSync(outPath)) {
      return Response.json({ content: "" });
    }

    const content = readFileSync(outPath, "utf-8");
    return Response.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
