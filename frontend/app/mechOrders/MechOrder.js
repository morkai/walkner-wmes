define([
  'moment',
  '../core/Model',
  'app/orders/OperationCollection'
], function(
  moment,
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
        order.importTs = moment(order.importTs).format('YYYY-MM-DD HH:mm:ss');
      }

      order.operations = order.operations === null ? [] : order.operations.toJSON();

      return order;
    }

  });
});
