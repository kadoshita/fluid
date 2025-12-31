import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Exclude E2E tests from regular test runs
    exclude: ["node_modules/**", "dist/**", ".next/**", "**/*.e2e.test.ts", "**/*.e2e.test.tsx"],
    // Run all tests sequentially to avoid database conflicts
    fileParallelism: false,
    pool: "threads",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vitest.setup.ts",
        "server.js",
      ],
    },
    env: {
      MONGODB_URI: "mongodb://fluid:fluid@localhost:27017/?authSource=admin",
      MONGODB_DB: "fluid_test",
      API_TOKEN: "token",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
