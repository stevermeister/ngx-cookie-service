// @ts-check
const { defineConfig } = require('eslint/config');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['*.ts'],
    extends: ['../../eslint.config.js'],
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
    files: ['*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
]);
