// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/core/Viewport'
], function(
  _,
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
    if (window.parent !== window)
    {
      window.parent.postMessage({
        type: 'viewport.page.embeddedLoaded',
        app: window.WMES_APP_ID,
        loaded: true
      }, '*');
    }
  });

  broker.subscribe('viewport.page.loadingFailed', function()
  {
    if (window.parent !== window)
    {
      window.parent.postMessage({
        type: 'viewport.page.embeddedLoaded',
        app: window.WMES_APP_ID,
        loaded: false
      }, '*');
    }
  });

  window.addEventListener('message', function(e)
  {
    var msg = e.data;

    switch (msg.type)
    {
      case 'viewport.page.embeddedLoaded':
        broker.publish('viewport.page.embeddedLoaded', {app: msg.app, loaded: msg.loaded});
        break;
    }
  });

  window.addEventListener('resize', _.debounce(broker.publish.bind(broker, 'viewport.resized'), 1000 / 30));

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
