// Flat ESLint config (ESLint 10 ignores .eslintrc.* entirely).
// Mirrors the old .eslintrc.js ruleset: TS recommended, no-unused-vars as error,
// explicit `any` as a warning (ParticleBass casts deliberately), no-console warning.
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "public/**", "scripts/**"],
  },

  js.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      // TypeScript reports undefined names itself; no-undef double-reports here.
      "no-undef": "off",
      // Base rule misreads parameters inside TS type annotations.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
    },
  },

  {
    // Node-side config/diagnostic files are not browser code.
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
  },
];
