import { NextRequest, NextResponse } from "next/server"
import { list, get, put, remove, genId, nextSortOrder } from "@/lib/store"

// ─── 类型 ───────────────────────────────────────────

type NextHandler = (req: NextRequest) => Promise<NextResponse>
type CrudHandlers = { GET: NextHandler; POST: NextHandler; PUT: NextHandler; DELETE: NextHandler }

export interface RouteConfig {
  /** 全局实体（如 polish-rule），不需要 novelId */
  global?: boolean
  /** POST 创建时自动生成 sortOrder */
  useSortOrder?: boolean
  /** POST 创建时合并的默认字段（body 中同名值会覆盖默认值） */
  postDefaults?: Record<string, unknown>
  /** 自定义 POST 参数校验，返回 null 表示通过，返回字符串表示错误消息 */
  postValidate?: (body: Record<string, unknown>) => string | null
  /** 完全覆盖默认 GET */
  get?: (req: NextRequest, entity: string) => Promise<NextResponse>
  /** 完全覆盖默认 POST */
  post?: (req: NextRequest, entity: string) => Promise<NextResponse>
}

// ─── 工具 ───────────────────────────────────────────

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

// ─── 工厂 ───────────────────────────────────────────

export function createRoute(entity: string, cfg?: RouteConfig): CrudHandlers {
  const config: RouteConfig = cfg ?? {}

  async function GET(req: NextRequest): Promise<NextResponse> {
    if (config.get) return config.get(req, entity)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const novelId = searchParams.get("novelId")

    // 单条
    if (id) {
      const record = get(entity, id, config.global ? undefined : (novelId ?? undefined))
      if (!record) return error("未找到", 404)
      return NextResponse.json(record)
    }

    // 列表
    if (!config.global && !novelId) return error("缺少 novelId", 400)
    return NextResponse.json(list(entity, config.global ? undefined : (novelId ?? undefined)))
  }

  async function POST(req: NextRequest): Promise<NextResponse> {
    if (config.post) return config.post(req, entity)

    const body: Record<string, unknown> = await req.json()
    const { novelId, ...rest } = body

    if (!config.global && !novelId) return error("缺少 novelId", 400)

    // 自定义校验
    if (config.postValidate) {
      const msg = config.postValidate(body)
      if (msg) return error(msg, 400)
    }

    const itemId = genId()

    // 构建数据：默认值 ← rest
    const data: Record<string, unknown> = {}
    if (config.postDefaults) {
      Object.assign(data, config.postDefaults)
    }
    Object.assign(data, rest)
    data.id = itemId
    if (!config.global) data.novelId = novelId
    if (config.useSortOrder) {
      data.sortOrder = nextSortOrder(entity, novelId as string | undefined)
    }

    put(entity, itemId, data, config.global ? undefined : (novelId as string | undefined))
    const record = get(entity, itemId, config.global ? undefined : (novelId as string | undefined))
    return NextResponse.json(record)
  }

  async function PUT(req: NextRequest): Promise<NextResponse> {
    const body: Record<string, unknown> = await req.json()
    const id = body.id as string | undefined
    const novelId = body.novelId as string | undefined
    const data: Record<string, unknown> = {}
    for (const key of Object.keys(body)) {
      if (key !== "id" && key !== "novelId") {
        data[key] = body[key]
      }
    }
    if (!id) return error("缺少 ID", 400)

    put(entity, id, data, config.global ? undefined : novelId)
    const record = get(entity, id, config.global ? undefined : novelId)
    return NextResponse.json(record)
  }

  async function DELETE(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const novelId = searchParams.get("novelId")
    if (!id) return error("缺少 ID", 400)

    remove(entity, id, config.global ? undefined : (novelId ?? undefined))
    return NextResponse.json({ success: true })
  }

  return { GET, POST, PUT, DELETE }
}
