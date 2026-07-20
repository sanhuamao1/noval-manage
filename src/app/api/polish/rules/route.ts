import { createRoute } from "@/lib/api-routes"

const { GET, POST, PUT, DELETE } = createRoute("polish-rule", {
  global: true,
  postDefaults: { useCount: 0 },
  postValidate: (body) => (!body.name ? "名称不能为空" : null),
})

export { GET, POST, PUT, DELETE }
