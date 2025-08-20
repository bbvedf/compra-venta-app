// eslint.config.js (CommonJS version)
const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Recomendado de JS
  js.configs.recommended,
  prettier,
  {
    files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      "no-console": "warn",        // warnings no detienen CI
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // variables con _ se ignoran
      "prefer-const": "error",
    },
  },
];
