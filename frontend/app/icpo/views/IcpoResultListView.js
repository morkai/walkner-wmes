// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/core/views/ListView'
], function(
  time,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'icpo.synced': 'refreshCollection'
    },

    events: {
      'click tr[data-id]': function(e)
      {
        var url = this.collection.get(e.currentTarget.dataset.id).genClientUrl();

        if (e.ctrlKey)
        {
          window.open(url);
        }
        else if (!e.altKey)
        {
          this.broker.publish('router.navigate', {
            url: url,
            trigger: true,
            replace: false
          });
        }
      }
    },

    columns: [
      'srcId', 'serviceTag', 'driver', 'gprs', 'led', 'startedAt', 'duration'
    ],

    serializeActions: function()
    {
      return null;
    },

    serializeRow: function(model)
    {
      var startedAt = time.getMoment(model.get('startedAt'));
      var finishedAt = time.getMoment(model.get('finishedAt'));

      return {
        _id: model.id,
        className: 'icpo-entry ' + (model.get('result') === 'success' ? 'success' : 'danger'),
        srcId: model.get('srcId'),
        serviceTag: model.get('serviceTag'),
        driver: model.get('driver'),
        gprs: model.get('gprs'),
        led: model.get('led'),
        startedAt: startedAt.format('YYYY-MM-DD, HH:mm:ss.SSS'),
        duration: time.toString((finishedAt.valueOf() - startedAt.valueOf()) / 1000, false, true)
      };
    }

  });
});
