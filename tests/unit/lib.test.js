/**
 * 纯函数层单元测试
 *
 * 覆盖 `scripts/lib/` —— 这些模块不依赖 hexo、无副作用，因此可直接 require。
 * 它们是从注册层抽出来的「可测内核」，也是本主题唯一能被完整单测的部分。
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const text = require('../../scripts/lib/text');
const html = require('../../scripts/lib/html');
const asset = require('../../scripts/lib/asset');
const config = require('../../scripts/lib/config');
const seo = require('../../scripts/lib/seo');
const ce = require('../../scripts/lib/config-export');
const path = require('../../scripts/lib/path');

// ────────────────────────────────────────────────────────────
// text：HTML → 纯文本、摘要、阅读时长
// ────────────────────────────────────────────────────────────

describe('lib/text', () => {
  it('stripHtml 剥离标签，null / undefined 安全', () => {
    assert.equal(text.stripHtml('<p>Hello <strong>world</strong></p>'), 'Hello world');
    assert.equal(text.stripHtml(null), '');
    assert.equal(text.stripHtml(undefined), '');
  });

  it('escapeHtml 转义 & < >', () => {
    assert.equal(text.escapeHtml('<a href="x">&</a>'), '&lt;a href="x"&gt;&amp;&lt;/a&gt;');
  });

  it('toExcerpt 超长时截断并追加省略号', () => {
    const out = text.toExcerpt('<p>' + 'a'.repeat(300) + '</p>', 100);
    assert.equal(out.length, 103);
    assert.ok(out.endsWith('...'));
  });

  it('toExcerpt 未超长时不追加省略号，alwaysSuffix 可强制追加', () => {
    assert.equal(text.toExcerpt('<p>short content</p>', 200), 'short content');
    assert.equal(text.toExcerpt('short', 200, { alwaysSuffix: true }), 'short...');
  });

  it('toExcerpt 缺省长度回落到 200', () => {
    assert.equal(text.DEFAULT_EXCERPT_LENGTH, 200);
    assert.equal(text.toExcerpt('x'.repeat(250)), 'x'.repeat(200) + '...');
  });

  it('toPlainText 丢弃 script / style，保留 pre 内文本', () => {
    const input =
      '<style>.a{color:red}</style><script>var t = 1;</script><pre><code>keepme</code></pre>';
    assert.equal(text.toPlainText(input), 'keepme');
  });

  it('toPlainText 剥离标签、还原实体、压缩空白', () => {
    const input = '<p>Hello   <strong>world</strong></p>\n\n<p>second &amp; third &lt;</p>';
    assert.equal(text.toPlainText(input), 'Hello world second & third <');
  });

  it('toPlainText 把 &amp; 放在最后还原，避免二次解码', () => {
    // 若先还原 &amp;，'&amp;lt;' 会被解成 '&lt;' 再被解成 '<'
    assert.equal(text.toPlainText('&amp;lt;'), '&lt;');
  });

  it('toIndexText 按 maxLength 截断，maxLength <= 0 不截断', () => {
    assert.equal(text.toIndexText('abcdefghijklmnopqrstuvwxyz', 10), 'abcdefghij');
    assert.equal(text.toIndexText('abcdefg', 0), 'abcdefg');
    assert.equal(text.toIndexText('abcdefg', -1), 'abcdefg');
  });

  it('readingTime 空内容返回 0', () => {
    assert.equal(text.readingTime(''), 0);
    assert.equal(text.readingTime(null), 0);
  });

  it('readingTime 按 200 词/分钟估算，忽略 HTML 标签，且至少 1 分钟', () => {
    assert.equal(text.readingTime(Array(400).fill('word').join(' ')), 2);
    assert.equal(text.readingTime('<p>Hello world</p><div>This is content</div>'), 1);
  });

  it('readingTime 支持自定义阅读速度', () => {
    assert.equal(text.readingTime(Array(400).fill('word').join(' '), 400), 1);
  });
});

// ────────────────────────────────────────────────────────────
// html：图片懒加载注入
//
// 核心约束：必须【保留 src】。只加 data-src 而删掉 src，
// 会让不支持 JS 或脚本未执行时的图片永久破图。
// ────────────────────────────────────────────────────────────

describe('lib/html', () => {
  it('hasAttr 兼容双引号 / 单引号 / 裸属性', () => {
    assert.equal(html.hasAttr(' src="/a.jpg" alt="a"', 'src'), true);
    assert.equal(html.hasAttr(" loading='lazy'", 'loading'), true);
    assert.equal(html.hasAttr(' loading alt="a"', 'loading'), true);
    assert.equal(html.hasAttr(' src="/a.jpg"', 'alt'), false);
    // 注意：'-' 是非单词字符，所以 data-src 里的 src 也会命中。
    // processImgTag 会先单独判断 data-src 并提前返回，因此不会误处理。
    assert.equal(html.hasAttr(' data-src="/a.jpg"', 'src'), true);
  });

  it('getAttrMatch 返回含等号与值的完整片段', () => {
    assert.equal(html.getAttrMatch(' src="/a.jpg" alt="a"', 'src'), 'src="/a.jpg"');
    assert.equal(html.getAttrMatch(" src='/a.jpg'", 'src'), "src='/a.jpg'");
    assert.equal(html.getAttrMatch(' alt="a"', 'src'), null);
  });

  it('processImgTag 保留 src 并补 data-src 与 loading="lazy"', () => {
    const out = html.processImgTag('<img src="/a.jpg" alt="a">');
    assert.ok(out.includes('src="/a.jpg"'), '应保留 src');
    assert.ok(out.includes('data-src="/a.jpg"'), '应包含 data-src');
    assert.ok(out.includes('loading="lazy"'), '应包含 loading="lazy"');
  });

  it('processImgTag 对已处理过的、或无 src 的标签原样返回', () => {
    const done = '<img data-src="/a.jpg" loading="lazy" alt="a">';
    assert.equal(html.processImgTag(done), done);
    const plain = '<img alt="a">';
    assert.equal(html.processImgTag(plain), plain);
  });

  it('lazyLoadHtml 不会重复注入 loading（单引号 / 裸属性）', () => {
    const single = html.lazyLoadHtml('<p><img src="/a.jpg" loading=\'lazy\' alt="a"></p>');
    assert.equal((single.match(/loading/g) || []).length, 1);
    const bare = html.lazyLoadHtml('<p><img src="/a.jpg" loading alt="a"></p>');
    assert.equal((bare.match(/loading/g) || []).length, 1);
  });

  it('lazyLoadHtml 属性值含 > 时不截断（data URI）', () => {
    const src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
    const out = html.lazyLoadHtml('<p><img src="' + src + '" alt="a"></p>');
    assert.ok(out.includes('src="' + src + '"'), 'data URI src 应完整保留');
    assert.ok(out.includes('data-src="' + src + '"'), '应完整复制到 data-src');
    assert.ok(out.includes('loading="lazy"'));
  });

  it('lazyLoadHtml 不改写 pre / script 内的示例图片', () => {
    const input =
      '<pre><code>&lt;img src="/code-sample.jpg" alt="x"&gt;</code></pre>' +
      '<script>var s = "<img src=\\"/inline.jpg\\">";</script>' +
      '<img src="/real.jpg" alt="real">';
    const out = html.lazyLoadHtml(input);
    assert.ok(out.includes('&lt;img src="/code-sample.jpg"'), 'pre 内示例不应改写');
    assert.ok(out.includes('var s = "<img src=\\"/inline.jpg\\">"'), 'script 内不应改写');
    assert.ok(out.includes('src="/real.jpg"'), '真实 img 应保留 src');
    assert.ok(out.includes('data-src="/real.jpg"'), '真实 img 应补 data-src');
  });

  it('lazyLoadHtml 对无图片内容、未闭合的受保护区均原样返回', () => {
    const plain = '<p>no image</p>';
    assert.equal(html.lazyLoadHtml(plain), plain);
    const broken = '<pre><code>unterminated';
    assert.equal(html.lazyLoadHtml(broken), broken, '未闭合保护区不应丢失尾部内容');
  });
});

// ────────────────────────────────────────────────────────────
// asset：asset_code 标签的参数解析与行截取
// ────────────────────────────────────────────────────────────

describe('lib/asset', () => {
  const EMPTY = { path: '', title: '', lang: '', from: 0, to: -1 };

  it('parseAssetCodeArgs 位置参数依次映射 path / title', () => {
    assert.deepEqual(asset.parseAssetCodeArgs(['data.txt', 'My Title']), {
      path: 'data.txt',
      title: 'My Title',
      lang: '',
      from: 0,
      to: -1
    });
  });

  it('parseAssetCodeArgs 解析 lang / from / to，且可出现在任意位置', () => {
    const out = asset.parseAssetCodeArgs(['data.txt', 'T', 'lang:js', 'from:2', 'to:5']);
    assert.equal(out.lang, 'js');
    assert.equal(out.from, 2);
    assert.equal(out.to, 5);

    const reordered = asset.parseAssetCodeArgs(['lang:py', 'demo.py']);
    assert.equal(reordered.lang, 'py');
    assert.equal(reordered.path, 'demo.py');
  });

  it('parseAssetCodeArgs 多余的位置参数归入 title；空输入安全', () => {
    assert.equal(asset.parseAssetCodeArgs(['a.js', 't1', 't2']).title, 't2');
    assert.deepEqual(asset.parseAssetCodeArgs([]), EMPTY);
    assert.deepEqual(asset.parseAssetCodeArgs(['', null]), EMPTY);
    assert.deepEqual(asset.parseAssetCodeArgs(undefined), EMPTY);
  });

  it('sliceLines 为 1-based 闭区间，from <= 0 从头、to < 0 到末尾，并去除首尾空白', () => {
    assert.equal(asset.sliceLines('a\nb\nc\nd', 2, 3), 'b\nc');
    assert.equal(asset.sliceLines('a\nb\nc', 0, 2), 'a\nb');
    assert.equal(asset.sliceLines('a\nb\nc', 2, -1), 'b\nc');
    assert.equal(asset.sliceLines('  a  \n  b  ', 1, 2), 'a  \n  b');
  });

  it('countLines 统计总行数，与截取区间无关', () => {
    assert.equal(asset.countLines('a\nb\nc'), 3);
    assert.equal(asset.countLines(''), 1);
    assert.equal(asset.countLines(null), 1);
  });

  it('inferLang 取扩展名且不含点', () => {
    assert.equal(asset.inferLang('a/b/demo.js'), 'js');
    assert.equal(asset.inferLang('data.txt'), 'txt');
    assert.equal(asset.inferLang('noext'), '');
  });
});

// ────────────────────────────────────────────────────────────
// config：主题配置校验
// ────────────────────────────────────────────────────────────

describe('lib/config', () => {
  it('validate 对合法配置返回空数组', () => {
    const valid = {
      title: 'x',
      style: { prefers_theme: 'auto', primary_color: '#0066cc' },
      sidebar: { position: 'right', width: 300 },
      pagination: { type: 'pagination', per_page: 10 },
      article: { excerpt_length: 200 },
      search: { index_length: 1500 }
    };
    assert.deepEqual(config.validate(valid), []);
  });

  it('validate 识别拼错的顶层键', () => {
    const problems = config.validate({ prefer_theme: 'dark' });
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes('prefer_theme'));
  });

  it('validate 识别非法枚举值并列出可选值', () => {
    const problems = config.validate({ style: { prefers_theme: 'midnight' } });
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes('midnight'));
    assert.ok(problems[0].includes('auto / light / dark'));
  });

  it('validate 识别非正数', () => {
    const problems = config.validate({ search: { index_length: -1 } });
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes('search.index_length'));
  });

  it('validate 对缺失的嵌套配置不报错', () => {
    assert.deepEqual(config.validate({}), []);
    assert.deepEqual(config.validate({ style: {} }), []);
    assert.deepEqual(config.validate(undefined), []);
  });

  it('getPath 按 a.b.c 读取，缺失时返回 undefined', () => {
    const obj = { a: { b: { c: 1 } } };
    assert.equal(config.getPath(obj, 'a.b.c'), 1);
    assert.equal(config.getPath(obj, 'a.x.c'), undefined);
    assert.equal(config.getPath(obj, 'a.b.c.d'), undefined);
  });

  it('hasSiteOverride 判断站点是否显式覆盖了某个主题配置', () => {
    assert.equal(config.hasSiteOverride({ theme_config: { version: '9.9.9' } }, 'version'), true);
    assert.equal(config.hasSiteOverride({ theme_config: { version: '9.9.9' } }, 'title'), false);
    assert.equal(config.hasSiteOverride({ theme_config: undefined }, 'version'), false);
  });
});

// ────────────────────────────────────────────────────────────
// path：导航 active 态判断（A1 修复）
// ────────────────────────────────────────────────────────────

describe('lib/path', () => {
  it('normalizePath 归一化协议主机 / 查询串 / 尾斜杠 / .html / index.html', () => {
    assert.equal(path.normalizePath('/wiki/foo/'), 'wiki/foo');
    assert.equal(path.normalizePath('wiki/foo.html'), 'wiki/foo');
    assert.equal(path.normalizePath('wiki/foo/index.html'), 'wiki/foo');
    assert.equal(path.normalizePath('wiki/foo/index'), 'wiki/foo');
    assert.equal(path.normalizePath('https://example.com/wiki/foo/'), 'wiki/foo');
    assert.equal(path.normalizePath('https://example.com/wiki/foo?a=1#top'), 'wiki/foo');
    assert.equal(path.normalizePath('/Wiki/Foo/'), 'wiki/foo', '统一小写');
  });

  it('normalizePath 对空值 / 非字符串安全', () => {
    assert.equal(path.normalizePath(''), '');
    assert.equal(path.normalizePath(null), '');
    assert.equal(path.normalizePath(undefined), '');
    assert.equal(path.normalizePath(42), '');
  });

  it('isNavActive 当前页与导航项一致时为 true', () => {
    assert.equal(path.isNavActive('wiki/foo/index.html', '/wiki/foo/'), true);
    assert.equal(path.isNavActive('wiki/foo.html', 'wiki/foo'), true);
  });

  it('isNavActive 不一致 / 空值为 false', () => {
    assert.equal(path.isNavActive('wiki/foo/index.html', '/wiki/bar/'), false);
    assert.equal(path.isNavActive('', '/wiki/foo/'), false);
    assert.equal(path.isNavActive('wiki/foo', ''), false);
  });
});

// ────────────────────────────────────────────────────────────
// seo：canonical / robots / JSON-LD（Phase 1）
// ────────────────────────────────────────────────────────────

describe('lib/seo', () => {
  it('normalizePagePath 归一化首页 / index.html / 目录型 URL', () => {
    assert.equal(seo.normalizePagePath(''), '/');
    assert.equal(seo.normalizePagePath(undefined), '/');
    assert.equal(seo.normalizePagePath('index.html'), '/');
    assert.equal(seo.normalizePagePath('/'), '/');
    assert.equal(seo.normalizePagePath('2024/01/01/hello/index.html'), '/2024/01/01/hello/');
    assert.equal(seo.normalizePagePath('about/index.html'), '/about/');
    assert.equal(seo.normalizePagePath('about.html'), '/about.html', '文件型 URL 保持原样');
  });

  it('robotsFor 仅归档类页面 noindex，且可整体关闭', () => {
    assert.equal(seo.robotsFor('archive'), 'noindex,follow');
    assert.equal(seo.robotsFor('category'), 'noindex,follow');
    assert.equal(seo.robotsFor('tag'), 'noindex,follow');
    assert.equal(seo.robotsFor('post'), '');
    assert.equal(seo.robotsFor('page'), '');
    assert.equal(seo.robotsFor('home'), '');
    assert.equal(seo.robotsFor('archive', { noindexArchives: false }), '');
  });

  it('buildJsonLd 按页面类型产出对应 schema', () => {
    const post = seo.buildJsonLd({
      type: 'post',
      title: '标题',
      description: '描述',
      url: 'https://example.com/p/',
      author: '作者',
      siteName: '站点',
      datePublished: '2024-01-01T00:00:00.000Z',
      keywords: 'a, b'
    });
    assert.equal(post['@type'], 'BlogPosting');
    assert.equal(post.headline, '标题');
    assert.equal(post.author.name, '作者');
    assert.equal(post.publisher.name, '站点');
    assert.equal(post.datePublished, '2024-01-01T00:00:00.000Z');

    assert.equal(
      seo.buildJsonLd({ type: 'home', siteName: '站点', url: 'https://example.com/' })['@type'],
      'WebSite'
    );
    assert.equal(seo.buildJsonLd({ type: 'page', title: '关于' })['@type'], 'WebPage');
    assert.equal(seo.buildJsonLd({ type: 'archive' }), null, '其他页面类型不输出');
  });

  it('stringifyJsonLd 转义 < > &，空数据返回空串', () => {
    const out = seo.stringifyJsonLd({ '@type': 'WebSite', name: '</script><a>&' });
    assert.ok(out.indexOf('\\u003c') !== -1);
    assert.ok(out.indexOf('\\u003e') !== -1);
    assert.ok(out.indexOf('\\u0026') !== -1);
    assert.ok(out.indexOf('</script>') === -1);
    assert.equal(seo.stringifyJsonLd(null), '');
  });
});

// ────────────────────────────────────────────────────────────
// config-export：前端统一配置（Phase 2）
// ────────────────────────────────────────────────────────────

describe('lib/config-export', () => {
  it('resolveI18n 找不到键时回落缺省值（Hexo __ 会原样返回键名）', () => {
    const t = key => (key === 'copy_code' ? '复制' : key);
    assert.equal(ce.resolveI18n(t, 'copy_code', 'Copy'), '复制');
    assert.equal(ce.resolveI18n(t, 'missing_key', 'Copy'), 'Copy');
    assert.equal(ce.resolveI18n(null, 'copy_code', 'Copy'), 'Copy', '非函数整体回落');
  });

  it('buildFrontendConfig 组装 copy / search / astronomy 三段', () => {
    const cfg = ce.buildFrontendConfig({
      version: '1.2.0',
      t: key => ({ copy_code: '复制', search_empty: '请输入' })[key] || key,
      searchUrl: '/blog/search.json'
    });
    assert.equal(cfg.version, '1.2.0');
    assert.equal(cfg.copy.copy, '复制');
    assert.equal(cfg.copy.copied, 'Copied!', '缺失键回落英文缺省');
    assert.equal(cfg.search.url, '/blog/search.json');
    assert.equal(cfg.search.empty, '请输入');
    assert.equal(cfg.search.noResults, 'No results found');
    assert.equal(cfg.astronomy.noEvents, 'No events for this day');
  });

  it('buildFrontendConfig 不传参时全缺省值', () => {
    const cfg = ce.buildFrontendConfig();
    assert.equal(cfg.version, '');
    assert.equal(cfg.search.url, '/search.json');
  });

  it('stringifyConfig 转义 < > &', () => {
    const out = ce.stringifyConfig({ a: '</script>' });
    assert.ok(out.indexOf('\\u003c') !== -1);
    assert.ok(out.indexOf('</script>') === -1);
  });
});
