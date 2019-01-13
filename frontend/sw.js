/* eslint-env serviceworker */
/* eslint strict: 0 */

'use strict';

const messageHandlers = {};
const notificationActions = {};
let errorCount = 0;

self.addEventListener('install', e =>
{
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e =>
{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message', e =>
{
  const response = {
    error: null,
    result: null
  };

  if (messageHandlers[e.data.action])
  {
    messageHandlers[e.data.action](e, (err, res) =>
    {
      response.error = err;
      response.result = res;

      e.ports.forEach(port => port.postMessage(response));
    });
  }
  else
  {
    response.error = new Error('Unknown action: ' + e.data.action);

    e.ports.forEach(port => port.postMessage(response));
  }
});

self.addEventListener('notificationclick', e =>
{
  const n = e.notification;
  const data = n.data || {};
  const onAction = data.onAction && data.onAction[e.action] || data.onClick || {};

  if (onAction.close !== false)
  {
    n.close();
  }

  const promises = [];

  if (onAction.open)
  {
    promises.push(focusOrOpen(onAction.open));
  }
  else if (onAction.focus)
  {
    promises.push(
      self.clients
        .get(typeof onAction.focus === 'string' ? onAction.focus : data.bestClientId)
        .then(client => client.focus())
    );
  }

  if (onAction.notify)
  {
    if (typeof onAction.notify !== 'object')
    {
      onAction.notify = {};
    }

    promises.push(
      self.clients
        .get(onAction.notify.clientId || data.bestClientId)
        .then(client => client.postMessage({
          action: 'notifications.userAction',
          userAction: onAction.notify.userAction || e.action,
          notificationAction: e.action,
          notificationReply: e.reply,
          data: onAction.notify.data || {}
        }))
    );
  }

  if (onAction.act && notificationActions[onAction.act.action])
  {
    promises.push(notificationActions[onAction.act.action](e, onAction.act.data || {}));
  }

  e.waitUntil(Promise.all(promises));
});

self.addEventListener('notificationclose', e =>
{
  e.waitUntil(self.skipWaiting());
});

messageHandlers.getClientId = (e, reply) =>
{
  reply(null, {clientId: e.source.id});
};

messageHandlers.getClients = (e, reply) =>
{
  self.clients
    .matchAll(e.data && e.data.filter || {type: 'window'})
    .then(clients =>
    {
      reply(null, clients.map(client =>
      {
        return {
          _id: client.id,
          type: client.type,
          url: client.url,
          focused: client.focused === true,
          visibilityState: client.visibilityState || 'undetermined'
        };
      }));
    })
    .catch(reply);
};

notificationActions.wmesFapComment = (e, data) =>
{
  if (!data.entryId)
  {
    return Promise.resolve();
  }

  const comment = (e.reply || '').trim();

  if (!comment.replace(/[^a-zA-Z0-9]+/g, '').length)
  {
    return Promise.resolve();
  }

  const init = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    redirect: 'manual',
    body: JSON.stringify({data: {comment: comment}})
  };

  return self.fetch('/fap/entries/' + data.entryId, init)
    .then(res =>
    {
      if (res.status !== 204)
      {
        throw new Error(`Unexpected response status: ${res.status}`);
      }

      return focusOrOpen('/#fap/entries/' + data.entryId);
    })
    .catch(err => showError({
      body: `Failed to comment FAP entry: ${data.entryId}.\n\nReason: ${err && err.message || err}`,
      data: {
        onClick: {
          open: '/#fap/entries/' + data.entryId
        }
      }
    }));
};

function showError(options)
{
  options.tag = 'error-' + (++errorCount);

  self.registration.showNotification('WMES Error', options);

  setTimeout(() =>
  {
    self.registration.getNotifications().then(notifications =>
    {
      const n = notifications.find(n => n.tag === options.tag);

      if (n)
      {
        n.close();
      }
    });
  }, 10000);
}

function focusOrOpen(url)
{
  return self.clients
    .matchAll({type: 'window'})
    .then(clients => clients.find(client => client.url.includes(url)))
    .then(client =>
    {
      if (client)
      {
        return client.focus();
      }

      return self.clients.openWindow(url);
    });
}

function inspect(data) // eslint-disable-line no-unused-vars
{
  self.fetch('/dev/inspect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    redirect: 'manual',
    body: JSON.stringify(data)
  });
}
