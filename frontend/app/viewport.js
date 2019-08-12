// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/broker',
  'app/core/Viewport'
], function(
  broker,
  Viewport
) {
  'use strict';

  var viewport = new Viewport({
    el: document.body,
    selector: '#app-viewport'
  });

  broker.subscribe('router.executing', function()
  {
    window.scrollTo(0, 0);
  });

  broker.subscribe('viewport.page.loaded', function()
  {
    if (window.parent !== window && Array.isArray(window.parent.WMES_PAGE_LOADED))
    {
      window.parent.WMES_PAGE_LOADED.forEach(function(callback)
      {
        callback(true);
      });
    }
  });

  broker.subscribe('viewport.page.loadingFailed', function()
  {
    if (window.parent !== window && Array.isArray(window.parent.WMES_PAGE_LOADED))
    {
      window.parent.WMES_PAGE_LOADED.forEach(function(callback)
      {
        callback(false);
      });
    }
  });

  window.viewport = viewport;

  Object.defineProperty(window, 'page', {
    get: function() { return viewport.currentPage; }
  });

  Object.defineProperty(window, 'dialog', {
    get: function() { return viewport.currentDialog; }
  });

  Object.defineProperty(window, 'model', {
    get: function()
    {
      var view = viewport.currentDialog || viewport.currentPage;

      return view && view.model || view.collection;
    }
  });

  return viewport;
});
