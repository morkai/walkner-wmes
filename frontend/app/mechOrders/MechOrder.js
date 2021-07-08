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

    parse: function(res)
    {
      res.operations = new OperationCollection(res.operations);

      return res;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (obj.importTs)
      {
        obj.importTs = time.format(obj.importTs, 'L, LTS');
      }

      obj.materialNorm = (obj.materialNorm || 0).toLocaleString();

      obj.operations = obj.operations ? obj.operations.toJSON() : [];

      return obj;
    }

  });
});
