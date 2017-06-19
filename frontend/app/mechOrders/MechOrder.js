// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model',
  'app/orders/OperationCollection'
], function(
  time,
  Model,
  OperationCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/mechOrders',

    clientUrlRoot: '#mechOrders',

    topicPrefix: 'mechOrders',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'mechOrders',

    labelAttribute: '_id',

    defaults: {
      name: null,
      mrp: null,
      materialNorm: null,
      operations: null,
      importTs: null
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

      if (order.importTs)
      {
        order.importTs = time.format(order.importTs, 'L, LTS');
      }

      order.operations = order.operations === null ? [] : order.operations.toJSON();

      return order;
    }

  });
});
