// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../broker',
  '../pubsub',
  '../socket',
  '../viewport',
  '../time',
  './views/RestartMessageView',
  'app/updater/templates/backendRestart',
  'app/updater/templates/frontendRestart',
  'i18n!app/nls/updater'
], function(
  broker,
  pubsub,
  socket,
  viewport,
  time,
  RestartMessageView,
  backendRestartTemplate,
  frontendRestartTemplate
) {
  'use strict';

  var STORAGE_KEY = 'VERSIONS';
  var updater = {};
  var activityTimer = null;
  var restartMessageView = null;
  var backendRestarting = false;
  var frontendRestarting = false;
  var frontendReloading = false;
  var viewsEnabled = true;

  var remoteVersions = window[STORAGE_KEY];
  var localVersions = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

  delete window[STORAGE_KEY];

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

  saveLocalStorage();

  socket.on('updater.versions', function(newVersions)
  {
    var oldVersions = updater.versions;

    updater.versions = newVersions;

    saveLocalStorage();

    if (newVersions.frontend !== oldVersions.frontend)
    {
      handleFrontendRestart();
    }
  });

  pubsub.subscribe('updater.newVersion', function(message)
  {
    broker.publish('updater.newVersion', message);

    if (message.service === 'backend')
    {
      handleBackendRestart();
    }
    else if (message.service === 'frontend')
    {
      handleFrontendRestart();
    }
  });

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

      if (restartMessageView !== null)
      {
        restartMessageView.$el.slideUp(function()
        {
          if (restartMessageView.options.type === 'backend')
          {
            restartMessageView.remove();
            restartMessageView = null;
          }
        });
      }

      broker.publish('updater.backendRestarted');
    });

    broker.publish('updater.backendRestarting');
  }

  function handleFrontendRestart()
  {
    if (frontendRestarting)
    {
      return;
    }

    frontendRestarting = true;

    window.addEventListener('mousemove', updateActivityTimer);
    window.addEventListener('keypress', updateActivityTimer);

    if (viewsEnabled)
    {
      if (restartMessageView !== null)
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

    updateActivityTimer();
  }

  function updateActivityTimer()
  {
    clearTimeout(activityTimer);

    activityTimer = setTimeout(reload, 60000);
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
