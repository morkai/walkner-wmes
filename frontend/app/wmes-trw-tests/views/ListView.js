// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: '',

    remoteTopics: {
      'trw.tests.saved': 'refreshCollection'
    },

    columns: [
      {id: 'line', className: 'is-min'},
      {id: 'workstation', className: 'is-min is-number'},
      {id: 'order', className: 'is-min'},
      {id: 'pce', className: 'is-min is-number'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      {id: 'tester', className: 'is-min'},
      {id: 'program'}
    ],

    serializeActions: function()
    {
      return null;
    }

  });
});
