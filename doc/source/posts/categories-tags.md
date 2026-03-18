---
title: Categories and Tags Guide
date: 2024-01-01
categories: Documentation
tags: [guide, categories, tags]
---

# Categories and Tags Guide

This guide explains how to use the categories and tags system in Hexo Theme Almagest.

## Overview

Categories and tags are two ways to organize your blog posts:

- **Categories**: Hierarchical organization of content (e.g., Technology > Web Development)
- **Tags**: Flexible labeling system for cross-cutting concerns (e.g., JavaScript, React, Tutorial)

## Using Categories

### Adding Categories to Posts

In your post's front matter, add the `categories` field:

```yaml
---
title: My First Post
date: 2024-01-01
categories: Technology
---
```

For nested categories:

```yaml
---
title: Web Development Tips
date: 2024-01-01
categories:
  - Technology
  - Web Development
---
```

### Viewing Categories

- Visit `/categories/` to see all categories
- Click on a category to view all posts in that category
- The sidebar widget shows all categories with post counts

## Using Tags

### Adding Tags to Posts

In your post's front matter, add the `tags` field:

```yaml
---
title: JavaScript Tips
date: 2024-01-01
tags: [javascript, programming, tips]
---
```

Or as a list:

```yaml
---
title: JavaScript Tips
date: 2024-01-01
tags:
  - javascript
  - programming
  - tips
---
```

### Viewing Tags

- Visit `/tags/` to see all tags in a tag cloud
- Click on a tag to view all posts with that tag
- The sidebar widget shows the most popular tags

## Best Practices

### Categories

1. **Keep it simple**: Use 2-3 main categories
2. **Be consistent**: Use the same category names across posts
3. **Avoid deep nesting**: Limit to 2-3 levels
4. **Use descriptive names**: Make categories clear and meaningful

Example structure:
```
- Technology
  - Web Development
  - Mobile Development
- Lifestyle
  - Travel
  - Food
- Business
```

### Tags

1. **Be specific**: Use specific, descriptive tags
2. **Avoid duplicates**: Don't create similar tags (e.g., "javascript" and "js")
3. **Use lowercase**: Keep tags lowercase for consistency
4. **Limit per post**: Use 3-5 tags per post
5. **Use hyphens**: Use hyphens for multi-word tags (e.g., "web-development")

Example tags:
```
javascript, react, vue, web-development, tutorial, tips, best-practices
```

## Sidebar Widgets

### Categories Widget

The categories widget displays:
- All categories
- Number of posts in each category
- Links to category pages

### Tags Widget

The tags widget displays:
- Top 20 most popular tags
- Tag cloud with size based on post count
- Links to tag pages

## Customization

### Hiding Categories or Tags

To hide the widgets, edit `_config.yml`:

```yaml
sidebar:
  widgets:
    categories: true  # Set to false to hide
    tags: true        # Set to false to hide
```

### Changing Widget Order

Edit the sidebar template at `layout/_partial/sidebar.ejs` to reorder widgets.

### Styling

Customize the appearance in `source/css/_components.styl`:

```stylus
.categories-widget
  // Your custom styles

.tags-widget
  // Your custom styles
```

## Tips and Tricks

### Organizing Large Blogs

For blogs with many posts:

1. Use categories for main topics
2. Use tags for cross-cutting concerns
3. Create a "Popular Tags" section
4. Use tag filtering for discovery

### SEO Optimization

- Use descriptive category and tag names
- Include keywords in category/tag names
- Link related categories and tags
- Create category/tag landing pages

### Content Discovery

- Use tags to create "related posts" sections
- Create tag-based archives
- Use tag clouds for visual navigation
- Link similar tags together

## Troubleshooting

### Categories Not Showing

1. Check that posts have categories in front matter
2. Verify category names are spelled correctly
3. Rebuild the site: `hexo clean && hexo generate`

### Tags Not Showing

1. Check that posts have tags in front matter
2. Verify tag names are spelled correctly
3. Rebuild the site: `hexo clean && hexo generate`

### Duplicate Categories/Tags

1. Check for spelling variations
2. Use consistent naming conventions
3. Rebuild the site to refresh

## See Also

- [Installation Guide](installation.md)
- [Configuration Guide](configuration.md)
- [Search Guide](search.md)
