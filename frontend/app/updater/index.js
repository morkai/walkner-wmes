// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../broker',
  '../pubsub',
  '../socket',
  '../viewport',
  '../time',
  '../i18n',
  '../data/localStorage',
  './views/RestartMessageView',
  './views/BrowserUpdateDialogView',
  './views/AddressUpdateDialogView',
  'app/updater/templates/backendRestart',
  'app/updater/templates/frontendRestart',
  'i18n!app/nls/updater'
], function(
  _,
  $,
  broker,
  pubsub,
  socket,
  viewport,
  time,
  t,
  localStorage,
  RestartMessageView,
  BrowserUpdateDialogView,
  AddressUpdateDialogView,
  backendRestartTemplate,
  frontendRestartTemplate
) {
  'use strict';

  var MIN_CHROME_VERSION = 70;
  var STORAGE_KEY = 'VERSIONS';
  var BACKEND_SERVICE_KEY = 'BACKEND_SERVICE';
  var FRONTEND_SERVICE_KEY = 'FRONTEND_SERVICE';
  var updater = {};
  var activityTimer = null;
  var restartMessageView = null;
  var backendRestarting = false;
  var frontendRestarting = false;
  var frontendReloading = false;
  var viewsEnabled = true;

  var backendService = window[BACKEND_SERVICE_KEY] || 'backend';
  var frontendService = window[FRONTEND_SERVICE_KEY] || 'frontend';

  var remoteVersions = window[STORAGE_KEY];
  var localVersions = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

  delete window[STORAGE_KEY];
  delete window[FRONTEND_SERVICE_KEY];
  delete window[BACKEND_SERVICE_KEY];

  updater.versions = localVersions && localVersions.time > time.appData
    ? localVersions
    : remoteVersions;

  updater.isRestarting = function() { return backendRestarting || frontendRestarting; };
  updater.isBackendRestarting = function() { return backendRestarting; };
  updater.isFrontendRestarting = function() { return frontendRestarting; };
  updater.isFrontendReloading = function() { return frontendReloading; };

  updater.enableViews = function() { viewsEnabled = true; };
  updater.disableViews = function() { viewsEnabled = false; };

  updater.pull = function(done) { socket.emit('updater.pull', done); };

  updater.getCurrentVersionString = function() { return updater.versions.package; };

  saveLocalStorage();

  socket.on('updater.versions', function(newVersions)
  {
    var oldVersions = updater.versions;

    updater.versions = newVersions;

    if (!_.isEqual(_.omit(newVersions, 'time'), _.omit(oldVersions, 'time')))
    {
      saveLocalStorage();
    }

    if (newVersions.frontend !== oldVersions.frontend)
    {
      handleFrontendRestart();
    }
  });

  pubsub.subscribe('updater.newVersion', function(message)
  {
    broker.publish('updater.newVersion', message);

    if (message.service === backendService)
    {
      handleBackendRestart();
    }
    else if (message.service === frontendService)
    {
      handleFrontendRestart();
    }
  });

  broker.subscribe('viewport.page.shown', function(page)
  {
    showBrowserUpdateDialog(page);
    showAddressUpdateDialog(page);
  });

  function showBrowserUpdateDialog(page)
  {
    if (page.pageId !== 'dashboard'
      || window.navigator.vendor.toLowerCase().indexOf('google') === -1
      || window.sessionStorage.getItem('WMES_BROWSER_UPDATE') === '1')
    {
      return;
    }

    var matches = window.navigator.userAgent.match(/Chrome\/([0-9]+)/);

    if (!matches)
    {
      return;
    }

    var chromeVersion = +matches[1];

    if (chromeVersion >= MIN_CHROME_VERSION)
    {
      return;
    }

    viewport.showDialog(new BrowserUpdateDialogView(), t('updater', 'browserUpdate:title'));
  }

  function showAddressUpdateDialog(page)
  {
    if (page.pageId !== 'dashboard'
      || /\.wmes\.pl$/.test(window.location.hostname)
      || window.location.hostname === 'localhost'
      || window.sessionStorage.getItem('WMES_ADDRESS_UPDATE') === '1'
      || window.document.body.classList.contains('is-embedded'))
    {
      return;
    }

    var req = $.ajax({
      method: 'GET',
      url: 'https://ket.wmes.pl/ping',
      dataType: 'text'
    });

    req.done(function(res)
    {
      if (res === 'pong')
      {
        viewport.showDialog(new AddressUpdateDialogView(), t('updater', 'addressUpdate:title'));
      }
    });
  }

  function saveLocalStorage()
  {
    updater.versions.time = Date.now();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updater.versions));
  }

  function handleBackendRestart()
  {
    if (backendRestarting)
    {
      return;
    }

    backendRestarting = true;

    if (viewsEnabled)
    {
      if (restartMessageView !== null)
      {
        restartMessageView.remove();
      }

      restartMessageView = new RestartMessageView({
        template: backendRestartTemplate,
        type: 'backend'
      });

      viewport.insertView(restartMessageView).render();

      restartMessageView.$el.slideDown();
    }

    broker.subscribe('socket.connected').setLimit(1).on('message', function()
    {
      backendRestarting = false;

      if (!restartMessageView)
      {
        return;
      }

      var oldRestartMessageView = restartMessageView;

      oldRestartMessageView.$el.slideUp(function()
      {
        if (restartMessageView === oldRestartMessageView)
        {
          restartMessageView.remove();
          restartMessageView = null;
        }
      });

      broker.publish('updater.backendRestarted');
    });

    broker.publish('updater.backendRestarting');
  }

  function handleFrontendRestart()
  {
    if (frontendRestarting || backendRestarting)
    {
      return;
    }

    frontendRestarting = true;

    window.addEventListener('mousemove', updateActivityTimer);
    window.addEventListener('keypress', updateActivityTimer);

    if (viewsEnabled)
    {
      if (restartMessageView)
      {
        restartMessageView.cancelAnimations(true, true);
      }

      if (restartMessageView)
      {
        restartMessageView.remove();
      }

      restartMessageView = new RestartMessageView({
        template: frontendRestartTemplate,
        type: 'frontend'
      });

      viewport.insertView(restartMessageView).render();

      restartMessageView.$el.slideDown();
    }

    broker.publish('updater.frontendRestarting');

    if (window.navigator.serviceWorker
      && window.navigator.serviceWorker.getRegistrations)
    {
      window.navigator.serviceWorker.getRegistrations().then(function(registrations)
      {
        registrations.forEach(function(registration)
        {
          registration.unregister().catch(_.noop);
        });
      }).catch(_.noop);
    }

    updateActivityTimer();
  }

  function updateActivityTimer()
  {
    clearTimeout(activityTimer);

    activityTimer = setTimeout(reload, _.random(60000, 120000));
  }

  function reload()
  {
    if (!socket.isConnected())
    {
      return;
    }

    frontendReloading = true;

    broker.publish('updater.frontendReloading');

    window.location.reload();
  }

  window.updater = updater;

  return updater;
});
