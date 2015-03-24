// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      var columns = ['_id', 'pGr', 'plant', 'minScheduleDate', 'qty', 'printedQty'].map(function(property)
      {
        return {id: property, label: t('purchaseOrders', 'PROPERTY:' + property)};
      });


      columns[3].noData = '-';
      columns[4].tdAttrs = 'class="is-number"';
      columns[5].tdAttrs = 'class="is-number"';

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
