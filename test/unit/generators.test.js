/**
 * generators 单元测试
 * 通过 mock 全局 hexo 对象，加载 scripts/generators.js 后断言各 generator 输出。
 */

'use strict';

const { test, run, assert } = require('./framework');
const path = require('path');

// ---- 构造 mock hexo ----
const registered = {};
let themeConfig = {};

global.hexo = {
  extend: {
    generator: {
      register(name, fn) {
        registered[name] = fn;
      }
    }
  },
  get theme() {
    return { config: themeConfig };
  }
};

// 加载被测模块
require(path.join(__dirname, '../../scripts/generators.js'));

// 构造本地数据（posts / categories / tags 为类 Hexo 对象）
function makePosts(list) {
  const arr = Object.assign([], list);
  arr.length = list.length;
  return arr;
}

function makeLocals(posts, categories, tags) {
  return { posts: makePosts(posts), categories, tags };
}

test('generators: 注册了 5 个 generator', () => {
  const names = Object.keys(registered).sort();
  assert.deepStrictEqual(names, ['archive', 'categories', 'search', 'search-page', 'tags']);
});

test('archive: 生成 archives/index.html 并携带 posts', () => {
  const locals = makeLocals([{ title: 'p1' }]);
  const out = registered.archive(locals);
  assert.strictEqual(out.path, 'archives/index.html');
  assert.strictEqual(out.layout, 'archive');
  assert.strictEqual(out.data.posts[0].title, 'p1');
});

test('categories: 生成 categories/index.html', () => {
  const out = registered.categories(makeLocals([], ['c1'], []));
  assert.strictEqual(out.path, 'categories/index.html');
  assert.strictEqual(out.layout, 'categories');
  assert.deepStrictEqual(out.data.categories, ['c1']);
});

test('tags: 生成 tags/index.html', () => {
  const out = registered.tags(makeLocals([], [], ['t1']));
  assert.strictEqual(out.path, 'tags/index.html');
  assert.strictEqual(out.layout, 'tags');
  assert.deepStrictEqual(out.data.tags, ['t1']);
});

test('search: 生成 search.json 数据', () => {
  themeConfig = {};
  const posts = [
    {
      title: 'Hello',
      path: '2024/01/01/hello/',
      content: 'body text',
      published: true,
      date: new Date('2024-01-01')
    },
    {
      title: 'Draft',
      path: '2024/01/02/draft/',
      content: 'secret',
      published: false,
      date: new Date('2024-01-02')
    }
  ];
  const out = registered.search(makeLocals(posts));
  assert.strictEqual(out.path, 'search.json');
  const data = JSON.parse(out.data);
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].title, 'Hello');
  assert.strictEqual(data[0].text, 'body text');
});

test('search: 索引正文剥离 HTML 标签并压缩空白', () => {
  themeConfig = {};
  const posts = [
    {
      title: 'HTML Post',
      path: '2024/01/01/html/',
      content:
        '<p>Hello   <strong>world</strong></p>\n\n<p>second &amp; paragraph</p><img src="/a.jpg" alt="x">',
      published: true,
      date: new Date('2024-01-01')
    }
  ];
  const data = JSON.parse(registered.search(makeLocals(posts)).data);
  assert.strictEqual(data[0].text, 'Hello world second & paragraph');
});

test('search: 丢弃 script / style 内容，保留 pre 文本', () => {
  themeConfig = {};
  const posts = [
    {
      title: 'Code Post',
      path: '2024/01/01/code/',
      content:
        '<style>.a{color:red}</style><script>var tracking = 1;</script><pre><code>keepme</code></pre>',
      published: true,
      date: new Date('2024-01-01')
    }
  ];
  const data = JSON.parse(registered.search(makeLocals(posts)).data);
  assert.strictEqual(data[0].text, 'keepme');
});

test('search: 正文按 search.index_length 截断', () => {
  themeConfig = { search: { index_length: 10 } };
  const posts = [
    {
      title: 'Long Post',
      path: '2024/01/01/long/',
      content: 'abcdefghijklmnopqrstuvwxyz',
      published: true,
      date: new Date('2024-01-01')
    }
  ];
  const data = JSON.parse(registered.search(makeLocals(posts)).data);
  assert.strictEqual(data[0].text, 'abcdefghij');
});

test('search: 受 features.search=false 控制', () => {
  themeConfig = { features: { search: false } };
  const out = registered.search(makeLocals([]));
  assert.deepStrictEqual(out, []);
});

test('search-page: 生成 /search/ 页面', () => {
  themeConfig = {};
  const out = registered['search-page'](makeLocals([]));
  assert.strictEqual(out.path, 'search/index.html');
  assert.strictEqual(out.layout, 'search');
});

test('search-page: features.search=false 时不生成', () => {
  themeConfig = { features: { search: false } };
  const out = registered['search-page'](makeLocals([]));
  assert.deepStrictEqual(out, []);
});

run();
