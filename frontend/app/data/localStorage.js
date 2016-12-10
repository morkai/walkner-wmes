// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(['jquery'], function($)
{
  'use strict';

  var start = null;
  var timeout = null;
  var remoteData = null;

  function handleWindowMessage(e)
  {
    var msg = e.data;

    if (msg.type !== 'localStorage')
    {
      return;
    }

    window.removeEventListener('message', handleWindowMessage);

    remoteData = msg.data;

    if (Object.keys(remoteData).length === 0)
    {
      Object.keys(localStorage).forEach(function(key)
      {
        remoteData[key] = localStorage[key];
      });

      window.parent.postMessage({type: 'localStorage', action: 'write', data: remoteData}, '*');
    }

    if (timeout)
    {
      clearTimeout(timeout);
      timeout = null;
    }

    if (start)
    {
      start();
      start = null;
    }
  }

  function setRemoteItem(key, value)
  {
    remoteData[key] = value;

    window.parent.postMessage({type: 'localStorage', action: 'setItem', key: key, value: value}, '*');
  }

  function removeRemoteItem(key)
  {
    delete remoteData[key];

    window.parent.postMessage({type: 'localStorage', action: 'remoteItem', key: key}, '*');
  }

  function clearRemoteData()
  {
    window.parent.postMessage({type: 'localStorage', action: 'clear'}, '*');
  }

  window.addEventListener('message', handleWindowMessage);

  return {
    start: function(done)
    {
      if (remoteData)
      {
        return done();
      }

      if (start)
      {
        var oldStart = start;

        start = function() { oldStart(); done(); };

        return;
      }

      start = done;
      timeout = setTimeout(function()
      {
        start();

        window.removeEventListener('message', handleWindowMessage);
        start = null;
        timeout = null;
      }, 333);

      window.parent.postMessage({type: 'localStorage', action: 'read'}, '*');
    },
    getItem: function(key)
    {
      var value = (remoteData ? remoteData : localStorage)[key];

      if (value === undefined)
      {
        return null;
      }

      return value;
    },
    setItem: function(key, value)
    {
      if (remoteData)
      {
        setRemoteItem(key, value);
      }
      else
      {
        localStorage.setItem(key, value);
      }
    },
    removeItem: function(key)
    {
      if (remoteData)
      {
        removeRemoteItem(key);
      }
      else
      {
        localStorage.removeItem(key);
      }
    },
    clear: function()
    {
      if (remoteData)
      {
        clearRemoteData();
      }
      else
      {
        localStorage.clear();
      }
    }
  };
});
