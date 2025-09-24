import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: [
      "build/**",
      ".svelte-kit/**",
      "node_modules/**",
      "static/**",
      "scripts/**",
      "*.config.js",
      "*.config.cjs",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
      },
    },
    rules: {
      // Allow unused variables that start with underscore
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allow console for server-side logging
      "no-console": "off",
      // Svelte specific ignores
      "no-undef": "off", // Svelte compiler handles this
    },
  },
];
