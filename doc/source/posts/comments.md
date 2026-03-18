---
title: Comments System Configuration
date: 2024-01-01
categories: Documentation
tags: [guide, comments, giscus]
---

# Comments System Configuration

This guide explains how to set up and configure the Giscus comments system in Hexo Theme Almagest.

## Overview

The theme integrates Giscus, a modern comments system powered by GitHub Discussions. It's lightweight, privacy-friendly, and requires no database.

## Prerequisites

Before setting up Giscus, you need:

1. A GitHub repository (public or private)
2. GitHub Discussions enabled on the repository
3. Giscus app installed on your repository

## Setup Steps

### Step 1: Enable GitHub Discussions

1. Go to your GitHub repository
2. Click "Settings"
3. Scroll to "Features"
4. Check "Discussions"

### Step 2: Install Giscus App

1. Visit [giscus.app](https://giscus.app)
2. Click "Install the app"
3. Select your repository
4. Grant necessary permissions

### Step 3: Get Configuration

1. Go back to [giscus.app](https://giscus.app)
2. Fill in your repository details:
   - Repository owner
   - Repository name
3. Choose mapping (usually "pathname")
4. Copy the configuration values

### Step 4: Configure Theme

Edit `_config.yml`:

```yaml
services:
  giscus:
    enable: true
    repo: "your-username/your-repo"
    repo_id: "your-repo-id"
    category: "Announcements"
    category_id: "your-category-id"
    mapping: "pathname"
    reactions_enabled: true
    emit_metadata: false
    input_position: "bottom"
    theme: "light"
    lang: "en"
    loading: "lazy"
```

### Step 5: Rebuild Site

```bash
hexo clean
hexo generate
```

## Configuration Options

### Basic Settings

| Option | Description | Example |
|--------|-------------|---------|
| `enable` | Enable/disable comments | `true` |
| `repo` | Repository in format owner/name | `user/blog` |
| `repo_id` | Repository ID from Giscus | `R_kgDOA...` |
| `category` | Discussion category | `Announcements` |
| `category_id` | Category ID from Giscus | `DIC_kwDOA...` |

### Mapping Options

| Mapping | Description |
|---------|-------------|
| `pathname` | Use page pathname (recommended) |
| `url` | Use full page URL |
| `title` | Use page title |
| `og:title` | Use Open Graph title |
| `specific` | Use specific term |
| `number` | Use specific number |

### Display Options

| Option | Description | Values |
|--------|-------------|--------|
| `reactions_enabled` | Show emoji reactions | `true`/`false` |
| `emit_metadata` | Emit metadata | `true`/`false` |
| `input_position` | Comment box position | `top`/`bottom` |
| `theme` | Color theme | `light`/`dark`/`preferred_color_scheme` |
| `lang` | Language | `en`/`zh-CN`/`zh-TW`/etc |
| `loading` | Loading behavior | `lazy`/`eager` |

## Enabling/Disabling Comments

### Per Site

Edit `_config.yml`:

```yaml
services:
  giscus:
    enable: false  # Disable for entire site
```

### Per Post

Add to post front matter:

```yaml
---
title: My Post
comments: false
---
```

## Customization

### Styling Comments

The comments section uses default Giscus styling. To customize:

1. Edit `layout/_partial/comments.ejs`
2. Add custom CSS classes
3. Style in `source/css/_components.styl`

Example:

```stylus
.comments-container
  margin-top $space-3xl
  padding-top $space-2xl
  border-top 1px solid var(--color-border)
```

### Changing Theme

To match your site theme, update `_config.yml`:

```yaml
services:
  giscus:
    theme: "preferred_color_scheme"  # Matches site theme
```

## Troubleshooting

### Comments Not Showing

1. Check that `enable: true` in `_config.yml`
2. Verify repository and IDs are correct
3. Ensure GitHub Discussions is enabled
4. Check browser console for errors
5. Rebuild site: `hexo clean && hexo generate`

### "Repository not found" Error

1. Verify repository name is correct
2. Check repository is public (or Giscus app has access)
3. Verify repository ID is correct
4. Ensure Giscus app is installed

### Comments Not Loading

1. Check internet connection
2. Verify GitHub is accessible
3. Check browser console for CORS errors
4. Try different mapping option
5. Clear browser cache

### Theme Not Matching

1. Update `theme` setting in `_config.yml`
2. Use `preferred_color_scheme` for auto-matching
3. Clear browser cache
4. Rebuild site

## Best Practices

### Moderation

1. Monitor discussions regularly
2. Set up GitHub notifications
3. Respond to comments promptly
4. Use GitHub's moderation tools

### Community Guidelines

1. Set clear community guidelines
2. Pin important discussions
3. Lock off-topic discussions
4. Use labels for organization

### Privacy

1. Giscus uses GitHub Discussions (no tracking)
2. Comments are public (visible on GitHub)
3. Users need GitHub account to comment
4. No personal data is stored

## Advanced Configuration

### Custom Mapping

For custom mapping, use:

```yaml
services:
  giscus:
    mapping: "specific"
    term: "my-custom-term"
```

### Multiple Categories

To use different categories for different post types:

1. Create multiple categories in GitHub Discussions
2. Use post front matter to specify category
3. Modify `layout/_partial/comments.ejs` to use dynamic category

### Disabling for Specific Pages

Edit `layout/page.ejs`:

```ejs
<% if (page.comments !== false) { %>
  <%- include('_partial/comments') %>
<% } %>
```

## Migration from Other Systems

### From Disqus

1. Export comments from Disqus
2. Create GitHub Discussions
3. Import comments (manual or script)
4. Update configuration

### From Utterances

1. Giscus is similar to Utterances
2. Both use GitHub (Discussions vs Issues)
3. Manual migration recommended
4. Update configuration

## See Also

- [Configuration Guide](configuration.md)
- [Installation Guide](installation.md)
- [Giscus Documentation](https://giscus.app)
- [GitHub Discussions](https://docs.github.com/en/discussions)
