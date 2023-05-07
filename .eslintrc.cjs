/** @type { import("eslint").Linter.BaseConfig } */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: ["node_modules/*", ".github/*", "build/*", "coverage/*"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  extends: ["eslint:recommended", "plugin:node/recommended"],
  plugins: ["import"],
  rules: {
    "no-console": "off",
    semi: ["error", "always"],
    "import/no-unresolved": "error",
    "node/no-extraneous-import": ["error", { allowModules: ["@jest/globals"] }],
    "node/no-missing-import": "off", // eslint not recognizing TS path aliases
    "node/no-process-env": "error",
    "node/no-unpublished-import": ["error", { allowModules: ["ts-jest", "@jest/types"] }],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".js", ".ts"],
    },
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json"],
      },
    },
  },
  overrides: [
    {
      // Typescript Files
      files: ["**/*.ts"],
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
      settings: {
        "import/parsers": {
          "@typescript-eslint/parser": [".ts"],
        },
        "import/resolver": {
          typescript: {
            project: ["./tsconfig.json"],
          },
        },
      },
    },
    {
      // Jest Test Files
      files: ["**/*.test.[tj]s"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      env: {
        "jest/globals": true,
      },
      rules: {
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
      },
    },
  ],
};
