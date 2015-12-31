// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/emptyOrders',

    clientUrlRoot: '#emptyOrders',

    topicPrefix: 'emptyOrders',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'emptyOrders',

    labelAttribute: '_id',

    defaults: {
      nc12: null,
      mrp: null,
      startDate: null,
      finishDate: null,
      statuses: null,
      createdAt: null
    },

    toJSON: function(options)
    {
      if (!options)
      {
        options = {};
      }

      var emptyOrder = Model.prototype.toJSON.call(this);

      if (emptyOrder.startDate)
      {
        emptyOrder.startDateText = time.format(emptyOrder.startDate, options.startFinishDateFormat || 'LL');
      }

      if (emptyOrder.finishDate)
      {
        emptyOrder.finishDateText = time.format(emptyOrder.finishDate, options.startFinishDateFormat || 'LL');
      }

      if (emptyOrder.createdAt)
      {
        emptyOrder.createdAtText = time.format(emptyOrder.createdAt, 'LLLL');
      }

      return emptyOrder;
    }

  });
});
