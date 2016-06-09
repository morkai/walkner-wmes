// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../core/Collection',
  './Setting'
], function(
  $,
  Collection,
  Setting
) {
  'use strict';

  return Collection.extend({

    model: Setting,

    rqlQuery: 'select(value)',

    matchSettingId: null,

    topicSuffix: '**',

    initialize: function(models, options)
    {
      if (options.pubsub)
      {
        this.setUpPubsub(options.pubsub);
      }
    },

    setUpPubsub: function(pubsub)
    {
      var collection = this;

      pubsub.subscribe('settings.updated.' + this.topicSuffix, function(changes)
      {
        var setting = collection.get(changes._id);

        if (setting)
        {
          setting.set(changes);
        }
        else
        {
          collection.add(changes);
        }
      });
    },

    fetchIfEmpty: function(next, context)
    {
      if (!this.isEmpty())
      {
        return next ? next.call(context) : null;
      }

      var deferred = $.Deferred();
      var req = this.fetch({reset: true});

      if (!next)
      {
        return req;
      }

      req.done(function()
      {
        var nextReqs = [].concat(next.call(context));

        $.when.apply($, nextReqs).then(
          function() { deferred.resolve(); },
          function() { deferred.reject(); }
        );
      });

      return deferred.promise();
    },

    update: function(id, newValue)
    {
      newValue = this.prepareValue(id, typeof newValue === 'string' ? newValue.trim() : newValue);

      if (newValue === undefined)
      {
        return $.Deferred().reject().promise();
      }

      var setting = this.get(id);

      if (setting)
      {
        if (setting.getValue() === newValue)
        {
          return $.Deferred().resolve().promise();
        }
      }
      else
      {
        this.add({
          _id: id,
          value: null
        });

        setting = this.get(id);
      }

      return setting.save({value: newValue});
    },

    prepareValue: function(id, newValue)
    {
      return newValue;
    },

    prepareObjectIdValue: function(newValue)
    {
      if (newValue === null || newValue === '')
      {
        return null;
      }

      var objectId = String(newValue).toLowerCase();

      return /^[a-f0-9]{24}$/.test(objectId) ? objectId : undefined;
    },

    prepareNumericValue: function(newValue, min, max)
    {
      var value = parseInt(newValue, 10);

      if (isNaN(value))
      {
        return;
      }

      if (value < min)
      {
        return min;
      }

      if (value > max)
      {
        return max;
      }

      return value;
    }

  });
});
