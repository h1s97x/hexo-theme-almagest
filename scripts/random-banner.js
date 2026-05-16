/**
 * Hexo 脚本：生成随机 Banner 图片列表
 * 将 source/img/random/ 目录下的图片列表注入到页面
 */

'use strict';

var fs = require('fs');
var path = require('path');

/**
 * 获取目录下所有指定扩展名的文件
 * @param {string} dir - 目录路径
 * @param {Array<string>} extensions - 扩展名数组
 * @returns {Array<string>} 文件列表
 */
function getFiles(dir, extensions) {
  try {
    var files = [];
    var items = fs.readdirSync(dir);

    items.forEach(function (item) {
      var fullPath = path.join(dir, item);
      var stat = fs.statSync(fullPath);

      if (stat.isFile()) {
        var ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          // 返回相对路径
          files.push('/img/random/' + item);
        }
      }
    });

    return files;
  } catch (e) {
    return [];
  }
}

/**
 * 将随机图片列表注入到 Hexo 变量中
 */
hexo.extend.filter.register('theme_inject', function (injectpoint) {
  // 获取 random 目录下的图片
  var randomDir = path.join(hexo.base_dir, 'source', 'img', 'random');
  var images = getFiles(randomDir, ['.jpg', '.jpeg', '.png', '.gif', '.webp']);

  // 将图片列表存储到 hexo 主题配置中
  hexo.theme.config.random_banners = images;
});
