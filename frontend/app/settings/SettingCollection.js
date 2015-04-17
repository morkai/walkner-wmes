// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
    }

  });
});
