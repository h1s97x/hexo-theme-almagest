/**
 * tags 注册层单元测试
 * 通过 mock 全局 hexo 加载 `scripts/tags/index.js` 后断言各 tag 渲染输出。
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

// ---- 构造 mock hexo ----
const registered = {};

// mock 的 Asset 模型：预先注入两条记录，供 asset_code 查询
const mockAssets = {
  'posts/hello/data.txt': {
    path: 'posts/hello/data.txt',
    source: path.join(__dirname, 'fixtures', 'data.txt')
  },
  'data.txt': {
    path: 'data.txt',
    source: path.join(__dirname, 'fixtures', 'data.txt')
  }
};

global.hexo = {
  extend: {
    tag: {
      register(name, fn, options) {
        registered[name] = { fn, options };
      }
    },
    highlight: {
      query() {
        return true;
      },
      exec(name, { args }) {
        const [code, opts] = args;
        return `<figure class="highlight ${opts.lang}"><figcaption>${opts.caption}</figcaption><pre>${code}</pre></figure>`;
      }
    }
  },
  render: {
    renderSync({ text }) {
      // 简单 markdown 模拟：仅处理空行与段落
      return '<p>' + text + '</p>';
    }
  },
  model(name) {
    if (name !== 'Asset') {
      return undefined;
    }
    return {
      findOne(query) {
        return mockAssets[query.path] || null;
      }
    };
  },
  log: {
    warn() {}
  },
  config: {
    syntax_highlighter: 'highlight.js',
    url: 'https://example.com',
    root: '/',
    relative_link: false,
    pretty_urls: {}
  }
};

// 加载被测模块
require(path.join(__dirname, '../../scripts/tags/index.js'));

test('tags: 注册了 4 个 tag', () => {
  assert.deepEqual(Object.keys(registered).sort(), ['alert', 'asset_code', 'button', 'note']);
});

test('note: 默认 info 类型且带 ends 选项', () => {
  assert.equal(
    registered.note.fn([], 'some note content'),
    '<div class="note note-info"><p>some note content</p></div>'
  );
  assert.equal(registered.note.options.ends, true);
});

test('note: 支持自定义类型', () => {
  assert.equal(
    registered.note.fn(['warning'], 'careful'),
    '<div class="note note-warning"><p>careful</p></div>'
  );
});

test('alert: 支持类型', () => {
  assert.equal(
    registered.alert.fn(['danger'], 'boom'),
    '<div class="alert alert-danger"><p>boom</p></div>'
  );
});

test('button: 默认值', () => {
  assert.equal(registered.button.fn([]), '<a href="#" class="btn btn-primary">Click me</a>');
});

test('button: 自定义文本/链接/类型', () => {
  assert.equal(
    registered.button.fn(['Go', 'https://example.com', 'success']),
    '<a href="https://example.com" class="btn btn-success">Go</a>'
  );
});

// ---- asset_code ----

test('asset_code: 通过绝对路径（相对 source/）渲染代码块', () => {
  const out = registered.asset_code.fn.call({ source: '_posts/hello.md' }, ['data.txt']);
  assert.match(out, /figure class="highlight txt"/);
  assert.match(out, /hello asset content/);
  assert.match(out, /data\.txt/);
});

test('asset_code: 相对当前文章 source 目录的路径', () => {
  const out = registered.asset_code.fn.call({ source: 'posts/hello.md' }, ['posts/hello/data.txt']);
  assert.match(out, /hello asset content/);
});

test('asset_code: 支持 title / lang / from / to 参数', () => {
  const out = registered.asset_code.fn.call({ source: '_posts/hello.md' }, [
    'data.txt',
    'My Title',
    'lang:js',
    'from:1',
    'to:1'
  ]);
  assert.match(out, /figure class="highlight js"/);
  assert.match(out, /My Title/);
});

test('asset_code: 找不到资源时返回空串并告警', () => {
  const warns = [];
  const originalWarn = global.hexo.log.warn;
  global.hexo.log.warn = msg => warns.push(msg);
  const out = registered.asset_code.fn.call({ source: '_posts/hello.md' }, ['missing.js']);
  assert.equal(out, '');
  assert.equal(warns.length, 1);
  assert.match(warns[0], /Asset not found: missing\.js/);
  global.hexo.log.warn = originalWarn;
});

test('asset_code: 未提供路径时直接返回空串', () => {
  assert.equal(registered.asset_code.fn.call({ source: '_posts/hello.md' }, []), '');
});
