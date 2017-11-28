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

  var COMPONENT_BLACKLIST = {
    '777777777777': true
  };

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

    serialize: function(force)
    {
      var order = this;

      if (!force
        && order.collection
        && order.collection.serializedMap
        && order.collection.serializedMap[this.id])
      {
        return order.collection.serializedMap[this.id];
      }

      var obj = order.toJSON();
      var childOrderCount = obj.childOrders.length;
      var lastChildOrderI = childOrderCount - 1;

      obj.rowSpan = childOrderCount + 1;
      obj.rowSpanDetails = obj.rowSpan;

      obj.childOrders = obj.childOrders.map(function(childOrder, i)
      {
        var components = [];

        obj.paintCount = 0;

        childOrder.components.forEach(function(component)
        {
          if (COMPONENT_BLACKLIST[component.nc12])
          {
            return;
          }

          obj.paintCount += component.unit === 'G' || component === 'KG' ? 1 : 0;

          components.push(component);
        });

        var rowSpan = components.length;
        var rowSpanDetails = rowSpan + (obj.paintCount > 1 ? 1 : 0);

        obj.rowSpan += rowSpan;
        obj.rowSpanDetails += rowSpanDetails;

        return _.assign({
          rowSpan: rowSpan + 1,
          rowSpanDetails: rowSpanDetails + 1,
          last: i === lastChildOrderI
        }, childOrder, {
          components: components
        });
      });

      if (obj.startTime)
      {
        obj.startTimeTime = time.utc.format(obj.startTime, 'HH:mm:ss');
      }

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

      obj.statusText = t('paintShop', 'status:' + obj.status);

      return obj;
    }

  }, {

    parse: parse

  });
});
