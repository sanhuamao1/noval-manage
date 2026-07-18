// src/app/api/outlines/generate/framework/route.ts
// 大纲框架内容查询接口
// POST body: { framework: string } → 返回对应框架的完整 MD 内容

import { NextResponse } from "next/server";
import { getFramework, getFrameworkContent } from "@/lib/extract/frameworks";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { framework } = body ?? {};

    if (!framework || typeof framework !== "string") {
      return NextResponse.json(
        { error: "缺少 framework 参数" },
        { status: 400 }
      );
    }

    const content = getFrameworkContent(framework);
    if (content === null) {
      return NextResponse.json(
        { error: `框架 "${framework}" 不存在` },
        { status: 404 }
      );
    }

    const info = getFramework(framework);

    return NextResponse.json({
      framework: info?.value ?? framework,
      icon: info?.icon,
      label: info?.label,
      content,
    });
  } catch (error) {
    console.error("获取框架内容失败:", error);
    return NextResponse.json(
      { error: "获取框架内容失败" },
      { status: 500 }
    );
  }
}
