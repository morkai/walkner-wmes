// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/time',
  'app/broker',
  'app/socket',
  'app/updater/index'
], function(
  t,
  user,
  time,
  broker,
  socket,
  updater
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:LOG';
  var SYNCING_KEY = 'PRODUCTION:LOG:SYNCING';
  var LOCK_KEY = 'PRODUCTION:LOCK';
  var syncingLogEntries = null;
  var enabled = false;

  broker.subscribe('socket.connected', setTimeout.bind(null, sync, 1337));

  broker.subscribe('socket.disconnected', restoreSyncingEntries);

  window.addEventListener('unload', restoreSyncingEntries);

  if (socket.isConnected())
  {
    sync();
  }

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

  function sync()
  {
    if (!enabled
      || !socket.isConnected()
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

    localStorage.removeItem(STORAGE_KEY);

    var unsyncedLogEntries = localStorage.getItem(SYNCING_KEY);

    if (unsyncedLogEntries !== null)
    {
      syncingLogEntries = unsyncedLogEntries + '\n' + syncingLogEntries;
    }

    localStorage.setItem(SYNCING_KEY, syncingLogEntries);

    broker.publish('production.syncing');

    socket.emit('production.sync', syncingLogEntries, function(err)
    {
      syncingLogEntries = null;

      localStorage.removeItem(SYNCING_KEY);

      broker.publish('production.synced', err);

      setTimeout(sync, 1);
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

  function getLock()
  {
    return parseInt(localStorage.getItem(LOCK_KEY) || '0', 10);
  }

  function setLock(value)
  {
    localStorage.setItem(LOCK_KEY, value);
  }

  return {
    generateId: generateId,
    isEnabled: function()
    {
      return enabled;
    },
    enable: function()
    {
      if (enabled)
      {
        return;
      }

      var lock = getLock();

      if (lock !== 0)
      {
        var answer = window.confirm(t('production', 'locked'));

        if (!answer)
        {
          return;
        }
      }

      setLock(1);

      enabled = true;
    },
    disable: function()
    {
      if (!enabled)
      {
        return;
      }

      setLock(0);

      enabled = false;
    },
    isSyncing: function()
    {
      return syncingLogEntries !== null;
    },
    record: function(prodShift, type, data)
    {
      if (prodShift.isLocked())
      {
        return;
      }

      if (!enabled)
      {
        throw new Error("Production log is disabled!");
      }

      var prodLogEntry = {
        secretKey: prodShift.getSecretKey(),
        type: type,
        data: data || {},
        createdAt: time.getMoment().toDate(),
        creator: user.getInfo(),
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        prodShift: prodShift.id,
        prodShiftOrder: prodShift.prodShiftOrder.id || null
      };

      prodLogEntry._id = generateId(prodLogEntry.createdAt, prodShift.id);

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

      setTimeout(sync, 1);
    }
  };
});
