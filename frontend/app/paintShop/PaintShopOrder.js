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

    urlRoot: '/paintShop/orders',

    clientUrlRoot: '#paintShop/orders',

    topicPrefix: 'paintShop.orders',

    privilegePrefix: 'PAINT_SHOP',

    nlsDomain: 'paintShop',

    parse: parse,

    serialize: function()
    {
      var obj = this.toJSON();
      var childOrderCount = obj.childOrders.length;
      var lastChildOrderI = childOrderCount - 1;

      obj.rowSpan = childOrderCount + 1;

      obj.childOrders.forEach(function(childOrder, i)
      {
        obj.rowSpan += childOrder.components.length;
        childOrder.rowSpan = childOrder.components.length + 1;
        childOrder.last = i === lastChildOrderI;
      });

      if (obj.startTime)
      {
        obj.startTimeText = time.utc.format(obj.startTime, 'HH:mm:ss');
      }

      if (obj.startedAt)
      {
        obj.startedAtText = time.format(obj.startedAt, 'HH:mm:ss');
      }

      if (obj.finishedAt)
      {
        obj.finishedAtText = time.format(obj.finishedAt, 'HH:mm:ss');
      }

      obj.statusText = t('paintShop', 'status:' + obj.status);

      return obj;
    }

  }, {

    parse: parse

  });
});
