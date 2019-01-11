/* eslint-env serviceworker */
/* eslint strict: 0 */

'use strict';

self.addEventListener('install', e =>
{
  e.waitUntil(skipWaiting());
});

self.addEventListener('activate', e =>
{
  e.waitUntil(clients.claim());
});

self.addEventListener('message', e =>
{
  var res = {};

  switch (e.data.action)
  {
    case 'getClientId':
      res.action = 'setClientId';
      res.clientId = e.source.id;
      break;
  }

  if (res.action)
  {
    e.ports.forEach(port => port.postMessage(res));
  }
});

self.addEventListener('notificationclick', e =>
{
  const n = e.notification;

  if (n.data.closeOnClick !== false)
  {
    n.close();
  }

  let promise = Promise.resolve();

  console.log('sw#notificationclick', e);

  event.waitUntil(promise);
});

self.addEventListener('notificationclose', (e) =>
{
  console.log('sw#notificationclose', e);
});
