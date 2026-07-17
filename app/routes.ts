import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/site-layout.tsx", [
    index("routes/home.tsx"),
    route("puppies", "routes/puppies.tsx"),
    route("parents", "routes/parents.tsx"),
    route("about", "routes/about.tsx"),
    route("deposit", "routes/deposit.tsx"),
  ]),
] satisfies RouteConfig;
