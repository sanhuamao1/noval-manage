import { createRoute } from "@/lib/api-routes"

const { GET, POST, PUT, DELETE } = createRoute("event-node", {
  postValidate: (body) => (!body.title ? "标题不能为空" : null),
})

export { GET, POST, PUT, DELETE }
