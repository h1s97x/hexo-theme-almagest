/**
 * Hexo Events
 * Handles Hexo lifecycle events
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册事件，不能使用 module.exports 导出函数。
 *
 * 本文件只保留**日志**。站点 _data 覆盖合并不再放这里——
 * 它与版本同步 / 高亮关闭 / 配置校验 / 废弃告警必须按固定顺序在同一
 * generateBefore 中执行（合并要先于其余逻辑），已统一收敛到
 * `scripts/config/index.js`（那里有完整的时机说明）。
 */

'use strict';

// Before generate
hexo.on('generateBefore', function () {
  console.log('Almagest: Generating...');
});

// After generate
hexo.on('generateAfter', function () {
  console.log('Almagest: Generation complete');
});

// Ready
hexo.on('ready', function () {
  console.log('Almagest: Theme ready');
});
