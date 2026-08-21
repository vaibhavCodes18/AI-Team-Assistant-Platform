import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    define: {
      global: "window",
    },

    server:
      command === "serve" // change to build if you wants to run on locally
        ? {
            proxy: {
              "/api": {
                target: env.VITE_API_URL,
                changeOrigin: true,
                secure: false,
              },

              "/oauth2/authorization": {
                target: env.VITE_API_URL,
                changeOrigin: true,
                secure: false,
              },

              "/oauth2": {
                target: env.VITE_API_URL,
                changeOrigin: true,
                secure: false,
              },

              "/login/oauth2": {
                target: env.VITE_API_URL,
                changeOrigin: true,
                secure: false,
              },
            },
          }
        : undefined,
  };
});