// @ts-check
const { defineConfig } = require('eslint/config');
const angular = require('angular-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = defineConfig([
  // ESLint 10 resolves the configuration file nearest to each linted file, so the
  // workspace-wide rules have to be pulled in explicitly instead of being inherited.
  ...rootConfig,
  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'lib', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'lib', style: 'camelCase' }],
      '@typescript-eslint/explicit-member-accessibility': ['off', { accessibility: 'explicit' }],
      'arrow-parens': ['off', 'always'],
      'import/order': 'off',
      'max-len': ['error', { code: 160 }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
]);
