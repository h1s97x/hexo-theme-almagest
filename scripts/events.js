/**
 * Hexo Events
 * Handles Hexo lifecycle events
 */

'use strict';

module.exports = function(hexo) {
  // Before generate
  hexo.on('generateBefore', function() {
    console.log('Minimal Pro: Generating...');
  });

  // After generate
  hexo.on('generateAfter', function() {
    console.log('Minimal Pro: Generation complete');
  });

  // Ready
  hexo.on('ready', function() {
    console.log('Minimal Pro: Theme ready');
  });
};
