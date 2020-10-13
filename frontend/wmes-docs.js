// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

(function()
{
  'use strict';

  window.WMES_APP_ID = 'docs';

  window.requireApp = requireApp;

  function requireApp()
  {
    if (window.IS_LINUX && window.parent !== window)
    {
      require(['app/data/localStorage'], function(localStorage)
      {
        localStorage.start(doRequireApp);
      });
    }
    else
    {
      doRequireApp();
    }
  }

  function doRequireApp()
  {
    require([
      'domReady',
      'jquery',
      'backbone',
      'backbone.layout',
      'moment',
      'app/monkeyPatch',
      'app/broker',
      'app/i18n',
      'app/socket',
      'app/router',
      'app/viewport',
      'app/updater/index',
      'app/data/loadedModules',
      'app/core/layouts/BlankLayout',
      'app/core/layouts/PageLayout',
      'app/time',
      'app/wmes-docs-routes',
      'bootstrap',
      'moment-lang/' + window.appLocale,
      'select2-lang/' + window.appLocale,
      'i18n!app/nls/core'
    ], startApp);
  }

  function startApp(
    domReady,
    $,
    Backbone,
    Layout,
    moment,
    monkeyPatch,
    broker,
    i18n,
    socket,
    router,
    viewport,
    updater,
    loadedModules,
    BlankLayout,
    PageLayout)
  {
    var startBroker = broker.sandbox();
    var useSocket = window.location.hash < 1;

    if (useSocket)
    {
      socket.connect();
    }

    moment.locale(window.appLocale);

    $.ajaxSetup({
      dataType: 'json',
      accepts: {
        json: 'application/json',
        text: 'text/plain'
      },
      contentType: 'application/json'
    });

    Layout.configure({
      manage: true,
      el: false,
      keep: true
    });

    viewport.registerLayout('blank', function createBlankLayout()
    {
      return new BlankLayout();
    });

    viewport.registerLayout('page', function createPageLayout()
    {
      return new PageLayout({
        version: updater.getCurrentVersionString(),
        changelogUrl: '#changelog',
        hdHidden: true
      });
    });

    broker.subscribe('page.titleChanged', function(newTitle)
    {
      newTitle.unshift(i18n('orderDocuments', 'TITLE'));

      document.title = newTitle.reverse().join(' < ');
    });

    if (useSocket && navigator.onLine)
    {
      startBroker.subscribe('socket.connected', function()
      {
        startBroker.subscribe('user.reloaded', doStartApp);
      });

      startBroker.subscribe('socket.connectFailed', doStartApp);
    }
    else
    {
      doStartApp();
    }

    function doStartApp()
    {
      startBroker.destroy();
      startBroker = broker.sandbox();

      broker.subscribe('i18n.reloaded', function(message)
      {
        localStorage.setItem('LOCALE', message.newLocale);

        window.location.reload();
      });

      if (typeof window.onPageShown === 'function')
      {
        broker.subscribe('viewport.page.shown', window.onPageShown).setLimit(1);
      }

      domReady(function()
      {
        startBroker.subscribe('viewport.page.shown', reveal).setLimit(1);

        if (window.ENV)
        {
          document.body.classList.add('is-' + window.ENV + '-env');
        }

        Backbone.history.start({
          root: '/',
          hashChange: true,
          pushState: false
        });
      });
    }

    function reveal()
    {
      if (startBroker !== null)
      {
        startBroker.destroy();
        startBroker = null;
      }

      $('#app-loading').remove();
      $('body').removeClass('is-loading');
    }
  }
})();
