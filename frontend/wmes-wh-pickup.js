// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

(function()
{
  'use strict';

  window.WMES_APP_ID = 'wh-pickup';

  window.requireApp = requireApp;

  function requireApp()
  {
    if (window.parent !== window)
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
      'app/core/layouts/PageLayout',
      'app/core/layouts/BlankLayout',
      'app/time',
      'app/wmes-wh-pickup-routes',
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
    PageLayout,
    BlankLayout)
  {
    var startBroker = broker.sandbox();

    socket.connect();

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

    viewport.registerLayout('page', function createPageLayout()
    {
      return new PageLayout({
        version: updater.getCurrentVersionString(),
        changelogUrl: '#changelog',
        hdHidden: false
      });
    });

    viewport.registerLayout('blank', function createBlankLayout()
    {
      return new BlankLayout();
    });

    broker.subscribe('page.titleChanged', function(newTitle)
    {
      newTitle.unshift(i18n('core', 'TITLE'));

      document.title = newTitle.reverse().join(' < ');
    });

    if (navigator.onLine)
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
      broker.subscribe('i18n.reloaded', function(message)
      {
        localStorage.setItem('LOCALE', message.newLocale);

        window.location.reload();
      });

      if (typeof window.onPageShown === 'function')
      {
        broker.subscribe('viewport.page.shown', window.onPageShown);
      }

      domReady(function()
      {
        startBroker.subscribe('viewport.page.shown', reveal);

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
