import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET || "https://homestead-puppies.com";

  const proxy = {
    "/api": {
      target: proxyTarget,
      changeOrigin: true,
      secure: true,
    },
  };

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: { proxy },
    preview: { proxy },
  };
});
