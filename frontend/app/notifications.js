// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/i18n',
  'app/router'
],
function(
  _,
  $,
  broker,
  t,
  router
) {
  'use strict';

  var N = window.Notification;
  var sw = window.navigator.serviceWorker;
  var bc = window.BroadcastChannel ? new window.BroadcastChannel('wmes-notifications') : null;
  var bcActions = {};
  var tabs = {};

  if (sw)
  {
    window.addEventListener('message', e =>
    {
      console.log('window#message', e);
    });
    sw.ready.then(function(registration)
    {
      if (!registration.active)
      {
        return;
      }

      var mc = new MessageChannel();

      mc.port1.onmessage = function(e)
      {
        console.log('port#message', e);
      };

      registration.active.postMessage({action: 'getClientId'}, [mc.port2]);
    });
  }

  function act(action, payload)
  {
    payload.action = action;
  }

  if (bc)
  {
    bc.onmessage = function(e)
    {
      if (bcActions[e.data.action])
      {
        bcActions[e.data.action](e.data);
      }
    };

    window.addEventListener('unload', function()
    {
      bc.postMessage({
        action: 'closeTab',
        tabId: window.INSTANCE_ID
      });
    });

    window.addEventListener('focus', function()
    {
      updateTab({focus: document.hasFocus()});
    });

    window.addEventListener('blur', function()
    {
      updateTab({focus: document.hasFocus()});
    });

    broker.subscribe('viewport.page.shown', refreshTab);

    broker.subscribe('viewport.page.shown').setLimit(1).on('message', function()
    {
      bc.postMessage({action: 'refreshTab'});
    });

    setInterval(refreshTab, 30000);
  }

  bcActions.updateTab = function(message)
  {
    var tab = message.tab;

    if (!tabs[tab._id])
    {
      tabs[tab._id] = {};
    }

    Object.assign(tabs[tab._id], tab);
  };

  bcActions.refreshTab = refreshTab;

  bcActions.closeTab = function(message)
  {
    delete tabs[message.tabId];
  };

  function refreshTab()
  {
    var req = router.currentRequest;

    updateTab({
      request: {
        path: req.path,
        query: req.queryString,
        fragment: req.fragment,
        params: req.params
      },
      focus: document.hasFocus()
    });
  }

  function updateTab(data)
  {
    if (!bc)
    {
      return;
    }

    var message = {
      action: 'updateTab',
      tab: Object.assign({
        _id: window.INSTANCE_ID,
        ts: Date.now()
      }, data)
    };

    bcActions.updateTab(message);
    bc.postMessage(message);
  }

  function getActiveClients(done)
  {

  }

  return window.notifications = {

    renderRequest: function()
    {
      if (!sw || !N || N.permission === 'granted' || N.permission === 'denied')
      {
        return;
      }

      sw.ready.then(function()
      {
        var $request = $('<div class="message message-inline message-warning notifications-request"></div>')
          .append('<p>' + t('core', 'notifications:request:message') + '</p>');

        $request.on('click', function()
        {
          if (N.permission !== 'default')
          {
            $request.remove();

            return;
          }

          N.requestPermission().then(function(permission)
          {
            if (permission === 'granted')
            {
              window.location.reload();
            }
            else if (permission !== 'default')
            {
              $request.remove();
            }
          });
        });

        $('.bd').prepend($request);
      });
    },

    show: function(options)
    {
      if (!N || N.permission !== 'granted')
      {
        return Promise.reject(new Error('Unsupported or disabled.'));
      }

      return new Promise(function(resolve, reject)
      {
        if (!options.scoreClient)
        {
          return show();
        }

        getActiveClients(function(clients)
        {
          if (!clients.length)
          {
            return show();
          }

          var scored = clients.map(function(client)
          {
            return {
              clientId: client._id,
              score: options.scoreClient(client)
            };
          });

          scored.sort(function(a, b)
          {
            return b.score - a.score;
          });

          if (scored[0].score < 0)
          {
            return resolve(null);
          }

          if (!options.data)
          {
            options.data = {};
          }

          options.data.clientId = scored[0].clientId;

          show();
        });

        function show()
        {
          sw.ready.then(function(registration)
          {
            if (!registration.active)
            {
              return reject(new Error('No active SW.'));
            }

            registration
              .showNotification(options.title, options)
              .then(resolve, reject);
          }).catch(reject);
        }
      });
    }

  };
});
