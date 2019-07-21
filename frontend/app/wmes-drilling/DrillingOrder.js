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

  var COMPONENT_BLACKLIST = {};

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

    urlRoot: '/drilling/orders',

    clientUrlRoot: '#drilling/orders',

    topicPrefix: 'drilling.orders',

    privilegePrefix: 'DRILLING',

    nlsDomain: 'wmes-drilling',

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
      var childOrderCount = obj.childOrders.length;
      var lastChildOrderI = childOrderCount - 1;

      obj.rowSpan = childOrderCount + 1;
      obj.rowSpanDetails = obj.rowSpan;
      obj.mrps = {};
      obj.mrps[obj.mrp] = 1;

      obj.childOrders = obj.childOrders.map(function(childOrder, i)
      {
        obj.mrps[childOrder.mrp] = 1;

        var components = [];

        childOrder.components.forEach(function(component)
        {
          if (COMPONENT_BLACKLIST[component.nc12])
          {
            return;
          }

          components.push(component);
        });

        var rowSpan = components.length;
        var rowSpanDetails = rowSpan;

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

      if (obj.status === 'finished' && obj.painted)
      {
        obj.status = 'painted';
      }

      obj.statusText = t('wmes-drilling', 'status:' + obj.status);

      return obj;
    },

    hasAnyChildOrderForComponents: function(components)
    {
      var childOrders = this.attributes.childOrders;

      for (var i = 0; i < childOrders.length; ++i)
      {
        if (components[childOrders[i].nc12])
        {
          return true;
        }
      }

      return false;
    }

  }, {

    parse: parse,

    isComponentBlacklisted: function(component)
    {
      return COMPONENT_BLACKLIST[component.nc12];
    }

  });
});
