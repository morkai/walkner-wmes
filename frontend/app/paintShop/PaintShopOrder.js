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

    serialize: function(force, paints, orders)
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

      if (!paints
        && orders
        && orders.paints)
      {
        paints = orders.paints;
      }

      var obj = order.toJSON();
      var childOrderCount = obj.childOrders.length;
      var lastChildOrderI = childOrderCount - 1;

      obj.rowSpan = childOrderCount + 1;
      obj.rowSpanDetails = obj.rowSpan;
      obj.paints = {};
      obj.mrps = {};
      obj.mrps[obj.mrp] = 1;
      obj.drilling = true;

      if (obj.paint.nc12 === '000000000000')
      {
        obj.paints['000000000000'] = obj.qty;
      }

      obj.childOrders = obj.childOrders.map(function(childOrder, i)
      {
        obj.drilling = obj.drilling && childOrder.mrp === 'KSJ';
        obj.mrps[childOrder.mrp] = 1;

        var components = [];

        obj.paintCount = 0;
        childOrder.paints = {};
        childOrder.paintList = [];

        childOrder.components.forEach(function(component)
        {
          if (COMPONENT_BLACKLIST[component.nc12])
          {
            return;
          }

          if (component.unit === 'G' || component.unit === 'KG')
          {
            obj.paintCount += 1;

            if (!obj.paints[component.nc12])
            {
              obj.paints[component.nc12] = 0;
            }

            if (!childOrder.paints[component.nc12])
            {
              childOrder.paints[component.nc12] = 0;
              childOrder.paintList.push(component.nc12);
            }

            obj.paints[component.nc12] += childOrder.qty;
            childOrder.paints[component.nc12] += childOrder.qty;
          }

          var paint = paints ? paints.get(component.nc12) : null;

          if (paint)
          {
            component.name = paint.get('name');
            component.placement = paint.get('shelf') + ', ' + paint.get('bin');
          }
          else
          {
            component.placement = '';
          }

          components.push(component);
        });

        var rowSpan = components.length;
        var rowSpanDetails = rowSpan + (obj.paintCount !== 1 ? 1 : 0);

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

      obj.mrps = Object.keys(obj.mrps).join(' ');

      if (orders && obj.followups.length)
      {
        var followupIds = obj.followups;

        obj.followups = [];

        followupIds.forEach(function(followupId)
        {
          var followupOrder = orders.get(followupId);

          if (followupOrder)
          {
            obj.followups.push({
              id: followupId,
              no: followupOrder.get('no')
            });
          }
        });
      }

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

      if (obj.status === 'finished' && obj.qtyDlv >= obj.qty)
      {
        obj.status = 'delivered';
      }

      obj.statusText = t('paintShop', 'status:' + obj.status);

      return obj;
    }

  }, {

    parse: parse,

    isComponentBlacklisted: function(component)
    {
      return COMPONENT_BLACKLIST[component.nc12];
    }

  });
});
