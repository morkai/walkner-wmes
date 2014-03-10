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
    BlankLayout,
    NavbarView,
    LogInFormView)
  {
    var startBroker = null;

    monkeyPatch(Backbone, $);

    socket.connect();

    moment.lang(window.LOCALE || 'pl');

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

      navbarView.on('feedback', function(done)
      {
        require(
          [
            'app/feedback/Feedback',
            'app/feedback/views/FeedbackFormView',
            'i18n!app/nls/feedback'
          ],
          function(Feedback, FeedbackFormView)
          {
            var feedbackFormView = new FeedbackFormView({
              done: function(added)
              {
                done();

                if (added)
                {
                  viewport.closeDialog();
                  viewport.msg.show({
                    type: 'success',
                    time: 3000,
                    text: i18n('feedback', 'form:message:success')
                  });
                }
              },
              model: new Feedback(),
              failureText: i18n('feedback', 'form:message:failure')
            });

            viewport.showDialog(feedbackFormView, i18n('feedback', 'dialog:title'));
          }
        );
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

      broker.subscribe('i18n.reloaded', function()
      {
        viewport.render();
      });

      broker.subscribe('user.reloaded', function()
      {
        viewport.render();

        if (viewport.currentPage.pageId === 'error')
        {
          router.dispatch(router.getCurrentRequest().url);
        }
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
      'app/core/layouts/BlankLayout',
      'app/core/views/NavbarView',
      'app/core/views/LogInFormView',
      'app/time',
      'app/routes',
      'app/visibility',
      'app/updater/index',
      'bootstrap',
      'moment-lang/' + (window.LOCALE || 'pl'),
      'select2-lang/' + (window.LOCALE || 'pl'),
      'i18n!app/nls/core'
    ], startApp);
  }

  if (!navigator.onLine || !document.getElementsByTagName('html')[0].hasAttribute('manifest'))
  {
    return requireApp();
  }

  var appCache = window.applicationCache;
  var reload = location.reload.bind(location);
  var reloadTimer = setTimeout(reload, 60000);

  function doStartApp()
  {
    clearTimeout(reloadTimer);
    reloadTimer = null;

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
  appCache.onobsolete = reload;
  appCache.onupdateready = reload;

  function monkeyPatch(Backbone, $)
  {
    var originalSync = Backbone.sync;

    Backbone.sync = function(method, model, options)
    {
      options.syncMethod = method;

      return originalSync.call(this, method, model, options);
    };

    $.fn.modal.Constructor.prototype.enforceFocus = function() {};
  }
})();
