// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'backbone',
  'h5.rql/specialOperators',
  'app/broker',
  'app/viewport',
  'app/core/Router',
  'app/core/pages/ErrorPage'
], function(
  Backbone,
  specialOperators,
  broker,
  viewport,
  Router,
  ErrorPage
) {
  'use strict';

  // Disable Backbone's decodeURIComponent
  Backbone.Router.prototype._extractParameters = function(route, fragment)
  {
    return route.exec(fragment).slice(1);
  };

  var router = new Router(broker);
  var backboneRouter = new Backbone.Router();

  backboneRouter.route('*catchall', 'catchall', function(url)
  {
    router.dispatch(url);
  });

  broker.subscribe('router.navigate', function(message)
  {
    var url = message.url;
    var firstChar = url.charAt(0);

    if (firstChar === '#' || firstChar === '/')
    {
      url = url.substr(1);
    }

    var trigger = message.trigger === true;
    var replace = message.replace === true;

    backboneRouter.navigate(url, {
      trigger: trigger,
      replace: replace
    });

    if (!trigger && replace)
    {
      router.setCurrentRequest(url);
    }
  });

  var notFoundUrl = '/404';

  broker.subscribe('router.404', function(message)
  {
    var req = message.req;

    if (req.path === notFoundUrl)
    {
      viewport.showPage(new ErrorPage({
        model: {
          code: 404,
          req: req,
          previousUrl: router.previousUrl
        }
      }));
    }
    else
    {
      router.dispatch(notFoundUrl);
    }
  });

  broker.subscribe('viewport.page.loadingFailed', function(message)
  {
    viewport.showPage(new ErrorPage({
      model: {
        code: message.xhr.status,
        req: router.currentRequest,
        previousUrl: router.previousUrl,
        xhr: message.xhr
      }
    }));
  });

  window.router = router;

  return router;
});
