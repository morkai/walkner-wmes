// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/i18n'
],
function(
  _,
  $,
  broker,
  t
) {
  'use strict';

  var clientId = null;

  var N = window.Notification;
  var sw = window.navigator.serviceWorker;
  var userActions = {};
  var messageHandlers = {
    userAction: function(message)
    {
      if (userActions[message.userAction])
      {
        userActions[message.userAction](message);
      }
    }
  };

  if (sw)
  {
    sw.addEventListener('message', function(e)
    {
      var action = e.data && e.data.action && e.data.action.split('.') || [];

      if (action[0] === 'notifications' && messageHandlers[action[1]])
      {
        messageHandlers[action[1]](e.data);
      }
    });

    act({action: 'getClientId'}, function(err, res)
    {
      if (err)
      {
        return console.error('Failed to get the client ID: %s', err.message);
      }

      clientId = res.clientId;
    });
  }

  function act(message, reply)
  {
    var timeout = setTimeout(
      complete.bind(null, new Error('Timeout.')),
      message.timeout || 1000
    );

    sw.ready.then(function(registration)
    {
      if (!registration.active)
      {
        return complete(new Error('No active registration!'));
      }

      var mc = new MessageChannel();

      mc.port1.onmessage = function(e)
      {
        complete(e.data.error, e.data.result);
      };

      registration.active.postMessage(message, [mc.port2]);
    });

    function complete(err, res)
    {
      if (timeout === null)
      {
        return;
      }

      clearTimeout(timeout);
      timeout = null;

      reply(err, res);
    }
  }

  function getClients(filter, done)
  {
    act({action: 'getClients', filter: filter}, done);
  }

  return window.notifications = {

    messageHandlers: messageHandlers,

    userActions: userActions,

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

      if (!options.data)
      {
        options.data = {};
      }

      return new Promise(function(resolve, reject)
      {
        if (!options.scoreClient)
        {
          return show();
        }

        getClients(null, function(err, clients)
        {
          if (err)
          {
            return reject(err);
          }

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

          if (scored[scored.length - 1].score < 0)
          {
            return resolve(null);
          }

          if (scored[0].clientId !== clientId)
          {
            return resolve(null);
          }

          options.data.bestClientId = scored[0].clientId;

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
    },

    close: function(requiredTags)
    {
      if (!sw)
      {
        return Promise.reject(new Error('Unsupported.'));
      }

      sw.ready
        .then(function(registration) { return registration.getNotifications(); })
        .then(function(notifications)
        {
          notifications.forEach(function(n)
          {
            if (!Array.isArray(requiredTags) || !requiredTags.length)
            {
              n.close();

              return;
            }

            if (!n.tag)
            {
              return;
            }

            var actualTags = n.tag.split(' ');

            if (_.every(requiredTags, function(requiredTag) { return actualTags.includes(requiredTag); }))
            {
              n.close();
            }
          });
        })
        .catch(function(err)
        {
          console.error('[notifications] Failed to close.', {tags: requiredTags, error: err});
        });
    }

  };
});
