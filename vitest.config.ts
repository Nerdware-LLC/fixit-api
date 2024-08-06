import viteTsconfigPaths from "vite-tsconfig-paths";
import GithubActionsReporter from "vitest-github-actions-reporter";
import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    /* `restoreMocks` accomplishes the following:
      - clears all spies of `spy.mock.calls` and `spy.mock.results` (same as clearMocks:true)
      - removes any mocked implementations (same as mockReset:true)
      - restores the original implementation so fns don't return undefined like with mockReset */
    restoreMocks: true,
    globals: true,
    silent: true,
    environment: "node",
    include: ["**/?(*.)test.?(c|m)[tj]s"],
    setupFiles: ["src/tests/setupTests.ts"],
    server: {
      deps: {
        // This config allows mocking the package's underlying @aws-sdk imports
        inline: ["@nerdware/ddb-single-table"],
      },
    },
    reporters: [
      "default",
      // GithubActionsReporter is used to format test results for GitHub Actions
      ...(process.env.GITHUB_ACTIONS ? [new GithubActionsReporter()] : []),
    ],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: [...coverageConfigDefaults.exclude, "**/tests/**/*", "**/__mocks__/**/*"],
      reporter: [
        ...coverageConfigDefaults.reporter,
        // 'json-summary' is used by the vitest-coverage-report GitHub Action
        ...(process.env.GITHUB_ACTIONS ? ["json-summary"] : []),
      ],
    },
  },
});
