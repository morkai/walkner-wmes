define([
  '../core/Collection',
  './Setting'
], function(
  Collection,
  Setting
) {
  'use strict';

  return Collection.extend({

    model: Setting,

    rqlQuery: 'select(value)',

    matchSettingId: null,

    initialize: function(options)
    {
      if (options.pubsub)
      {
        var collection = this;

        options.pubsub.subscribe('settings.updated.**', function(changes)
        {
          var setting = collection.get(changes._id);

          if (setting)
          {
            setting.set(changes);
          }
          else if (collection.matchSettingId && collection.matchSettingId(changes._id))
          {
            collection.add(changes);
          }
        });
      }
    }

  });
});
