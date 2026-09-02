/**
 * ESLint Flat Config (ESLint >= 9)
 *
 * 旧版 `.eslintrc.json` 已在 ESLint 10 被彻底移除，因此迁移到 flat config。
 *
 * 职责划分（重要）：
 *   - **Prettier 负责代码格式**（缩进、引号、分号、空格等），
 *     `eslint-config-prettier` 会关闭所有与之冲突的格式化规则。
 *   - **ESLint 只负责代码质量**（未使用变量、恒等比较、必须加大括号等）。
 *
 * 旧 .eslintrc.json 中 indent / quotes / semi / brace-style / comma-dangle /
 * keyword-spacing / space-infix-ops / space-before-function-paren /
 * no-trailing-spaces / linebreak-style 共 10 条格式化规则已随本次迁移移除，
 * 统一交由 Prettier 处理，避免两个工具互相覆盖、反复报错。
 *
 * 按运行环境分为三组：
 *   - eslint.config.js : 本配置文件（CommonJS + node 全局）
 *   - source/js/**     : 浏览器端 IIFE 脚本（无 require，无 hexo 全局）
 *   - scripts/**, test/**: CommonJS，可访问 Hexo 全局对象
 */

'use strict';

const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

// 仅代码质量规则（不含任何 Prettier 已负责的格式化规则）
const qualityRules = {
  // caughtErrors 显式设为 'none'：ESLint 9 起默认值由 'none' 改为 'all'，
  // 会把空 catch (e) 块报成 unused var。此处保留旧版 .eslintrc 的语义，
  // 避免升级引入与业务代码无关的噪音。
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
  'no-console': ['warn'],
  eqeqeq: ['error', 'always'],
  curly: ['error', 'all']
};

module.exports = [
  {
    ignores: ['node_modules/**', 'public/**', '.demo/**', 'coverage/**']
  },
  js.configs.recommended,
  prettier,

  // 本配置文件自身（CommonJS，需 node 全局）
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: qualityRules
  },

  // 浏览器端脚本：IIFE，无模块系统
  {
    files: ['source/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    },
    rules: qualityRules
  },

  // Hexo 主题脚本 / 单元测试：CommonJS，可访问全局 hexo
  {
    files: ['scripts/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        hexo: 'readonly'
      }
    },
    rules: {
      ...qualityRules,
      // 构建日志与测试输出是有意为之的终端反馈，不视为违规
      'no-console': 'off'
    }
  }
];
