/**
 * 共享的 Hexo mock
 *
 * 主题的注册层脚本（scripts 下各目录的 index.js）是「直接执行的脚本」，
 * 靠全局 hexo 对象注册钩子。单测的做法是：先把下面这个 mock 装到 global.hexo，
 * 再 require 被测脚本。
 *
 * 此前 5 个注册层测试文件各自写了一份形状不同的 mock（约 25 行 × 5），
 * 这里是唯一的一份。
 */

'use strict';

const path = require('path');

const ROOT = path.join(__dirname, '..');

/** 注册结果，按 Hexo 扩展点分桶 */
const registry = {
  filters: {}, // name -> fn[]（同一事件允许多个 filter）
  helpers: {}, // name -> fn
  generators: {}, // name -> fn
  tags: {}, // name -> { fn, options }
  events: {} // event -> fn[]
};

/** 可变状态：测试里随时改写，mock 通过 getter 读到最新值 */
const state = {
  themeConfig: {},
  siteConfig: {
    syntax_highlighter: 'highlight.js',
    url: 'https://example.com',
    root: '/',
    relative_link: false,
    pretty_urls: {},
    theme_config: undefined
  },
  logs: { info: [], warn: [] }
};

/** asset_code 用的虚拟资源，两个键分别覆盖「绝对路径」与「相对当前文章」两种解析 */
const FIXTURE = path.join(__dirname, 'fixtures', 'data.txt');
const assets = {
  'data.txt': { path: 'data.txt', source: FIXTURE },
  'posts/hello/data.txt': { path: 'posts/hello/data.txt', source: FIXTURE }
};

/** hexo.locals 的最小 mock（_data 覆盖合并用） */
const localsStore = {};
const localsMock = {
  get(key) {
    return localsStore[key];
  },
  set(key, value) {
    localsStore[key] = value;
  }
};

/** hexo.theme 的稳定 stub：config 属性代理 state.themeConfig，
 *  支持 `hexo.theme.config = merged` 写回（_data 覆盖合并的消费方式） */
const themeStub = {};
Object.defineProperty(themeStub, 'config', {
  get() {
    return state.themeConfig;
  },
  set(value) {
    state.themeConfig = value;
  }
});

function bucket(map, name) {
  if (!map[name]) {
    map[name] = [];
  }
  return map[name];
}

global.hexo = {
  extend: {
    filter: {
      register(name, fn) {
        bucket(registry.filters, name).push(fn);
      }
    },
    helper: {
      register(name, fn) {
        registry.helpers[name] = fn;
      },
      get(name) {
        if (name !== 'url_for') {
          return function () {
            return '';
          };
        }
        // 模拟 hexo-util url_for 的最小行为：拼接站点 root
        // （ alm_canonical 依赖它来应用子目录部署的 root）
        return function (p) {
          const root = state.siteConfig.root || '/';
          return (root.replace(/\/+$/, '') + String(p || '/')).replace(/\/{2,}/g, '/');
        };
      }
    },
    generator: {
      register(name, fn) {
        registry.generators[name] = fn;
      }
    },
    tag: {
      register(name, fn, options) {
        registry.tags[name] = { fn, options };
      }
    },
    highlight: {
      query() {
        return true;
      },
      exec(name, { args }) {
        const [code, opts] = args;
        return (
          '<figure class="highlight ' +
          opts.lang +
          '"><figcaption>' +
          opts.caption +
          '</figcaption><pre>' +
          code +
          '</pre></figure>'
        );
      }
    }
  },

  on(event, fn) {
    bucket(registry.events, event).push(fn);
  },

  get theme() {
    return themeStub;
  },

  get config() {
    return state.siteConfig;
  },

  locals: localsMock,

  log: {
    info(msg) {
      state.logs.info.push(String(msg));
    },
    warn(msg) {
      state.logs.warn.push(String(msg));
    }
  },

  model(name) {
    if (name !== 'Asset') {
      return undefined;
    }
    return {
      findOne(query) {
        return assets[query.path] || null;
      }
    };
  },

  render: {
    /** 极简 markdown 模拟：只包一层 <p>，够断言 tag 的输出结构 */
    renderSync({ text }) {
      return '<p>' + text + '</p>';
    }
  }
};

/**
 * 加载一个注册层脚本并返回它的 module.exports（Hexo 会忽略这个导出，
 * 它只为测试而存在）。require 有缓存，同一文件只执行一次。
 */
function load(relPath) {
  return require(path.join(ROOT, relPath));
}

/** 触发 ready 事件 */
function fireReady() {
  bucket(registry.events, 'ready').forEach(function (fn) {
    fn();
  });
}

/** 触发 generateBefore 事件（配置守卫在此挂载，见 scripts/config/index.js） */
function fireGenerateBefore() {
  bucket(registry.events, 'generateBefore').forEach(function (fn) {
    fn();
  });
}

/** 串起某个事件上的所有 filter，模拟 Hexo 的 filter 链 */
function runFilter(name, input) {
  return bucket(registry.filters, name).reduce(function (acc, fn) {
    return fn(acc) || acc;
  }, input);
}

/** 清空 warn 日志（断言前调用） */
function clearWarns() {
  state.logs.warn.length = 0;
}

module.exports = { registry, state, load, fireReady, fireGenerateBefore, runFilter, clearWarns };
