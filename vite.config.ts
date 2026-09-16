import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5500,
    headers: {
      "X-Content-Type-Options": "nosniff",
    },
    hmr: {
      protocol: "ws",
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
    cssMinify: true,
    minify: "esbuild",
  },
});
