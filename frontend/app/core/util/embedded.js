// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/templates/embedded/appsDialog',
  'app/core/templates/embedded/confirmDialog',
  'app/core/templates/embedded/actions'
], function(
  require,
  $,
  t,
  viewport,
  View,
  DialogView,
  appsDialogTemplate,
  confirmDialogTemplate,
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

      var actions = this.actions;
      var $embeddedActions = $(actionsTemplate({
        app: window.WMES_APP_ID,
        left: options && options.left === true
      }));

      $embeddedActions.on('click', '[data-action]', function(e)
      {
        var action = actions[e.currentTarget.dataset.action];

        if (action)
        {
          action();
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
