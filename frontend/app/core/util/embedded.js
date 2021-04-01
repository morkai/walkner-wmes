// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/data/localStorage',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/templates/embedded/appsDialog',
  'app/core/templates/embedded/confirmDialog',
  'app/core/templates/embedded/uiLock',
  'app/core/templates/embedded/actions'
], function(
  require,
  $,
  t,
  viewport,
  localStorage,
  View,
  DialogView,
  appsDialogTemplate,
  confirmDialogTemplate,
  uiLockTemplate,
  actionsTemplate
) {
  'use strict';

  var enabled = window.IS_EMBEDDED
    || window.parent !== window
    || window.location.href.indexOf('_embedded=1') !== -1;
  var switchTimer = null;

  function handleWindowMessage(e)
  {
    var msg = e.data || {data: {}};

    switch (msg.type)
    {
      case 'apps':
        handleAppsMessage(msg.data);
        break;
    }
  }

  function handleAppsMessage(data)
  {
    clearTimeout(switchTimer);

    if (!data || !Array.isArray(data.apps) || data.apps.length === 0)
    {
      return;
    }

    if (data.apps.length === 1)
    {
      window.parent.postMessage({type: 'switch', app: window.WMES_APP_ID}, '*');
    }
    else
    {
      showAppsDialog(data.apps);
    }
  }

  function showAppsDialog(apps)
  {
    var viewport = require('app/viewport');

    viewport.showDialog(new View({
      events: {
        'click [data-app]': function(e)
        {
          viewport.closeAllDialogs();

          window.parent.postMessage({
            type: 'switch',
            app: window.WMES_APP_ID,
            newApp: e.currentTarget.dataset.app
          }, '*');
        }
      },
      dialogClassName: 'embedded-appsDialog',
      template: appsDialogTemplate,
      getTemplateData: function() { return {apps: apps}; }
    }));
  }

  window.addEventListener('message', handleWindowMessage);

  return {

    actions: {
      switch: function()
      {
        window.parent.postMessage({type: 'apps'}, '*');

        if (switchTimer)
        {
          clearTimeout(switchTimer);
        }

        switchTimer = setTimeout(
          function() { window.parent.postMessage({type: 'switch', app: window.WMES_APP_ID}, '*'); },
          250
        );
      },
      config: function()
      {
        window.parent.postMessage({type: 'config'}, '*');
      },
      refresh: function()
      {
        window.parent.postMessage({type: 'refresh'}, '*');
      },
      resetBrowser: function()
      {
        window.parent.postMessage({type: 'resetBrowser'}, '*');
      },
      restartBrowser: function()
      {
        window.parent.postMessage({type: 'restartBrowser'}, '*');
      },
      noKiosk: function()
      {
        window.parent.postMessage({type: 'noKiosk'}, '*');
      },
      reboot: function()
      {
        var dialogView = new DialogView({
          dialogClassName: 'embedded-confirmDialog',
          template: confirmDialogTemplate,
          model: {
            action: 'reboot'
          }
        });

        dialogView.once('answered', function(answer)
        {
          if (answer === 'yes')
          {
            window.parent.postMessage({type: 'reboot'}, '*');
          }
        });

        require('app/viewport').showDialog(dialogView, t('core', 'embedded:reboot:title'));
      },
      shutdown: function()
      {
        var dialogView = new DialogView({
          dialogClassName: 'embedded-confirmDialog',
          template: confirmDialogTemplate,
          model: {
            action: 'shutdown'
          }
        });

        dialogView.once('answered', function(answer)
        {
          if (answer === 'yes')
          {
            window.parent.postMessage({type: 'shutdown'}, '*');
          }
        });

        require('app/viewport').showDialog(dialogView, t('core', 'embedded:shutdown:title'));
      },
      lockUi: function()
      {
        var $uiLock = $('.embedded-uiLock');

        if ($uiLock.length)
        {
          return;
        }

        $uiLock = $(uiLockTemplate()).appendTo(document.body);

        $uiLock.find('div').on('click', function()
        {
          localStorage.removeItem('WMES_EMBEDDED_UI_LOCKED');

          $uiLock.remove();
        });

        $uiLock.on('touchstart', function(e)
        {
          if (!$(e.target).closest('.embedded-uiLock-inner').length)
          {
            return false;
          }
        });

        $uiLock.appendTo('body');

        localStorage.setItem('WMES_EMBEDDED_UI_LOCKED', '1');
      }
    },

    isEnabled: function() { return enabled; },

    ready: function(appId)
    {
      if (!enabled)
      {
        return;
      }

      window.parent.postMessage({type: 'ready', app: appId || window.WMES_APP_ID}, '*');
    },

    render: function(view, options)
    {
      if (!enabled)
      {
        return;
      }

      var showCount = 0;
      var showCountTimer = null;

      var actions = Object.assign({}, options && options.actions);

      if (actions.lockUi)
      {
        if (typeof actions.lockUi !== 'object')
        {
          actions.lockUi = {};
        }

        actions.lockUi = Object.assign({
          icon: 'fa-lock',
          handler: this.actions.lockUi,
          title: t('core', 'embedded:actions:lockUi')
        }, actions.lockUi);

        if (localStorage.getItem('WMES_EMBEDDED_UI_LOCKED') === '1')
        {
          view.timers.lockUi = setTimeout(actions.lockUi.handler, 1);
        }
      }

      var $embeddedActions = $(actionsTemplate({
        app: window.WMES_APP_ID,
        left: options && options.left === true,
        actions: actions
      }));

      var handlers = Object.assign({}, this.actions, actions);

      $embeddedActions.on('click', '[data-action]', function(e)
      {
        var action = handlers[e.currentTarget.dataset.action];

        if (action)
        {
          if (typeof action.handler === 'function')
          {
            action.handler(view, action);
          }
          else if (typeof action === 'function')
          {
            action(view, action);
          }
        }

        e.preventDefault();
      });

      $embeddedActions.on('show.bs.dropdown', function()
      {
        showCount += 1;

        clearTimeout(showCountTimer);
        showCountTimer = setTimeout(function() { showCount = 0; }, 2000);

        toggleDevItems(showCount < 3);
      });

      $embeddedActions.on('hidden.bs.dropdown', function()
      {
        toggleDevItems(true);
      });

      $('.embedded-actions').remove();
      $('.modal.fade').removeClass('fade');

      (options && options.container || view.$el).append($embeddedActions);

      function toggleDevItems(hidden)
      {
        $embeddedActions.find('.dev').toggleClass('hidden', hidden);
      }
    }

  };
});
