/**
 * Lazy Load Script
 * Implements lazy loading for images
 */

(function() {
  'use strict';

  function initLazyLoad() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      loadAllImages();
      return;
    }

    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          const srcset = img.getAttribute('data-srcset');

          // Load image
          if (src) {
            img.src = src;
          }
          if (srcset) {
            img.srcset = srcset;
          }

          // Add loaded class
          img.classList.add('loaded');

          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    images.forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Fallback function to load all images
  function loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      const srcset = img.getAttribute('data-srcset');

      if (src) {
        img.src = src;
      }
      if (srcset) {
        img.srcset = srcset;
      }

      img.classList.add('loaded');
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }

})();
