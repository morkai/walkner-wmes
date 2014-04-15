// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'moment',
  '../core/Model',
  './OperationCollection'
], function(
  moment,
  Model,
  OperationCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orders',

    clientUrlRoot: '#orders',

    topicPrefix: 'orders',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'orders',

    labelAttribute: '_id',

    defaults: {
      nc12: null,
      name: null,
      mrp: null,
      qty: null,
      unit: null,
      startDate: null,
      finishDate: null,
      statuses: null,
      operations: null,
      createdAt: null,
      updatedAt: null
    },

    parse: function(data, xhr)
    {
      data = Model.prototype.parse.call(this, data, xhr);

      data.operations = new OperationCollection(data.operations);

      return data;
    },

    toJSON: function()
    {
      var order = Model.prototype.toJSON.call(this);

      if (order.startDate)
      {
        order.startDateText = moment(order.startDate).format('LL');
      }

      if (order.finishDate)
      {
        order.finishDateText = moment(order.finishDate).format('LL');
      }

      if (order.qty && order.unit)
      {
        order.qtyUnit = order.qty + ' ' + order.unit;
      }

      if (order.createdAt)
      {
        order.createdAtText = moment(order.createdAt).format('LLLL');
      }

      if (order.updatedAt)
      {
        order.updatedAtText = moment(order.updatedAt).format('LLLL');
      }

      order.operations = order.operations === null ? [] : order.operations.toJSON();

      return order;
    }

  });
});
