import viteTsconfigPaths from "vite-tsconfig-paths";
import GithubActionsReporter from "vitest-github-actions-reporter";
import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    globals: true,
    clearMocks: true,
    mockReset: true,
    environment: "node",
    include: ["**/?(*.){test,spec}.?(c|m)[tj]s?(x)"],
    setupFiles: ["src/tests/setupTests.ts"],
    reporters: ["default", ...(process.env.GITHUB_ACTIONS ? [new GithubActionsReporter()] : [])],
    coverage: {
      include: ["src/**/*.{js,ts}"],
      exclude: [...coverageConfigDefaults.exclude, "**/__mocks__/**/*", "__mocks__/**/*"],
      reporter: [
        ...coverageConfigDefaults.reporter,
        "json-summary", // <-- used by vitest-coverage-report GitHub Action
      ],
    },
  },
});
