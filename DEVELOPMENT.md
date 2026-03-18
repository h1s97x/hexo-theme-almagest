# Hexo Theme Almagest - 开发指南

## 项目概述

Hexo Theme Almagest 是一个功能完整、高度可定制的 Hexo 主题，旨在为开发者提供清晰的学习路径和强大的功能。

## 项目结构

```
hexo-theme-almagest/
├── layout/                 # EJS 模板文件
│   ├── layout.ejs         # 主布局
│   ├── index.ejs          # 首页
│   ├── post.ejs           # 文章页
│   ├── page.ejs           # 页面
│   ├── archive.ejs        # 归档页
│   ├── categories.ejs     # 分类页
│   ├── tags.ejs           # 标签页
│   ├── search.ejs         # 搜索页
│   ├── wiki.ejs           # Wiki 页
│   ├── topic.ejs          # Topic 页
│   ├── notebooks.ejs      # Notebooks 页
│   ├── 404.ejs            # 404 页
│   └── _partial/          # 组件目录
│       ├── head.ejs
│       ├── header.ejs
│       ├── footer.ejs
│       ├── navbar.ejs
│       ├── sidebar.ejs
│       ├── post-card.ejs
│       ├── pagination.ejs
│       ├── comments.ejs
│       ├── search-box.ejs
│       ├── categories-widget.ejs
│       ├── tags-widget.ejs
│       ├── wiki-nav.ejs
│       ├── topic-nav.ejs
│       ├── notebooks-nav.ejs
│       ├── constellation-nav.ejs
│       ├── astronomy-card.ejs
│       ├── astronomy-calendar.ejs
│       └── observation-guide.ejs
├── source/                # 静态资源
│   ├── css/              # 样式文件
│   │   ├── main.styl
│   │   ├── _variables.styl
│   │   ├── _base.styl
│   │   ├── _layout.styl
│   │   ├── _responsive.styl
│   │   ├── _theme-light.styl
│   │   ├── _theme-dark.styl
│   │   ├── _code-highlight.styl
│   │   └── _astronomy.styl
│   └── js/               # JavaScript 文件
│       ├── main.js
│       ├── theme.js
│       ├── sidebar.js
│       ├── search.js
│       ├── lazy-load.js
│       ├── code-copy.js
│       └── astronomy.js
├── scripts/              # Hexo 脚本
│   ├── index.js
│   ├── events.js
│   ├── generators.js
│   ├── helpers.js
│   ├── filters.js
│   └── tags.js
├── languages/            # 多语言文件
│   ├── zh-CN.yml
│   ├── en.yml
│   └── zh-TW.yml
├── _config.yml           # 主题配置示例
├── package.json          # 项目配置
├── README.md             # 项目说明
└── LICENSE               # MIT 许可证
```

## 开发环境设置

### 1. 克隆项目

```bash
git clone https://github.com/your-username/hexo-theme-almagest.git
cd hexo-theme-almagest
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置开发环境

复制配置示例：

```bash
cp _config.example.yml _config.almagest.yml
```

### 4. 启动开发服务器

在演示博客目录中：

```bash
cd doc
hexo server
```

## 代码规范

### JavaScript 规范

- 使用 2 空格缩进
- 使用单引号
- 使用分号
- 使用 const/let，避免 var
- 函数名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

```javascript
// 好的例子
const MAX_ITEMS = 10;

function getUserName(userId) {
  const user = getUser(userId);
  return user.name;
}

// 不好的例子
var max_items = 10;

function get_user_name(userId) {
  var user = getUser(userId);
  return user.name;
}
```

### Stylus 规范

- 使用 2 空格缩进
- 使用单引号
- 使用分号
- 变量名使用 $prefix-name 格式
- 混入名使用 mixin-name 格式

```stylus
// 好的例子
$primary-color = #0066cc
$secondary-color = #666666

mixin-button()
  padding: 0.5rem 1rem
  border-radius: 4px
  cursor: pointer

.button
  mixin-button()
  background: $primary-color
  color: white

// 不好的例子
primary_color = #0066cc

button_mixin()
  padding: 0.5rem 1rem

.button
  button_mixin()
```

### EJS 规范

- 使用 2 空格缩进
- 使用语义化标签
- 属性值使用双引号
- 自闭合标签使用 />

```ejs
<!-- 好的例子 -->
<div class="container">
  <% if (posts.length > 0) { %>
    <ul class="post-list">
      <% posts.forEach(post => { %>
        <li class="post-item">
          <a href="<%= post.path %>"><%= post.title %></a>
        </li>
      <% }); %>
    </ul>
  <% } else { %>
    <p class="no-posts">暂无文章</p>
  <% } %>
</div>

<!-- 不好的例子 -->
<div class='container'>
  <% if (posts.length > 0) %>
    <ul class='post-list'>
      <% posts.forEach(post => %>
        <li class='post-item'>
          <a href='<%= post.path %>'><%= post.title %></a>
        </li>
      <% ); %>
    </ul>
  <% } %>
</div>
```

## 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码风格（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建、依赖等

### Scope 范围

- `layout`: 模板相关
- `style`: 样式相关
- `script`: 脚本相关
- `config`: 配置相关
- `docs`: 文档相关

### 提交示例

```
feat(layout): 实现 Wiki 系统基础功能

- 创建 wiki.ejs 页面模板
- 创建 wiki-nav.ejs 导航组件
- 实现文档树导航
- 支持多项目管理

Closes #123
```

## 开发工作流

### 1. 创建功能分支

```bash
git checkout -b feat/feature-name
```

### 2. 开发功能

- 编写代码
- 遵循代码规范
- 添加注释和文档

### 3. 测试功能

```bash
npm run lint
npm run lint:fix
npm run format
```

### 4. 提交代码

```bash
git add .
git commit -m "feat(scope): description"
```

### 5. 推送到远程

```bash
git push origin feat/feature-name
```

### 6. 创建 Pull Request

在 GitHub 上创建 PR，描述功能和改进。

## 常用命令

### 代码检查

```bash
# ESLint 检查
npm run lint

# ESLint 自动修复
npm run lint:fix

# Stylelint 检查
npm run style:lint

# Stylelint 自动修复
npm run style:lint:fix

# Prettier 格式化
npm run format
```

### 开发服务器

```bash
# 启动开发服务器
cd doc
hexo server

# 生成静态文件
hexo generate

# 清除缓存
hexo clean
```

## 模块开发

### 1. 创建新模板

在 `layout/` 目录下创建新的 EJS 文件：

```ejs
<%- include _partial/head %>
<body>
  <%- include _partial/header %>
  
  <main class="main-content">
    <!-- 页面内容 -->
  </main>
  
  <%- include _partial/footer %>
</body>
</html>
```

### 2. 创建新组件

在 `layout/_partial/` 目录下创建新的 EJS 文件：

```ejs
<div class="component-name">
  <!-- 组件内容 -->
</div>
```

### 3. 创建新样式

在 `source/css/` 目录下创建新的 Stylus 文件：

```stylus
// 导入变量
@import '_variables'

// 定义样式
.component-name
  padding: 1rem
  background: $primary-color
  color: white
```

### 4. 创建新脚本

在 `source/js/` 目录下创建新的 JavaScript 文件：

```javascript
const ComponentName = {
  init() {
    // 初始化逻辑
  },

  method() {
    // 方法实现
  }
};

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ComponentName.init();
  });
} else {
  ComponentName.init();
}
```

## 调试技巧

### 1. 浏览器开发者工具

- 打开 DevTools（F12）
- 检查 HTML 结构
- 调试 JavaScript
- 分析性能

### 2. 控制台日志

```javascript
console.log('调试信息');
console.error('错误信息');
console.warn('警告信息');
```

### 3. 源代码映射

在开发时启用源代码映射，便于调试。

## 性能优化

### 1. 代码分割

- 按需加载脚本
- 分离关键路径

### 2. 缓存策略

- 静态资源缓存
- 搜索索引缓存

### 3. 图片优化

- 懒加载
- 响应式图片
- 图片压缩

### 4. 样式优化

- CSS 最小化
- 关键 CSS 内联
- 移除未使用的 CSS

## 测试

### 1. 单元测试

编写单元测试验证功能：

```javascript
// 示例测试
describe('Theme', () => {
  it('should toggle theme', () => {
    const theme = Theme.getCurrent();
    Theme.toggle();
    expect(Theme.getCurrent()).not.toBe(theme);
  });
});
```

### 2. 集成测试

测试组件之间的交互。

### 3. 端到端测试

测试完整的用户流程。

## 文档编写

### 1. 代码注释

```javascript
/**
 * 获取用户信息
 * @param {number} userId - 用户 ID
 * @returns {Object} 用户对象
 */
function getUser(userId) {
  // 实现
}
```

### 2. README 文档

- 项目描述
- 安装说明
- 使用示例
- 配置选项

### 3. API 文档

- 函数签名
- 参数说明
- 返回值说明
- 使用示例

## 常见问题

### Q: 如何添加新的语言支持？

A: 在 `languages/` 目录下创建新的语言文件，例如 `fr.yml`。

### Q: 如何自定义主题颜色？

A: 编辑 `source/css/_variables.styl` 文件中的颜色变量。

### Q: 如何添加新的页面类型？

A: 在 `layout/` 目录下创建新的 EJS 文件，并在 Hexo 配置中注册。

### Q: 如何扩展主题功能？

A: 创建新的脚本、样式和模板，遵循现有的代码结构和规范。

## 相关资源

- [Hexo 官方文档](https://hexo.io/)
- [EJS 模板引擎](https://ejs.co/)
- [Stylus 预处理器](https://stylus-lang.com/)
- [JavaScript 最佳实践](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

感谢您的贡献！
