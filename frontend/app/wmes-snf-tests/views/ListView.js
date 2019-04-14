// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable is-colored',

    remoteTopics: {
      'snf.tests.saved': 'refreshCollection'
    },

    columns: [
      {id: 'prodLine', className: 'is-min'},
      {id: 'orderNo', className: 'is-min'},
      {id: 'serialNo', className: 'is-min is-number'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      {id: 'program'}
    ],

    serializeActions: function()
    {
      return null;
    }

  });
});
