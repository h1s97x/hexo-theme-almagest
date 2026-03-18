---
title: Image Optimization Guide
date: 2024-01-01
categories: Documentation
tags: [guide, images, performance]
---

# Image Optimization Guide

This guide explains how to optimize images in Hexo Theme Almagest for better performance and user experience.

## Overview

The theme includes built-in image optimization features:

- **Lazy loading**: Images load only when needed
- **Responsive images**: Different sizes for different devices
- **Error handling**: Graceful fallbacks for failed images
- **Placeholder support**: Shows placeholder while loading

## Lazy Loading

### Enabling Lazy Loading

Lazy loading is enabled by default. To disable, edit `_config.yml`:

```yaml
image:
  lazy_load: false
```

### Using Lazy Loading

In your Markdown, use the `data-src` attribute:

```html
<img data-src="/images/my-image.jpg" alt="My Image" />
```

Or in HTML:

```html
<img 
  data-src="/images/my-image.jpg" 
  data-srcset="/images/my-image-small.jpg 480w, /images/my-image-large.jpg 1200w"
  alt="My Image" 
/>
```

### How It Works

1. Image is not loaded initially
2. When image enters viewport, it's loaded
3. `loaded` class is added when complete
4. Smooth fade-in effect

## Responsive Images

### Using srcset

For responsive images, use the `srcset` attribute:

```html
<img 
  src="/images/my-image.jpg"
  srcset="
    /images/my-image-small.jpg 480w,
    /images/my-image-medium.jpg 768w,
    /images/my-image-large.jpg 1200w
  "
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 80vw, 100vw"
  alt="My Image"
/>
```

### Using picture Element

For art direction:

```html
<picture>
  <source media="(max-width: 480px)" srcset="/images/my-image-small.jpg">
  <source media="(max-width: 768px)" srcset="/images/my-image-medium.jpg">
  <img src="/images/my-image-large.jpg" alt="My Image" />
</picture>
```

### Combining Lazy Loading and Responsive

```html
<img 
  data-src="/images/my-image.jpg"
  data-srcset="
    /images/my-image-small.jpg 480w,
    /images/my-image-large.jpg 1200w
  "
  alt="My Image"
/>
```

## Image Formats

### Recommended Formats

| Format | Use Case | Pros | Cons |
|--------|----------|------|------|
| JPEG | Photos | Small file size | Lossy compression |
| PNG | Graphics | Lossless, transparency | Larger file size |
| WebP | Modern browsers | Excellent compression | Limited support |
| AVIF | Future-proof | Best compression | Very limited support |

### Using Modern Formats

```html
<picture>
  <source type="image/webp" srcset="/images/my-image.webp">
  <source type="image/jpeg" srcset="/images/my-image.jpg">
  <img src="/images/my-image.jpg" alt="My Image" />
</picture>
```

## Image Optimization Tools

### Online Tools

- **TinyPNG**: Compress PNG/JPEG
- **ImageOptim**: Batch optimization
- **Squoosh**: Google's image optimizer
- **WebP Converter**: Convert to WebP

### Command Line Tools

```bash
# Using ImageMagick
convert input.jpg -quality 85 output.jpg

# Using ImageOptim
imageoptim *.jpg *.png

# Using cwebp
cwebp input.jpg -o output.webp
```

## Best Practices

### File Size

- Keep images under 500KB
- Use appropriate format for content
- Compress before uploading
- Use responsive images

### Dimensions

- Use actual display size
- Avoid upscaling
- Provide multiple sizes
- Use appropriate aspect ratios

### Accessibility

- Always include `alt` text
- Describe image content
- Use descriptive filenames
- Provide captions when needed

### Performance

- Lazy load below-the-fold images
- Use CDN for image delivery
- Enable browser caching
- Monitor Core Web Vitals

## Configuration

### Placeholder Color

Edit `_config.yml`:

```yaml
image:
  placeholder_color: "#f0f0f0"
```

### Lazy Load Settings

Edit `source/js/lazy-load.js`:

```javascript
const imageObserver = new IntersectionObserver((entries, observer) => {
  // ...
}, {
  rootMargin: '50px'  // Load 50px before entering viewport
});
```

## Styling Images

### Image Container

```stylus
.image-container
  position relative
  overflow hidden
  background-color var(--color-placeholder-bg)
  border-radius $border-radius-lg
  
  img
    width 100%
    height auto
    display block
```

### Image Gallery

```stylus
.image-gallery
  display grid
  grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
  gap $space-lg
  
  .gallery-item
    position relative
    overflow hidden
    border-radius $border-radius-lg
    
    img
      width 100%
      height 100%
      object-fit cover
```

## Troubleshooting

### Images Not Loading

1. Check image path is correct
2. Verify image file exists
3. Check file permissions
4. Verify image format is supported
5. Check browser console for errors

### Lazy Loading Not Working

1. Verify `lazy_load: true` in `_config.yml`
2. Check `data-src` attribute is set
3. Verify browser supports Intersection Observer
4. Check browser console for errors
5. Rebuild site: `hexo clean && hexo generate`

### Images Too Large

1. Compress images before uploading
2. Use appropriate format (WebP, JPEG)
3. Resize to actual display size
4. Use responsive images
5. Enable gzip compression

### Responsive Images Not Working

1. Check `srcset` syntax is correct
2. Verify image files exist
3. Check `sizes` attribute is set
4. Test in different browsers
5. Use browser DevTools to debug

## Performance Metrics

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Image-Specific Metrics

- **Image load time**: < 1s
- **Image file size**: < 500KB
- **Total image size**: < 50% of page size

## Advanced Techniques

### Image Sprites

Combine multiple images into one:

```stylus
.icon
  background-image url('/images/sprites.png')
  background-repeat no-repeat
  display inline-block
  width 24px
  height 24px

.icon-home
  background-position 0 0

.icon-search
  background-position -24px 0
```

### SVG Images

Use SVG for icons and graphics:

```html
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
</svg>
```

### Image Optimization API

Use Hexo plugins for automatic optimization:

```bash
npm install hexo-image-optimizer
```

## See Also

- [Configuration Guide](configuration.md)
- [Installation Guide](installation.md)
- [Performance Best Practices](best-practices.md)
