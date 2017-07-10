// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model',
  '../data/orgUnits',
  '../data/isaPalletKinds',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  Model
) {
  'use strict';

  var STATUS_TO_SEVERITY_CLASS_NAME = {
    new: 'debug',
    started: 'warning',
    finished: 'success',
    cancelled: 'danger'
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

    initialize: function()
    {

    },

    serialize: function()
    {
      var obj = this.toJSON();
      var childOrderCount = obj.orders.length;
      var lastChildOrderI = childOrderCount - 1;

      obj.rowSpan = childOrderCount + 1;

      obj.orders.forEach(function(childOrder, i)
      {
        obj.rowSpan += childOrder.components.length;
        childOrder.rowSpan = childOrder.components.length + 1;
        childOrder.last = i === lastChildOrderI;
      });

      if (obj.startedAt)
      {
        obj.startedAt = time.format(obj.startedAt, 'HH:mm:ss');
      }

      if (obj.finishedAt)
      {
        obj.finishedAt = time.format(obj.finishedAt, 'HH:mm:ss');
      }

      obj.statusText = t('paintShop', 'status:' + obj.status);

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.toJSON();

      return obj;
    }

  }, {

    parse: parse

  });
});
