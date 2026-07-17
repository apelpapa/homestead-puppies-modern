import type { Config } from "@react-router/dev/config";

export default {
  // Nginx will serve the generated frontend; Express remains the only backend.
  ssr: false,
  prerender: ["/"],
} satisfies Config;
