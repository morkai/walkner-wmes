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
      'ct.pces.saved': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: 'startedAt', className: 'is-min'},
        {id: 'duration', className: 'is-min'},
        {id: 'order', className: 'is-min'},
        {id: 'pce', className: 'is-min'},
        {id: 'line', className: 'is-min'},
        {id: 'station', className: 'is-min', label: this.t('PROPERTY:station:short')},
        '-'
      ];
    },

    serializeActions: function()
    {
      return null;
    }

  });
});
