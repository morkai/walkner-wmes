// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model',
  './OperationCollection',
  './DocumentCollection',
  './ComponentCollection'
], function(
  time,
  Model,
  OperationCollection,
  DocumentCollection,
  ComponentCollection
) {
  'use strict';

  var DATE_PROPS = [
    'startDate',
    'finishDate',
    'scheduledStartDate',
    'scheduledFinishDate',
  ];
  var TIME_PROPS = [
    'sapCreatedAt',
    'createdAt',
    'updatedAt'
  ];

  return Model.extend({

    urlRoot: '/orders',

    clientUrlRoot: '#orders',

    topicPrefix: 'orders',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'orders',

    labelAttribute: '_id',

    parse: function(data, xhr)
    {
      data = Model.prototype.parse.call(this, data, xhr);

      data.operations = new OperationCollection(data.operations);
      data.documents = new DocumentCollection(data.documents);
      data.bom = new ComponentCollection(data.bom);

      return data;
    },

    toJSON: function()
    {
      var order = Model.prototype.toJSON.call(this);

      DATE_PROPS.forEach(function(prop)
      {
        if (order[prop])
        {
          order[prop + 'Text'] = time.format(order[prop], 'LL');
        }
      });

      TIME_PROPS.forEach(function(prop)
      {
        if (order[prop])
        {
          order[prop + 'Text'] = time.format(order[prop], 'LLL');
        }
      });

      if (order.qty && order.unit)
      {
        order.qtyUnit = order.qty + ' ' + order.unit;
      }

      if (order.qtyDone && order.qtyDone.total >= 0 && order.unit)
      {
        order.qtyDoneUnit = (order.qtyDone.total || 0) + ' ' + order.unit;
      }

      order.qtys = '';

      if (order.qtyDone && order.qtyDone.total >= 0)
      {
        order.qtys += order.qtyDone.total;
      }

      if (order.qty)
      {
        if (order.qtys.length)
        {
          order.qtys += '/';
        }

        order.qtys += order.qty;
      }

      order.operations = order.operations ? order.operations.toJSON() : [];

      if (!Array.isArray(order.documents))
      {
        order.documents = order.documents && order.documents.toJSON ? order.documents.toJSON() : [];
      }

      if (!Array.isArray(order.bom))
      {
        order.bom = order.bom && order.bom.toJSON ? order.bom.toJSON() : [];
      }

      return order;
    }

  });
});
