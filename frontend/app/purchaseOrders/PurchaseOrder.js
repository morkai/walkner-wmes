// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'moment',
  '../i18n',
  '../time',
  '../core/Model',
  './PurchaseOrderItemCollection',
  './PurchaseOrderPrintCollection'
], function(
  _,
  moment,
  t,
  time,
  Model,
  PurchaseOrderItemCollection,
  PurchaseOrderPrintCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/purchaseOrders',

    clientUrlRoot: '#purchaseOrders',

    topicPrefix: 'purchaseOrders',

    privilegePrefix: 'PURCHASE_ORDERS',

    nlsDomain: 'purchaseOrders',

    labelAttribute: '_id',

    initialize: function(attributes, options)
    {
      if (options.prints)
      {
        this.prints = new PurchaseOrderPrintCollection(null, {paginate: false});
        this.prints.url = this.url() + '/prints';
      }
      else
      {
        this.prints = null;
      }
    },

    getFirstScheduledQuantity: function(item)
    {
      return this.get('items').get(item).get('schedule')[0].qty;
    },

    parse: function(data, options)
    {
      data = Model.prototype.parse.call(this, data, options);

      if (options.update)
      {
        this.get('items').set(data.items);

        delete data.items;
      }
      else
      {
        data.items = new PurchaseOrderItemCollection(data.items);
      }

      return data;
    },

    update: function(data)
    {
      var items = data.items;

      if (items)
      {
        delete data.items;

        this.get('items').set(items);
      }

      this.set(data);
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.docDate = moment.utc(obj.docDate).format('LL');

      if (obj.vendor && obj.vendor._id)
      {
        obj.vendorText = obj.vendor._id;

        if (obj.vendor.name.length)
        {
          obj.vendorText += ': ' + obj.vendor.name;
        }
      }
      else
      {
        obj.vendorText = obj.vendor;
      }

      obj.items = obj.items ? obj.items.invoke('serialize') : [];

      obj.minScheduleDate = obj.scheduledAt ? moment.utc(obj.scheduledAt).format('L') : null;

      obj.className = obj.open ? '' : 'success';

      obj.qty = obj.qty.toLocaleString();
      obj.printedQty = obj.printedQty.toLocaleString();

      if (obj.importedAt)
      {
        obj.importedAtText = time.format(obj.importedAt, 'LLLL');
      }

      if (obj.createdAt)
      {
        obj.createdAtText = time.format(obj.createdAt, 'LLLL');
      }

      if (obj.updatedAt)
      {
        obj.updatedAtText = time.format(obj.updatedAt, 'LLLL');
      }

      return obj;
    }

  });
});
