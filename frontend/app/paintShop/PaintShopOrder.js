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

  var DRILLING_MRP = 'KSJ';

  var DRILLING_STATUS_PRIORITY = {
    new: 'warning',
    started: 'info',
    partial: 'warning',
    finished: 'success',
    cancelled: 'danger'
  };

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
      var drillingOrders = orders
        && orders.drillingOrders
        && orders.drillingOrders.getAllByOrderNo(obj.order)
        || [];
      var whOrders = orders
        && orders.whOrders
        && orders.whOrders.byOrderNo[obj.order]
        || [];
      var childOrderCount = obj.childOrders.length;
      var lastChildOrderI = childOrderCount - 1;

      obj.rowSpanDetails = childOrderCount + 1;

      if (obj.notes.length)
      {
        obj.rowSpanDetails += 1;
      }

      obj.paints = {};
      obj.mrps = {};
      obj.mrps[obj.mrp] = 1;
      obj.drilling = obj.paint.nc12 === '000000000000';

      if (obj.drilling)
      {
        obj.mrps[DRILLING_MRP] = 1;
        obj.paints['000000000000'] = obj.qty;
      }

      obj.childOrders = obj.childOrders.map(function(childOrder, i)
      {
        obj.mrps[childOrder.mrp] = 1;

        var components = [];

        childOrder.paints = {};
        childOrder.paintList = [];
        childOrder.noteList = childOrder.nc12 === obj.nc12 ? [] : Array.prototype.slice.call(childOrder.notes);
        childOrder.paintCount = 0;
        childOrder.drilling = order.getDrillingStatus(childOrder, drillingOrders);

        childOrder.components.forEach(function(component)
        {
          if (COMPONENT_BLACKLIST[component.nc12])
          {
            return;
          }

          if (component.unit === 'G' || component.unit === 'KG')
          {
            childOrder.paintCount += 1;

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

        var rowSpanDetails = components.length;

        if (childOrder.paintCount !== 1)
        {
          if (childOrder.paintCount === 0)
          {
            childOrder.noteList.unshift({
              icon: 'fa-circle-o',
              priority: 'warning',
              text: t('paintShop', 'drilling')
            });
          }
          else
          {
            childOrder.noteList.unshift({
              icon: 'fa-paint-brush',
              priority: 'danger',
              text: t('paintShop', 'multiPaint', {count: childOrder.paintCount})
            });
          }
        }

        if (childOrder.drilling)
        {
          childOrder.noteList.unshift({
            icon: 'fa-circle-o',
            priority: DRILLING_STATUS_PRIORITY[childOrder.drilling],
            text: t('paintShop', 'drilling:' + childOrder.drilling)
          });
        }

        if (childOrder.noteList.length)
        {
          rowSpanDetails += 1;
        }

        obj.rowSpanDetails += rowSpanDetails;

        return _.assign({
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

      if (obj.status === 'startedMsp')
      {
        obj.status = 'started';
      }
      else if (obj.status === 'finished' && obj.qtyDlv >= obj.qty)
      {
        obj.status = 'delivered';
      }

      obj.statusText = t('paintShop', 'status:' + obj.status);

      obj.whOrders = whOrders.map(function(whOrder)
      {
        return whOrder.serialize();
      });

      return obj;
    },

    getDrillingStatus: function(childOrder, drillingOrders)
    {
      if (drillingOrders.length === 0)
      {
        return null;
      }

      var statuses = {};
      var components = {};

      childOrder.components.forEach(function(component)
      {
        components[component.nc12] = true;
      });

      drillingOrders.forEach(function(drillingOrder)
      {
        if (!drillingOrder.hasAnyChildOrderForComponents(components))
        {
          return;
        }

        var status = drillingOrder.get('status');

        if (!status[status])
        {
          statuses[status] = 1;
        }
        else
        {
          statuses[status] += 1;
        }
      });

      var availableStatuses = Object.keys(statuses);

      if (availableStatuses.length === 0)
      {
        return null;
      }

      delete statuses.cancelled;

      availableStatuses = Object.keys(statuses);

      if (availableStatuses.length === 1)
      {
        return availableStatuses[0];
      }

      return 'started';
    }

  }, {

    DRILLING_MRP: DRILLING_MRP,

    parse: parse,

    isComponentBlacklisted: function(component)
    {
      return COMPONENT_BLACKLIST[component.nc12];
    }

  });
});
