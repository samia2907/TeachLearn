module.exports = {
  root: true,

  env: {
    es2020: true,
    node: true,
  },

  extends: [
    "eslint:recommended",
  ],

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "script",
  },

  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
      },
    ],

    "no-undef": "error",
  },
};