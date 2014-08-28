// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../pubsub',
  './ProdLineStateCollection'
], function(
  pubsub,
  ProdLineStateCollection)
{
  'use strict';

  var loading = false;
  var loaded = false;
  var unloadTimer = null;
  var stateChangedMessageQueue = [];
  var stateChangedSub = null;
  var collection = new ProdLineStateCollection();

  function handleStateChangedMessage(message)
  {
    if (loading)
    {
console.log('handleStateChangedMessage > loading', message);
      return stateChangedMessageQueue.push(message);
    }

    var prodLineState = collection.get(message._id);

    if (prodLineState && message.v > prodLineState.get('v'))
    {
console.log('handleStateChangedMessage', message);
      prodLineState.set(message);
    }
    else
    {
console.log('handleStateChangedMessage > ignored v%d vs v%d', message.v, prodLineState.get('v'), message);
    }
  }

  collection.on('request', function()
  {
    loading = true;
  });

  collection.on('sync', function()
  {
    loading = false;
    loaded = true;

    stateChangedMessageQueue.forEach(handleStateChangedMessage);
    stateChangedMessageQueue = [];
  });

  collection.on('error', function()
  {
    loading = false;
    loaded = false;
    stateChangedMessageQueue = [];

    collection.reset([]);
  });

  return {
    collection: collection,
    load: function()
    {
      if (loaded)
      {
        return;
      }

      if (stateChangedSub === null)
      {
        stateChangedSub = pubsub.subscribe('production.stateChanged.**', handleStateChangedMessage);
      }

      return collection.fetch({reset: true});
    },
    unload: function()
    {
      if (!loaded)
      {
        return;
      }

      if (unloadTimer !== null)
      {
        clearTimeout(unloadTimer);
      }

      unloadTimer = setTimeout(function()
      {
        if (stateChangedSub !== null)
        {
          stateChangedSub.cancel();
          stateChangedSub = null;
        }

        collection.reset([]);

        unloadTimer = null;
        loaded = false;
      }, 10000);
    }
  };
});
