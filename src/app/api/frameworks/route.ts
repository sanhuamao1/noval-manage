import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const frameworks = await db.framework.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(frameworks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
