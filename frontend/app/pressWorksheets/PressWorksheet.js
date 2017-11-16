// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model',
  '../core/util/getShiftStartInfo'
], function(
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
        shift: shiftStartInfo.shift,
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

      data.laborManHours = 0;
      data.machineManHours = 0;

      if (data.orders)
      {
        var paintShop = data.type === 'paintShop';

        data.orders = data.orders.map(function(order)
        {
          if (paintShop)
          {
            order.startedAt = time.getMoment(order.startedAt).format('LTS');
            order.finishedAt = time.getMoment(order.finishedAt).format('LTS');
          }

          var operation = order.orderData.operations[order.operationNo];

          if (operation)
          {
            order.laborManHours = operation.laborTime / 100 * order.quantityDone;
            order.machineManHours = operation.machineTime / 100 * order.quantityDone;

            data.laborManHours += order.laborManHours;
            data.machineManHours += order.machineManHours;
          }

          return order;
        });
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

  });
});
