---
title: Multi-language Configuration Guide
date: 2024-01-01
categories: Documentation
tags: [guide, multilingual, i18n]
---

# Multi-language Configuration Guide

This guide explains how to configure and use the multi-language support in Hexo Theme Almagest.

## Overview

The theme supports multiple languages out of the box:

- **Simplified Chinese** (zh-CN)
- **English** (en)
- **Traditional Chinese** (zh-TW)

Additional languages can be added easily.

## Setting Site Language

Edit `_config.yml`:

```yaml
language: en  # or zh-CN, zh-TW
```

## Supported Languages

### Simplified Chinese (zh-CN)

```yaml
language: zh-CN
```

File: `languages/zh-CN.yml`

### English (en)

```yaml
language: en
```

File: `languages/en.yml`

### Traditional Chinese (zh-TW)

```yaml
language: zh-TW
```

File: `languages/zh-TW.yml`

## Language Files

### Structure

Language files are YAML files in the `languages/` directory:

```yaml
# Navigation
home: Home
archives: Archives
categories: Categories

# Pagination
prev: Previous
next: Next

# Post
read_more: Read More
updated: Updated
```

### Using Translations in Templates

In EJS templates, use the `__()` function:

```ejs
<h1><%= __('home') %></h1>
<a href="/archives/"><%= __('archives') %></a>
```

### Using Translations in JavaScript

In JavaScript files:

```javascript
const homeText = hexo.config.i18n.__(hexo.config.language, 'home');
```

## Adding a New Language

### Step 1: Create Language File

Create `languages/fr.yml` for French:

```yaml
# French translations
home: Accueil
archives: Archives
categories: Catégories
tags: Étiquettes
about: À propos

# Pagination
prev: Précédent
next: Suivant

# Post
read_more: Lire la suite
updated: Mis à jour
posted_on: Publié le
in: dans
with_tags: avec les étiquettes

# Sidebar
recent_posts: Articles récents
no_posts: Aucun article trouvé

# Comments
comments: Commentaires

# Table of Contents
toc: Table des matières

# Social
social: Liens sociaux

# Footer
powered_by: Alimenté par
theme: Thème

# Search
search: Rechercher
search_results: Résultats de recherche
search_no_results: Aucun résultat trouvé
search_placeholder: Rechercher des articles...
search_desc: Rechercher le contenu du site

# Categories
categories_desc: Parcourir les articles par catégorie
no_categories: Aucune catégorie trouvée

# Tags
tags_desc: Parcourir les articles par étiquette
all_tags: Toutes les étiquettes
no_tags: Aucune étiquette trouvée

# Archive Page
archive: Archives
archive_description: Parcourir tous les articles

# 404 Error Page
page_not_found: Page non trouvée
page_not_found_description: Désolé, la page que vous recherchez n'existe pas ou a été supprimée.
back_to_home: Retour à l'accueil
suggestions: Suggestions
check_url: Vérifiez que l'URL est correcte
try_search: Essayez d'utiliser la fonction de recherche
visit_homepage: Visiter la page d'accueil
browse_menu: Parcourir le menu

# Image
image_loading: Chargement...
image_error: Échec du chargement de l'image

# Code
copy_code: Copier le code
code_copied: Copié
```

### Step 2: Update Configuration

Edit `_config.yml`:

```yaml
language: fr
```

### Step 3: Rebuild Site

```bash
hexo clean
hexo generate
```

## Language-Specific Content

### Creating Language-Specific Posts

Use Hexo's language feature:

```yaml
---
title: My Post
date: 2024-01-01
lang: en
---
```

### Language-Specific Layouts

Create language-specific templates:

- `layout/index.ejs` - Default
- `layout/index.en.ejs` - English
- `layout/index.zh-CN.ejs` - Simplified Chinese

## Customization

### Adding Translations

Edit the language file and add new keys:

```yaml
# New translations
my_custom_key: My Custom Value
```

Use in templates:

```ejs
<%= __('my_custom_key') %>
```

### Overriding Translations

Create a custom language file:

```yaml
# Override default translations
home: My Custom Home
```

### Conditional Translations

In templates:

```ejs
<% if (config.language === 'zh-CN') { %>
  <p>中文内容</p>
<% } else if (config.language === 'en') { %>
  <p>English content</p>
<% } %>
```

## Best Practices

### Translation Quality

1. Use native speakers for translations
2. Maintain consistency across files
3. Test all languages thoroughly
4. Keep translations up-to-date

### Key Naming

1. Use descriptive key names
2. Group related keys
3. Use lowercase with underscores
4. Avoid abbreviations

### Content Organization

1. Keep language files organized
2. Use comments to group sections
3. Maintain alphabetical order
4. Document custom keys

## Troubleshooting

### Translations Not Showing

1. Check language file exists
2. Verify key name is correct
3. Check `__()` function syntax
4. Rebuild site: `hexo clean && hexo generate`

### Wrong Language Displayed

1. Verify `language` setting in `_config.yml`
2. Check language file is correct
3. Clear browser cache
4. Rebuild site

### Missing Translations

1. Check all keys are defined
2. Add missing keys to language file
3. Use fallback language
4. Rebuild site

## Advanced Configuration

### Multiple Language Sites

For multi-language sites, use Hexo's language feature:

```yaml
# _config.yml
language:
  - en
  - zh-CN
  - zh-TW
```

### Language Switcher

Create a language switcher component:

```ejs
<div class="language-switcher">
  <a href="/?lang=en">English</a>
  <a href="/?lang=zh-CN">中文</a>
  <a href="/?lang=zh-TW">繁體中文</a>
</div>
```

### RTL Language Support

For right-to-left languages (Arabic, Hebrew):

```stylus
html[lang="ar"]
  direction rtl
  text-align right
```

## Language Resources

### Translation Services

- **Google Translate**: Quick translations
- **DeepL**: High-quality translations
- **Crowdin**: Community translations
- **Lokalise**: Professional translation platform

### Language Codes

- `en` - English
- `zh-CN` - Simplified Chinese
- `zh-TW` - Traditional Chinese
- `fr` - French
- `de` - German
- `es` - Spanish
- `ja` - Japanese
- `ko` - Korean

## See Also

- [Configuration Guide](configuration.md)
- [Installation Guide](installation.md)
- [Hexo i18n Documentation](https://hexo.io/docs/internationalization)
