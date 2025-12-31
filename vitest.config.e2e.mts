import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.e2e.test.ts", "**/*.e2e.test.tsx"],
    // E2E tests should run sequentially
    fileParallelism: false,
    pool: "threads",
    testTimeout: 30000,
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
