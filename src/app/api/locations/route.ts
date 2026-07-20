import { createRoute } from "@/lib/api-routes"

const { GET, POST, PUT, DELETE } = createRoute("location", {
  useSortOrder: true,
  postValidate: (body) => (!body.name ? "名称不能为空" : null),
})

export { GET, POST, PUT, DELETE }
