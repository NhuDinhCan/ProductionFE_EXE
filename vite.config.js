import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

const requiredProductionEnv = ["VITE_API_BASE_URL", "VITE_WS_URL"];

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (command === "build") {
    for (const key of requiredProductionEnv) {
      const value = process.env[key] || env[key];
      if (!value?.trim()) {
        throw new Error(`${key} is required for production builds`);
      }
    }
  }

  return {
    plugins: [react()],
    define: {
      global: "window",
    },
  };
});
