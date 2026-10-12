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

  overrides: [
    {
      files: ["content/catalog.js", "content/TechMinds_Grade1_Math.js"],
      parserOptions: {sourceType: "module"},
    },
  ],

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
