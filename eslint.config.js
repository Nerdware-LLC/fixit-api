import eslintJS from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import nodePlugin from "eslint-plugin-node";
import globalsPkg from "globals";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";

const {
  node: nodeGlobals,
  jest: { jest, ...jestGlobals }, // jest has to be explicitly imported
} = globalsPkg;

/** @type { import("eslint").Linter.FlatConfig } */
export default [
  ////////////////////////////////////////////////////////////////
  // ALL FILES
  {
    files: ["src/**/*.[tj]s", "./*.[tj]s"],
    ignores: ["src/types/graphql.ts"], // don't lint generated code
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      globals: nodeGlobals,
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsEslintParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      import: importPlugin,
      node: nodePlugin,
    },
    rules: {
      ...eslintJS.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs["typescript"].rules,
      ...nodePlugin.configs.recommended.rules,
      ...tsEslintPlugin.configs["eslint-recommended"].rules,
      ...tsEslintPlugin.configs.recommended.rules,
      ...tsEslintPlugin.configs["recommended-requiring-type-checking"].rules,
      eqeqeq: ["error", "always"],
      "no-console": "warn",
      "no-unused-vars": "off", // @typescript-eslint/no-unused-vars is used instead
      "prefer-const": "warn",
      semi: ["error", "always"],
      "import/no-unresolved": "error",
      "node/no-extraneous-import": ["error", { allowModules: ["@jest/globals"] }],
      "node/no-missing-import": "off",
      "node/no-process-env": "error",
      "node/no-unpublished-import": [
        "error",
        { allowModules: ["@jest/types", "ts-jest", "type-fest"] },
      ],
      "node/no-unsupported-features/es-syntax": "off",
      "@typescript-eslint/ban-types": [
        "error",
        {
          types: { "{}": false /* un-bans `{}`, which is banned by default */ },
          extendDefaults: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { arguments: false } },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".js"],
      },
      "import/resolver": {
        node: true,
        typescript: {
          project: ["./tsconfig.json"],
        },
      },
    },
  },
  ////////////////////////////////////////////////////////////////
  // TEST FILES
  {
    files: ["src/**/*.{test,spec}.[tj]s"],
    languageOptions: {
      globals: jestGlobals,
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      "jest/expect-expect": "off", // doesn't detect 'expect's in called fns
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
      "@typescript-eslint/no-unsafe-assignment": "off", // many Jest fns return `any`
    },
  },
  ////////////////////////////////////////////////////////////////
  // NON-TEST FILES
  {
    files: ["src/**/*"],
    ignores: ["**/__tests__/**/*", "src/**/*.{test,spec}.[tj]s"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@tests*", "@tests/*", "@/__tests__*", "@/__tests__/*"],
              message:
                "Test-related exports like mocks should only be imported in test-related files. " +
                "If this file is part of a test suite, please rename it to match the pattern *.test.*",
            },
          ],
        },
      ],
    },
  },
  ////////////////////////////////////////////////////////////////
];
