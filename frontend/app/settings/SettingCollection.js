// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/Collection',
  './Setting'
], function(
  _,
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
      var topicSuffixes = Array.isArray(collection.topicSuffix) ? collection.topicSuffix : [collection.topicSuffix];

      _.forEach(topicSuffixes, function(topicSuffix)
      {
        pubsub.subscribe('settings.updated.' + topicSuffix, function(changes)
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
      });
    },

    fetchIfEmpty: function(next, context)
    {
      if (!this.isEmpty())
      {
        return next ? next.call(context) : null;
      }

      var deferred = $.Deferred(); // eslint-disable-line new-cap
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
        return $.Deferred().reject().promise(); // eslint-disable-line new-cap
      }

      var setting = this.get(id);

      if (setting)
      {
        if (_.isEqual(setting.getValue(), newValue))
        {
          return $.Deferred().resolve().promise(); // eslint-disable-line new-cap
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

    prepareMultiObjectIdValue: function(newValue)
    {
      return String(newValue)
        .toLowerCase()
        .split(',')
        .filter(function(objectId) { return /^[a-f0-9]{24}$/.test(objectId); });
    },

    prepareMultiSelect2Value: function(newValue)
    {
      return String(newValue || '')
        .split(',')
        .filter(function(id) { return id.length > 0; });
    },

    prepareNumericValue: function(newValue, min, max, defaultValue)
    {
      var value = parseInt(newValue, 10);

      if (isNaN(value))
      {
        return defaultValue;
      }

      if (min != null && value < min)
      {
        return min;
      }

      if (max != null && value > max)
      {
        return max;
      }

      return value;
    },

    prepareFloatValue: function(newValue, min, max, defaultValue)
    {
      var value = parseFloat(newValue);

      if (isNaN(value))
      {
        return defaultValue;
      }

      if (min != null && value < min)
      {
        return min;
      }

      if (max != null && value > max)
      {
        return max;
      }

      return value;
    },

    prepareFormValue: function(id, value)
    {
      return value || '';
    },

    getValue: function(idSuffix, defaultValue)
    {
      var setting = this.get((this.idPrefix || '') + idSuffix);

      if (setting)
      {
        return setting.getValue();
      }

      if (defaultValue == null)
      {
        return null;
      }

      return defaultValue;
    }

  });
});
