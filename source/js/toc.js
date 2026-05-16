/**
 * Table of Contents Enhancement
 * 跟随滚动和展开/折叠功能
 */
(function () {
  'use strict';

  // TOC 增强类
  class TocEnhancement {
    constructor() {
      this.tocContainer = document.querySelector('.toc-wrapper');
      this.tocContent = document.querySelector('.toc-content');
      this.tocToggle = document.querySelector('.toc-toggle');
      this.tocLinks = document.querySelectorAll('.toc-content a');
      this.articleHeadings = document.querySelectorAll(
        '.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6'
      );

      if (!this.tocContainer || !this.tocContent) {
        return;
      }

      this.init();
    }

    init() {
      // 初始化跟随滚动
      this.initScrollFollow();

      // 初始化展开/折叠
      this.initExpandCollapse();
    }

    // 跟随滚动 - 自动高亮当前阅读位置
    initScrollFollow() {
      if (!window.tocConfig || !window.tocConfig.scroll_follow) {
        return;
      }

      // 使用 Intersection Observer 检测当前可见的标题
      const observerOptions = {
        rootMargin: '-80px 0px -80% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      const headingObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            const link = this.tocContent.querySelector(`a[href="#${id}"]`);

            if (link) {
              // 移除其他 active 状态
              this.tocLinks.forEach(l => l.classList.remove('active'));
              // 添加 active 状态
              link.classList.add('active');

              // 平滑滚动到视图中
              this.scrollIntoViewIfNeeded(link);
            }
          }
        });
      }, observerOptions);

      // 观察所有标题
      this.articleHeadings.forEach(heading => {
        if (heading.id) {
          headingObserver.observe(heading);
        }
      });

      // 点击目录链接时也设置 active
      this.tocLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.tocLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });
    }

    // 将 active 项平滑滚动到视图中
    scrollIntoViewIfNeeded(element) {
      const container = this.tocContent;
      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;
      const elementHeight = element.clientHeight;

      // 如果元素在容器上方或下方，则滚动
      if (
        elementTop < container.scrollTop ||
        elementTop + elementHeight > container.scrollTop + containerHeight
      ) {
        container.scrollTo({
          top: elementTop - containerHeight / 2 + elementHeight / 2,
          behavior: 'smooth'
        });
      }
    }

    // 展开/折叠功能
    initExpandCollapse() {
      if (!window.tocConfig || !window.tocConfig.expand || !window.tocConfig.expand.enable) {
        return;
      }

      const collapseDepth = window.tocConfig.expand.collapse_depth || 2;

      // 获取所有嵌套的 ul 列表
      const nestedLists = this.tocContent.querySelectorAll('ul');

      nestedLists.forEach(ul => {
        // 检查当前 ul 的深度
        const depth = this.getListDepth(ul);

        if (depth >= collapseDepth) {
          // 获取父级 li
          const parentLi = ul.parentElement;
          if (parentLi && parentLi.tagName === 'LI') {
            // 添加折叠状态
            parentLi.classList.add('toc-item-collapsed');

            // 检查 sessionStorage
            const linkId = parentLi.querySelector('a')?.getAttribute('href') || '';
            const isExpanded = sessionStorage.getItem(`toc-expanded-${linkId}`) === 'true';

            if (isExpanded) {
              parentLi.classList.add('toc-item-expanded');
              parentLi.classList.remove('toc-item-collapsed');
            }

            // 点击切换折叠状态
            const link = parentLi.querySelector('a');
            if (link) {
              link.addEventListener('click', e => {
                // 如果是折叠项的链接，先阻止默认行为
                if (parentLi.classList.contains('toc-item-collapsed')) {
                  e.preventDefault();
                  e.stopPropagation();

                  // 展开
                  parentLi.classList.remove('toc-item-collapsed');
                  parentLi.classList.add('toc-item-expanded');

                  // 保存状态
                  sessionStorage.setItem(`toc-expanded-${linkId}`, 'true');
                }
              });
            }

            // 添加折叠图标
            if (!parentLi.querySelector('.toc-expand-icon')) {
              const expandIcon = document.createElement('span');
              expandIcon.className = 'toc-expand-icon';
              expandIcon.innerHTML =
                '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>';
              expandIcon.style.cssText =
                'margin-left: 4px; cursor: pointer; transition: transform 0.2s;';

              parentLi.querySelector('a').appendChild(expandIcon);
            }
          }
        }
      });

      // 初始化折叠图标旋转
      this.updateExpandIcons();
    }

    // 获取列表的深度
    getListDepth(ul) {
      let depth = 1;
      let parent = ul.parentElement;

      while (parent) {
        if (parent.classList.contains('toc-content')) {
          break;
        }
        if (parent.tagName === 'LI') {
          depth++;
        }
        parent = parent.parentElement;
      }

      return depth;
    }

    // 更新展开图标方向
    updateExpandIcons() {
      const collapsedItems = this.tocContent.querySelectorAll('.toc-item-collapsed');
      collapsedItems.forEach(item => {
        const icon = item.querySelector('.toc-expand-icon');
        if (icon) {
          icon.style.transform = 'rotate(-90deg)';
        }
      });

      const expandedItems = this.tocContent.querySelectorAll('.toc-item-expanded');
      expandedItems.forEach(item => {
        const icon = item.querySelector('.toc-expand-icon');
        if (icon) {
          icon.style.transform = 'rotate(0deg)';
        }
      });
    }
  }

  // 页面加载完成后初始化
  function initTocEnhancement() {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new TocEnhancement();
      });
    } else {
      new TocEnhancement();
    }
  }

  // Pjax 切换后重新初始化
  document.addEventListener('pjax:complete', () => {
    new TocEnhancement();
  });

  initTocEnhancement();
})();
