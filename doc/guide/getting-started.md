# 快速开始

## 环境要求

- **Node.js**: >= 18.0.0
- **Hexo**: >= 6.0.0
- **包管理器**: pnpm (推荐) 或 npm

## 安装主题

### 方式一：Git 克隆（推荐）

```bash
cd your-hexo-site
git clone https://github.com/h1s97x/hexo-theme-almagest.git themes/almagest
```

### 方式二：npm 安装

```bash
cd your-hexo-site
npm install hexo-theme-almagest --save
```

## 启用主题

修改站点根目录的 `_config.yml`：

```yaml
theme: almagest
```

## 安装依赖

### 必需依赖

```bash
# 本地搜索（可选，但推荐安装）
npm install hexo-generator-searchdb --save
```

### 可选依赖

```bash
# 数学公式支持
npm install hexo-renderer-marked --save

# RSS 订阅
npm install hexo-generator-feed --save

# Sitemap
npm install hexo-generator-sitemap --save
```

## 基础配置

在站点 `_config.yml` 中添加：

```yaml
# 搜索配置
search:
  path: search.xml
  field: post
  content: true

# 文章摘要
excerpt:
  type: truncate
  limit: 200
```

## 验证安装

启动本地服务器：

```bash
hexo server
```

访问 `http://localhost:4000`，如果看到星空主题界面，说明安装成功。

## 下一步

- [配置详解](./config.md) - 了解完整配置项
- [Front-matter 示例](../examples/front-matter.md) - 如何写文章
