---
title: Search Functionality Guide
date: 2024-01-01
categories: Documentation
tags: [guide, search, features]
---

# Search Functionality Guide

This guide explains how to use and configure the search functionality in Hexo Theme Almagest.

## Overview

The theme includes a built-in search feature that allows visitors to search your blog content without external dependencies.

## Using Search

### Accessing Search

1. Click the search icon in the header
2. Or navigate to `/search/` directly
3. Enter your search query

### Search Features

- **Real-time search**: Results update as you type
- **Title matching**: Prioritizes matches in post titles
- **Content matching**: Searches post content
- **Highlighting**: Highlights matching terms in results
- **Excerpts**: Shows relevant excerpts from matching posts

## Enabling/Disabling Search

Edit `_config.yml`:

```yaml
features:
  search: true  # Set to false to disable
```

## Search Configuration

### Search Index

The search index is automatically generated during build:

```bash
hexo generate
```

The index is stored in `public/search.json`.

### Customizing Search

Edit `source/js/search.js` to customize:

- Number of results displayed
- Search algorithm
- Result formatting
- Excerpt length

## Search Results

### Result Display

Each search result shows:
- **Title**: Post title (clickable link)
- **Excerpt**: Relevant excerpt from the post
- **URL**: Post URL
- **Highlighting**: Matching terms highlighted

### Result Ranking

Results are ranked by:
1. Title matches (higher weight)
2. Content matches (lower weight)
3. Relevance score

## Advanced Usage

### Search Operators

The search supports basic operators:

- **Multiple terms**: `javascript react` (AND search)
- **Phrase search**: Not currently supported
- **Exclusion**: Not currently supported

### Search Tips

1. **Use specific terms**: More specific searches yield better results
2. **Try variations**: If results are poor, try different keywords
3. **Check spelling**: Ensure keywords are spelled correctly
4. **Use categories/tags**: For browsing, use categories or tags instead

## Customization

### Styling Search Results

Edit `source/css/_components.styl`:

```stylus
.search-results
  // Your custom styles

.search-result-item
  // Your custom styles

.result-title
  // Your custom styles
```

### Changing Result Count

Edit `source/js/search.js`, find the `displayResults` function:

```javascript
results.slice(0, 20).forEach(result => {
  // Change 20 to your desired number
})
```

### Customizing Search Box

Edit `layout/_partial/search-box.ejs` to customize the search form.

## Performance

### Search Index Size

The search index size depends on:
- Number of posts
- Average post length
- Content complexity

Typical index sizes:
- 100 posts: ~50KB
- 500 posts: ~250KB
- 1000 posts: ~500KB

### Optimization Tips

1. **Exclude content**: Remove unnecessary content from search
2. **Compress index**: Use gzip compression
3. **Lazy load**: Load search script on demand
4. **Cache**: Browser caches search index

## Troubleshooting

### Search Not Working

1. Check that search is enabled in `_config.yml`
2. Verify `search.json` exists in `public/` directory
3. Check browser console for errors
4. Rebuild site: `hexo clean && hexo generate`

### No Results Found

1. Check post front matter for content
2. Verify posts are published (not in draft)
3. Try different search terms
4. Check for spelling errors

### Search Slow

1. Reduce number of posts in search index
2. Optimize post content
3. Use browser caching
4. Consider external search service for large blogs

## Advanced Configuration

### Excluding Posts from Search

Add to post front matter:

```yaml
---
title: My Post
search: false
---
```

### Custom Search Index

To customize what gets indexed, edit `scripts/generators.js`:

```javascript
hexo.extend.generator.register('search', function(locals) {
  const searchData = [];
  
  locals.posts.forEach(post => {
    if (post.published !== false && post.search !== false) {
      searchData.push({
        title: post.title,
        url: post.path,
        content: post.content,
        date: post.date
      });
    }
  });
  
  return {
    path: 'search.json',
    content: JSON.stringify(searchData)
  };
});
```

## Integration with Other Features

### Search + Categories

Combine search with categories for better content discovery:
1. Use search for keyword-based discovery
2. Use categories for topic-based browsing

### Search + Tags

Combine search with tags for flexible navigation:
1. Use search for specific queries
2. Use tags for related content

## See Also

- [Categories and Tags Guide](categories-tags.md)
- [Configuration Guide](configuration.md)
- [Installation Guide](installation.md)
