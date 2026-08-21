import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const target = env.VITE_API_URL || "http://localhost:8080";

  return {
    plugins: [react()],

    define: {
      global: "window",
    },

    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
        },

        "/oauth2/authorization": {
          target,
          changeOrigin: true,
          secure: false,
        },

        "/login/oauth2": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});