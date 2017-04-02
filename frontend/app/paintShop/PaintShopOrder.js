// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
