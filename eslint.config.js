import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu(
  {
    typescript: true,
    unocss: true,
    formatters: true,
    rules: {
      'curly': [
        'error',
        'all',
      ],
      'brace-style': ['error', '1tbs'],
      'array-bracket-newline': ['error', { multiline: true }],
      'vue/attributes-order': [
        'error',
        {
          order: [
            'CONDITIONALS',
            'LIST_RENDERING',
            'DEFINITION',
            'GLOBAL',
            'UNIQUE',
            ['ATTR_SHORTHAND_BOOL', 'ATTR_STATIC', 'ATTR_DYNAMIC'],
            'RENDER_MODIFIERS',
            'TWO_WAY_BINDING',
            'SLOT',
            'OTHER_DIRECTIVES',
            'CONTENT',
            'EVENTS',
          ],
          alphabetical: true,
        },
      ],
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'vue/no-mutating-props': [
        'error',
        {
          shallowOnly: true,
        },
      ],
      'unocss/order-attributify': ['off'],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 2,
          },
          multiline: {
            max: 1,
          },
        },
      ],
    },
  },
  ...compat.config({
    // extends: ['./.eslintrc-auto-import.json'],
    globals: {
      __DEV__: true,
    },
  }),
)
