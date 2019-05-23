// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  '../core/util/getShiftStartInfo'
], function(
  _,
  t,
  time,
  Model,
  getShiftStartInfo
) {
  'use strict';

  function formatUser(user)
  {
    return user && user.label ? user.label : null;
  }

  return Model.extend({

    urlRoot: '/pressWorksheets',

    clientUrlRoot: '#pressWorksheets',

    topicPrefix: 'pressWorksheets',

    privilegePrefix: 'PRESS_WORKSHEETS',

    nlsDomain: 'pressWorksheets',

    labelAttribute: 'rid',

    defaults: function()
    {
      var shiftStartInfo = getShiftStartInfo(Date.now());

      return {
        rid: null,
        date: time.format(shiftStartInfo.moment.valueOf(), 'YYYY-MM-DD'),
        shift: shiftStartInfo.no,
        type: 'mech',
        divisions: [],
        prodLines: [],
        startedAt: null,
        finishedAt: null,
        master: null,
        operator: null,
        operators: null,
        orders: null,
        createdAt: null,
        creator: null
      };
    },

    serialize: function()
    {
      var data = this.toJSON();

      data.date = time.format(data.date, 'LL');
      data.shift = t('core', 'SHIFT:' + data.shift);
      data.master = formatUser(data.master);
      data.operator = formatUser(data.operator);
      data.operators = (data.operators || [])
        .map(formatUser)
        .filter(function(user) { return !!user; });
      data.creator = formatUser(data.creator);
      data.createdAt = data.createdAt ? time.format(data.createdAt, 'LLLL') : null;
      data.losses = this.hasAnyLosses();

      data.machineManHours = 0;

      if (data.orders)
      {
        data.orders = this.constructor.serializeOrders(data.orders, data);
      }

      if (Array.isArray(data.divisions))
      {
        data.divisions = data.divisions.join('; ');
      }

      if (Array.isArray(data.prodLines))
      {
        data.prodLines = data.prodLines.join('; ');
      }

      data.type = t('pressWorksheets', 'PROPERTY:type:' + data.type);

      return data;
    },

    hasAnyLosses: function()
    {
      var orders = this.get('orders') || [];

      for (var i = 0; i < orders.length; ++i)
      {
        var order = orders[i];

        if (Array.isArray(order.losses) && order.losses.length)
        {
          return true;
        }
      }

      return false;
    }

  }, {

    serializeOrders: function(orders, data)
    {
      var paintShop = orders.length && orders[0].startedAt.length > 5;

      return orders.map(function(order)
      {
        order = _.clone(order);

        var startedAt = time.getMoment(order.startedAt, paintShop ? undefined : 'HH:mm');
        var finishedAt = time.getMoment(order.finishedAt, paintShop ? undefined : 'HH:mm');

        if (!order.opWorkDuration)
        {
          order.opWorkDuration = finishedAt.diff(startedAt) / 3600000;
        }

        order.opWorkDuration = time.utc.format(order.opWorkDuration * 3600000, 'HH:mm');

        if (paintShop)
        {
          order.startedAt = startedAt.format('HH:mm:ss');
          order.finishedAt = finishedAt.format('HH:mm:ss');
        }

        var operation = order.orderData.operations[order.operationNo];

        if (operation && data)
        {
          data.machineManHours += order.machineManHours = operation.machineTime / 100 * order.quantityDone;
        }

        return order;
      });
    }

  });
});
