// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'dummyPaint.orders.updated': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: '_id', className: 'is-min'},
        {id: 'nc12', className: 'is-min'},
        {id: 'name', className: 'is-min'},
        {id: 'leadingNo', className: 'is-min'},
        {id: 'leadingNc12', className: 'is-min'},
        {id: 'leadingName', className: 'is-min'},
        {id: 'salesNo', className: 'is-min'},
        {id: 'paintSource', className: 'is-min'},
        {id: 'productFamily', className: 'is-min'},
        {id: 'paintFamily', className: 'is-min'},
        {id: 'paintCategory', className: 'is-min'},
        {id: 'paintCode', className: 'is-min'},
        {id: 'dummyNc12', className: 'is-min'},
        {id: 'paintNc12', className: 'is-min'},
        {id: 'paintName', className: 'is-min'},
        {id: 'changed', className: 'is-min'},
        {id: 'error', className: 'is-min'},
        {id: 'createdAt', className: 'is-min'},
        {id: 'stage', className: 'is-min'},
        {id: 'job', className: 'is-min'},
        '-'
      ];
    },

    serializeActions: function()
    {
      return null;
    }

  });
});
