// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

(function()
{
  'use strict';

  window.requireApp = requireApp;

  function requireApp()
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
      'app/core/layouts/PrintLayout',
      'app/core/layouts/BlankLayout',
      'app/core/views/NavbarView',
      'app/core/views/FormView',
      'app/users/views/LogInFormView',
      'app/time',
      'app/wmes-routes',
      'bootstrap',
      'moment-lang/' + window.appLocale,
      'select2-lang/' + window.appLocale,
      'i18n!app/nls/core',
      'i18n!app/nls/users'
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
    PrintLayout,
    BlankLayout,
    NavbarView,
    FormView,
    LogInFormView)
  {
    var startBroker = null;

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
        views: {
          '.navbar': createNavbarView()
        },
        version: updater.getCurrentVersionString(),
        changelogUrl: '#changelog'
      });
    });

    viewport.registerLayout('print', function createPrintLayout()
    {
      return new PrintLayout();
    });

    viewport.registerLayout('blank', function createBlankLayout()
    {
      return new BlankLayout();
    });

    if (navigator.onLine)
    {
      startBroker = broker.sandbox();

      startBroker.subscribe('socket.connected', function()
      {
        startBroker.subscribe('user.reloaded', doStartApp);
      });

      startBroker.subscribe('socket.connectFailed', doStartApp);

      broker.subscribe('page.titleChanged', function(newTitle)
      {
        newTitle.unshift(i18n('core', 'TITLE'));

        document.title = newTitle.reverse().join(' < ');
      });
    }
    else
    {
      doStartApp();
    }

    function createNavbarView()
    {
      var req = router.getCurrentRequest();
      var navbarView = new NavbarView({
        currentPath: req === null ? '/' : req.path,
        loadedModules: loadedModules.map
      });

      navbarView.on('logIn', function()
      {
        viewport.showDialog(
          new LogInFormView(), i18n('users', 'LOG_IN_FORM:TITLE:LOG_IN')
        );
      });

      navbarView.on('logOut', function()
      {
        $.ajax({
          type: 'GET',
          url: '/logout'
        }).fail(function()
        {
          viewport.msg.show({
            type: 'error',
            text: i18n('core', 'MSG:LOG_OUT:FAILURE'),
            time: 5000
          });
        });
      });

      return navbarView;
    }

    function doStartApp()
    {
      if (startBroker !== null)
      {
        startBroker.destroy();
        startBroker = null;
      }

      var userReloadTimer = null;

      broker.subscribe('i18n.reloaded', function(message)
      {
        localStorage.setItem('LOCALE', message.newLocale);
        viewport.render();
      });

      broker.subscribe('user.reloaded', function()
      {
        if (userReloadTimer)
        {
          clearTimeout(userReloadTimer);
        }

        userReloadTimer = setTimeout(function()
        {
          userReloadTimer = null;

          if (viewport.currentPage && viewport.currentPage.view instanceof FormView)
          {
            return;
          }

          var currentRequest = router.getCurrentRequest();

          viewport.render();

          if (!/^\/production\//.test(currentRequest.path))
          {
            router.dispatch(currentRequest.url);
          }
        }, 1);
      });

      broker.subscribe('user.loggedIn', function()
      {
        if (userReloadTimer)
        {
          clearTimeout(userReloadTimer);
          userReloadTimer = null;
        }

        var req = router.getCurrentRequest();

        if (!req)
        {
          return;
        }

        viewport.render();

        var url = req.url;

        if (url === '/' || url === '/login')
        {
          router.dispatch(window.DASHBOARD_URL_AFTER_LOG_IN || '/');
        }
        else
        {
          router.dispatch(url);
        }
      });

      broker.subscribe('user.loggedOut', function()
      {
        viewport.msg.show({
          type: 'success',
          text: i18n('core', 'MSG:LOG_OUT:SUCCESS'),
          time: 2500
        });

        setTimeout(function()
        {
          broker.publish('router.navigate', {
            url: '/',
            trigger: true
          });
        }, 1);
      });

      domReady(function()
      {
        $('#app-loading').fadeOut(function() { $(this).remove(); });

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
  }
})();
