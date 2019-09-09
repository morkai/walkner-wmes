// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/time',
  'app/broker',
  'app/socket',
  'app/data/localStorage',
  'app/updater/index'
], function(
  _,
  $,
  t,
  user,
  time,
  broker,
  socket,
  localStorage,
  updater
) {
  'use strict';

  var instanceId = window.INSTANCE_ID;
  var STORAGE_KEY = 'PRODUCTION:LOG';
  var SYNCING_KEY = 'PRODUCTION:LOG:SYNCING';
  var LOCK_KEY = 'PRODUCTION:LOCK';
  var syncingLogEntries = null;
  var enabled = false;
  var enableTimer = null;
  var lockTimer = null;
  var scheduleSync = _.debounce(sync, 33);

  broker.subscribe('socket.connected', setTimeout.bind(null, sync, 1337));

  window.addEventListener('unload', restoreSyncingEntries);

  function restoreSyncingEntries()
  {
    if (syncingLogEntries === null)
    {
      return;
    }

    var newLogEntries = localStorage.getItem(STORAGE_KEY);

    if (newLogEntries === null)
    {
      localStorage.setItem(STORAGE_KEY, syncingLogEntries);
    }
    else
    {
      localStorage.setItem(STORAGE_KEY, syncingLogEntries + '\n' + newLogEntries);
    }

    syncingLogEntries = null;

    localStorage.removeItem(SYNCING_KEY);

    broker.publish('production.synced', {message: 'DISCONNECT'});
  }

  function sync(failCount)
  {
    if (!enabled
      || syncingLogEntries !== null
      || updater.isRestarting())
    {
      return;
    }

    syncingLogEntries = localStorage.getItem(STORAGE_KEY);

    if (syncingLogEntries === null)
    {
      return;
    }

    var unsyncedLogEntries = localStorage.getItem(SYNCING_KEY);

    if (unsyncedLogEntries !== null)
    {
      syncingLogEntries = unsyncedLogEntries + '\n' + syncingLogEntries;
    }

    localStorage.setItem(SYNCING_KEY, syncingLogEntries);
    localStorage.removeItem(STORAGE_KEY);

    broker.publish('production.syncing');

    var req = $.ajax({
      method: 'POST',
      url: '/prodLogEntries',
      contentType: 'text/plain; charset=UTF-8',
      data: syncingLogEntries,
      timeout: 10000
    });

    req.fail(function(jqXhr)
    {
      var currentLogEntries = localStorage.getItem(STORAGE_KEY);

      if (currentLogEntries === null)
      {
        currentLogEntries = syncingLogEntries;
      }
      else
      {
        currentLogEntries = syncingLogEntries + '\n' + currentLogEntries;
      }

      localStorage.setItem(STORAGE_KEY, currentLogEntries);
      localStorage.removeItem(SYNCING_KEY);

      syncingLogEntries = null;

      broker.publish('production.synced', {message: jqXhr.responseText});

      failCount = !failCount ? 1 : (failCount + 1);

      setTimeout(sync, Math.min(failCount * 1000, 20000), failCount);
    });

    req.done(function(data)
    {
      localStorage.removeItem(SYNCING_KEY);

      syncingLogEntries = null;

      broker.publish('production.synced', null);

      if (data && data.lock)
      {
        broker.publish('production.locked', data.lock);
      }

      setTimeout(sync, 100);
    });
  }

  // http://stackoverflow.com/a/7616484
  function hashCode(str)
  {
    var hash = 0;

    for (var i = 0, l = str.length; i < l; ++i)
    {
      hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
    }

    return hash;
  }

  function generateId(date, str)
  {
    return date.getTime().toString(36)
      + hashCode(str).toString(36)
      + Math.round(Math.random() * 10000000000000000).toString(36);
  }

  function createLogEntry(prodShift, type, data, createdAt)
  {
    if (!createdAt)
    {
      createdAt = time.getMoment().toDate();
    }

    return {
      _id: generateId(createdAt, prodShift.id),
      instanceId: instanceId,
      secretKey: prodShift.getSecretKey(),
      type: type,
      data: data || {},
      createdAt: createdAt,
      creator: user.getInfo(),
      division: prodShift.get('division'),
      subdivision: prodShift.get('subdivision'),
      mrpControllers: prodShift.get('mrpControllers'),
      prodFlow: prodShift.get('prodFlow'),
      workCenter: prodShift.get('workCenter'),
      prodLine: prodShift.prodLine.id,
      station: prodShift.prodLine.station,
      prodShift: prodShift.id,
      prodShiftOrder: prodShift.prodShiftOrder.id || null
    };
  }

  return {
    generateId: generateId,
    isEnabled: function() { return enabled; },
    enable: function(deferred)
    {
      if (enabled)
      {
        if (deferred)
        {
          enableTimer = setTimeout(function()
          {
            enableTimer = null;
            deferred.resolve();
          }, 1);
        }

        return;
      }

      if (!deferred)
      {
        enabled = true;

        return;
      }

      if (lockTimer)
      {
        clearInterval(lockTimer);
      }

      if (enableTimer)
      {
        clearTimeout(enableTimer);
      }

      window.removeEventListener('storage', onStorage);
      window.addEventListener('storage', onStorage);

      var embedded = window.parent !== window || window.ENV === 'development';

      lockTimer = setInterval(onLockTimeout, embedded ? 333333 : 333);
      enableTimer = setTimeout(onEnableTimeout, embedded ? 1 : 2000);

      function onLockTimeout()
      {
        localStorage.setItem(LOCK_KEY, JSON.stringify({
          instanceId: instanceId,
          time: Date.now()
        }));
      }

      function onEnableTimeout()
      {
        enableTimer = null;

        if (deferred && deferred.state() === 'pending')
        {
          enabled = true;

          setTimeout(sync, 1000);

          deferred.resolve();
        }
      }

      function onStorage(e)
      {
        if (e.key !== LOCK_KEY)
        {
          return;
        }

        var lock = JSON.parse(e.newValue);

        if (lock.instanceId !== instanceId)
        {
          if (deferred)
          {
            deferred.reject();
            deferred = null;
          }
          else
          {
            broker.publish('production.duplicateDetected', {
              thisInstanceId: instanceId,
              thatInstanceId: lock.instanceId
            });
          }
        }
      }
    },
    disable: function()
    {
      if (!enabled)
      {
        return;
      }

      if (enableTimer)
      {
        clearTimeout(enableTimer);
        enableTimer = null;
      }

      if (lockTimer)
      {
        clearInterval(lockTimer);
        lockTimer = null;
      }

      enabled = false;
    },
    isSyncing: function()
    {
      return syncingLogEntries !== null;
    },
    create: createLogEntry,
    record: function(prodShift, typeOrLogEntry, data, createdAt)
    {
      if (prodShift.isLocked())
      {
        return;
      }

      if (!enabled)
      {
        throw new Error('Production log is disabled!');
      }

      var prodLogEntry = typeof typeOrLogEntry === 'object'
        ? typeOrLogEntry
        : createLogEntry(prodShift, typeOrLogEntry, data, createdAt);

      var oldLogEntries = localStorage.getItem(STORAGE_KEY);
      var newLogEntries;

      if (oldLogEntries === null)
      {
        newLogEntries = JSON.stringify(prodLogEntry);
      }
      else
      {
        newLogEntries = oldLogEntries + '\n' + JSON.stringify(prodLogEntry);
      }

      localStorage.setItem(STORAGE_KEY, newLogEntries);

      prodShift.saveLocalData();

      scheduleSync();
    }
  };
});
