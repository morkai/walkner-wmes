// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'pos-list is-clickable',

    remoteTopics: {
      'purchaseOrders.synced': function(message)
      {
        if (message.created || message.updated || message.closed)
        {
          this.refreshCollection();
        }
      },
      'purchaseOrders.printed.*': 'setPrintedQty',
      'purchaseOrders.cancelled.*': 'setPrintedQty'
    },

    initialize: function()
    {
      ListView.prototype.initialize.call(this);

      this.listenTo(this.collection, 'change', this.render);
    },

    serializeColumns: function()
    {
      var columns = [
        {id: '_id', className: 'is-min'},
        {id: 'pGr', className: 'is-min'},
        {id: 'plant', className: 'is-min'},
        {id: 'qty', className: 'is-min is-number'},
        {id: 'printedQty', className: 'is-min is-number'},
        {id: 'minScheduleDate', noData: '-'}
      ];

      if (!user.data.vendor)
      {
        columns.unshift({id: 'vendorText', label: t('purchaseOrders', 'PROPERTY:vendor')});
      }

      return columns;
    },

    serializeActions: function()
    {
      return null;
    },

    serializeRows: function()
    {
      return this.collection.invoke('serialize');
    },

    setPrintedQty: function(message)
    {
      var po = this.collection.get(message._id);

      if (po)
      {
        po.set('printedQty', message.printedQty);
      }
    }

  });
});
