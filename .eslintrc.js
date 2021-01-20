module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "indent": ["error", 4],
    "semi": ["off", "always"],
    "space-before-function-paren": ["off", "always"],
    "comma-dangle": ["off", "never"],
    "operator-linebreak": ["off", "after"]
  }
}
