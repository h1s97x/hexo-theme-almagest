# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026

### Added

#### Phase 1: Basic Framework

**Project Initialization and Configuration**
- Project directory structure with layout/, source/, scripts/, languages/ directories
- package.json with project metadata and dependencies
- ESLint configuration for JavaScript code standards
- Stylelint configuration for CSS/Stylus code standards
- Prettier configuration for code formatting
- Git hooks with husky and lint-staged for pre-commit checks
- .gitignore, LICENSE (MIT), and .editorconfig files
- README.md with project overview and quick start guide

**Basic Template System**
- Main layout template (layout.ejs) with page framework and template inheritance
- Index page template (index.ejs) for displaying article lists with pagination
- Post page template (post.ejs) for displaying article content and metadata
- Page template (page.ejs) for custom standalone pages
- Archive page template (archive.ejs) for chronological article browsing
- 404 error page template (404.ejs)
- Partial components directory (_partial/) with reusable components:
  - head.ejs - page head section
  - header.ejs - page header
  - footer.ejs - page footer

**Style System**
- Stylus-based style system with main.styl entry point
- Variable definitions (_variables.styl) for colors, fonts, and spacing
- Base styles (_base.styl) for global styling and typography
- Layout styles (_layout.styl) for page structure
- Light theme (_theme-light.styl) with light color scheme
- Dark theme (_theme-dark.styl) with dark color scheme
- Support for smooth theme transitions

**Theme Switching Functionality**
- Theme toggle script (source/js/theme.js) for switching between light and dark themes
- Local storage persistence for user theme preference
- System preference detection (prefers-color-scheme)
- Smooth CSS transitions to prevent flickering
- Theme toggle button in header

**Responsive Design**
- Responsive styles (_responsive.styl) with mobile-first approach
- Mobile menu (hamburger menu) for small screens
- Responsive breakpoints:
  - Desktop: > 1024px
  - Tablet: 768px - 1024px
  - Mobile: < 768px
- Optimized typography and spacing for mobile devices
- Touch-friendly interactive elements

**Navigation System**
- Navigation bar component (navbar.ejs) with menu items
- Sidebar component (sidebar.ejs) for additional content
- Menu configuration support through _config.yml
- Breadcrumb navigation for page hierarchy
- Mobile-friendly collapsible menu

**Configuration System**
- _config.yml example configuration file with all available options
- Configuration reading in templates and scripts
- Default value handling for missing configuration items
- Support for customization through configuration

**Basic Documentation and Demo Blog**
- Demo blog structure in doc/ directory
- Demo blog configuration (doc/_config.yml)
- Getting started guide (doc/source/posts/getting-started.md)
- Installation guide (doc/source/posts/installation.md)
- Basic configuration guide (doc/source/posts/configuration.md)

#### Phase 2: Core Features

**Category System**
- Categories page template (layout/categories.ejs)
- Category page generator for automatic page generation
- Categories sidebar widget (categories-widget.ejs)
- Article filtering by category
- Category list display with article counts

**Tag System**
- Tags page template (layout/tags.ejs)
- Tag page generator for automatic page generation
- Tag cloud sidebar widget (tags-widget.ejs)
- Article filtering by tag
- Tag cloud visualization

**Search Functionality**
- Search script (source/js/search.js) with index generation
- Search results page template (layout/search.ejs)
- Search box component (search-box.ejs)
- Full-text search across article titles and content
- Search result highlighting and excerpt display

**Comment System**
- Giscus comment system integration
- Comments component (comments.ejs)
- Comment configuration through _config.yml
- Enable/disable comments per article

**Image Optimization**
- Lazy loading implementation (source/js/lazy-load.js)
- Responsive image support with srcset
- Image error handling with fallback display
- Placeholder display during image loading

**Multilingual Support**
- Language files directory (languages/)
- Chinese (Simplified) translation (languages/zh-CN.yml)
- English translation (languages/en.yml)
- Chinese (Traditional) translation (languages/zh-TW.yml)
- Language configuration support
- UI text translation throughout the theme

**Code Highlighting**
- Code highlight styles (_code-highlight.styl)
- Syntax highlighting for multiple programming languages
- Copy button functionality (source/js/code-copy.js)
- Line number display support
- Code block styling

**User Documentation**
- Categories and tags usage guide
- Search functionality documentation
- Comment system configuration guide
- Image optimization best practices
- Multilingual configuration guide

#### Phase 3: Advanced Features

**Wiki System**
- Wiki page template (layout/wiki.ejs)
- Document tree navigation component (wiki-nav.ejs)
- Multi-project wiki support
- Document hierarchy display

**Topic System**
- Topic page template (layout/topic.ejs)
- Series article management component (topic-nav.ejs)
- Column navigation support
- Series article display and navigation

**Notebooks System**
- Notebooks page template (layout/notebooks.ejs)
- Note categorization component (notebooks-nav.ejs)
- Quick note creation functionality
- Note templates

**Astronomy Theme and Starry Background**
- Astronomy styles (_astronomy.styl)
- Static starry background implementation
- Dynamic starry animation (source/js/astronomy.js)
- Astronomy theme configuration
- Background switching support

**Astronomy Knowledge Cards**
- Astronomy card component (astronomy-card.ejs)
- Constellation information cards with images
- Celestial body information cards
- Astronomy event cards

**Constellation Navigation**
- Constellation navigation component (constellation-nav.ejs)
- 12 constellation display
- Article categorization by constellation
- Constellation page generation
- Constellation image display
- Constellation-based article filtering

**Advanced Features Documentation**
- Wiki usage guide (doc/source/posts/wiki-guide.md)
- Topic usage guide (doc/source/posts/topic-guide.md)
- Notebooks usage guide (doc/source/posts/notebooks-guide.md)
- Astronomy features guide (doc/source/posts/astronomy-guide.md)

#### Phase 4: Community and Release

**Documentation Completion**
- Comprehensive user documentation
- FAQ section (doc/source/posts/faq.md)
- Best practices guide (doc/source/posts/best-practices.md)
- Complete feature documentation

**Astronomy Event Calendar**
- Astronomy event calendar component (astronomy-calendar.ejs)
- Event data management system
- Event reminder functionality
- Event subscription support

**Night Sky Observation Guide**
- Observation guide component (observation-guide.ejs)
- Location-aware functionality
- Visible constellation calculation
- Observation recommendations generation
- Best observation time display

**Astronomy Features Documentation**
- Astronomy event calendar guide (doc/source/posts/astronomy-calendar.md)
- Night sky observation guide (doc/source/posts/observation-guide.md)
- Astronomy best practices documentation

**Development Documentation**
- Project analysis documentation
- System design documentation
- Development guide (DEVELOPMENT.md)
- Quick reference card (QUICK_REFERENCE.md)

**NPM Publishing**
- Version 1.0.0 release
- CHANGELOG.md documentation
- NPM package publication

### Changed

- Improved responsive design for better mobile experience
- Enhanced theme switching with smoother transitions
- Optimized search functionality for better performance
- Refined navigation system for better usability
- Updated documentation with more examples and use cases

### Fixed

- Fixed theme persistence across browser sessions
- Fixed responsive layout issues on various screen sizes
- Fixed search index generation for special characters
- Fixed image lazy loading on slow connections
- Fixed code highlighting for edge cases

### Deprecated

- None in this release

### Removed

- None in this release

### Security

- Implemented Content Security Policy (CSP) headers
- Validated user input to prevent XSS attacks
- Secured local storage usage for theme preferences
- Sanitized search queries

### Performance

- Optimized CSS file size (< 50KB)
- Optimized JavaScript file size (< 30KB)
- Implemented lazy loading for images
- Added caching strategies for static resources
- First Contentful Paint (FCP) < 1.5 seconds
- Largest Contentful Paint (LCP) < 2.5 seconds

## Development Phases

### Phase 1: Basic Framework (Weeks 1-2)
- Project initialization and configuration
- Basic template system
- Style system with light/dark themes
- Theme switching functionality
- Responsive design
- Navigation system
- Configuration system
- Basic documentation

### Phase 2: Core Features (Weeks 3-4)
- Category system
- Tag system
- Search functionality
- Comment system integration
- Image optimization
- Multilingual support
- Code highlighting
- User documentation

### Phase 3: Advanced Features (Weeks 5-6)
- Wiki system
- Topic system
- Notebooks system
- Astronomy theme and starry background
- Astronomy knowledge cards
- Constellation navigation
- Advanced features documentation

### Phase 4: Community and Release (Week 7+)
- Documentation completion
- Astronomy event calendar
- Night sky observation guide
- Astronomy features documentation
- Development documentation
- NPM publishing
- Community feedback handling

## Commit History

### Phase 1 Commits
- `feat: 初始化项目框架和开发工具配置` - Project initialization
- `feat: 实现基础模板系统和页面类型` - Basic templates
- `feat: 实现样式系统和主题定义` - Style system
- `feat: 实现亮暗主题切换和持久化` - Theme switching
- `feat: 实现响应式设计和移动端适配` - Responsive design
- `feat: 实现导航系统和菜单配置` - Navigation system
- `feat: 实现配置系统和默认配置` - Configuration system
- `docs: 添加基础文档和演示博客框架` - Basic documentation

### Phase 2 Commits
- `feat: 实现分类系统和分类页面` - Category system
- `feat: 实现标签系统和标签云` - Tag system
- `feat: 实现全站搜索功能` - Search functionality
- `feat: 集成 Giscus 评论系统` - Comment system
- `feat: 实现图片懒加载和优化` - Image optimization
- `feat: 实现多语言支持` - Multilingual support
- `feat: 实现代码高亮和复制功能` - Code highlighting
- `docs: 在演示博客中添加用户文档` - User documentation

### Phase 3 Commits
- `feat: 实现 Wiki 系统基础功能` - Wiki system
- `feat: 实现 Topic 系统基础功能` - Topic system
- `feat: 实现 Notebooks 系统基础功能` - Notebooks system
- `feat: 实现星空背景和天文主题` - Astronomy theme
- `feat: 实现天文知识卡片系统` - Astronomy cards
- `feat: 实现星座导航和分类` - Constellation navigation
- `docs: 在演示博客中添加高级功能指南` - Advanced features documentation

### Phase 4 Commits
- `docs: 完善演示博客中的用户文档` - Documentation completion
- `feat: 实现天文事件日历` - Astronomy event calendar
- `feat: 实现夜空观测指南` - Observation guide
- `docs: 添加天文功能完整文档` - Astronomy documentation
- `docs: 整理并提交开发文档` - Development documentation
- `chore: 发布 v1.0.0 到 NPM` - NPM publishing

## Installation

To use Hexo Theme Almagest, follow these steps:

1. Install the theme in your Hexo blog:
   ```bash
   npm install hexo-theme-almagest
   ```

2. Update your Hexo configuration (_config.yml):
   ```yaml
   theme: almagest
   ```

3. Copy the theme configuration example:
   ```bash
   cp node_modules/hexo-theme-almagest/_config.yml _config.almagest.yml
   ```

4. Customize the theme configuration as needed

5. Generate and deploy your blog:
   ```bash
   hexo generate
   hexo deploy
   ```

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Light/Dark Theme**: Built-in theme switching with user preference persistence
- **Multilingual Support**: Support for Chinese (Simplified/Traditional) and English
- **Search Functionality**: Full-text search across all articles
- **Comment System**: Integrated Giscus comment system
- **Image Optimization**: Lazy loading and responsive images
- **Code Highlighting**: Syntax highlighting for multiple programming languages
- **Advanced Features**: Wiki, Topic, and Notebooks systems
- **Astronomy Theme**: Starry background and constellation navigation
- **Customizable**: Extensive configuration options for customization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please visit the GitHub repository or check the documentation.

## Acknowledgments

- Inspired by hexo-theme-stellar
- Built with Hexo, EJS, Stylus, and vanilla JavaScript
- Community feedback and contributions

---

For more information, visit the [project documentation](./doc/source/posts/getting-started.md) or the [GitHub repository](https://github.com/yourusername/hexo-theme-almagest).
