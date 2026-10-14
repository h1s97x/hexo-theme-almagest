/**
 * 注册层单元测试
 *
 * 覆盖 `scripts/{config,filters,generators,helpers,tags}/index.js`。
 * 这 5 个文件是「直接执行的脚本」，会往全局 `hexo` 注册扩展点，
 * 因此测试流程是：装 mock → require 脚本 → 调用注册进去的回调。
 *
 * 注：`scripts/events/index.js` 只往控制台打日志，未纳入单测。
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { registry, state, load, fireReady, runFilter, clearWarns } = require('../setup');

// 装了 mock 之后再加载被测脚本
const configModule = load('scripts/config/index.js');
const pkg = require('../../package.json');

// ────────────────────────────────────────────────────────────
// 注册点契约
//
// 这组断言是「变更探测器」：主题对外暴露的扩展点清单。
// 增删扩展点时需要同步更新这里，这正是它的作用。
// ────────────────────────────────────────────────────────────

describe('注册点契约', () => {
  it('5 个注册层脚本暴露的扩展点与预期一致', () => {
    load('scripts/filters/index.js');
    load('scripts/generators/index.js');
    load('scripts/helpers/index.js');
    load('scripts/tags/index.js');

    assert.deepEqual(Object.keys(registry.generators).sort(), [
      'archive',
      'categories',
      'page',
      'search',
      'search-page',
      'tags'
    ]);
    assert.deepEqual(Object.keys(registry.helpers).sort(), [
      'alm_canonical',
      'alm_export_config',
      'alm_inject',
      'alm_json_ld',
      'alm_robots',
      'get_categories',
      'get_excerpt',
      'get_reading_time',
      'get_tags',
      'is_featured',
      'is_nav_active',
      'theme_version'
    ]);
    assert.deepEqual(Object.keys(registry.tags).sort(), ['alert', 'asset_code', 'button', 'note']);
    assert.deepEqual(Object.keys(registry.filters).sort(), [
      'after_render:html',
      'before_post_render',
      'excerpt'
    ]);
  });

  it('配置校验在 ready 事件上注册', () => {
    assert.equal(registry.events.ready.length, 1);
  });

  it('懒加载挂在渲染层而非 after_post_render（回归保护）', () => {
    // 挂在 after_post_render 会污染 post.content，进而污染 search.json 与 RSS
    assert.equal(registry.filters['after_post_render'], undefined);
  });
});

// ────────────────────────────────────────────────────────────
// config：version 同步 + 配置校验告警
// ────────────────────────────────────────────────────────────

describe('scripts/config', () => {
  it('syncVersion 在站点未覆盖时，把主题 version 对齐 package.json', () => {
    state.themeConfig = { version: '0.0.1' };
    state.siteConfig.theme_config = undefined;
    assert.equal(configModule.syncVersion(global.hexo), true);
    assert.equal(state.themeConfig.version, pkg.version);
  });

  it('syncVersion 尊重站点显式覆盖，不覆盖用户配置', () => {
    state.themeConfig = { version: '9.9.9' };
    state.siteConfig.theme_config = { version: '9.9.9' };
    assert.equal(configModule.syncVersion(global.hexo), false);
    assert.equal(state.themeConfig.version, '9.9.9');
  });

  it('syncVersion 在版本已一致时不做改动', () => {
    state.themeConfig = { version: pkg.version };
    state.siteConfig.theme_config = undefined;
    assert.equal(configModule.syncVersion(global.hexo), false);
  });

  it('ready 时把配置问题写进日志，且不抛错', () => {
    clearWarns();
    state.themeConfig = { prefer_theme: 'dark' }; // 拼错：应为 prefers_theme
    state.siteConfig.theme_config = undefined;
    fireReady();

    const output = state.logs.warn.join('\n');
    assert.ok(output.includes('prefer_theme'), '应提示未知配置项');
    assert.ok(output.includes('配置问题'), '应输出问题汇总');
  });

  it('配置合法时 ready 不输出告警', () => {
    clearWarns();
    state.themeConfig = { title: 'ok', version: pkg.version };
    state.siteConfig.theme_config = undefined;
    fireReady();
    assert.deepEqual(state.logs.warn, []);
  });
});

// ────────────────────────────────────────────────────────────
// filters：图片懒加载注入 + 摘要
// ────────────────────────────────────────────────────────────

describe('scripts/filters', () => {
  function render(html, themeConfig) {
    state.themeConfig = themeConfig || {};
    return runFilter('after_render:html', html);
  }

  it('before_post_render 原样返回数据（占位）', () => {
    const data = { title: 'x' };
    assert.equal(runFilter('before_post_render', data), data);
  });

  it('图片保留 src，并补 data-src 与 loading="lazy"', () => {
    const out = render('<p><img src="/a.jpg" alt="a"></p>', { image: { lazy_load: true } });
    assert.ok(out.includes('src="/a.jpg"'), '应保留 src');
    assert.ok(out.includes('data-src="/a.jpg"'));
    assert.ok(out.includes('loading="lazy"'));
  });

  it('已处理过的图片不重复处理', () => {
    const input = '<p><img data-src="/a.jpg" loading="lazy" alt="a"></p>';
    assert.equal(render(input, { image: { lazy_load: true } }), input);
  });

  it('lazy_load=false、无图片、非字符串输入均原样返回', () => {
    const image = '<p><img src="/a.jpg" alt="a"></p>';
    assert.equal(render(image, { image: { lazy_load: false } }), image);

    const plain = '<p>no image</p>';
    assert.equal(render(plain, {}), plain);

    assert.equal(render(null, {}), null);
  });

  it('excerpt 已存在时不覆盖，否则按默认长度生成', () => {
    const custom = { content: 'body', excerpt: 'custom' };
    runFilter('excerpt', custom);
    assert.equal(custom.excerpt, 'custom');

    const generated = { content: '<p>' + 'x'.repeat(300) + '</p>' };
    runFilter('excerpt', generated);
    assert.ok(generated.excerpt.endsWith('...'));
    assert.equal(generated.excerpt.length, 203);
  });
});

// ────────────────────────────────────────────────────────────
// generators：页面生成 + 搜索索引
// ────────────────────────────────────────────────────────────

describe('scripts/generators', () => {
  const generate = registry.generators;
  const locals = (posts, categories, tags) => ({ posts: posts || [], categories, tags });
  const post = extra =>
    Object.assign({ path: '2024/01/01/x/', published: true, date: new Date('2024-01-01') }, extra);

  it('archive / categories / tags 输出正确的 path、layout 与数据', () => {
    const archive = generate.archive(locals([{ title: 'p1' }]));
    assert.equal(archive.path, 'archives/index.html');
    assert.equal(archive.layout, 'archive');
    assert.equal(archive.data.posts[0].title, 'p1');

    const categories = generate.categories(locals([], ['c1'], []));
    assert.equal(categories.path, 'categories/index.html');
    assert.equal(categories.layout, 'categories');
    assert.deepEqual(categories.data.categories, ['c1']);

    const tags = generate.tags(locals([], [], ['t1']));
    assert.equal(tags.path, 'tags/index.html');
    assert.equal(tags.layout, 'tags');
    assert.deepEqual(tags.data.tags, ['t1']);
  });

  it('page generator：pretty 关闭时与核心行为一致', () => {
    state.themeConfig = { url: { pretty: false } };
    const routes = generate.page({
      pages: [
        { path: 'about/index.html', layout: 'page', content: '<p>a</p>' },
        { path: 'robots.txt', content: 'User-agent: *' },
        { path: 'raw.html', content: '<html/>' }
      ]
    });
    assert.deepEqual(
      routes.map(r => r.path),
      ['about/index.html', 'robots.txt', 'raw.html'],
      'pretty 关闭时路径不动'
    );
    assert.equal(routes[0].data.content, '<p>a</p>', '有 layout 时 data 为文档对象');
    assert.equal(routes[1].data, 'User-agent: *', '无 layout 时 data 为原始内容');
    assert.equal(routes[2].data, '<html/>');
  });

  it('page generator：pretty 开启时改写 foo.html 为 foo/index.html', () => {
    state.themeConfig = { url: { pretty: true } };
    const routes = generate.page({
      pages: [
        { path: 'raw.html', content: '<html/>' },
        { path: 'index.html', content: 'home' },
        { path: 'deep/page.html', layout: 'page', content: 'x' },
        { path: 'about/index.html', layout: 'page', content: 'y' }
      ]
    });
    assert.deepEqual(
      routes.map(r => r.path),
      ['raw/index.html', 'index.html', 'deep/page/index.html', 'about/index.html']
    );
    // 站点根 index 不能被改写（否则输出 index/index.html）
    assert.equal(routes[1].path, 'index.html');
    // 已 pretty 的幂等
    assert.equal(routes[3].path, 'about/index.html');
    state.themeConfig = {};
  });

  it('search 生成 search.json，且跳过未发布文章', () => {
    state.themeConfig = {};
    const out = generate.search(
      locals([
        post({ title: 'Hello', content: 'body text' }),
        post({ title: 'Draft', content: 'secret', published: false })
      ])
    );
    assert.equal(out.path, 'search.json');
    const data = JSON.parse(out.data);
    assert.equal(data.length, 1);
    assert.equal(data[0].title, 'Hello');
    assert.equal(data[0].text, 'body text');
  });

  it('search 的正文剥离 HTML、压缩空白、还原实体', () => {
    state.themeConfig = {};
    const out = generate.search(
      locals([
        post({
          title: 'HTML Post',
          content:
            '<p>Hello   <strong>world</strong></p>\n\n<p>second &amp; paragraph</p><img src="/a.jpg" alt="x">'
        })
      ])
    );
    assert.equal(JSON.parse(out.data)[0].text, 'Hello world second & paragraph');
  });

  it('search 丢弃 script / style，保留 pre 文本', () => {
    state.themeConfig = {};
    const out = generate.search(
      locals([
        post({
          title: 'Code Post',
          content:
            '<style>.a{color:red}</style><script>var tracking = 1;</script><pre><code>keepme</code></pre>'
        })
      ])
    );
    assert.equal(JSON.parse(out.data)[0].text, 'keepme');
  });

  it('search 正文按 search.index_length 截断', () => {
    state.themeConfig = { search: { index_length: 10 } };
    const out = generate.search(
      locals([post({ title: 'Long Post', content: 'abcdefghijklmnopqrstuvwxyz' })])
    );
    assert.equal(JSON.parse(out.data)[0].text, 'abcdefghij');
  });

  it('features.search=false 时不生成索引与搜索页', () => {
    state.themeConfig = { features: { search: false } };
    assert.deepEqual(generate.search(locals([])), []);
    assert.deepEqual(generate['search-page'](locals([])), []);
  });

  it('search-page 生成 /search/ 页面', () => {
    state.themeConfig = {};
    const out = generate['search-page'](locals([]));
    assert.equal(out.path, 'search/index.html');
    assert.equal(out.layout, 'search');
  });
});

// ────────────────────────────────────────────────────────────
// helpers：模板 helper 行为
// ────────────────────────────────────────────────────────────

describe('scripts/helpers', () => {
  const helpers = registry.helpers;

  it('get_reading_time 空内容返回 0，按 200 词/分钟估算，忽略 HTML', () => {
    assert.equal(helpers.get_reading_time(''), 0);
    assert.equal(helpers.get_reading_time(null), 0);
    assert.equal(helpers.get_reading_time(Array(400).fill('word').join(' ')), 2);
    assert.equal(helpers.get_reading_time('<p>Hello world</p><div>This is content</div>'), 1);
  });

  it('get_excerpt 去除 HTML 并截断，长度可自定义', () => {
    const excerpt = helpers.get_excerpt({ content: '<p>' + 'a'.repeat(300) + '</p>' }, 100);
    assert.ok(excerpt.endsWith('...'));
    assert.equal(excerpt.length, 103);
    assert.equal(helpers.get_excerpt({ content: 'short content' }, 200), 'short content');
  });

  it('get_excerpt 优先使用 post.excerpt，缺省长度回落 200', () => {
    const post = { content: 'long body...', excerpt: 'custom excerpt' };
    assert.equal(helpers.get_excerpt(post, 200), 'custom excerpt');
    assert.equal(helpers.get_excerpt({ content: 'y'.repeat(250) }).length, 203);
  });

  it('is_featured 严格判断 featured 标记', () => {
    assert.equal(helpers.is_featured({ featured: true }), true);
    assert.equal(helpers.is_featured({}), false);
    assert.equal(helpers.is_featured({ featured: 'yes' }), false, '非 true 一律为 false');
  });

  it('get_categories / get_tags 缺失时返回空数组', () => {
    assert.deepEqual(helpers.get_categories({ categories: ['a'] }), ['a']);
    assert.deepEqual(helpers.get_categories({}), []);
    assert.deepEqual(helpers.get_tags({ tags: ['t'] }), ['t']);
    assert.deepEqual(helpers.get_tags({}), []);
  });

  it('is_nav_active 容忍 URL / 尾斜杠 / .html / index.html 差异', () => {
    assert.equal(helpers.is_nav_active('wiki/foo/index.html', '/wiki/foo/'), true);
    assert.equal(helpers.is_nav_active('wiki/foo.html', 'wiki/foo'), true);
    assert.equal(
      helpers.is_nav_active('wiki/foo/index.html', 'https://example.com/wiki/foo/'),
      true,
      '导航项配完整 URL 也能匹配'
    );
    assert.equal(helpers.is_nav_active('wiki/foo/index.html', '/wiki/bar/'), false);
    assert.equal(helpers.is_nav_active('', '/wiki/foo/'), false, '空路径不匹配');
    assert.equal(helpers.is_nav_active('wiki/foo', ''), false, '空导航项不匹配');
  });

  it('theme_version 与 package.json 版本一致', () => {
    assert.equal(helpers.theme_version(), pkg.version);
  });

  it('alm_canonical 拼绝对地址并应用 root，未配置 url 时返回空串', () => {
    const ctx = { config: state.siteConfig, path: 'index.html' };
    assert.equal(
      helpers.alm_canonical.call(ctx, { path: '2024/01/01/hello/index.html' }),
      'https://example.com/2024/01/01/hello/'
    );
    assert.equal(
      helpers.alm_canonical.call(ctx, { path: 'about/index.html' }),
      'https://example.com/about/'
    );
    // page.path 缺失时回退 this.path（路由路径）
    assert.equal(helpers.alm_canonical.call(ctx, undefined), 'https://example.com/');

    const savedUrl = state.siteConfig.url;
    state.siteConfig.url = '';
    assert.equal(helpers.alm_canonical.call(ctx, { path: 'foo/index.html' }), '');
    state.siteConfig.url = savedUrl;
  });

  it('alm_robots 归档类页面 noindex，可被配置关闭', () => {
    state.themeConfig.seo = { noindex_archives: true };
    assert.equal(helpers.alm_robots('archive'), 'noindex,follow');
    assert.equal(helpers.alm_robots('category'), 'noindex,follow');
    assert.equal(helpers.alm_robots('tag'), 'noindex,follow');
    assert.equal(helpers.alm_robots('post'), '');
    assert.equal(helpers.alm_robots('home'), '');

    state.themeConfig.seo = { noindex_archives: false };
    assert.equal(helpers.alm_robots('archive'), '');
    state.themeConfig.seo = {};
  });

  it('alm_json_ld 输出转义后的 JSON 字符串', () => {
    const ld = helpers.alm_json_ld({
      type: 'post',
      title: '标题</script>',
      url: 'https://example.com/p/'
    });
    assert.ok(ld.indexOf('"@type":"BlogPosting"') !== -1);
    assert.ok(ld.indexOf('\\u003c') !== -1, '< 必须转义为 \\u003c');
    assert.ok(ld.indexOf('</script>') === -1, '不允许出现未转义的闭合标签');
    assert.equal(helpers.alm_json_ld({ type: 'archive' }), '');
  });

  it('alm_export_config 输出含 copy/search/astronomy 的转义 JSON', () => {
    const ctx = {
      __: key => (key === 'copy_code' ? '复制代码' : key),
      url_for: p => '/blog' + p,
      config: state.siteConfig
    };
    const out = helpers.alm_export_config.call(ctx);
    const parsed = JSON.parse(out);
    assert.equal(parsed.copy.copy, '复制代码');
    assert.equal(parsed.copy.copied, 'Copied!', '缺失键回落缺省值');
    assert.equal(parsed.search.url, '/blog/search.json');
    assert.equal(parsed.version, pkg.version);
    assert.ok(out.indexOf('\\u003c') !== -1 || out.indexOf('<') === -1, '不允许出现未转义 <');
  });

  it('alm_export_config 无 i18n / url_for 上下文时全缺省值', () => {
    const parsed = JSON.parse(helpers.alm_export_config.call({}));
    assert.equal(parsed.copy.copy, 'Copy');
    assert.equal(parsed.search.url, '/search.json');
  });

  it('alm_inject 输出注入点原始 HTML，缺失/非字符串返回空串', () => {
    state.themeConfig = { inject: { head: '<meta>', post_top: '<p>top</p>' } };
    assert.equal(helpers.alm_inject('post_top'), '<p>top</p>');
    assert.equal(helpers.alm_inject('post_bottom'), '');
    assert.equal(helpers.alm_inject('head'), '<meta>');
    assert.equal(helpers.alm_inject(''), '');
    assert.equal(helpers.alm_inject(undefined), '');
    state.themeConfig = { inject: { post_top: 123 } };
    assert.equal(helpers.alm_inject('post_top'), '', '非字符串不输出');
    state.themeConfig = {};
  });
});

// ────────────────────────────────────────────────────────────
// tags：自定义 markdown 标签
// ────────────────────────────────────────────────────────────

describe('scripts/tags', () => {
  const tags = registry.tags;

  it('note 默认 info 类型，且声明为闭合标签', () => {
    assert.equal(
      tags.note.fn([], 'some note content'),
      '<div class="note note-info"><p>some note content</p></div>'
    );
    assert.equal(tags.note.options.ends, true);
  });

  it('note / alert 支持自定义类型', () => {
    assert.equal(
      tags.note.fn(['warning'], 'careful'),
      '<div class="note note-warning"><p>careful</p></div>'
    );
    assert.equal(
      tags.alert.fn(['danger'], 'boom'),
      '<div class="alert alert-danger"><p>boom</p></div>'
    );
  });

  it('button 的默认值与自定义参数', () => {
    assert.equal(tags.button.fn([]), '<a href="#" class="btn btn-primary">Click me</a>');
    assert.equal(
      tags.button.fn(['Go', 'https://example.com', 'success']),
      '<a href="https://example.com" class="btn btn-success">Go</a>'
    );
  });

  it('asset_code 支持按 source 目录相对路径解析', () => {
    const out = tags.asset_code.fn.call({ source: '_posts/hello.md' }, ['data.txt']);
    assert.match(out, /figure class="highlight txt"/);
    assert.match(out, /hello asset content/);
    assert.match(out, /data\.txt/);

    const nested = tags.asset_code.fn.call({ source: 'posts/hello.md' }, ['posts/hello/data.txt']);
    assert.match(nested, /hello asset content/);
  });

  it('asset_code 支持 title / lang / from / to 参数', () => {
    const out = tags.asset_code.fn.call({ source: '_posts/hello.md' }, [
      'data.txt',
      'My Title',
      'lang:js',
      'from:1',
      'to:1'
    ]);
    assert.match(out, /figure class="highlight js"/);
    assert.match(out, /My Title/);
  });

  it('asset_code 找不到资源时返回空串并告警，未提供路径时直接返回空串', () => {
    clearWarns();
    const missing = tags.asset_code.fn.call({ source: '_posts/hello.md' }, ['missing.js']);
    assert.equal(missing, '');
    assert.equal(state.logs.warn.length, 1);
    assert.match(state.logs.warn[0], /Asset not found: missing\.js/);

    assert.equal(tags.asset_code.fn.call({ source: '_posts/hello.md' }, []), '');
  });
});
