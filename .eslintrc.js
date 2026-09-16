module.exports = {
  env: {
    browser: true,
    es2021: true,
  },

  extends: [
    'react-app',
    'plugin:react/recommended',
    'airbnb',
    'prettier',
  ],

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },

  plugins: ['react'],

  rules: {
    // ---------------------------
    // ❌ TURN OFF ALL STRICT RULES
    // ---------------------------

    'react/function-component-definition': 0,
    'react/prop-types': 0,
    'react/state-in-constructor': 0,
    'react/no-array-index-key': 0,
    'react/self-closing-comp': 0,
    'react/button-has-type': 0,
    'react/destructuring-assignment': 0,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 0,

    'import/extensions': 0,
    'import/prefer-default-export': 0,

    'jsx-a11y/alt-text': 0,
    'jsx-a11y/no-autofocus': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/anchor-is-valid': 0,

    'react/jsx-one-expression-per-line': 0,

    // ---------------------------
    // ❌ TURN OFF STYLE RULES
    // ---------------------------

    'linebreak-style': 0,
    'object-curly-newline': 0,
    'no-multiple-empty-lines': 0,
    'no-underscore-dangle': 0,
    'camelcase': 0,
    'eqeqeq': 0,
    'no-param-reassign': 0,
    'no-unused-vars': 0,
    'no-use-before-define': 0,
    'arrow-body-style': 0,
    'prefer-destructuring': 0,
    'react/jsx-props-no-spreading': 0,

    // ---------------------------
    // KEEP ONLY IMPORT ORDER (optional)
    // ---------------------------
    'import/order': 0,
  },
};