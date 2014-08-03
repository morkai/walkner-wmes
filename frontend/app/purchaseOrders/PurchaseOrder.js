// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Model',
  './PurchaseOrderItemCollection'
], function(
  time,
  Model,
  PurchaseOrderItemCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/purchaseOrders',

    clientUrlRoot: '#purchaseOrders',

    topicPrefix: 'purchaseOrders',

    privilegePrefix: 'PURCHASE_ORDERS',

    nlsDomain: 'purchaseOrders',

    labelAttribute: '_id',

    defaults: {

    },

    parse: function(data, xhr)
    {
      data = Model.prototype.parse.call(this, data, xhr);

      data.items = new PurchaseOrderItemCollection(data.items);

      return data;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.docDate = time.getMoment(obj.docDate).utc().format('LL');

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

      var minScheduleDate = this.get('items').getMinScheduleDate();

      obj.minScheduleDate = minScheduleDate
        ? time.getMoment(minScheduleDate).utc().format('YYYY-MM-DD')
        : null;

      obj.className = obj.open ? (obj.printed ? 'info' : '') : 'success';

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
