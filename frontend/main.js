(function()
{
  'use strict';

  var domains = [];
  var i18n = null;
  var select2 = null;

  require.onError = function(err)
  {
    console.error(err);

    var loadingEl = document.getElementById('app-loading');

    if (!loadingEl)
    {
      return;
    }

    loadingEl.className = 'error';

    var spinnerEl = loadingEl.getElementsByClassName('fa-spin')[0];

    if (spinnerEl)
    {
      spinnerEl.classList.remove('fa-spin');
    }
  };

  require.onResourceLoad = function(context, map)
  {
    if (map.prefix === 'i18n')
    {
      var keys = context.defined[map.id];
      var domain = map.id.substr(map.id.lastIndexOf('/') + 1);

      if (i18n !== null)
      {
        i18n.register(domain, keys, map.id);
      }
      else
      {
        domains.push([domain, keys, map.id]);
      }
    }
    else if (map.id === 'app/i18n')
    {
      i18n = context.defined[map.id];
      i18n.config = context.config.config.i18n;

      domains.forEach(function(domainData)
      {
        i18n.register(domainData[0], domainData[1], domainData[2]);
      });

      domains = null;
    }
    else if (map.id === 'select2')
    {
      select2 = context.defined[map.id];
      select2.lang = function(lang)
      {
        window.jQuery.extend(window.jQuery.fn.select2.defaults, select2.lang[lang]);
      };
    }
    else if (/^select2-lang/.test(map.id))
    {
      var lang = map.id.substr(map.id.lastIndexOf('/') + 1);

      select2.lang[lang] = context.defined[map.id];
    }
  };

  function startApp(
    domReady,
    $,
    Backbone,
    Layout,
    moment,
    broker,
    i18n,
    socket,
    router,
    viewport,
    PageLayout,
    PrintLayout,
    NavbarView,
    LogInFormView)
  {
    socket.connect();

    moment.lang(window.LOCALE || 'pl');

    var startBroker = broker.sandbox();

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
        }
      });
    });

    viewport.registerLayout('print', function createPrintLayout()
    {
      return new PrintLayout();
    });

    function createNavbarView()
    {
      var req = router.getCurrentRequest();
      var navbarView = new NavbarView({
        currentPath: req === null ? '/' : req.path
      });

      navbarView.on('logIn', function()
      {
        viewport.showDialog(
          new LogInFormView(), i18n('core', 'LOG_IN_FORM:DIALOG_TITLE')
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
      startBroker.destroy();
      startBroker = null;

      broker.subscribe('i18n.reloaded', function()
      {
        viewport.render();
      });

      broker.subscribe('user.reloaded', function()
      {
        viewport.render();
      });

      broker.subscribe('user.loggedOut', function()
      {
        viewport.msg.show({
          type: 'success',
          text: i18n('core', 'MSG:LOG_OUT:SUCCESS'),
          time: 2500
        });

        broker.publish('router.navigate', {
          url: '/',
          trigger: true
        });
      });

      domReady(function()
      {
        $('#app-loading').fadeOut(function() { $(this).remove(); });

        Backbone.history.start({
          root: '/',
          hashChange: true,
          pushState: false
        });
      });
    }
  }

  function requireApp()
  {
    require([
      'domReady',
      'jquery',
      'backbone',
      'backbone.layout',
      'moment',
      'app/broker',
      'app/i18n',
      'app/socket',
      'app/router',
      'app/viewport',
      'app/core/layouts/PageLayout',
      'app/core/layouts/PrintLayout',
      'app/core/views/NavbarView',
      'app/core/views/LogInFormView',
      'app/time',
      'app/fte/routes',
      'app/orders/routes',
      'app/emptyOrders/routes',
      'app/events/routes',
      'app/users/routes',
      'app/orderStatuses/routes',
      'app/downtimeReasons/routes',
      'app/aors/routes',
      'app/workCenters/routes',
      'app/companies/routes',
      'app/prodTasks/routes',
      'app/divisions/routes',
      'app/dashboard/routes',
      'bootstrap',
      'moment-lang/' + (window.LOCALE || 'pl'),
      'select2-lang/' + (window.LOCALE || 'pl'),
      'i18n!app/nls/core'
    ], startApp);
  }

  if (!document.getElementsByTagName('html')[0].hasAttribute('manifest'))
  {
    return requireApp();
  }

  var appCache = window.applicationCache;

  function doStartApp()
  {
    appCache.onnoupdate = null;
    appCache.oncached = null;
    appCache.onerror = null;
    appCache.onobsolete = null;
    appCache.onupdateready = null;

    requireApp();
  }

  appCache.onnoupdate = doStartApp;
  appCache.oncached = doStartApp;
  appCache.onerror = doStartApp;
  appCache.onobsolete = location.reload.bind(location);
  appCache.onupdateready = location.reload.bind(location);
})();
