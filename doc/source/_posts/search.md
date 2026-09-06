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

- **Real-time search**: Results update as you type (debounced 150 ms)
- **CJK friendly**: Chinese/Japanese/Korean text is indexed with bigrams, so partial
  phrases match without requiring whitespace tokenization
- **Title matching**: Prioritizes matches in post titles
- **Content matching**: Searches post content
- **Highlighting**: Highlights matching terms in results
- **Excerpts**: Shows relevant excerpts from matching posts

## Enabling/Disabling Search

Edit `_config.yml`:

```yaml
features:
  search: true # Set to false to disable
```

## Search Configuration

### Search Index

The search index is automatically generated during build:

```bash
hexo generate
```

The index is stored in `public/search.json`.

Each entry contains only `title`, `url`, `date` and `text` — `text` is the post body
with HTML tags stripped and truncated to `search.index_length` characters.
The index no longer embeds raw post HTML, so its size is bounded by
`posts × index_length` instead of the full site content.

### Index Size

```yaml
# _config.yml
search:
  index_length: 1500 # characters of plain text indexed per post
```

Rough size estimate: `posts × index_length`
(~1 byte per character for English, ~3 bytes for CJK).

- 500 posts at the default `1500`: ~750 KB English / ~2.2 MB CJK (about 1/3 of that after gzip)
- Large sites: lower `index_length` to `600`–`800` to roughly halve it again

Searching only covers the indexed excerpt, so an overly small value means the tail of
long posts is not searchable.

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
});
```

### Customizing Search Box

Edit `layout/_partial/search-box.ejs` to customize the search form.

## Performance

### Search Index Size

The search index size depends on:

- Number of posts
- `search.index_length` (characters of plain text indexed per post)

See [Index Size](#index-size) for the estimate and tuning advice.

### Optimization Tips

1. **Lower `search.index_length`**: The single most effective knob
2. **Compress index**: Use gzip/brotli compression (hosting platforms usually do this)
3. **Lazy load**: The index is fetched on demand when the search page is opened
4. **Cache**: Browser caches the index across visits

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

1. Lower `search.index_length` (smaller index = faster fetch and rebuild)
2. Turn off indexing for posts that do not need it (`search: false` in front matter)
3. Use browser caching
4. Consider an external search service for very large blogs (1000+ long posts)

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
hexo.extend.generator.register('search', function (locals) {
  const searchData = [];

  locals.posts.forEach(post => {
    if (post.published !== false && post.search !== false) {
      searchData.push({
        title: post.title,
        url: post.path,
        // 纯文本片段（toIndexText 会剥离标签并截断到 index_length）
        text: toIndexText(post.content, 1500),
        date: post.date
      });
    }
  });

  return {
    path: 'search.json',
    data: JSON.stringify(searchData)
  };
});
```

Keep the `text` field name — `source/js/search.js` reads it (falling back to `content`
for older indexes).

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

- [Categories and Tags Guide](categories-tags.html)
- [Installation & Configuration FAQ](faq.html)
