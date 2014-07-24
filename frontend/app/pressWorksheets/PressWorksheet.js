// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../time',
  '../core/Model'
], function(
  t,
  time,
  Model
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
      return {
        rid: null,
        date: time.format('YYYY-MM-DD'),
        shift: 1,
        type: 'mech',
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

      data.date = time.format(data.date, 'YYYY-MM-DD');
      data.shift = t('core', 'SHIFT:' + data.shift);
      data.master = formatUser(data.master);
      data.operator = formatUser(data.operator);
      data.operators = (data.operators || [])
        .map(formatUser)
        .filter(function(user) { return !!user; });
      data.creator = formatUser(data.creator);
      data.createdAt = data.createdAt ? time.format(data.createdAt, 'LLLL') : null;

      if (data.type === 'paintShop' && data.orders)
      {
        data.orders = data.orders.map(function(order)
        {
          order.startedAt = time.getMoment(order.startedAt).format('HH:mm:ss');
          order.finishedAt = time.getMoment(order.finishedAt).format('HH:mm:ss');

          return order;
        });
      }

      data.type = t('pressWorksheets', 'PROPERTY:type:' + data.type);

      return data;
    }

  });
});
