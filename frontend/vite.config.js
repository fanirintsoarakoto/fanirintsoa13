import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    minify: "esbuild",
    chunkSizeWarningLimit: 3000,
  },
  server: { host: true, port: 5173 },
});
