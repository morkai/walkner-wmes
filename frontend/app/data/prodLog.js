define([
  'app/user',
  'app/time',
  'app/broker',
  'app/socket'
], function(
  user,
  time,
  broker,
  socket
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:LOG';
  var storage = localStorage;
  var syncingLogEntries = null;
  var enabled = false;

  broker.subscribe('socket.connected', sync.bind(null, true));

  broker.subscribe('socket.disconnected', restoreSyncingEntries);

  window.addEventListener('unload', restoreSyncingEntries);

  if (socket.isConnected())
  {
    sync();
  }

  function restoreSyncingEntries()
  {
    if (!enabled || syncingLogEntries === null)
    {
      return;
    }

    var newLogEntries = storage.getItem(STORAGE_KEY);

    if (newLogEntries === null)
    {
      storage.setItem(STORAGE_KEY, syncingLogEntries + '\n' + newLogEntries);
    }
    else
    {
      storage.setItem(STORAGE_KEY, syncingLogEntries);
    }

    syncingLogEntries = null;

    broker.publish('production.synced', {message: 'DISCONNECT'});
  }

  function sync()
  {
    if (!enabled || !socket.isConnected() || syncingLogEntries !== null)
    {
      return;
    }

    syncingLogEntries = storage.getItem(STORAGE_KEY);

    if (syncingLogEntries === null)
    {
      return;
    }

    storage.removeItem(STORAGE_KEY);

    broker.publish('production.syncing');

    socket.emit('production.sync', syncingLogEntries, function(err)
    {
      syncingLogEntries = null;

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

  return {
    generateId: generateId,
    enable: function()
    {
      enabled = true;
    },
    disable: function()
    {
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

      storage.setItem(STORAGE_KEY, newLogEntries);

      prodShift.saveLocalData();

      setTimeout(sync, 1);
    }
  };
});
