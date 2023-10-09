import viteTsconfigPaths from "vite-tsconfig-paths";
import GithubActionsReporter from "vitest-github-actions-reporter";
import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    /* `restoreMocks` accomplishes the following:
      - clears all spies of `spy.mock.calls` and `spy.mock.results` (same as clearMocks:true)
      - removes any mocked implementations (same as mockReset:true)
      - restores the original implementation so fns don't return undefined like with mockReset
    */
    restoreMocks: true,
    globals: true,
    silent: true,
    environment: "node",
    include: ["**/?(*.){test,spec}.?(c|m)[tj]s?(x)"],
    setupFiles: ["src/tests/setupTests.ts"],
    // This server.deps.inline config allows mocking the package's underlying @aws-sdk imports
    server: {
      deps: {
        inline: ["@nerdware/ddb-single-table"],
      },
    },
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
