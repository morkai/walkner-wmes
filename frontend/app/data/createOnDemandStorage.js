// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/broker',
  'app/pubsub'
], function(
  time,
  broker,
  pubsub
) {
  'use strict';

  return function createOnDemandStorage(createCollection)
  {
    var pubsubSandbox = null;
    var collection = null;
    var releaseTimer = null;

    function release()
    {
      releaseTimer = null;

      if (collection === null)
      {
        return;
      }

      pubsubSandbox.destroy();
      pubsubSandbox = null;
      collection = null;
    }

    function setUpPubsub(pubsub, collection)
    {
      var topicPrefix = collection.getTopicPrefix();

      pubsub.subscribe(topicPrefix + '.added', function(message)
      {
        collection.add(message.model);
      });

      pubsub.subscribe(topicPrefix + '.edited', function(message)
      {
        var model = collection.get(message.model._id);

        if (model)
        {
          model.set(message.model);
        }
        else
        {
          collection.add(message.model);
        }
      });

      pubsub.subscribe(topicPrefix + '.deleted', function(message)
      {
        collection.remove(message.model._id);
      });
    }

    return {
      acquire: function()
      {
        if (releaseTimer !== null)
        {
          clearTimeout(releaseTimer);
          releaseTimer = null;
        }

        if (collection === null)
        {
          pubsubSandbox = pubsub.sandbox();
          collection = createCollection(pubsubSandbox);

          setUpPubsub(pubsubSandbox, collection);
        }

        return collection;
      },
      release: function()
      {
        if (releaseTimer !== null)
        {
          clearTimeout(releaseTimer);
        }

        releaseTimer = setTimeout(release, 30000);
      }
    };
  };
});
