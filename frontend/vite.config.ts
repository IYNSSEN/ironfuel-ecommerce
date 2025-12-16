import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/public": "http://localhost:4000",
      "/external": "http://localhost:4000"
    }
  }
});
