// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model'
], function(
  _,
  time,
  t,
  Model
) {
  'use strict';

  function parse(obj)
  {
    ['date', 'startedAt', 'finishedAt'].forEach(function(prop)
    {
      if (typeof obj[prop] === 'string')
      {
        obj[prop] = new Date(obj[prop]);
      }
    });

    return obj;
  }

  return Model.extend({

    urlRoot: '/wiring/orders',

    clientUrlRoot: '#wiring/orders',

    topicPrefix: 'wiring.orders',

    privilegePrefix: 'WIRING',

    nlsDomain: 'wmes-wiring',

    parse: parse,

    serialize: function(force, orders)
    {
      var order = this;

      if (!orders)
      {
        orders = order.collection;
      }

      if (!force
        && orders
        && orders.serializedMap
        && orders.serializedMap[order.id])
      {
        return orders.serializedMap[order.id];
      }

      var obj = order.toJSON();

      if (obj.startedAt)
      {
        var startedAt = time.getMoment(obj.startedAt);

        obj.startedAtTime = startedAt.format('HH:mm:ss');
        obj.startedAtDate = startedAt.format('DD.MM, HH:mm:ss');
      }

      if (obj.finishedAt)
      {
        var finishedAt = time.getMoment(obj.finishedAt);

        obj.finishedAtTime = finishedAt.format('HH:mm:ss');
        obj.finishedAtDate = finishedAt.format('DD.MM, HH:mm:ss');
      }

      obj.mrps = [obj.mrp];
      obj.leadingOrders = {};

      obj.orders.forEach(function(sapOrder)
      {
        obj.leadingOrders[sapOrder.leadingOrder] = 1;
      });

      obj.leadingOrders = Object.keys(obj.leadingOrders).sort();

      obj.qtyRemaining = Math.max(obj.qty - obj.qtyDone, 0);

      return obj;
    }

  }, {

    parse: parse

  });
});
