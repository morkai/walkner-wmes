// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Model',
  './OperationCollection',
  './DocumentCollection'
], function(
  time,
  Model,
  OperationCollection,
  DocumentCollection
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
      data.documents = new DocumentCollection(data.documents);

      return data;
    },

    toJSON: function()
    {
      var order = Model.prototype.toJSON.call(this);

      if (order.startDate)
      {
        order.startDateText = time.format(order.startDate, 'LL');
      }

      if (order.finishDate)
      {
        order.finishDateText = time.format(order.finishDate, 'LL');
      }

      if (order.qty && order.unit)
      {
        order.qtyUnit = order.qty + ' ' + order.unit;
      }

      if (order.createdAt)
      {
        order.createdAtText = time.format(order.createdAt, 'LLLL');
      }

      if (order.updatedAt)
      {
        order.updatedAtText = time.format(order.updatedAt, 'LLLL');
      }

      order.operations = order.operations ? order.operations.toJSON() : [];

      if (!Array.isArray(order.documents))
      {
        if (order.documents && order.documents.toJSON)
        {
          order.documents = order.documents.toJSON();
        }
        else
        {
          order.documents = [];
        }
      }

      return order;
    }

  });
});
