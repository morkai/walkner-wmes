// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/ListView'
], function(
  time,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    remoteTopics: {
      'icpo.results.synced': 'refreshCollection'
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
        startedAt: startedAt.format('L, LTS'),
        duration: time.toString((finishedAt.valueOf() - startedAt.valueOf()) / 1000, false, true)
      };
    }

  });
});
