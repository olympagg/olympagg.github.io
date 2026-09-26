import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { flatConfigs as importFlatConfigs } from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/",
    "node_modules/",
    "src/data/cache/",
    "src/data/parsed/",
    "bun.lock",
    "eslint.config.ts",
    "**/*.json",
  ]),

  eslint.configs.recommended,

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },

  {
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
    settings: {
      react: { version: "detect" },
    },
  },
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,

  importFlatConfigs.recommended,
  importFlatConfigs.typescript,
  {
    settings: {
      "import-x/core-modules": ["bun", "bun:test"],
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          extensions: [".ts", ".tsx", ".json"],
        }),
      ],
    },
  },
  {
    rules: {
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/no-duplicates": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["..", "../**"],
              message: "Use the @/ alias instead of parent-relative imports.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },

  {
    // Frontend code ships to users — no stray console logging.
    // Build-time code (scripts, build.ts, the data pipeline, the dev server)
    // is intentionally free to log progress and debug output.
    files: [
      "src/App.tsx",
      "src/frontend.tsx",
      "src/pages/**/*.tsx",
      "src/components/**/*.tsx",
      "src/hooks/**/*.ts",
      "src/contexts/**/*.tsx",
      "src/lib/**/*.ts",
    ],
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },

  prettier,

  {
    rules: {
      curly: ["error", "all"],
    },
  },
]);
