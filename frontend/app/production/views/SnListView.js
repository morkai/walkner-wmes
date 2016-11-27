// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/views/ListView'
], function(
  $,
  t,
  viewport,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    dialogClassName: 'production-modal production-snList-modal',

    paginationOptions: {
      navigate: false
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'orderNo', className: 'is-min'},
      {id: 'serialNo', className: 'is-min'},
      {id: 'taktTime', className: 'is-min'},
      'scannedAt'
    ],

    serializeActions: function()
    {
      return null;
    },

    onDialogShown: function()
    {
      this.ajax(this.collection.fetch({reset: true}));
    }

  });
});
